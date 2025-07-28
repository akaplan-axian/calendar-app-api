const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import validation middleware
const { validateRequest, validateResponse } = require('./middleware/validation');

// Import route modules
const indexRoutes = require('./routes/index');
const healthRoutes = require('./routes/health');
const eventsRoutes = require('./routes/events');

// Apply validation middleware
app.use(validateRequest);
app.use(validateResponse);

// Routes
app.use('/', indexRoutes);
app.use('/health', healthRoutes);
app.use('/api/events', eventsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = app;
