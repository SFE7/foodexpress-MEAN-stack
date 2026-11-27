/**
 * FILE: backend/models/Category.js
 * ROLE: MongoDB Mongoose model.
 * USED BY / TALKS TO: Controllers and seed scripts.
 * KEY IDEA: A Mongoose schema describes stored fields.
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    // ObjectId links a category to one restaurant; null means it is global.
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
