# OpenAPI Memory Bank

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

---

**Remember: An outdated OpenAPI spec is worse than no spec at all. Keep it current!**
