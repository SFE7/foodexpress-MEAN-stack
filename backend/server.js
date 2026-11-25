require('dotenv').config();
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
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json({ message: 'Internal server error' });
});

const port = Number(process.env.PORT) || 5000;
connectDatabase()
  .then(() => app.listen(port, () => console.log(`Server listening on port ${port}`)))
  .catch((error) => {
    console.error('Unable to start server:', error);
    process.exitCode = 1;
  });
