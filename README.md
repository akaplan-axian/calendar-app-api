# Calendar App API

A schema-first REST API for calendar applications built with OpenAPI 3.1, Express.js, PostgreSQL, and Objection.js ORM.

## Features

- **Schema-First Development**: OpenAPI specification drives both API validation and database operations
- **Automatic Request/Response Validation**: Using openapi-backend for seamless OpenAPI integration
- **PostgreSQL Integration**: Full-featured ORM with Objection.js built on Knex.js
- **Type-Safe Database Operations**: JSON Schema validation aligned with OpenAPI specifications
- **Database Migrations**: Version-controlled database schema management
- **Comprehensive Error Handling**: Proper HTTP status codes and error responses
- **Production Ready**: Includes security middleware, CORS, logging, and graceful shutdown

## Tech Stack

- **Framework**: Express.js
- **API Specification**: OpenAPI 3.1.0
- **API Backend**: openapi-backend
- **Database**: PostgreSQL
- **ORM**: Objection.js + Knex.js
- **Validation**: AJV (via openapi-backend)
- **Security**: Helmet.js
- **Logging**: Morgan

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akaplan-axian/calendar-app-api.git
   cd calendar-app-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=calendar_app_dev
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

4. **Create the database**
   ```bash
   createdb calendar_app_dev
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

All endpoints are automatically generated from the OpenAPI specification located at `src/openapi/openapi.yaml`.

### Available Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/events` - Get all calendar events
- `POST /api/events` - Create a new calendar event

### Example Usage

**Get all events:**
```bash
curl http://localhost:3000/api/events
```

**Create a new event:**
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

## Database Management

### Available Scripts

- `npm run db:migrate` - Run pending migrations
- `npm run db:rollback` - Rollback the last migration
- `npm run db:seed` - Run database seeds
- `npm run db:reset` - Reset database (rollback all + migrate + seed)

### Creating Migrations

```bash
npx knex migrate:make migration_name
```

### Creating Seeds

```bash
npx knex seed:make seed_name
```

## Project Structure

```
├── src/
│   ├── app.js                 # Main application setup with openapi-backend
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── handlers/              # OpenAPI operation handlers
│   │   ├── events.js          # Event-related handlers
│   │   ├── health.js          # Health check handlers
│   │   └── general.js         # General API handlers
│   ├── models/                # Objection.js models
│   │   └── Event.js           # Event model with validation
│   ├── migrations/            # Database migrations
│   ├── seeds/                 # Database seed files
│   └── openapi/
│       └── openapi.yaml       # OpenAPI 3.1 specification
├── knexfile.js               # Knex configuration
├── index.js                  # Application entry point
└── package.json
```

## Schema-First Development

This API follows a schema-first approach where:

1. **OpenAPI Specification** (`src/openapi/openapi.yaml`) defines the API contract
2. **openapi-backend** automatically handles routing and validation based on the spec
3. **Objection.js Models** use JSON Schema validation that aligns with OpenAPI schemas
4. **Database Migrations** create tables that match the API data models

### Adding New Endpoints

1. **Update OpenAPI Spec**: Add new paths and schemas to `src/openapi/openapi.yaml`
2. **Create Handler**: Add corresponding handler function in `src/handlers/`
3. **Register Handler**: Map the operationId to the handler in `src/app.js`
4. **Update Database**: Create migrations if new data models are needed

## Validation

Request and response validation is automatically handled by openapi-backend using the OpenAPI specification. This ensures:

- **Request Validation**: All incoming requests are validated against the schema
- **Response Validation**: All outgoing responses match the defined schemas
- **Type Safety**: Database models use JSON Schema validation
- **Consistent Error Handling**: Standardized error responses for validation failures

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Validation errors with detailed field information
- **404 Not Found**: Route or resource not found
- **409 Conflict**: Database constraint violations
- **500 Internal Server Error**: Unexpected server errors

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `calendar_app_dev` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_SSL` | Enable SSL | `false` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update the OpenAPI specification if needed
5. Add tests for new functionality
6. Submit a pull request

## License

ISC License - see LICENSE file for details.
