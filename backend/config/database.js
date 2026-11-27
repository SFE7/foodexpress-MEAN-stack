/**
 * FILE: backend/config/database.js
 * ROLE: Opens the connection to MongoDB using Mongoose (our Object Data Modeling library).
 * USED BY / TALKS TO: Called by backend/server.js before the HTTP server starts.
 * KEY IDEA: Mongoose maps JavaScript objects to MongoDB documents inside the "foodexpress" DB.
 */
const mongoose = require('mongoose');

async function connectDatabase() {
  // Fail fast with a clear message if MONGO_URI was forgotten in .env
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  // Always target the "foodexpress" database, even if the Atlas URI omits a DB name
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'foodexpress' });
  console.log('Connected to MongoDB');
}

module.exports = connectDatabase;
