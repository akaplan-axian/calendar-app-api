# OpenAPI Guidelines

## Critical Instructions for Future LLMs

This file serves as a memory bank to ensure the OpenAPI specification remains synchronized with the actual API implementation.

### 🚨 MANDATORY REQUIREMENTS

**BEFORE CONSIDERING ANY TASK COMPLETE:**
1. **ALWAYS run `npm test` and ensure ALL tests pass**
2. **If ANY tests fail, fix them IMMEDIATELY before proceeding**
3. **Never mark a task as complete with failing tests**

**ALWAYS** update `src/openapi/openapi.yaml` when making ANY of the following changes:

1. **Adding new routes/endpoints**
2. **Modifying existing routes** (path, method, parameters)
3. **Changing request/response schemas**
4. **Adding/removing middleware that affects API behavior**
5. **Updating error responses**
6. **Modifying API version or metadata**

### 📁 Current API Structure

**Main Files to Monitor:**
- `src/express.js` - Main Express app configuration
- `src/routes/*.js` - All route definitions
- `index.js` - Server startup (less likely to affect OpenAPI)

**Current Endpoints (as of last update):**
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/events` - Calendar events

### 🔄 Update Process

When modifying the API:

1. **Make code changes first**
2. **Immediately update `openapi.yaml`** to reflect:
   - New/modified paths
   - Updated request/response schemas
   - Changed status codes
   - New/modified examples
3. **Verify the OpenAPI spec matches the actual implementation**
4. **Test both the API and the OpenAPI spec**

### 📋 OpenAPI Update Checklist

For each API change, verify the OpenAPI spec includes:

- [ ] Correct HTTP method and path
- [ ] Accurate request schema (if applicable)
- [ ] Complete response schema with all properties
- [ ] Realistic examples that match actual API responses
- [ ] Proper status codes
- [ ] Updated tags and descriptions
- [ ] Error response schemas (404, 500, etc.)

### 🎯 Quality Standards

The OpenAPI specification must:
- Use OpenAPI 3.1.0 (latest version)
- Be in YAML format
- **ALL JSON schemas MUST be defined in `components/schemas` section**
- **Use JSON pointers ($ref) to reference schemas from paths**
- Include complete schemas with required fields
- Provide realistic examples
- Document all possible response codes
- Use consistent naming conventions
- Include proper descriptions for all endpoints

### 📐 Schema Organization Policy

**MANDATORY: All schemas must be centralized in `components/schemas`**

✅ **CORRECT - Use $ref pointers:**
```yaml
paths:
  /api/events:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateEventRequest'
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreateEventResponse'

components:
  schemas:
    CreateEventRequest:
      type: object
      properties:
        title:
          type: string
        # ... other properties
````

❌ __INCORRECT - Inline schemas:__

```yaml
paths:
  /api/events:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                # ... inline schema definition
```

### 🔍 Validation

Before completing any API changes:
1. **Run `npm run validate-openapi`** to check for warnings and errors
2. Ensure the OpenAPI spec can be parsed without errors
3. Verify all endpoints are documented
4. Check that examples match actual API responses
5. Confirm schema types match implementation

#### Common Validation Warnings and Solutions

**Warning: "Operation must have at least one `4XX` response"**
- **Solution**: Add appropriate 4xx responses to all endpoints
- **Standard responses to add**:
  - `404`: Use `$ref: '#/components/responses/NotFound'` for endpoints that might not find resources
  - `400`: Use `$ref: '#/components/responses/ValidationError'` for endpoints with request validation
  - `500`: Use `$ref: '#/components/responses/InternalServerError'` for all endpoints (server errors can happen anywhere)

**Warning: "Component is never used"**
- **Solution**: Either use the component in endpoint responses or remove it if truly unnecessary
- **Common unused components**: Response components in `components/responses` section
- **Fix**: Reference unused response components in appropriate endpoint responses

#### Validation Best Practices

1. **All GET endpoints should have**: `200`, `404`, `500` responses
2. **All POST endpoints should have**: `201`, `400`, `500` responses (and `404` if applicable)
3. **All PUT/PATCH endpoints should have**: `200`, `400`, `404`, `500` responses
4. **All DELETE endpoints should have**: `204`, `404`, `500` responses
5. **Always reference response schemas** using `$ref` instead of inline definitions
6. **Reuse common response components** like `NotFound`, `InternalServerError`, `ValidationError`

### 📝 Notes for Future Development

- The API follows RESTful conventions
- All responses are JSON format
- Error responses follow a consistent schema
- The API uses Express.js with modular route organization
- Tests are in `tests/app.test.js` and should also be updated when API changes

## OpenAPI Specification Management

### File Location

The OpenAPI specification is located at:
- **File**: `src/openapi/openapi.yaml`
- **Format**: OpenAPI 3.1.0
- **Language**: YAML

### Specification Structure

```yaml
openapi: 3.1.0
info:
  title: Calendar App API
  version: 1.0.0
  description: RESTful API for calendar applications

servers:
  - url: http://localhost:3000
    description: Development server

paths:
  # API endpoints defined here

components:
  schemas:
    # All data schemas defined here
  responses:
    # Common response schemas defined here
  parameters:
    # Reusable parameters defined here
```

### Schema Design Principles

#### 1. Centralized Schema Definitions

All schemas must be defined in the `components/schemas` section:

```yaml
components:
  schemas:
    Event:
      type: object
      required:
        - title
        - startDate
        - endDate
      properties:
        id:
          type: string
          format: uuid
          description: Unique identifier
        title:
          type: string
          minLength: 1
          maxLength: 255
          description: Event title
        description:
          type: string
          description: Event description
        startDate:
          type: string
          format: date-time
          description: Event start date and time
        endDate:
          type: string
          format: date-time
          description: Event end date and time
        location:
          type: string
          maxLength: 255
          description: Event location
        createdAt:
          type: string
          format: date-time
          readOnly: true
          description: Creation timestamp
        updatedAt:
          type: string
          format: date-time
          readOnly: true
          description: Last update timestamp
```

#### 2. Request/Response Schema Separation

Create separate schemas for requests and responses:

```yaml
components:
  schemas:
    CreateEventRequest:
      type: object
      required:
        - title
        - startDate
        - endDate
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 255
        description:
          type: string
        startDate:
          type: string
          format: date-time
        endDate:
          type: string
          format: date-time
        location:
          type: string
          maxLength: 255

    EventResponse:
      allOf:
        - $ref: '#/components/schemas/CreateEventRequest'
        - type: object
          required:
            - id
            - createdAt
            - updatedAt
          properties:
            id:
              type: string
              format: uuid
            createdAt:
              type: string
              format: date-time
            updatedAt:
              type: string
              format: date-time
```

#### 3. Error Response Schemas

Define consistent error response schemas:

```yaml
components:
  schemas:
    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          required:
            - message
            - code
          properties:
            message:
              type: string
              description: Human-readable error message
            code:
              type: string
              description: Machine-readable error code
            details:
              type: object
              description: Additional error details

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              message: "Validation failed"
              code: "VALIDATION_ERROR"
              details:
                field: "title"
                message: "Title is required"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              message: "Event not found"
              code: "EVENT_NOT_FOUND"

    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              message: "Internal server error"
              code: "INTERNAL_ERROR"
```

### Documentation Best Practices

#### 1. Comprehensive Descriptions

Provide clear descriptions for all components:

```yaml
paths:
  /api/events:
    get:
      summary: Get all calendar events
      description: |
        Retrieves a list of all calendar events. Events are returned in 
        chronological order by start date.
      operationId: getAllEvents
      tags:
        - Events
      responses:
        '200':
          description: List of events retrieved successfully
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/EventResponse'
              example:
                - id: "123e4567-e89b-12d3-a456-426614174000"
                  title: "Team Meeting"
                  description: "Weekly sync meeting"
                  startDate: "2025-08-01T14:00:00Z"
                  endDate: "2025-08-01T15:00:00Z"
                  location: "Conference Room A"
                  createdAt: "2025-07-31T10:00:00Z"
                  updatedAt: "2025-07-31T10:00:00Z"
```

#### 2. Realistic Examples

Include realistic examples that match actual API responses:

```yaml
components:
  schemas:
    CreateEventRequest:
      type: object
      example:
        title: "Project Kickoff Meeting"
        description: "Initial meeting to discuss project requirements and timeline"
        startDate: "2025-08-15T09:00:00Z"
        endDate: "2025-08-15T10:30:00Z"
        location: "Conference Room B"
```

#### 3. Proper Tags and Organization

Use tags to organize endpoints logically:

```yaml
tags:
  - name: Events
    description: Calendar event operations
  - name: Health
    description: Health check and monitoring endpoints

paths:
  /api/events:
    get:
      tags:
        - Events
    post:
      tags:
        - Events
  
  /health:
    get:
      tags:
        - Health
```

### Validation and Testing

#### 1. OpenAPI Validation

Always validate the OpenAPI specification:

```bash
# Validate OpenAPI spec
npm run validate-openapi

# Check for specific issues
npx @redocly/cli lint src/openapi/openapi.yaml
```

#### 2. Schema Validation Testing

Test that actual API responses match the OpenAPI schemas:

```javascript
// Example test
const OpenAPISchemaValidator = require('openapi-schema-validator').default;
const fs = require('fs');
const yaml = require('js-yaml');

describe('OpenAPI Schema Validation', () => {
  let validator;
  let spec;

  beforeAll(() => {
    const specFile = fs.readFileSync('src/openapi/openapi.yaml', 'utf8');
    spec = yaml.load(specFile);
    validator = new OpenAPISchemaValidator({ version: 3 });
  });

  test('should have valid OpenAPI specification', () => {
    const result = validator.validate(spec);
    expect(result.errors).toHaveLength(0);
  });

  test('API response should match schema', async () => {
    const response = await request(app).get('/api/events');
    
    // Validate response against schema
    const eventSchema = spec.components.schemas.EventResponse;
    // Add validation logic here
  });
});
```

### Maintenance Workflow

#### 1. Regular Reviews

- **Weekly**: Review OpenAPI spec for accuracy
- **Before releases**: Validate all endpoints are documented
- **After API changes**: Immediately update specification

#### 2. Version Management

Update version numbers when making breaking changes:

```yaml
info:
  title: Calendar App API
  version: 1.1.0  # Increment for breaking changes
  description: RESTful API for calendar applications
```

#### 3. Documentation Generation

Generate documentation from the OpenAPI spec:

```bash
# Generate HTML documentation
npx @redocly/cli build-docs src/openapi/openapi.yaml

# Serve documentation locally
npx @redocly/cli preview-docs src/openapi/openapi.yaml
```

---

**Remember: An outdated OpenAPI spec is worse than no spec at all. Keep it current!**

## Related Documentation

- [API Documentation](api.md) - User-facing API documentation
- [Development Guide](development.md) - Development workflow including OpenAPI
- [Testing Guide](testing.md) - Testing strategies including schema validation
