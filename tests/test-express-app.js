const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Create Express app for testing
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mock handlers for testing
const mockHandlers = {
  // Root route handler
  getApiInfo: (req, res) => {
    res.status(200).json({
      message: 'Calendar App API',
      version: '1.0.0',
      status: 'running'
    });
  },

  // Health route handler
  getHealthStatus: (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  },

  // Events GET handler
  getCalendarEvents: (req, res) => {
    res.status(200).json({
      events: [],
      message: 'No events found'
    });
  },

  // Events POST handler
  createCalendarEvent: (req, res) => {
    const eventData = req.body;
    const mockEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      ...eventData
    };
    
    res.status(201).json({
      id: mockEvent.id,
      message: 'Event created successfully',
      event: mockEvent
    });
  }
};

// Routes
app.get('/', mockHandlers.getApiInfo);
app.get('/health', mockHandlers.getHealthStatus);
app.get('/api/events', mockHandlers.getCalendarEvents);
app.post('/api/events', mockHandlers.createCalendarEvent);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Something went wrong!',
    message: 'Internal server error'
  });
});

module.exports = app;
