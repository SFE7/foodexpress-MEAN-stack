/**
 * FILE: backend/routes/categoryRoutes.js
 * ROLE: Express route definitions.
 * USED BY / TALKS TO: server.js mounts this router.
 * KEY IDEA: Route order determines which handler runs.
 */
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// GET / (PUBLIC)
// GET /: public by default; calls the controller.
router.get('/', categoryController.getCategories);

// POST / (restaurateur, admin)
// POST /: public by default; calls the controller.
router.post(
  '/',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  categoryController.createCategory
);

// PUT /:id (restaurateur, admin)
// PUT /:id: public by default; calls the controller.
router.put(
  '/:id',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  categoryController.updateCategory
);

// DELETE /:id (restaurateur, admin)
// DELETE /:id: public by default; calls the controller.
router.delete(
  '/:id',
  authMiddleware,
  authorize('restaurateur', 'admin'),
  categoryController.deleteCategory
);

module.exports = router;
