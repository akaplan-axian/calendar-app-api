# Development Guide

This guide covers the development workflow, architecture, and best practices for the Calendar App API.

## Architecture Overview

The Calendar App API follows a **schema-first development** approach with a modular architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OpenAPI Spec  │───▶│  openapi-backend │───▶│    Handlers     │
│  (openapi.yaml) │    │   (Validation)   │    │  (Business Logic)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │◀───│  Objection.js   │◀───│     Models      │
│   (Database)    │    │     (ORM)       │    │ (Data Layer)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Tech Stack

- **Framework**: Express.js
- **API Specification**: OpenAPI 3.1.0
- **API Backend**: openapi-backend (automatic validation and routing)
- **Database**: PostgreSQL
- **ORM**: Objection.js + Knex.js
- **Validation**: AJV (via openapi-backend)
- **Security**: Helmet.js
- **Logging**: Morgan
- **Testing**: Jest

## Project Structure

```
├── src/
│   ├── app.js                 # Main application setup with openapi-backend
│   ├── express.js             # Express server configuration
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── handlers/              # OpenAPI operation handlers
│   │   ├── events.js          # Event-related handlers
│   │   ├── health.js          # Health check handlers
│   │   └── general.js         # General API handlers
│   ├── models/                # Objection.js models
│   │   └── Event.js           # Event model with validation
│   ├── routes/                # Express route definitions
│   │   ├── events.js          # Event routes
│   │   ├── health.js          # Health routes
│   │   └── index.js           # Route aggregation
│   ├── migrations/            # Database migrations
│   ├── seeds/                 # Database seed files
│   ├── openapi/
│   │   └── openapi.yaml       # OpenAPI 3.1 specification
│   └── utils/
│       └── openapi.js         # OpenAPI utilities
├── tests/                     # Test files (mirrors src structure)
├── docs/                      # Documentation
├── knexfile.js               # Knex configuration
├── index.js                  # Application entry point
└── package.json
```

## Schema-First Development

This API follows a schema-first approach where:

1. **OpenAPI Specification** defines the API contract
2. **openapi-backend** handles routing and validation automatically
3. **Objection.js Models** use JSON Schema validation aligned with OpenAPI
4. **Database Migrations** create tables matching the API data models

### Benefits

- **Consistency**: Single source of truth for API structure
- **Automatic Validation**: Request/response validation without manual code
- **Documentation**: API documentation is always up-to-date
- **Type Safety**: Schema-driven development reduces errors
- **Contract-First**: Frontend and backend can develop in parallel

## Adding New Endpoints

Follow this workflow to add new API endpoints:

### 1. Update OpenAPI Specification

Edit `src/openapi/openapi.yaml` to add the new endpoint:

```yaml
paths:
  /api/events/{id}:
    get:
      operationId: getEventById
      summary: Get event by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Event found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Event'
        '404':
          $ref: '#/components/responses/NotFound'
```

### 2. Create Handler Function

Add the handler in the appropriate file (e.g., `src/handlers/events.js`):

```javascript
const getEventById = async (c, req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.query().findById(id);
    
    if (!event) {
      return res.status(404).json({
        error: {
          message: 'Event not found',
          code: 'EVENT_NOT_FOUND'
        }
      });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

module.exports = {
  // ... existing handlers
  getEventById
};
```

### 3. Register Handler

Map the operationId to the handler in `src/app.js`:

```javascript
const eventHandlers = require('./handlers/events');

// Register handlers
api.register({
  // ... existing handlers
  getEventById: eventHandlers.getEventById
});
```

### 4. Update Database (if needed)

If the endpoint requires database changes:

```bash
# Create migration
npx knex migrate:make add_new_field_to_events

# Update model if needed
# Edit src/models/Event.js

# Update seeds if needed
# Edit src/seeds/01_sample_events.js
```

### 5. Add Tests

Create tests in the appropriate test file:

```javascript
describe('GET /api/events/:id', () => {
  test('should return event by ID', async () => {
    const response = await request(app)
      .get('/api/events/123e4567-e89b-12d3-a456-426614174000')
      .expect(200);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title');
  });
  
  test('should return 404 for non-existent event', async () => {
    const response = await request(app)
      .get('/api/events/non-existent-id')
      .expect(404);
    
    expect(response.body.error.code).toBe('EVENT_NOT_FOUND');
  });
});
```

## Validation

### Request/Response Validation

Validation is automatically handled by openapi-backend using the OpenAPI specification:

- **Request Validation**: All incoming requests are validated against schemas
- **Response Validation**: All outgoing responses are validated (in development)
- **Error Handling**: Validation errors return standardized error responses

### Model Validation

Objection.js models use JSON Schema validation:

```javascript
// src/models/Event.js
class Event extends Model {
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['title', 'startDate', 'endDate'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        location: { type: 'string', maxLength: 255 }
      }
    };
  }
}
```

## Error Handling

### Standardized Error Responses

All errors follow a consistent format:

```javascript
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional details
  }
}
```

### Error Handler Implementation

```javascript
const handleError = (error, res) => {
  console.error('Error:', error);
  
  if (error.statusCode) {
    // Known error with status code
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      }
    });
  }
  
  // Unknown error - return 500
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  });
};
```

### Common Error Patterns

```javascript
// Validation error
res.status(400).json({
  error: {
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: { field: 'title', message: 'Title is required' }
  }
});

// Not found error
res.status(404).json({
  error: {
    message: 'Event not found',
    code: 'EVENT_NOT_FOUND'
  }
});

// Conflict error
res.status(409).json({
  error: {
    message: 'Event already exists',
    code: 'EVENT_CONFLICT'
  }
});
```

## Development Workflow

### Daily Development

1. **Start Development Environment**
   ```bash
   docker-compose up -d
   # or for local development
   npm run dev
   ```

2. **Make Changes**
   - Update OpenAPI spec first
   - Implement handlers
   - Update models if needed
   - Add/update tests

3. **Test Changes**
   ```bash
   npm test
   npm run test:coverage
   ```

4. **Validate API Spec**
   ```bash
   npm run validate-openapi
   ```

### Feature Development Process

1. **Plan the Feature**
   - Define API endpoints needed
   - Plan database schema changes
   - Consider validation requirements

2. **Update OpenAPI Specification**
   - Add new paths and operations
   - Define request/response schemas
   - Add examples and descriptions

3. **Database Changes**
   - Create migrations if needed
   - Update models
   - Update seeds

4. **Implement Handlers**
   - Create business logic
   - Handle errors appropriately
   - Follow existing patterns

5. **Add Tests**
   - Unit tests for handlers
   - Integration tests for endpoints
   - Test error conditions

6. **Documentation**
   - Update API documentation
   - Add code comments
   - Update this guide if needed

## Best Practices

### Code Organization

1. **Separation of Concerns**
   - Handlers contain business logic
   - Models handle data operations
   - Routes are minimal (handled by openapi-backend)

2. **Consistent Naming**
   - Use camelCase for JavaScript
   - Use snake_case for database columns
   - Use kebab-case for URLs

3. **Error Handling**
   - Always handle errors gracefully
   - Use consistent error response format
   - Log errors for debugging

### OpenAPI Best Practices

1. **Schema Organization**
   - Define all schemas in `components/schemas`
   - Use `$ref` pointers instead of inline schemas
   - Reuse common response schemas

2. **Documentation**
   - Provide clear descriptions
   - Include realistic examples
   - Document all possible responses

3. **Validation**
   - Define proper constraints
   - Use appropriate data types
   - Include format specifications

### Database Best Practices

1. **Migrations**
   - Keep migrations atomic
   - Always implement rollback
   - Test migrations thoroughly

2. **Models**
   - Use JSON Schema validation
   - Define relationships clearly
   - Keep models focused

3. **Queries**
   - Use Objection.js query builder
   - Avoid raw SQL when possible
   - Consider performance implications

## Testing Strategy

### Test Types

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test complete request/response cycles
3. **Database Tests**: Test model operations (with test database)

### Test Structure

```javascript
describe('Feature', () => {
  beforeEach(async () => {
    // Setup test data
  });
  
  afterEach(async () => {
    // Cleanup
  });
  
  describe('Happy Path', () => {
    test('should work correctly', async () => {
      // Test implementation
    });
  });
  
  describe('Error Cases', () => {
    test('should handle errors', async () => {
      // Test error handling
    });
  });
});
```

## Debugging

### Common Debug Techniques

1. **Console Logging**
   ```javascript
   console.log('Debug info:', { variable, context });
   ```

2. **Request Logging**
   - Morgan middleware logs all requests
   - Check logs for request details

3. **Database Debugging**
   ```javascript
   // Enable Knex debugging
   const knex = require('knex')({
     // ... config
     debug: true
   });
   ```

4. **OpenAPI Validation Debugging**
   - Check openapi-backend validation errors
   - Verify schema definitions

## Performance Considerations

### Database Performance

1. **Indexes**: Add indexes for frequently queried columns
2. **Query Optimization**: Use efficient Objection.js queries
3. **Connection Pooling**: Configured automatically by Knex

### API Performance

1. **Response Size**: Keep responses focused and minimal
2. **Caching**: Consider caching for frequently accessed data
3. **Pagination**: Implement pagination for large datasets

## Security Considerations

### Current Security Measures

1. **Helmet.js**: Security headers
2. **CORS**: Cross-origin request handling
3. **Input Validation**: Automatic via OpenAPI
4. **SQL Injection Prevention**: Objection.js query builder

### Future Security Enhancements

1. **Authentication**: JWT or session-based auth
2. **Authorization**: Role-based access control
3. **Rate Limiting**: Prevent abuse
4. **Input Sanitization**: Additional input cleaning

## Related Documentation

- [Installation Guide](installation.md) - Set up development environment
- [API Documentation](api.md) - API endpoint reference
- [Database Management](database.md) - Database operations
- [Testing Guide](testing.md) - Testing strategies and coverage
- [OpenAPI Guidelines](openapi-guidelines.md) - OpenAPI specification management
