/**
 * FILE: backend/routes/authRoutes.js
 * ROLE: Express route definitions.
 * USED BY / TALKS TO: server.js mounts this router.
 * KEY IDEA: Route order determines which handler runs.
 */
const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// POST /register: public by default; calls the controller.
router.post('/register', authController.register);
// POST /login: public by default; calls the controller.
router.post('/login', authController.login);
// GET /me: JWT authentication required; calls the controller.
router.get('/me', authenticate, authController.getMe);
// PUT /profile: JWT authentication required; calls the controller.
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
