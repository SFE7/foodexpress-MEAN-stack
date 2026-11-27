/**
 * FILE: backend/controllers/categoryController.js
 * ROLE: API request controller.
 * USED BY / TALKS TO: Route files call exported handlers.
 * KEY IDEA: Validate input and return HTTP responses.
 */
const Category = require('../models/Category');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');

// GET /api/categories (PUBLIC)
// query restaurant = id returns that restaurant's categories; no query returns general categories (restaurant null).
// Route: GET /api/categories; called by public or admin depending on filters.
// Steps: validate input, query or update MongoDB, then return JSON.
// Possible errors: 404 if a requested category is missing; unexpected failures go to next(error).
async function getCategories(req, res, next) {
  try {
    const { restaurant } = req.query;
    const query = restaurant ? { restaurant } : { restaurant: null };
    const categories = await Category.find(query).sort({ nom: 1 });
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
}

// POST /api/categories (admin creates general category; restaurateur creates for restaurant they own)
// Route: POST /api/categories; called by authorized restaurateur or admin.
// Steps: validate input, query or update MongoDB, then return JSON.
// Possible errors: 400 or 403 for invalid ownership; unexpected failures go to next(error).
async function createCategory(req, res, next) {
  try {
    const { nom, description, restaurant } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({ message: 'Category name (nom) is required' });
    }

    if (req.user.role === 'admin') {
      let restaurantId = null;
      if (restaurant) {
        const restDoc = await Restaurant.findById(restaurant);
        if (!restDoc) {
          return res.status(404).json({ message: 'Restaurant not found' });
        }
        restaurantId = restDoc._id;
      }
      const category = new Category({
        nom: nom.trim(),
        description: description || '',
        restaurant: restaurantId,
      });
      await category.save();
      return res.status(201).json(category);
    }

    // Restaurateur
    if (!restaurant) {
      return res.status(400).json({ message: 'Restaurant ID is required for restaurateurs' });
    }

    const restDoc = await Restaurant.findById(restaurant);
    if (!restDoc) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restDoc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you do not own this restaurant' });
    }

    const category = new Category({
      nom: nom.trim(),
      description: description || '',
      restaurant: restDoc._id,
    });
    await category.save();
    return res.status(201).json(category);
  } catch (error) {
    return next(error);
  }
}

// PUT /api/categories/:id (admin can manage all; restaurateur can manage categories for restaurants they own)
// Route: PUT /api/categories/:id; called by authorized restaurateur or admin.
// Steps: validate input, query or update MongoDB, then return JSON.
// Possible errors: 403 for wrong owner, 404 if missing; unexpected failures go to next(error).
async function updateCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (req.user.role !== 'admin') {
      if (!category.restaurant) {
        return res.status(403).json({ message: 'Forbidden: cannot edit general categories' });
      }
      const restDoc = await Restaurant.findById(category.restaurant);
      if (!restDoc || restDoc.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: you do not own this restaurant' });
      }
    }

    const { nom, description } = req.body;
    if (nom !== undefined) {
      if (!nom.trim()) {
        return res.status(400).json({ message: 'Category name cannot be empty' });
      }
      category.nom = nom.trim();
    }
    if (description !== undefined) {
      category.description = description;
    }

    await category.save();
    return res.json(category);
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/categories/:id
// Deleting a category with dishes must be refused with a clear 400 message
// Route: DELETE /api/categories/:id; called by authorized restaurateur or admin.
// Steps: validate input, query or update MongoDB, then return JSON.
// Possible errors: 403 for wrong owner, 404 if missing; unexpected failures go to next(error).
async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (req.user.role !== 'admin') {
      if (!category.restaurant) {
        return res.status(403).json({ message: 'Forbidden: cannot delete general categories' });
      }
      const restDoc = await Restaurant.findById(category.restaurant);
      if (!restDoc || restDoc.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: you do not own this restaurant' });
      }
    }

    const dishCount = await Dish.countDocuments({ categorie: category._id });
    if (dishCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category: ${dishCount} dish(es) are associated with it. Please reassign or delete those dishes first.`,
      });
    }

    await category.deleteOne();
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
