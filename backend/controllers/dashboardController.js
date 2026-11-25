const mongoose = require('mongoose');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

const ORDER_STATUSES = [
  'en_attente',
  'acceptee',
  'en_preparation',
  'en_livraison',
  'livree',
  'annulee',
];

function roundAmount(value) {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}

// GET /api/dashboard/restaurant (restaurateur, admin)
async function getRestaurantDashboard(req, res, next) {
  try {
    const restaurantParam = typeof req.query.restaurant === 'string' ? req.query.restaurant.trim() : '';
    const matchFilter = {};

    if (restaurantParam) {
      if (!mongoose.Types.ObjectId.isValid(restaurantParam)) {
        return res.status(400).json({ message: 'Invalid restaurant ID' });
      }
      const restId = new mongoose.Types.ObjectId(restaurantParam);

      if (req.user.role !== 'admin') {
        const owned = await Restaurant.exists({ _id: restId, owner: req.user._id });
        if (!owned) {
          return res.status(403).json({ message: 'Forbidden: you do not own this restaurant' });
        }
      }
      matchFilter.restaurant = restId;
    } else if (req.user.role !== 'admin') {
      const ownedRestaurants = await Restaurant.find({ owner: req.user._id }).select('_id');
      matchFilter.restaurant = { $in: ownedRestaurants.map((r) => r._id) };
    }

    // Revenue rule: sum of `total` of all orders whose statut is NOT 'annulee'
    const [summaryAgg, topDishes] = await Promise.all([
      Order.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$statut', 'en_attente'] }, 1, 0] },
            },
            acceptedOrders: {
              $sum: { $cond: [{ $eq: ['$statut', 'acceptee'] }, 1, 0] },
            },
            revenue: {
              $sum: { $cond: [{ $ne: ['$statut', 'annulee'] }, '$total', 0] },
            },
          },
        },
      ]),
      Order.aggregate([
        { $match: { ...matchFilter, statut: { $ne: 'annulee' } } },
        { $unwind: '$articles' },
        {
          $group: {
            _id: '$articles.nom',
            quantite: { $sum: '$articles.quantite' },
          },
        },
        { $sort: { quantite: -1, _id: 1 } },
        { $limit: 5 },
        { $project: { _id: 0, nom: '$_id', quantite: 1 } },
      ]),
    ]);

    const summary = summaryAgg[0] || {};
    return res.json({
      totalOrders: summary.totalOrders || 0,
      pendingOrders: summary.pendingOrders || 0,
      acceptedOrders: summary.acceptedOrders || 0,
      revenue: roundAmount(summary.revenue || 0),
      topDishes,
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/dashboard/admin (admin only)
async function getAdminDashboard(req, res, next) {
  try {
    // Global revenue rule: sum of `total` of all orders whose statut is NOT 'annulee'
    const [clientsCount, restaurantsCount, ordersCount, revenueAgg, statusAgg] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { statut: { $ne: 'annulee' } } },
        { $group: { _id: null, globalRevenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } },
        { $project: { _id: 0, statut: '$_id', count: 1 } },
      ]),
    ]);

    const statusCountMap = new Map(statusAgg.map((entry) => [entry.statut, entry.count]));
    const ordersByStatus = ORDER_STATUSES.map((statut) => ({
      statut,
      count: statusCountMap.get(statut) || 0,
    }));

    return res.json({
      clientsCount,
      restaurantsCount,
      ordersCount,
      globalRevenue: roundAmount(revenueAgg[0]?.globalRevenue || 0),
      ordersByStatus,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getRestaurantDashboard,
  getAdminDashboard,
};
