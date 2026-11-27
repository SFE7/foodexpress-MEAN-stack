/**
 * FILE: backend/routes/userRoutes.js
 * ROLE: Express route definitions.
 * USED BY / TALKS TO: server.js mounts this router.
 * KEY IDEA: Route order determines which handler runs.
 */
const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate, authorize('admin'));
// GET /: public by default; calls the controller.
router.get('/', userController.listUsers);
// PATCH /:id/toggle-active: public by default; calls the controller.
router.patch('/:id/toggle-active', userController.toggleActive);

module.exports = router;
