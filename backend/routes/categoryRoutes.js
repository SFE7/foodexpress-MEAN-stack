const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// GET / (PUBLIC)
router.get('/', categoryController.getCategories);

// POST / (restaurateur, admin)
router.post(
  '/',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  categoryController.createCategory
);

// PUT /:id (restaurateur, admin)
router.put(
  '/:id',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  categoryController.updateCategory
);

// DELETE /:id (restaurateur, admin)
router.delete(
  '/:id',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  categoryController.deleteCategory
);

module.exports = router;
