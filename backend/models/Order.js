/**
 * FILE: backend/models/Order.js
 * ROLE: MongoDB Mongoose model.
 * USED BY / TALKS TO: Controllers and seed scripts.
 * KEY IDEA: A Mongoose schema describes stored fields.
 */
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // ObjectId identifies the client who owns this order.
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // ObjectId ties this order to exactly one restaurant.
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    articles: [
      {
        // ObjectId references the dish used to validate price and availability.
        plat: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
        nom: { type: String, required: true },
        quantite: { type: Number, min: 1, required: true },
        // The accepted server price is stored so later dish edits do not change history.
        prixUnitaire: { type: Number, required: true, min: 0 },
      },
    ],
    adresseLivraison: { type: String, required: true },
    // BUSINESS RULE: subtotal is dish price multiplied by quantity.
    sousTotal: { type: Number, default: 0, min: 0 },
    fraisLivraison: { type: Number, default: 0, min: 0 },
    // BUSINESS RULE: total equals subtotal plus delivery fee.
    total: { type: Number, default: 0, min: 0 },
    // Payment mode is limited to delivery or online payment.
    modePaiement: { type: String, enum: ['livraison', 'en_ligne'], default: 'livraison' },
    // BUSINESS RULE: status follows the server-defined lifecycle below.
    statut: {
      type: String,
      enum: ['en_attente', 'acceptee', 'en_preparation', 'en_livraison', 'livree', 'annulee'],
      default: 'en_attente',
    },
    remarque: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
