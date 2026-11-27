/**
 * FILE: backend/routes/dishRoutes.js
 * ROLE: Express route definitions.
 * USED BY / TALKS TO: server.js mounts this router.
 * KEY IDEA: Route order determines which handler runs.
 */
const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// GET / (PUBLIC)
// GET /: public by default; calls the controller.
router.get('/', dishController.getDishes);

// GET /:id (PUBLIC)
// GET /:id: public by default; calls the controller.
router.get('/:id', dishController.getDishById);

// POST / (restaurateur, admin)
// POST /: public by default; calls the controller.
router.post(
  '/',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  dishController.createDish
);

// PUT /:id (restaurateur, admin)
// PUT /:id: public by default; calls the controller.
router.put(
  '/:id',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  dishController.updateDish
);

// DELETE /:id (restaurateur, admin)
// DELETE /:id: public by default; calls the controller.
router.delete(
  '/:id',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  dishController.deleteDish
);

module.exports = router;
