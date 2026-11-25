const Order = require('../models/Order');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');

const ORDER_TRANSITIONS = {
  en_attente: ['acceptee', 'annulee'],
  acceptee: ['en_preparation', 'annulee'],
  en_preparation: ['en_livraison'],
  en_livraison: ['livree'],
  livree: [],
  annulee: [],
};

// POST /api/orders (client only)
async function createOrder(req, res, next) {
  try {
    const { restaurant, articles, adresseLivraison, modePaiement, remarque } = req.body;

    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    for (const item of articles) {
      if (!item.plat || !Number.isInteger(Number(item.quantite)) || Number(item.quantite) < 1) {
        return res.status(400).json({ message: 'Each article must specify a valid plat and an integer quantity >= 1' });
      }
    }

    if (!restaurant) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const restDoc = await Restaurant.findById(restaurant);
    if (!restDoc) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restDoc.status !== 'validated') {
      return res.status(400).json({ message: 'Restaurant is not validated or is suspended' });
    }

    if (restDoc.isOpen === false) {
      return res.status(400).json({ message: 'Restaurant is currently closed' });
    }

    if (!adresseLivraison || !adresseLivraison.trim()) {
      return res.status(400).json({ message: 'Delivery address (adresseLivraison) is required' });
    }

    const paymentMethod = modePaiement || 'livraison';
    if (!['livraison', 'en_ligne'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Payment method must be either "livraison" or "en_ligne"' });
    }

    // Server-side dish and pricing validation
    const dishIds = articles.map((a) => a.plat);
    const dishes = await Dish.find({ _id: { $in: dishIds } });
    const dishMap = new Map(dishes.map((d) => [d._id.toString(), d]));

    const unavailableDishes = [];
    for (const item of articles) {
      const dish = dishMap.get(item.plat.toString());
      if (!dish) {
        unavailableDishes.push(`Item ID ${item.plat} (not found)`);
      } else if (dish.restaurant.toString() !== restDoc._id.toString()) {
        unavailableDishes.push(`${dish.nom} (does not belong to this restaurant)`);
      } else if (!dish.disponible) {
        unavailableDishes.push(`${dish.nom} (currently unavailable)`);
      }
    }

    if (unavailableDishes.length > 0) {
      return res.status(400).json({
        message: `Some dishes are unavailable or invalid: ${unavailableDishes.join(', ')}`,
        unavailableDishes,
      });
    }

    // Calculate server-side prices
    let sousTotal = 0;
    const orderArticles = articles.map((item) => {
      const dish = dishMap.get(item.plat.toString());
      const quantite = Number(item.quantite);
      const prixUnitaire = dish.prix;
      sousTotal += quantite * prixUnitaire;
      return {
        plat: dish._id,
        nom: dish.nom,
        quantite,
        prixUnitaire,
      };
    });

    const fraisLivraison = restDoc.fraisLivraison || 0;
    const total = sousTotal + fraisLivraison;

    const order = new Order({
      client: req.user._id,
      restaurant: restDoc._id,
      articles: orderArticles,
      adresseLivraison: adresseLivraison.trim(),
      sousTotal,
      fraisLivraison,
      total,
      modePaiement: paymentMethod,
      statut: 'en_attente',
      remarque: (remarque || '').trim(),
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('restaurant', 'nom image fraisLivraison adresse')
      .populate('client', 'nom prenom email telephone')
      .populate('articles.plat', 'nom image');

    return res.status(201).json(populatedOrder);
  } catch (error) {
    return next(error);
  }
}

// GET /api/orders/my-orders (client only)
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ client: req.user._id })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'nom image fraisLivraison adresse')
      .populate('articles.plat', 'nom image');

    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}

// GET /api/orders/restaurant (restaurateur, admin)
async function getRestaurantOrders(req, res, next) {
  try {
    const query = {};

    if (req.user.role === 'admin') {
      if (req.query.restaurant) {
        query.restaurant = req.query.restaurant;
      }
    } else {
      const ownedRestaurants = await Restaurant.find({ owner: req.user._id }).select('_id');
      const restIds = ownedRestaurants.map((r) => r._id);
      query.restaurant = { $in: restIds };
    }

    if (req.query.statut && req.query.statut !== 'all') {
      query.statut = req.query.statut;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('client', 'nom prenom telephone email')
      .populate('restaurant', 'nom image adresse')
      .populate('articles.plat', 'nom image');

    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}

// GET /api/orders/:id (client owner, restaurant owner, admin)
async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'nom image fraisLivraison adresse owner')
      .populate('client', 'nom prenom telephone email')
      .populate('articles.plat', 'nom image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isClientOwner =
      order.client &&
      (order.client._id ? order.client._id.toString() : order.client.toString()) === req.user._id.toString();
    const isRestaurantOwner =
      order.restaurant &&
      order.restaurant.owner &&
      (order.restaurant.owner._id ? order.restaurant.owner._id.toString() : order.restaurant.owner.toString()) ===
        req.user._id.toString();

    if (!isAdmin && !isClientOwner && !isRestaurantOwner) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to view this order' });
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
}

// PUT /api/orders/:id/status (admin, restaurant owner, or client cancelling en_attente)
async function updateOrderStatus(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate('restaurant');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { statut } = req.body;
    if (!statut) {
      return res.status(400).json({ message: 'New status (statut) is required' });
    }

    if (order.statut === 'livree' || order.statut === 'annulee') {
      return res.status(400).json({ message: 'Order can no longer be modified' });
    }

    const allowedTransitions = ORDER_TRANSITIONS[order.statut] || [];
    if (!allowedTransitions.includes(statut)) {
      return res.status(400).json({
        message: `Invalid status transition from "${order.statut}" to "${statut}". Allowed next statuses: ${allowedTransitions.join(', ') || 'none'}`,
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isClientOwner = order.client.toString() === req.user._id.toString();
    const isRestaurantOwner =
      order.restaurant &&
      order.restaurant.owner &&
      order.restaurant.owner.toString() === req.user._id.toString();

    if (isAdmin) {
      // Allowed
    } else if (req.user.role === 'restaurateur') {
      if (!isRestaurantOwner) {
        return res.status(403).json({ message: 'Forbidden: You do not own this restaurant' });
      }
    } else if (req.user.role === 'client') {
      if (!isClientOwner || order.statut !== 'en_attente' || statut !== 'annulee') {
        return res.status(403).json({ message: 'Clients can only cancel their own pending orders' });
      }
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    order.statut = statut;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('restaurant', 'nom image fraisLivraison adresse owner')
      .populate('client', 'nom prenom telephone email')
      .populate('articles.plat', 'nom image');

    return res.json(updatedOrder);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  ORDER_TRANSITIONS,
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
};
