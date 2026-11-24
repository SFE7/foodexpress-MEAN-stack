const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    prix: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    disponible: { type: Boolean, default: true },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dish', dishSchema);
