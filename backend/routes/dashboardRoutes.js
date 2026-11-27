/**
 * FILE: backend/routes/dashboardRoutes.js
 * ROLE: Express route definitions.
 * USED BY / TALKS TO: server.js mounts this router.
 * KEY IDEA: Route order determines which handler runs.
 */
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.use(authMiddleware);

// GET /restaurant: JWT plus role check required; calls the controller.
router.get('/restaurant', authorize('restaurateur', 'admin'), dashboardController.getRestaurantDashboard);
// GET /admin: JWT plus role check required; calls the controller.
router.get('/admin', authorize('admin'), dashboardController.getAdminDashboard);

module.exports = router;
