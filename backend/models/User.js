/**
 * FILE: backend/models/User.js
 * ROLE: MongoDB Mongoose model.
 * USED BY / TALKS TO: Controllers and seed scripts.
 * KEY IDEA: A Mongoose schema describes stored fields.
 */
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Required identity fields keep accounts readable and prevent blank profiles.
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    // Email is unique and normalized; lowering it avoids duplicate account spellings.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telephone: { type: String, required: true, trim: true },
    // SECURITY: select false hides the password by default in normal database queries.
    password: { type: String, required: true, select: false },
    // Registration allows client/restaurateur; admin is assigned outside normal registration.
    role: { type: String, enum: ['client', 'restaurateur', 'admin'], default: 'client' },
    // Disabling this flag lets admins block login without deleting the account.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// SECURITY: every password change is hashed before MongoDB stores it.
userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

module.exports = mongoose.model('User', userSchema);
