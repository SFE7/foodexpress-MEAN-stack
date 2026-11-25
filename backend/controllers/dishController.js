const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');

// GET /api/dishes (PUBLIC)
// query `restaurant` (required for normal use), optional `categorie`, `search`, `disponible`. Populate categorie (nom).
async function getDishes(req, res, next) {
  try {
    const { restaurant, categorie, search, disponible } = req.query;

    const query = {};
    if (restaurant) {
      query.restaurant = restaurant;
    }
    if (categorie) {
      query.categorie = categorie;
    }
    if (disponible !== undefined && disponible !== '') {
      query.disponible = disponible === 'true' || disponible === true;
    }
    if (search && search.trim()) {
      query.nom = { $regex: search.trim(), $options: 'i' };
    }

    const dishes = await Dish.find(query)
      .populate('categorie', 'nom description')
      .populate('restaurant', 'nom fraisLivraison isOpen status')
      .sort({ nom: 1 });

    return res.json(dishes);
  } catch (error) {
    return next(error);
  }
}

// GET /api/dishes/:id (PUBLIC)
async function getDishById(req, res, next) {
  try {
    const dish = await Dish.findById(req.params.id)
      .populate('categorie', 'nom description')
      .populate('restaurant', 'nom fraisLivraison isOpen status');

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    return res.json(dish);
  } catch (error) {
    return next(error);
  }
}

// POST /api/dishes (restaurateur, admin)
// validate nom, prix >= 0, restaurant; verify restaurant belongs to restaurateur (admin: any).
// verify categorie, if provided, belongs to that restaurant.
async function createDish(req, res, next) {
  try {
    const { nom, description, prix, image, disponible, categorie, restaurant } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({ message: 'Dish name (nom) is required' });
    }
    if (prix === undefined || isNaN(Number(prix)) || Number(prix) < 0) {
      return res.status(400).json({ message: 'A valid price (prix >= 0) is required' });
    }
    if (!restaurant) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const restDoc = await Restaurant.findById(restaurant);
    if (!restDoc) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (req.user.role !== 'admin' && restDoc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you do not own this restaurant' });
    }

    let catId = null;
    if (categorie) {
      const catDoc = await Category.findById(categorie);
      if (!catDoc) {
        return res.status(404).json({ message: 'Category not found' });
      }
      // If the category is tied to a restaurant, make sure it matches
      if (catDoc.restaurant && catDoc.restaurant.toString() !== restDoc._id.toString()) {
        return res.status(400).json({ message: 'Category does not belong to this restaurant' });
      }
      catId = catDoc._id;
    }

    const dish = new Dish({
      nom: nom.trim(),
      description: description || '',
      prix: Number(prix),
      image: image || '',
      disponible: disponible !== undefined ? Boolean(disponible) : true,
      categorie: catId,
      restaurant: restDoc._id,
    });

    await dish.save();
    await dish.populate('categorie', 'nom description');
    return res.status(201).json(dish);
  } catch (error) {
    return next(error);
  }
}

// PUT /api/dishes/:id
// update nom, description, prix, image, disponible, categorie, with ownership check.
async function updateDish(req, res, next) {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    const restDoc = await Restaurant.findById(dish.restaurant);
    if (!restDoc) {
      return res.status(404).json({ message: 'Associated restaurant not found' });
    }

    if (req.user.role !== 'admin' && restDoc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you do not own the restaurant for this dish' });
    }

    const { nom, description, prix, image, disponible, categorie } = req.body;

    if (nom !== undefined) {
      if (!nom.trim()) {
        return res.status(400).json({ message: 'Dish name cannot be empty' });
      }
      dish.nom = nom.trim();
    }
    if (description !== undefined) dish.description = description;
    if (prix !== undefined) {
      if (isNaN(Number(prix)) || Number(prix) < 0) {
        return res.status(400).json({ message: 'Price must be >= 0' });
      }
      dish.prix = Number(prix);
    }
    if (image !== undefined) dish.image = image;
    if (disponible !== undefined) dish.disponible = Boolean(disponible);

    if (categorie !== undefined) {
      if (categorie === null || categorie === '') {
        dish.categorie = null;
      } else {
        const catDoc = await Category.findById(categorie);
        if (!catDoc) {
          return res.status(404).json({ message: 'Category not found' });
        }
        if (catDoc.restaurant && catDoc.restaurant.toString() !== restDoc._id.toString()) {
          return res.status(400).json({ message: 'Category does not belong to this restaurant' });
        }
        dish.categorie = catDoc._id;
      }
    }

    await dish.save();
    await dish.populate('categorie', 'nom description');
    return res.json(dish);
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/dishes/:id (ownership check)
async function deleteDish(req, res, next) {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    const restDoc = await Restaurant.findById(dish.restaurant);
    if (!restDoc) {
      return res.status(404).json({ message: 'Associated restaurant not found' });
    }

    if (req.user.role !== 'admin' && restDoc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you do not own the restaurant for this dish' });
    }

    await dish.deleteOne();
    return res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
};
