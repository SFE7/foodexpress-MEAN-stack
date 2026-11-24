const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    articles: [
      {
        plat: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
        nom: { type: String, required: true },
        quantite: { type: Number, min: 1, required: true },
        prixUnitaire: { type: Number, required: true, min: 0 },
      },
    ],
    adresseLivraison: { type: String, required: true },
    sousTotal: { type: Number, default: 0, min: 0 },
    fraisLivraison: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    modePaiement: { type: String, enum: ['livraison', 'en_ligne'], default: 'livraison' },
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
