# Deployment Guide

This guide covers deployment strategies, environment configuration, and production setup for the Calendar App API.

## Environment Configuration

### Environment Variables

The application uses environment variables for configuration. All variables should be defined in production environments.

| Variable | Description | Default | Required | Example |
|----------|-------------|---------|----------|---------|
| `PORT` | Server port | `3000` | No | `3000` |
| `NODE_ENV` | Environment | `development` | Yes | `production` |
| `DB_HOST` | Database host | `localhost` | Yes | `db.example.com` |
| `DB_PORT` | Database port | `5432` | No | `5432` |
| `DB_NAME` | Database name | `calendar_app_dev` | Yes | `calendar_app_prod` |
| `DB_USER` | Database user | `postgres` | Yes | `app_user` |
| `DB_PASSWORD` | Database password | `postgres` | Yes | `secure_password` |
| `DB_SSL` | Enable SSL | `false` | No | `true` |

### Environment Files

#### Development
```env
# .env.development
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendar_app_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

#### Production
```env
# .env.production
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=calendar_app_prod
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_SSL=true
```

## Docker Deployment

### Production Docker Setup

#### 1. Production Dockerfile

The existing `Dockerfile` is production-ready:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=calendar_app_prod
      - DB_USER=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_SSL=false
    depends_on:
      - db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=calendar_app_prod
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
```

#### 3. Deploy with Docker Compose

```bash
# Set database password
export DB_PASSWORD=your-secure-password

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate

# Optional: Seed database
docker-compose -f docker-compose.prod.yml exec app npm run db:seed
```

### Docker Best Practices

1. **Multi-stage builds** for smaller images
2. **Non-root user** for security
3. **Health checks** for monitoring
4. **Volume persistence** for database data
5. **Environment-specific configs**

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS (Elastic Container Service)

1. **Build and push Docker image**:
```bash
# Build image
docker build -t calendar-app-api .

# Tag for ECR
docker tag calendar-app-api:latest your-account.dkr.ecr.region.amazonaws.com/calendar-app-api:latest

# Push to ECR
docker push your-account.dkr.ecr.region.amazonaws.com/calendar-app-api:latest
```

2. **Create ECS Task Definition**:
```json
{
  "family": "calendar-app-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "calendar-app-api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/calendar-app-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DB_HOST",
          "value": "your-rds-endpoint"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/calendar-app-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

3. **Database Setup with RDS**:
- Create PostgreSQL RDS instance
- Configure security groups
- Run migrations from ECS task

#### Using AWS Lambda (Serverless)

For serverless deployment, consider using AWS Lambda with API Gateway:

1. **Install Serverless Framework**:
```bash
npm install -g serverless
npm install serverless-http
```

2. **Create serverless.yml**:
```yaml
service: calendar-app-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    DB_HOST: ${env:DB_HOST}
    DB_NAME: ${env:DB_NAME}
    DB_USER: ${env:DB_USER}
    DB_PASSWORD: ${env:DB_PASSWORD}

functions:
  app:
    handler: lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-offline
```

3. **Create Lambda handler**:
```javascript
// lambda.js
const serverless = require('serverless-http');
const app = require('./src/app');

module.exports.handler = serverless(app);
```

### Google Cloud Platform (GCP)

#### Using Cloud Run

1. **Build and deploy**:
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/calendar-app-api

# Deploy to Cloud Run
gcloud run deploy calendar-app-api \
  --image gcr.io/PROJECT-ID/calendar-app-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,DB_HOST=your-db-host
```

2. **Database with Cloud SQL**:
```bash
# Create Cloud SQL instance
gcloud sql instances create calendar-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create calendar_app_prod --instance=calendar-db
```

### Heroku Deployment

1. **Create Heroku app**:
```bash
heroku create your-app-name
```

2. **Add PostgreSQL addon**:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. **Set environment variables**:
```bash
heroku config:set NODE_ENV=production
```

4. **Deploy**:
```bash
git push heroku main
```

5. **Run migrations**:
```bash
heroku run npm run db:migrate
```

## Database Setup

### Production Database Configuration

#### PostgreSQL Production Setup

1. **Create production database**:
```sql
CREATE DATABASE calendar_app_prod;
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE calendar_app_prod TO app_user;
```

2. **Configure SSL** (recommended):
```javascript
// knexfile.js production config
production: {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './src/migrations'
  },
  seeds: {
    directory: './src/seeds'
  }
}
```

#### Database Migration in Production

```bash
# Run migrations
NODE_ENV=production npm run db:migrate

# Check migration status
NODE_ENV=production npx knex migrate:status

# Rollback if needed (use with caution)
NODE_ENV=production npm run db:rollback
```

### Database Backup Strategy

#### Automated Backups

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="calendar_app_backup_$DATE.sql"

pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Upload to S3 (optional)
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/
```

#### Restore from Backup

```bash
# Restore database
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup_file.sql
```

## Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint

The API includes a health check endpoint at `/health`:

```javascript
// Health check response
{
  "status": "healthy",
  "timestamp": "2025-08-08T12:00:00Z",
  "uptime": 3600,
  "database": "connected"
}
```

#### Monitoring Setup

1. **Application Performance Monitoring (APM)**:
   - New Relic
   - DataDog
   - AWS X-Ray

2. **Log Aggregation**:
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Splunk
   - AWS CloudWatch

3. **Uptime Monitoring**:
   - Pingdom
   - UptimeRobot
   - StatusCake

### Logging Configuration

#### Production Logging

```javascript
// src/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## Security Considerations

### Production Security Checklist

- [ ] **Environment Variables**: Store sensitive data in environment variables
- [ ] **HTTPS**: Use SSL/TLS certificates
- [ ] **Database SSL**: Enable SSL for database connections
- [ ] **CORS**: Configure CORS for specific origins
- [ ] **Rate Limiting**: Implement rate limiting
- [ ] **Input Validation**: Validate all inputs (handled by OpenAPI)
- [ ] **Security Headers**: Use Helmet.js (already configured)
- [ ] **Authentication**: Implement authentication if needed
- [ ] **Secrets Management**: Use proper secrets management
- [ ] **Regular Updates**: Keep dependencies updated

### Security Headers

The application already includes Helmet.js for security headers:

```javascript
// Security headers included
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}));
```

## Performance Optimization

### Production Optimizations

1. **Connection Pooling**: Configured in Knex
2. **Compression**: Enable gzip compression
3. **Caching**: Implement Redis for caching
4. **Database Indexes**: Ensure proper indexing
5. **Load Balancing**: Use load balancer for multiple instances

#### Enable Compression

```javascript
// src/express.js
const compression = require('compression');

app.use(compression());
```

#### Redis Caching

```javascript
// src/config/redis.js
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

module.exports = client;
```

## Scaling Strategies

### Horizontal Scaling

1. **Load Balancer**: Distribute traffic across multiple instances
2. **Database Read Replicas**: Scale read operations
3. **Microservices**: Split into smaller services
4. **CDN**: Use CDN for static assets

### Vertical Scaling

1. **Increase CPU/Memory**: Scale up server resources
2. **Database Optimization**: Optimize queries and indexes
3. **Connection Pool Tuning**: Adjust pool sizes

## Deployment Checklist

### Pre-Deployment

- [ ] Run all tests: `npm test`
- [ ] Check code coverage: `npm run test:coverage`
- [ ] Validate OpenAPI spec: `npm run validate-openapi`
- [ ] Update environment variables
- [ ] Review security settings
- [ ] Backup current database
- [ ] Test migrations on staging

### Deployment

- [ ] Deploy application
- [ ] Run database migrations
- [ ] Verify health check endpoint
- [ ] Test critical API endpoints
- [ ] Monitor logs for errors
- [ ] Verify database connectivity

### Post-Deployment

- [ ] Monitor application metrics
- [ ] Check error rates
- [ ] Verify performance metrics
- [ ] Test user-facing functionality
- [ ] Update documentation if needed

## Rollback Strategy

### Application Rollback

1. **Container Rollback**:
```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --scale app=0
docker-compose -f docker-compose.prod.yml up -d previous-image
```

2. **Database Rollback**:
```bash
# Rollback migrations (use with extreme caution)
NODE_ENV=production npm run db:rollback
```

### Rollback Checklist

- [ ] Stop new deployments
- [ ] Rollback application to previous version
- [ ] Rollback database if necessary (rare)
- [ ] Verify system functionality
- [ ] Monitor for issues
- [ ] Communicate status to stakeholders

## Related Documentation

- [Installation Guide](installation.md) - Development setup
- [Development Guide](development.md) - Development workflow
- [Database Management](database.md) - Database operations
- [API Documentation](api.md) - API reference
