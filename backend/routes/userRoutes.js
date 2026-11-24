const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate, authorize('admin'));
router.get('/', userController.listUsers);
router.patch('/:id/toggle-active', userController.toggleActive);

module.exports = router;
