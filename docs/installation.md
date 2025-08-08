# Installation Guide

This guide covers both Docker and local development setup options for the Calendar App API.

## Prerequisites

### Option 1: Docker (Recommended)
- Docker
- Docker Compose

### Option 2: Local Development
- Node.js (v22 or higher - see .nvmrc)
- PostgreSQL (v12 or higher)
- npm or yarn

## Docker Setup (Recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/akaplan-axian/calendar-app-api.git
cd calendar-app-api
```

### 2. Start the Application
```bash
docker-compose up -d
```

This will:
- Build the Node.js application container
- Start PostgreSQL database
- Install all dependencies (including dev dependencies)
- Start the application in development mode with hot reload

### 3. Set Up the Database
```bash
npm run db:setup
```
This convenient script runs both migrations and seeds in the Docker container.

### 4. View Logs (Optional)
```bash
docker-compose logs -f app
```

The API will be available at `http://localhost:3000`

### Docker Development Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up --build -d
```

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/akaplan-axian/calendar-app-api.git
cd calendar-app-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
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

### 4. Create the Database
```bash
createdb calendar_app_dev
```

### 5. Run Database Migrations
```bash
npm run db:migrate
```

### 6. Seed the Database (Optional)
```bash
npm run db:seed
```

## Running the Application

### Docker Development
```bash
docker-compose up -d
```

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The API will be available at `http://localhost:3000`

## Verification

Once the application is running, you can verify the installation by:

1. **Health Check**: Visit `http://localhost:3000/health`
2. **API Info**: Visit `http://localhost:3000/`
3. **Test Endpoint**: `curl http://localhost:3000/api/events`

## Troubleshooting

### Common Issues

**Docker Issues:**
- Ensure Docker and Docker Compose are installed and running
- Check if ports 3000 and 5432 are available
- Try rebuilding containers: `docker-compose up --build -d`

**Local Development Issues:**
- Verify Node.js version matches .nvmrc
- Ensure PostgreSQL is running and accessible
- Check database credentials in .env file
- Verify database exists: `psql -l | grep calendar_app_dev`

**Database Connection Issues:**
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists and is accessible
- For Docker: Database runs in container automatically
- For local: Start PostgreSQL service manually

## Next Steps

After successful installation, see:
- [API Documentation](api.md) - Learn about available endpoints
- [Development Guide](development.md) - Understand the development workflow
- [Database Management](database.md) - Learn database operations
