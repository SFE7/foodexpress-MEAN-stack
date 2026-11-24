const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    adresse: { type: String, default: '' },
    typeCuisine: { type: String, default: '' },
    image: { type: String, default: '' },
    fraisLivraison: { type: Number, default: 0, min: 0 },
    horaires: { type: String, default: '' },
    isOpen: { type: Boolean, default: true },
    status: { type: String, enum: ['pending', 'validated', 'suspended'], default: 'pending' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
