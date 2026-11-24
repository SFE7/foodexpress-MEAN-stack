const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
