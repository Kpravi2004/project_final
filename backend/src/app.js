const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Real Estate API is running' });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const propertyRoutes = require('./routes/propertyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/predict', predictionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
