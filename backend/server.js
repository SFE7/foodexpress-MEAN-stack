/**
 * FILE: backend/server.js
 * ROLE: Entry point of the Express backend; sets up middleware, mounts API routes, and starts DB.
 * USED BY / TALKS TO: Called by Node (`npm start` / `npm run dev`); talks to MongoDB & routes/*.js.
 * KEY IDEA: Express handles HTTP requests in order: global middleware -> route -> error handler.
 */
// Load secret settings (PORT, MONGO_URI, JWT_SECRET) from backend/.env into process.env
require('dotenv').config();
// CORS lets our Angular app (localhost:4200) talk to this API (localhost:5000) safely
const cors = require('cors');
const express = require('express');
const connectDatabase = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const restaurantRoutes = require('./routes/restaurantRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
app.use(cors());
// Parse incoming JSON request bodies so controllers can read req.body
app.use(express.json());

// Quick health-check endpoint to verify the server is alive
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
// Mount each feature router under its /api/* base path
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/dashboard', dashboardRoutes);

// Global error-handling middleware (4 args): catches any error passed via next(error)
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json({ message: 'Internal server error' });
});

const port = Number(process.env.PORT) || 5000;
// Connect to MongoDB first, then start listening for HTTP traffic
connectDatabase()
  .then(() => app.listen(port, () => console.log(`Server listening on port ${port}`)))
  .catch((error) => {
    console.error('Unable to start server:', error);
    process.exitCode = 1;
  });
