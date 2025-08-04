// Test setup file - runs before all tests
process.env.NODE_ENV = 'test';

// Mock the Event model to prevent database connections
jest.mock('../src/models/Event', () => {
  class MockEvent {
    constructor(data) {
      Object.assign(this, data);
      this.id = this.id || 'evt_' + Math.random().toString(36).substr(2, 9);
    }

    static get tableName() {
      return 'events';
    }

    static get idColumn() {
      return 'id';
    }

    static get jsonSchema() {
      // Try to import and call the getOpenAPISchema function
      try {
        const { getOpenAPISchema } = require('../src/utils/openapi');
        const eventSchema = getOpenAPISchema('Event');
        
        if (!eventSchema) {
          throw new Error('Event schema not found in OpenAPI specification');
        }
        
        // Create a copy and add internal fields for database operations
        const dbSchema = {
          ...eventSchema,
          properties: {
            ...eventSchema.properties,
            // Add internal database fields
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        };
        
        return dbSchema;
      } catch (error) {
        // If the error is specifically about the schema not being found, re-throw it
        if (error.message === 'Event schema not found in OpenAPI specification') {
          throw error;
        }
        
        // Fallback schema for when OpenAPI utils are not available or mocked differently
        return {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            location: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['title', 'startDate', 'endDate']
        };
      }
    }

    static query = jest.fn().mockReturnValue({
      orderBy: jest.fn().mockReturnThis(),
      insert: jest.fn().mockImplementation((data) => {
        const event = new MockEvent(data);
        return Promise.resolve(event);
      }),
      then: jest.fn().mockResolvedValue([]),
    });

    $beforeInsert() {
      const now = new Date().toISOString();
      this.createdAt = now;
      this.updatedAt = now;
      
      if (!this.id) {
        this.id = 'evt_' + Math.random().toString(36).substr(2, 9);
      }
    }

    $beforeUpdate() {
      this.updatedAt = new Date().toISOString();
    }

    toJSON() {
      const json = { ...this };
      delete json.createdAt;
      delete json.updatedAt;
      return json;
    }
  }

  return MockEvent;
});

// Mock knex for other potential database operations
jest.mock('knex', () => {
  const mockKnex = {
    destroy: jest.fn().mockResolvedValue(),
    raw: jest.fn().mockResolvedValue({ rows: [] }),
  };
  return jest.fn(() => mockKnex);
});

// Mock Objection.js Model for other models
jest.mock('objection', () => {
  class MockModel {
    static knex(knexInstance) {
      if (knexInstance) {
        // Setting knex instance
        return;
      }
      // Getting knex instance
      return {
        destroy: jest.fn().mockResolvedValue(),
      };
    }
  }
  
  return {
    Model: MockModel,
  };
});

// Note: OpenAPI utility functions are not mocked globally
// Individual tests mock them as needed

// Temporarily enable console output to debug issues
// const originalConsoleLog = console.log;
// const originalConsoleError = console.error;

// beforeAll(() => {
//   console.log = jest.fn();
//   console.error = jest.fn();
// });

// afterAll(() => {
//   console.log = originalConsoleLog;
//   console.error = originalConsoleError;
// });
