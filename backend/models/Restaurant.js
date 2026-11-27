/**
 * FILE: backend/models/Restaurant.js
 * ROLE: MongoDB Mongoose model.
 * USED BY / TALKS TO: Controllers and seed scripts.
 * KEY IDEA: A Mongoose schema describes stored fields.
 */
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    // Required name identifies the restaurant in lists and order records.
    nom: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    adresse: { type: String, default: '' },
    typeCuisine: { type: String, default: '' },
    image: { type: String, default: '' },
    // BUSINESS RULE: delivery fee is reused when the server calculates an order total.
    fraisLivraison: { type: Number, default: 0, min: 0 },
    horaires: { type: String, default: '' },
    // An open restaurant may accept orders; a closed one must reject checkout.
    isOpen: { type: Boolean, default: true },
    // Only validated restaurants should receive client orders.
    status: { type: String, enum: ['pending', 'validated', 'suspended'], default: 'pending' },
    // ObjectId links the restaurant to its User owner.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
