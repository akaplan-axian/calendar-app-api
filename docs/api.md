# API Documentation

The Calendar App API provides RESTful endpoints for managing calendar events. All endpoints are automatically generated from the OpenAPI specification located at `src/openapi/openapi.yaml`.

## Base URL

```
http://localhost:3000
```

## Available Endpoints

### General Endpoints

#### Get API Information
- **Endpoint**: `GET /`
- **Description**: Returns basic API information and metadata
- **Response**: JSON object with API details

#### Health Check
- **Endpoint**: `GET /health`
- **Description**: Health check endpoint for monitoring
- **Response**: JSON object with health status

### Calendar Events

#### Get All Events
- **Endpoint**: `GET /api/events`
- **Description**: Retrieve all calendar events
- **Response**: Array of event objects

**Example Request:**
```bash
curl http://localhost:3000/api/events
```

**Example Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Team Meeting",
    "description": "Weekly sync meeting",
    "startDate": "2025-08-01T14:00:00Z",
    "endDate": "2025-08-01T15:00:00Z",
    "location": "Conference Room A",
    "createdAt": "2025-07-31T10:00:00Z",
    "updatedAt": "2025-07-31T10:00:00Z"
  }
]
```

#### Create New Event
- **Endpoint**: `POST /api/events`
- **Description**: Create a new calendar event
- **Content-Type**: `application/json`
- **Request Body**: Event object (see schema below)
- **Response**: Created event object with generated ID

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "description": "Weekly sync meeting",
    "startDate": "2025-08-01T14:00:00Z",
    "endDate": "2025-08-01T15:00:00Z",
    "location": "Conference Room A"
  }'
```

**Example Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Team Meeting",
  "description": "Weekly sync meeting",
  "startDate": "2025-08-01T14:00:00Z",
  "endDate": "2025-08-01T15:00:00Z",
  "location": "Conference Room A",
  "createdAt": "2025-07-31T10:00:00Z",
  "updatedAt": "2025-07-31T10:00:00Z"
}
```

## Data Schemas

### Event Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | No* | Unique identifier (auto-generated) |
| `title` | string | Yes | Event title |
| `description` | string | No | Event description |
| `startDate` | string (ISO 8601) | Yes | Event start date and time |
| `endDate` | string (ISO 8601) | Yes | Event end date and time |
| `location` | string | No | Event location |
| `createdAt` | string (ISO 8601) | No* | Creation timestamp (auto-generated) |
| `updatedAt` | string (ISO 8601) | No* | Last update timestamp (auto-generated) |

*Auto-generated fields are not required in requests but will be present in responses.

### Date Format

All dates must be in ISO 8601 format with timezone information:
- **Format**: `YYYY-MM-DDTHH:mm:ssZ`
- **Example**: `2025-08-01T14:00:00Z`

## Response Formats

### Success Responses

All successful responses return JSON with appropriate HTTP status codes:
- `200 OK` - Successful GET requests
- `201 Created` - Successful POST requests

### Error Responses

Error responses follow a consistent format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common HTTP status codes:
- `400 Bad Request` - Invalid request data or validation errors
- `404 Not Found` - Resource not found
- `409 Conflict` - Database constraint violations
- `500 Internal Server Error` - Unexpected server errors

### Validation Errors

Validation errors provide detailed field-level information:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "title",
      "message": "Title is required"
    }
  }
}
```

## Testing the API

### Using curl

**Test health endpoint:**
```bash
curl http://localhost:3000/health
```

**Get all events:**
```bash
curl http://localhost:3000/api/events
```

**Create an event:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "startDate": "2025-08-15T10:00:00Z",
    "endDate": "2025-08-15T11:00:00Z"
  }'
```

### Using HTTPie

**Get all events:**
```bash
http GET localhost:3000/api/events
```

**Create an event:**
```bash
http POST localhost:3000/api/events \
  title="Test Event" \
  startDate="2025-08-15T10:00:00Z" \
  endDate="2025-08-15T11:00:00Z"
```

### Using Postman

1. Import the OpenAPI specification from `src/openapi/openapi.yaml`
2. Set base URL to `http://localhost:3000`
3. Use the generated requests or create custom ones

## OpenAPI Specification

The complete API specification is available at:
- **File**: `src/openapi/openapi.yaml`
- **Format**: OpenAPI 3.1.0
- **Validation**: All requests and responses are automatically validated

For detailed schema definitions, validation rules, and additional endpoint information, refer to the OpenAPI specification file.

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

## Authentication

Currently, no authentication is required. This may be added in future versions.

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all origins in development mode.

## Related Documentation

- [Installation Guide](installation.md) - Set up the API
- [Development Guide](development.md) - Learn about development workflow
- [OpenAPI Guidelines](openapi-guidelines.md) - Understand API specification management
