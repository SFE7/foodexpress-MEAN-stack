/**
 * FILE: backend/models/Dish.js
 * ROLE: MongoDB Mongoose model.
 * USED BY / TALKS TO: Controllers and seed scripts.
 * KEY IDEA: A Mongoose schema describes stored fields.
 */
const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    // BUSINESS RULE: price is never trusted from the client during order creation.
    prix: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    // Only available dishes may appear as valid choices for a new order.
    disponible: { type: Boolean, default: true },
    // ObjectId optionally connects this dish to a Category.
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    // ObjectId identifies the restaurant that owns this dish.
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dish', dishSchema);
