const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// 1. POST / (client only)
router.post('/', authMiddleware, authorize('client'), orderController.createOrder);

// 2. GET /my-orders (client only) - defined before /:id
router.get('/my-orders', authMiddleware, authorize('client'), orderController.getMyOrders);

// 3. GET /restaurant (restaurateur, admin) - defined before /:id
router.get(
  '/restaurant',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  orderController.getRestaurantOrders
);

// 4. GET /:id (client owner, restaurant owner, admin)
router.get('/:id', authMiddleware, orderController.getOrderById);

// 5. PUT /:id/status (admin, restaurant owner, or client cancelling en_attente)
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router;
