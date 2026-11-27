/**
 * FILE: backend/controllers/userController.js
 * ROLE: API request controller.
 * USED BY / TALKS TO: Route files call exported handlers.
 * KEY IDEA: Validate input and return HTTP responses.
 */
const User = require('../models/User');

// Helper: prepares safe values or data for the controller.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Route: GET /api/users; called by admin users.
// Steps: validate input, query or update MongoDB, then return JSON.
// Possible errors: 403 for non-admin; unexpected failures go to next(error).
async function listUsers(req, res, next) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filter = search
      ? { $or: ['nom', 'prenom', 'email'].map((field) => ({ [field]: new RegExp(escapeRegex(search), 'i') })) }
      : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
}

// Route: PATCH /api/users/:id/toggle-active; called by admin users.
// Steps: validate input, query or update MongoDB, then return JSON.
// Possible errors: 400 for self-toggle, 404 if missing; unexpected failures go to next(error).
async function toggleActive(req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listUsers, toggleActive };
