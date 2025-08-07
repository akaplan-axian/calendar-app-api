const { Model } = require('objection');
const { getOpenAPISchema } = require('../utils/openapi');

class Event extends Model {
  static get tableName() {
    return 'events';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    // Get the Event schema from OpenAPI specification
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
  }

  $beforeInsert() {
    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
    
    // Generate ID if not provided
    if (!this.id) {
      this.id = 'evt_' + Math.random().toString(36).substr(2, 9);
    }
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }

  // Convert to OpenAPI response format
  toJSON() {
    const json = super.toJSON();
    
    // Remove internal fields from API responses
    delete json.createdAt;
    delete json.updatedAt;
    
    // Remove null values to keep the API response clean
    Object.keys(json).forEach(key => {
      if (json[key] === null) {
        delete json[key];
      }
    });
    
    return json;
  }
}

module.exports = Event;
