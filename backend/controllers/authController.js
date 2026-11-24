const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  const result = user.toObject ? user.toObject() : { ...user };
  delete result.password;
  return result;
}

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

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
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

function getMe(req, res) {
  return res.json({ user: publicUser(req.user) });
}

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
