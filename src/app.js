const OpenAPIBackend = require('openapi-backend').default;
const { Model } = require('objection');
const Knex = require('knex');

// Import database configuration
const dbConfig = require('./config/database').current;

// Import OpenAPI utility
const { loadOpenAPISpec } = require('./utils/openapi');

// Import handlers
const { getApiInfo } = require('./handlers/general');
const { getHealthStatus } = require('./handlers/health');
const { getCalendarEvents, createCalendarEvent } = require('./handlers/events');

// Initialize Knex and bind it to Objection.js
const knex = Knex(dbConfig);
Model.knex(knex);

// Load OpenAPI specification
const openApiSpec = loadOpenAPISpec();

// Debug logging: Log the full OpenAPI specification
console.log('=== DEBUG: Full OpenAPI Specification ===');
console.log(JSON.stringify(openApiSpec, null, 2));
console.log('=== END DEBUG: OpenAPI Specification ===');

// Create OpenAPI backend instance
const api = new OpenAPIBackend({
  definition: openApiSpec,
  validate: true,
  ajvOpts: {
    strict: false,
    validateFormats: true
  }
});

// Register operation handlers
api.register({
  // Map operationIds to handler functions
  getApiInfo,
  getHealthStatus,
  getCalendarEvents,
  createCalendarEvent,
  
  // Default handlers
  notFound: (c, req, res) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.path
    });
  },
  
  notImplemented: (c, req, res) => {
    const { status, mock } = c.api.mockResponseForOperation(c.operation.operationId);
    res.status(status).json(mock);
  },
  
  validationFail: (c, req, res) => {
    const errors = c.validation.errors.map(error => ({
      field: error.instancePath || error.schemaPath,
      message: error.message,
      rejectedValue: error.data
    }));
    
    res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  },
  
  unauthorizedHandler: (c, req, res) => {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
});

// Initialize the OpenAPI backend
api.init();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await knex.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await knex.destroy();
  process.exit(0);
});

module.exports = { api, knex };
