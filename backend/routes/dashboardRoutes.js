const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.use(authMiddleware);

router.get('/restaurant', authorize('restaurateur', 'admin'), dashboardController.getRestaurantDashboard);
router.get('/admin', authorize('admin'), dashboardController.getAdminDashboard);

module.exports = router;
