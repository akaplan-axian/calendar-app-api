# Active Context - Calendar App API

## Current Work Focus

### Project Status: **PRODUCTION READY** ✅

The Calendar App API is fully functional with all core features implemented and tested. The project has achieved production-ready status with comprehensive validation, testing, and operational features.

### Recent Achievements (Last Development Session)

**✅ Core API Implementation Complete:**

- Schema-first REST API with OpenAPI 3.1 specification
- Full CRUD operations for calendar events
- Automatic request/response validation via openapi-backend
- PostgreSQL integration with Objection.js ORM

**✅ Production-Ready Features:**

- Security middleware (Helmet.js) for HTTP security headers
- CORS support for cross-origin requests
- Request logging with Morgan
- Graceful shutdown handling (SIGINT/SIGTERM)
- Comprehensive error handling with proper HTTP status codes

**✅ Testing Excellence:**

- Achieved 95%+ code coverage with Jest
- Comprehensive test suite covering all handlers, models, and utilities
- Integration tests for API endpoints
- Error scenario testing for robust error handling

**✅ Development Experience:**

- Docker Compose setup for local development
- Database migrations and seed data
- Clear documentation and setup instructions
- Environment-based configuration

### Current Active Decisions

**1. Schema-First Architecture Pattern:**

- **Decision**: Use OpenAPI specification as single source of truth
- **Implementation**: openapi-backend handles routing and validation automatically
- **Benefit**: Eliminates validation inconsistencies between API and documentation
- **Pattern**: Update OpenAPI spec → automatic validation + routing

**2. Database Model Validation Alignment:**

- **Decision**: Align Objection.js JSON Schema with OpenAPI schemas
- **Implementation**: `Event.js` model uses `getOpenAPISchema('Event')` for validation
- **Benefit**: Database validation matches API validation exactly
- **Pattern**: OpenAPI schema → JSON Schema → Database validation

**3. Automatic ID Generation:**

- **Decision**: Generate event IDs automatically with 'evt_' prefix
- **Implementation**: `$beforeInsert()` hook in Event model
- **Format**: `evt_` + 9-character random string (e.g., `evt_abc123def`)
- **Benefit**: Consistent ID format, no client-side ID management needed

**4. Response Sanitization:**

- **Decision**: Remove internal database fields from API responses
- **Implementation**: `toJSON()` method removes `createdAt`, `updatedAt`, null values
- **Benefit**: Clean API responses that match OpenAPI schemas exactly

### Important Patterns and Learnings

**OpenAPI-Backend Integration Pattern:**

```javascript
// Register handlers by operationId
api.register({
  getCalendarEvents,    // Maps to operationId in OpenAPI spec
  createCalendarEvent,  // Automatic validation before handler execution
  // ... other handlers
});
```

**Model Validation Pattern:**

```javascript
static get jsonSchema() {
  const eventSchema = getOpenAPISchema('Event');
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

**Error Handling Pattern:**

```javascript
// Structured error responses with field-level details
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

### Key Technical Insights

**1. AJV Configuration for OpenAPI:**

- Required `addFormats(ajv)` for date-time format validation
- Set `strict: false` to handle OpenAPI schema variations
- Custom AJV configuration in openapi-backend initialization

**2. Database Migration Strategy:**

- Use descriptive migration names with timestamps
- Include indexes for common query patterns (`startDate`, `endDate`, `title`)
- Separate up/down migrations for safe rollbacks

**3. Docker Development Workflow:**

- `docker-compose up -d` for full environment
- `npm run db:setup` for database initialization
- Hot reload enabled for development efficiency

**4. Testing Strategy:**

- Mock external dependencies (database, external APIs)
- Test both success and error scenarios
- Use descriptive test names that explain behavior
- Maintain 95%+ coverage threshold

### Current Configuration

**Environment Variables in Use:**

```
NODE_ENV=development
DB_HOST=localhost (or postgres container)
DB_PORT=5432
DB_NAME=calendar_app_dev
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
```

**Key Dependencies:**

- `openapi-backend`: API routing and validation
- `objection`: ORM with JSON Schema validation
- `knex`: Query builder and migrations
- `helmet`: Security middleware
- `morgan`: Request logging
- `cors`: Cross-origin resource sharing

### Active Development Standards

**Code Quality Requirements:**

- All new code must have corresponding tests
- Maintain 95%+ test coverage
- Follow OpenAPI-first development approach
- Use structured error responses
- Include proper TypeScript-style JSDoc comments

**Database Standards:**

- All schema changes via migrations
- Include appropriate indexes
- Use consistent naming conventions
- Validate data at both API and database levels

**API Standards:**

- All endpoints defined in OpenAPI specification first
- Consistent error response format
- Proper HTTP status codes
- ISO 8601 date-time format for all timestamps

### Next Session Priorities

**If Continuing Development:**

1. **Enhanced Event Querying**: Add filtering, sorting, pagination
2. **Event Recurrence**: Support for recurring events
3. **Bulk Operations**: Create/update/delete multiple events
4. **Authentication**: User management and event ownership
5. **Real-time Updates**: WebSocket support for live calendar updates

**Maintenance Tasks:**

1. **Dependency Updates**: Keep packages current
2. **Security Audits**: Regular `npm audit` checks
3. **Performance Monitoring**: Add metrics and monitoring
4. **Documentation Updates**: Keep README and API docs current

### Critical Files to Remember

**Core Application Files:**

- `src/app.js` - OpenAPI backend configuration and handler registration
- `src/express.js` - Express app setup with middleware
- `src/openapi/openapi.yaml` - Single source of truth for API contract

**Key Implementation Files:**

- `src/models/Event.js` - Database model with OpenAPI schema alignment
- `src/handlers/events.js` - Event CRUD operation handlers
- `src/utils/openapi.js` - OpenAPI specification loading utilities

**Configuration Files:**

- `src/config/database.js` - Database configuration for all environments
- `jest.config.js` - Test configuration with coverage thresholds
- `docker-compose.yml` - Development environment setup

### Development Workflow Established

1. **Update OpenAPI Spec** (`src/openapi/openapi.yaml`)
2. **Create/Update Handler** (`src/handlers/`)
3. **Register Handler** in `src/app.js` by operationId
4. **Update Database Model** if needed (`src/models/`)
5. **Create Migration** if schema changes needed
6. **Write Tests** for new functionality
7. **Run Coverage** to ensure thresholds met
8. **Test with Docker** to verify full integration

This workflow ensures schema-first development with automatic validation and comprehensive testing.
