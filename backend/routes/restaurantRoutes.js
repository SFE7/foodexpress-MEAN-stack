const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth helper for public routes that allow owners/admins to view non-validated details
async function optionalAuth(req, res, next) {
  const authorization = req.get('Authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select('-password');
      if (user && user.isActive !== false) {
        req.user = user;
      }
    } catch {
      // Ignore token errors for optional auth
    }
  }
  next();
}

// 1. GET / (PUBLIC)
router.get('/', restaurantController.getRestaurants);

// 2. GET /mine (restaurateur or admin) - declared BEFORE /:id
router.get(
  '/mine',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  restaurantController.getMyRestaurants
);

// 2b. GET /admin/all (admin only) - declared BEFORE /:id
router.get(
  '/admin/all',
  authMiddleware,
  authorize('admin'),
  restaurantController.getAllRestaurantsAdmin
);

// 3. GET /cuisines (PUBLIC) - declared BEFORE /:id
router.get('/cuisines', restaurantController.getCuisines);

// 4. GET /:id (PUBLIC or authenticated owner/admin if not validated)
router.get('/:id', optionalAuth, restaurantController.getRestaurantById);

// 5. POST / (restaurateur, admin)
router.post(
  '/',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  restaurantController.createRestaurant
);

// 6. PUT /:id (restaurateur owner or admin)
router.put(
  '/:id',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  restaurantController.updateRestaurant
);

// 7. DELETE /:id (owner or admin)
router.delete(
  '/:id',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  restaurantController.deleteRestaurant
);

// 8. PATCH /:id/status (admin only)
router.patch(
  '/:id/status',
  authMiddleware,
  authorize('admin'),
  restaurantController.updateRestaurantStatus
);

module.exports = router;
