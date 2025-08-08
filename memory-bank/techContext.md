# Tech Context - Calendar App API

## Core Technology Stack

### Backend Framework

- **Express.js** - Web application framework for Node.js
- **Node.js v22+** - JavaScript runtime (see .nvmrc for exact version)
- **openapi-backend** - OpenAPI 3.1 backend framework for automatic validation and routing

### API Specification & Validation

- **OpenAPI 3.1.0** - API specification standard
- **AJV** - JSON Schema validator (via openapi-backend)
- **ajv-formats** - Additional format validators for AJV (date-time, etc.)
- **js-yaml** - YAML parser for loading OpenAPI specification

### Database Stack

- **PostgreSQL v12+** - Primary database
- **Objection.js** - SQL-friendly ORM built on Knex.js
- **Knex.js** - SQL query builder and migration tool
- **JSON Schema** - Database model validation aligned with OpenAPI

### Security & Middleware

- **Helmet.js** - Security middleware for HTTP headers
- **CORS** - Cross-Origin Resource Sharing middleware
- **Morgan** - HTTP request logger middleware
- **dotenv** - Environment variable management

### Testing Framework

- **Jest** - JavaScript testing framework with built-in coverage
- **Istanbul/nyc** - Code coverage tool (built into Jest)
- **Supertest** - HTTP assertion library for testing APIs

### Development Tools

- **Docker** - Containerization platform
- **Docker Compose** - Multi-container Docker applications
- **npm** - Package manager and script runner

## Development Setup Requirements

### Option 1: Docker (Recommended)

```bash
# Prerequisites
- Docker Desktop
- Docker Compose

# Setup Commands
docker-compose up -d        # Start all services
npm run db:setup           # Initialize database
```

### Option 2: Local Development

```bash
# Prerequisites
- Node.js v22+ (see .nvmrc)
- PostgreSQL v12+
- npm or yarn

# Setup Commands
npm install                # Install dependencies
createdb calendar_app_dev  # Create database
npm run db:migrate         # Run migrations
npm run db:seed           # Seed sample data
```

## Key Dependencies

### Production Dependencies

```json
{
  "express": "^4.18.x",
  "openapi-backend": "^5.x.x",
  "objection": "^3.x.x",
  "knex": "^2.x.x",
  "pg": "^8.x.x",
  "helmet": "^7.x.x",
  "cors": "^2.x.x",
  "morgan": "^1.x.x",
  "dotenv": "^16.x.x",
  "ajv-formats": "^2.x.x",
  "js-yaml": "^4.x.x"
}
```

### Development Dependencies

```json
{
  "jest": "^29.x.x",
  "supertest": "^6.x.x",
  "nodemon": "^3.x.x"
}
```

## Environment Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendar_app_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

### Environment-Specific Settings

**Development:**

- Hot reload with nodemon
- Detailed error messages
- Database seeding enabled
- CORS enabled for all origins

**Test:**

- Separate test database
- Mocked external dependencies
- Fast test execution
- Coverage reporting

**Production:**

- SSL database connections
- Connection pooling (min: 2, max: 10)
- Security headers enforced
- Error logging without sensitive data

## Database Configuration

### Connection Configuration

```javascript
// src/config/database.js
const config = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'calendar_app_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    migrations: {
      directory: path.join(__dirname, '../migrations'),
      tableName: 'knex_migrations'
    }
  }
};
```

### Migration Management

```bash
# Create new migration
npx knex migrate:make migration_name

# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback

# Reset database (rollback all + migrate + seed)
npm run db:reset
```

## Testing Configuration

### Jest Configuration (jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Coverage Thresholds
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    },
    './src/routes/': {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90
    }
  },
  
  // Exclude from coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/migrations/**',
    '!src/seeds/**',
    '!**/*.test.js'
  ]
};
```

### Test Scripts

```bash
npm test                    # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage
npm run test:coverage:open  # Generate and open HTML coverage report
npm run coverage:check      # Validate coverage thresholds
```

## Docker Configuration

### Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose (docker-compose.yml)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
    volumes:
      - .:/app  # Hot reload for development
      
  postgres:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: calendar_app_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Build and Deployment

### NPM Scripts

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:coverage:open": "jest --coverage && open coverage/lcov-report/index.html",
    "db:migrate": "knex migrate:latest",
    "db:rollback": "knex migrate:rollback",
    "db:seed": "knex seed:run",
    "db:reset": "knex migrate:rollback --all && knex migrate:latest && knex seed:run",
    "db:setup": "docker-compose exec app npm run db:migrate && docker-compose exec app npm run db:seed"
  }
}
```

### Production Deployment Considerations

- Use process managers (PM2, systemd)
- Enable SSL for database connections
- Configure proper logging levels
- Set up health check monitoring
- Use environment-specific configuration files
- Enable database connection pooling

## Technical Constraints

### Node.js Version

- **Minimum**: Node.js v22 (specified in .nvmrc)
- **Reason**: Modern JavaScript features, performance improvements
- **Compatibility**: ES2022+ features used throughout codebase

### Database Constraints

- **PostgreSQL v12+** required for JSON operations
- **Connection Limits**: Configure based on deployment environment
- **Schema Migrations**: All changes must be reversible
- **Indexing Strategy**: Indexes on frequently queried fields

### API Constraints

- **OpenAPI 3.1.0** specification compliance required
- **JSON Schema** validation for all requests/responses
- **ISO 8601** date-time format mandatory
- **HTTP Status Codes** must follow REST conventions

### Security Constraints

- **HTTPS** required in production
- **CORS** configured for specific origins in production
- **Request Size Limits**: 10MB maximum payload
- **SQL Injection Prevention**: Parameterized queries only

## Development Workflow Tools

### Code Quality

- **ESLint** (optional) - JavaScript linting
- **Prettier** (optional) - Code formatting
- **Husky** (optional) - Git hooks for pre-commit checks

### Debugging

- **Node.js Inspector** - Built-in debugging support
- **Morgan Logging** - HTTP request logging
- **Console Debugging** - Structured error logging

### API Documentation

- **OpenAPI Specification** - Self-documenting API
- **Redoc/Swagger UI** - Interactive API documentation
- **Postman Collections** - API testing collections

## Performance Considerations

### Database Performance

- **Connection Pooling**: Configured per environment
- **Query Optimization**: Indexes on search fields
- **Migration Performance**: Batch operations for large datasets

### API Performance

- **Request Validation**: Cached OpenAPI schema
- **Response Compression**: Gzip compression enabled
- **Memory Management**: Proper cleanup in handlers

### Monitoring

- **Health Check Endpoint**: `/health` for load balancer checks
- **Application Metrics**: Response times, error rates
- **Database Metrics**: Connection pool usage, query performance

## Future Technical Considerations

### Scalability

- **Horizontal Scaling**: Stateless application design
- **Database Scaling**: Read replicas, connection pooling
- **Caching Layer**: Redis for session/response caching

### Observability

- **Structured Logging**: JSON log format
- **Distributed Tracing**: OpenTelemetry integration
- **Metrics Collection**: Prometheus/Grafana stack

### Security Enhancements

- **Authentication**: JWT token validation
- **Authorization**: Role-based access control
- **Rate Limiting**: Request throttling middleware
- **Input Sanitization**: Enhanced validation rules

This technical foundation provides a robust, scalable platform for calendar API development with modern tooling and best practices.
