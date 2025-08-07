# Docker Setup for Calendar App API

This project includes Docker configuration for easy development setup with PostgreSQL.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations:**
   ```bash
   docker-compose exec app npm run db:migrate
   ```

3. **Seed the database (optional):**
   ```bash
   docker-compose exec app npm run db:seed
   ```

4. **Access the application:**
   - API: http://localhost:3000
   - Database: localhost:5432

## Available Commands

### Docker Compose Commands
```bash
# Start services in background
docker-compose up -d

# Start services with logs
docker-compose up

# Stop services
docker-compose down

# Rebuild and start services
docker-compose up --build

# View logs
docker-compose logs app
docker-compose logs postgres

# Execute commands in running containers
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
docker-compose exec app npm test
```

### Database Management
```bash
# Run migrations
docker-compose exec app npm run db:migrate

# Rollback migrations
docker-compose exec app npm run db:rollback

# Seed database
docker-compose exec app npm run db:seed

# Reset database (rollback all, migrate, seed)
docker-compose exec app npm run db:reset

# Access PostgreSQL directly
docker-compose exec postgres psql -U postgres -d calendar_app_dev
```

## Environment Variables

The docker-compose.yml file sets up the following environment variables for the application:

- `NODE_ENV=development`
- `PORT=3000`
- `DB_HOST=postgres` (container name)
- `DB_PORT=5432`
- `DB_NAME=calendar_app_dev`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_SSL=false`

## File Structure

- `docker-compose.yml` - Main Docker Compose configuration
- `Dockerfile` - Production Docker image
- `Dockerfile.dev` - Development Docker image (used by docker-compose)
- `.dockerignore` - Files to exclude from Docker build context

## Development Workflow

1. Make code changes in your editor
2. The application will automatically restart (nodemon)
3. Database changes persist in the `postgres_data` volume
4. Logs are available via `docker-compose logs app`

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready -U postgres

# View PostgreSQL logs
docker-compose logs postgres
```

### Application Issues
```bash
# View application logs
docker-compose logs app

# Restart just the application
docker-compose restart app

# Rebuild the application image
docker-compose up --build app
```

### Clean Reset
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Rebuild and start fresh
docker-compose up --build
