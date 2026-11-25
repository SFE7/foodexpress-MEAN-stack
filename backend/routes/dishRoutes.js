const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// GET / (PUBLIC)
router.get('/', dishController.getDishes);

// GET /:id (PUBLIC)
router.get('/:id', dishController.getDishById);

// POST / (restaurateur, admin)
router.post(
  '/',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  dishController.createDish
);

// PUT /:id (restaurateur, admin)
router.put(
  '/:id',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  dishController.updateDish
);

// DELETE /:id (restaurateur, admin)
router.delete(
  '/:id',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  dishController.deleteDish
);

module.exports = router;
