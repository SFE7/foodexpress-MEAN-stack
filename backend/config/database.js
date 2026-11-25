const mongoose = require('mongoose');

async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(process.env.MONGO_URI, { dbName: 'foodexpress' });
  console.log('Connected to MongoDB');
}

module.exports = connectDatabase;
