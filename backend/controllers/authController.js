/**
 * FILE: backend/controllers/authController.js
 * ROLE: API request controller.
 * USED BY / TALKS TO: Route files call exported handlers.
 * KEY IDEA: Validate input and return HTTP responses.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper: prepares safe values or data for the controller.
function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  // SECURITY: the signed JWT carries identity and role for protected routes.
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Helper: prepares safe values or data for the controller.
function publicUser(user) {
  const result = user.toObject ? user.toObject() : { ...user };
  // SECURITY: password hashes must never be returned to the browser.
  delete result.password;
  return result;
}

// Route: POST /api/auth/register; called by public visitors.
// Steps: validate input, query or update MongoDB, then return JSON.
// Possible errors: 400 for bad fields or 409 for duplicate email.
async function register(req, res, next) {
  try {
    const body = req.body || {};
    const { nom, prenom, email, telephone, password, confirmPassword } = body;
    const role = body.role === undefined ? 'client' : body.role;

    if (![nom, prenom, email, telephone, password, confirmPassword].every(
      (value) => typeof value === 'string' && value.trim()
    )) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (!['client', 'restaurateur'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    // SECURITY: public registration cannot create an admin account.

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({ nom, prenom, email: normalizedEmail, telephone, password, role });
    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    return next(error);
  }
}

// Route: POST /api/auth/login; called by public visitors.
// Steps: validate input, query or update MongoDB, then return JSON.
// Possible errors: 400 for missing data or 401 for bad credentials.
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    // DEMO TIP: explain that bcrypt.compare verifies the password without revealing it.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account disabled' });
    }

    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

// Route: GET /api/auth/me; called by authenticated users.
// Steps: validate input, query or update MongoDB, then return JSON.
// Possible errors: 401 when the JWT is missing or invalid; unexpected failures go to next(error).
function getMe(req, res) {
  return res.json({ user: publicUser(req.user) });
}

// Route: PUT /api/auth/profile; called by authenticated users.
// Steps: validate input, query or update MongoDB, then return JSON.
// Possible errors: 400 for invalid fields; unexpected failures go to next(error).
async function updateProfile(req, res, next) {
  try {
    const body = req.body || {};
    const { nom, prenom, telephone, password } = body;
    for (const field of ['nom', 'prenom', 'telephone']) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'string' || !body[field].trim()) {
          return res.status(400).json({ message: `${field} cannot be empty` });
        }
        req.user[field] = body[field].trim();
      }
    }
    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }
      req.user.password = password;
    }

    const user = await req.user.save();
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, getMe, updateProfile };
