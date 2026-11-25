const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');
const Category = require('../models/Category');

// GET /api/restaurants (PUBLIC)
async function getRestaurants(req, res, next) {
  try {
    const { search, typeCuisine, isOpen, sort = 'alpha', page = 1, limit = 12 } = req.query;

    const query = { status: 'validated' };

    if (search && search.trim()) {
      query.nom = { $regex: search.trim(), $options: 'i' };
    }

    if (typeCuisine && typeCuisine.trim()) {
      query.typeCuisine = typeCuisine.trim();
    }

    if (isOpen === 'true' || isOpen === true) {
      query.isOpen = true;
    }

    let sortOptions = { nom: 1 };
    if (sort === 'alpha') {
      sortOptions = { nom: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [total, data] = await Promise.all([
      Restaurant.countDocuments(query),
      Restaurant.find(query).sort(sortOptions).skip(skip).limit(limitNum).populate('owner', 'nom prenom email telephone'),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.json({
      data,
      page: pageNum,
      totalPages,
      total,
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/restaurants/mine (restaurateur or admin)
async function getMyRestaurants(req, res, next) {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .populate('owner', 'nom prenom email telephone');
    return res.json(restaurants);
  } catch (error) {
    return next(error);
  }
}

// GET /api/restaurants/admin/all (admin only - returns all restaurants regardless of status)
async function getAllRestaurantsAdmin(req, res, next) {
  try {
    const restaurants = await Restaurant.find()
      .sort({ createdAt: -1 })
      .populate('owner', 'nom prenom email telephone');
    return res.json(restaurants);
  } catch (error) {
    return next(error);
  }
}

// GET /api/restaurants/cuisines (PUBLIC)
async function getCuisines(req, res, next) {
  try {
    const cuisines = await Restaurant.distinct('typeCuisine', {
      status: 'validated',
      typeCuisine: { $ne: '', $ne: null },
    });
    return res.json(cuisines);
  } catch (error) {
    return next(error);
  }
}

// GET /api/restaurants/:id (PUBLIC)
async function getRestaurantById(req, res, next) {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'nom prenom email telephone');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.status !== 'validated') {
      // only its owner or an admin may see it
      if (!req.user || (req.user.role !== 'admin' && restaurant.owner._id.toString() !== req.user._id.toString())) {
        return res.status(403).json({ message: 'Access forbidden: restaurant not validated' });
      }
    }

    return res.json(restaurant);
  } catch (error) {
    return next(error);
  }
}

// POST /api/restaurants (restaurateur, admin)
async function createRestaurant(req, res, next) {
  try {
    const { nom, description, adresse, typeCuisine, image, fraisLivraison, horaires, isOpen, owner } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({ message: 'Restaurant name (nom) is required' });
    }

    let assignedOwner = req.user._id;
    let assignedStatus = 'pending';

    if (req.user.role === 'admin') {
      assignedOwner = owner || req.user._id;
      assignedStatus = 'validated';
    }

    const restaurant = new Restaurant({
      nom: nom.trim(),
      description: description || '',
      adresse: adresse || '',
      typeCuisine: typeCuisine || '',
      image: image || '',
      fraisLivraison: fraisLivraison !== undefined ? Math.max(0, Number(fraisLivraison)) : 0,
      horaires: horaires || '',
      isOpen: isOpen !== undefined ? Boolean(isOpen) : true,
      status: assignedStatus,
      owner: assignedOwner,
    });

    await restaurant.save();
    await restaurant.populate('owner', 'nom prenom email telephone');
    return res.status(201).json(restaurant);
  } catch (error) {
    return next(error);
  }
}

// PUT /api/restaurants/:id (restaurateur owner or admin)
async function updateRestaurant(req, res, next) {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you can only update your own restaurant' });
    }

    const { nom, description, adresse, typeCuisine, image, fraisLivraison, horaires, isOpen } = req.body;

    if (nom !== undefined) {
      if (!nom.trim()) {
        return res.status(400).json({ message: 'Restaurant name cannot be empty' });
      }
      restaurant.nom = nom.trim();
    }
    if (description !== undefined) restaurant.description = description;
    if (adresse !== undefined) restaurant.adresse = adresse;
    if (typeCuisine !== undefined) restaurant.typeCuisine = typeCuisine;
    if (image !== undefined) restaurant.image = image;
    if (fraisLivraison !== undefined) restaurant.fraisLivraison = Math.max(0, Number(fraisLivraison));
    if (horaires !== undefined) restaurant.horaires = horaires;
    if (isOpen !== undefined) restaurant.isOpen = Boolean(isOpen);

    await restaurant.save();
    await restaurant.populate('owner', 'nom prenom email telephone');
    return res.json(restaurant);
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/restaurants/:id (owner or admin)
async function deleteRestaurant(req, res, next) {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: you can only delete your own restaurant' });
    }

    await Dish.deleteMany({ restaurant: restaurant._id });
    await Category.deleteMany({ restaurant: restaurant._id });
    await restaurant.deleteOne();

    return res.json({ message: 'Restaurant, dishes, and categories deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

// PATCH /api/restaurants/:id/status (admin only)
async function updateRestaurantStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['validated', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be validated, suspended, or pending' });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.status = status;
    await restaurant.save();
    await restaurant.populate('owner', 'nom prenom email telephone');
    return res.json(restaurant);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getRestaurants,
  getMyRestaurants,
  getAllRestaurantsAdmin,
  getCuisines,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantStatus,
};
