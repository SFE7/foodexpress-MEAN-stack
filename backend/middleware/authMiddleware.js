/**
 * FILE: backend/middleware/authMiddleware.js
 * ROLE: Verifies the JWT sent by the browser and attaches the logged-in user to req.user.
 * USED BY / TALKS TO: Used by all protected routes in backend/routes/*.js; reads User model.
 * KEY IDEA: Middleware is a gatekeeper function (req, res, next) that runs before a controller.
 */
// JWT (JSON Web Token) is a signed digital wristband proving who the user is
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticate(req, res, next) {
  // Step 1: Read "Authorization: Bearer <token>" from the HTTP request headers
  const authorization = req.get('Authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // SECURITY: Verify signature with our secret key; throws if tampered or expired
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Step 2: Load the fresh user from MongoDB, excluding the hashed password
    const user = await User.findById(payload.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // SECURITY: Disabled accounts are blocked immediately even if their token has not expired
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account disabled' });
    }

    // Step 3: Save user on req so downstream middleware/controllers know who is calling
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return next(error);
  }
}

module.exports = authenticate;
