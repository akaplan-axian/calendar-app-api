const Event = require('../../src/models/Event');
const { getOpenAPISchema } = require('../../src/utils/openapi');

// Mock the openapi utils
jest.mock('../../src/utils/openapi');

describe('Event Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('static properties', () => {
    it('should have correct tableName', () => {
      expect(Event.tableName).toBe('events');
    });

    it('should have correct idColumn', () => {
      expect(Event.idColumn).toBe('id');
    });
  });

  describe('jsonSchema', () => {
    it('should return schema with database fields added', () => {
      const mockOpenAPISchema = {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
        },
        required: ['title', 'startDate', 'endDate']
      };

      getOpenAPISchema.mockReturnValue(mockOpenAPISchema);

      const schema = Event.jsonSchema;

      expect(getOpenAPISchema).toHaveBeenCalledWith('Event');
      expect(schema).toEqual({
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['title', 'startDate', 'endDate']
      });
    });

    it('should throw error when OpenAPI schema is not found', () => {
      getOpenAPISchema.mockReturnValue(null);

      expect(() => Event.jsonSchema).toThrow('Event schema not found in OpenAPI specification');
    });
  });

  describe('$beforeInsert', () => {
    it('should set createdAt and updatedAt timestamps', () => {
      const event = new Event();
      const mockDate = '2025-07-28T10:00:00.000Z';
      
      // Mock Date
      const originalDate = global.Date;
      global.Date = jest.fn(() => ({ toISOString: () => mockDate }));

      event.$beforeInsert();

      expect(event.createdAt).toBe(mockDate);
      expect(event.updatedAt).toBe(mockDate);

      // Restore original Date
      global.Date = originalDate;
    });

    it('should generate ID if not provided', () => {
      const event = new Event();
      
      // Mock Math.random to have predictable ID generation
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.123456789);

      event.$beforeInsert();

      expect(event.id).toMatch(/^evt_[a-z0-9]{9}$/);

      // Restore original Math.random
      Math.random = originalRandom;
    });

    it('should not override existing ID', () => {
      const event = new Event();
      event.id = 'existing_id';
      
      event.$beforeInsert();

      expect(event.id).toBe('existing_id');
    });
  });

  describe('$beforeUpdate', () => {
    it('should update updatedAt timestamp', () => {
      const event = new Event();
      const mockDate = '2025-07-28T10:00:00.000Z';
      
      // Mock Date
      const originalDate = global.Date;
      global.Date = jest.fn(() => ({ toISOString: () => mockDate }));

      event.$beforeUpdate();

      expect(event.updatedAt).toBe(mockDate);

      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('toJSON', () => {
    it('should remove internal fields from JSON output', () => {
      const event = new Event();
      event.id = 'evt_123';
      event.title = 'Test Event';
      event.startDate = '2025-07-28T10:00:00Z';
      event.endDate = '2025-07-28T11:00:00Z';
      event.createdAt = '2025-07-28T09:00:00Z';
      event.updatedAt = '2025-07-28T09:30:00Z';

      const json = event.toJSON();

      // Should have the main fields
      expect(json.id).toBe('evt_123');
      expect(json.title).toBe('Test Event');
      expect(json.startDate).toBe('2025-07-28T10:00:00Z');
      expect(json.endDate).toBe('2025-07-28T11:00:00Z');
      
      // Should NOT have internal fields
      expect(json.createdAt).toBeUndefined();
      expect(json.updatedAt).toBeUndefined();
    });
  });
});
