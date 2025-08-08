# System Patterns - Calendar App API

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   OpenAPI 3.1   │───▶│  openapi-backend │───▶│   Express.js    │
│  Specification  │    │   (Validation)   │    │   Application   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AJV Validator │    │     Handlers     │    │   Middleware    │
│  (with formats) │    │   (Business      │    │   (Security,    │
│                 │    │    Logic)        │    │   CORS, Logs)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Objection.js  │───▶│     Knex.js      │───▶│   PostgreSQL    │
│   ORM Models    │    │  Query Builder   │    │    Database     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Design Patterns

## 1. Schema-First Development Pattern

**Pattern**: Single Source of Truth
**Implementation**: OpenAPI specification drives all validation and routing

```yaml
# OpenAPI Specification (src/openapi/openapi.yaml)
paths:
  /api/events:
    post:
      operationId: createCalendarEvent  # Maps to handler function
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateEventRequest'
```

```javascript
// Handler Registration (src/app.js)
api.register({
  createCalendarEvent,  // Function name matches operationId
  // Automatic validation happens before handler execution
});
```

**Benefits:**

- API documentation never goes out of sync
- Validation logic is centralized
- Consistent error responses
- Type safety across the stack

## 2. Validation Alignment Pattern

**Pattern**: Dual-Layer Validation with Schema Reuse
**Implementation**: Database models use OpenAPI schemas for validation

```javascript
// Model Validation (src/models/Event.js)
static get jsonSchema() {
  const eventSchema = getOpenAPISchema('Event');  // Reuse OpenAPI schema
  return {
    ...eventSchema,
    properties: {
      ...eventSchema.properties,
      // Add internal database fields
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  };
}
```

**Benefits:**

- API and database validation stay in sync
- Single schema definition for both layers
- Consistent validation rules
- Reduced maintenance overhead

## 3. Automatic Routing Pattern

**Pattern**: Convention-Based Handler Mapping
**Implementation**: operationId in OpenAPI maps to handler function names

```javascript
// OpenAPI Backend Configuration (src/app.js)
const api = new OpenAPIBackend({
  definition: openApiSpec,
  validate: true,
  // Handlers automatically mapped by operationId
});

api.register({
  getCalendarEvents,     // operationId: getCalendarEvents
  createCalendarEvent,   // operationId: createCalendarEvent
  getHealthStatus,       // operationId: getHealthStatus
});
```

**Benefits:**

- No manual route definitions needed
- Automatic request/response validation
- Consistent error handling
- Self-documenting API structure

## 4. Error Handling Pattern

**Pattern**: Structured Error Responses with Context
**Implementation**: Centralized error handling with detailed field information

```javascript
// Validation Error Handler (src/app.js)
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
}
```

**Benefits:**

- Consistent error response format
- Field-level error details
- Proper HTTP status codes
- Client-friendly error messages

## 5. Database Migration Pattern

**Pattern**: Version-Controlled Schema Evolution
**Implementation**: Knex.js migrations with up/down operations

```javascript
// Migration Structure (src/migrations/*)
exports.up = function(knex) {
  return knex.schema.createTable('events', (table) => {
    table.string('id').primary();
    table.string('title', 100).notNullable();
    // ... other fields
    table.index(['startDate', 'endDate']);  // Performance indexes
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('events');
};
```

**Benefits:**

- Reversible database changes
- Version control for schema
- Team collaboration on database changes
- Production deployment safety

## Key Technical Decisions

### 1. OpenAPI Backend Choice

**Decision**: Use openapi-backend instead of express-openapi-validator
**Rationale**:

- More comprehensive OpenAPI 3.1 support
- Built-in mock response generation
- Better error handling customization
- Automatic routing based on operationIds

**Implementation Details:**

```javascript
const api = new OpenAPIBackend({
  definition: openApiSpec,
  validate: true,
  ajvOpts: {
    strict: false,           // Handle OpenAPI schema variations
    validateFormats: true,   // Enable format validation
  },
  customizeAjv: (ajv) => {
    addFormats(ajv);        // Add date-time format support
    return ajv;
  }
});
```

### 2. Objection.js ORM Choice

**Decision**: Use Objection.js over Sequelize or TypeORM
**Rationale**:

- Built on Knex.js for powerful query building
- JSON Schema validation aligns with OpenAPI
- Lightweight and flexible
- Excellent PostgreSQL support

**Implementation Pattern:**

```javascript
class Event extends Model {
  static get tableName() { return 'events'; }
  
  static get jsonSchema() {
    return getOpenAPISchema('Event');  // Reuse OpenAPI schema
  }
  
  $beforeInsert() {
    this.id = 'evt_' + Math.random().toString(36).substr(2, 9);
    this.createdAt = new Date().toISOString();
  }
}
```

### 3. Database Configuration Strategy

**Decision**: Environment-based configuration with fallbacks
**Implementation**:

```javascript
const config = {
  development: { /* local settings */ },
  test: { /* test database */ },
  production: { /* production with SSL */ }
};

module.exports.current = config[process.env.NODE_ENV || 'development'];
```

**Benefits:**

- Easy environment switching
- Secure production configuration
- Consistent development setup

### 4. Middleware Stack Design

**Decision**: Minimal, focused middleware stack
**Implementation Order:**

1. **Helmet.js** - Security headers
2. **CORS** - Cross-origin support
3. **Morgan** - Request logging
4. **Express.json()** - Body parsing
5. **OpenAPI Backend** - Validation and routing

**Rationale:**

- Security first (Helmet)
- Enable cross-origin requests early
- Log all requests for debugging
- Parse body before validation
- OpenAPI handles routing last

## Component Relationships

### Request Flow Architecture

```
HTTP Request
    │
    ▼
┌─────────────────┐
│   Middleware    │ ◄── Helmet, CORS, Morgan, Body Parser
│     Stack       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ OpenAPI Backend │ ◄── Route matching, Request validation
│   Validation    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│    Handler      │ ◄── Business logic, Database operations
│   Function      │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Objection.js    │ ◄── Model validation, Database queries
│     Model       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   PostgreSQL    │ ◄── Data persistence
│   Database      │
└─────────────────┘
    │
    ▼
HTTP Response (validated against OpenAPI schema)
```

### Data Flow Patterns

**Create Event Flow:**

1. Client sends POST request to `/api/events`
2. Middleware processes security, CORS, logging
3. OpenAPI Backend validates request against schema
4. Handler function receives validated data
5. Objection.js model validates data again (database layer)
6. Database insert operation via Knex.js
7. Response formatted and validated against OpenAPI schema
8. Client receives structured response

**Error Flow:**

1. Validation failure at any layer
2. Structured error response generated
3. Proper HTTP status code set
4. Field-level error details included
5. Consistent error format returned

## Testing Architecture Patterns

### Test Structure Pattern

```
tests/
├── handlers/          # Unit tests for business logic
├── models/           # Database model tests (mocked)
├── routes/           # Integration tests for endpoints
├── utils/            # Utility function tests
└── setup.js          # Test environment configuration
```

### Mocking Strategy

**Database Mocking:**

```javascript
// Mock Objection.js queries
jest.mock('../src/models/Event');
const Event = require('../src/models/Event');

Event.query.mockReturnValue({
  insert: jest.fn().mockResolvedValue(mockEvent),
  orderBy: jest.fn().mockResolvedValue([mockEvent])
});
```

**Benefits:**

- Fast test execution
- Isolated unit tests
- Predictable test data
- No database dependencies

## Security Patterns

### Security Middleware Stack

```javascript
app.use(helmet());           // Security headers
app.use(cors());            // Cross-origin requests
app.use(express.json({ limit: '10mb' }));  // Body size limit
```

### Input Validation Security

- All inputs validated against OpenAPI schema
- SQL injection prevention via parameterized queries (Knex.js)
- XSS prevention via proper content-type headers
- Request size limits to prevent DoS attacks

## Performance Patterns

### Database Optimization

```javascript
// Index Strategy (src/migrations/*)
table.index(['startDate', 'endDate']);  // Range queries
table.index('title');                   // Text searches
```

### Connection Management

```javascript
// Graceful Shutdown Pattern (src/app.js)
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await knex.destroy();  // Close database connections
  process.exit(0);
});
```

## Deployment Patterns

### Docker Development Pattern

```yaml
# docker-compose.yml
services:
  app:
    build: .
    volumes:
      - .:/app          # Hot reload for development
    depends_on:
      - postgres
  
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: calendar_app_dev
```

**Benefits:**

- Consistent development environment
- Easy database setup
- Hot reload for development
- Production-like environment locally

This architecture provides a solid foundation for scalable, maintainable calendar API development with strong validation, testing, and operational characteristics.
