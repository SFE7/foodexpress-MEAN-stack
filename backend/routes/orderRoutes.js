/**
 * FILE: backend/routes/orderRoutes.js
 * ROLE: Express route definitions.
 * USED BY / TALKS TO: server.js mounts this router.
 * KEY IDEA: Route order determines which handler runs.
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// 1. POST / (client only)
// POST /: JWT plus role check required; calls the controller.
router.post('/', authMiddleware, authorize('client'), orderController.createOrder);

// 2. GET /my-orders (client only) - defined before /:id
// GET /my-orders: JWT plus role check required; calls the controller.
router.get('/my-orders', authMiddleware, authorize('client'), orderController.getMyOrders);

// 3. GET /restaurant (restaurateur, admin) - defined before /:id
// GET /restaurant: public by default; calls the controller.
router.get(
  '/restaurant',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  orderController.getRestaurantOrders
);

// 4. GET /:id (client owner, restaurant owner, admin)
// GET /:id: JWT authentication required; calls the controller.
router.get('/:id', authMiddleware, orderController.getOrderById);

// 5. PUT /:id/status (admin, restaurant owner, or client cancelling en_attente)
// PUT /:id/status: JWT authentication required; calls the controller.
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router;
