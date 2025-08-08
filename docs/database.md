# Database Management

This guide covers database operations, migrations, seeding, and management for the Calendar App API.

## Database Configuration

The application uses PostgreSQL with Knex.js as the query builder and migration tool.

### Configuration Files
- **Knex Configuration**: `knexfile.js`
- **Database Connection**: `src/config/database.js`
- **Environment Variables**: `.env`

### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DB_HOST` | Database host | `localhost` | `localhost` |
| `DB_PORT` | Database port | `5432` | `5432` |
| `DB_NAME` | Database name | `calendar_app_dev` | `calendar_app_dev` |
| `DB_USER` | Database user | `postgres` | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` | `your_password` |
| `DB_SSL` | Enable SSL | `false` | `true` |

## Available Scripts

### Docker Environment (Recommended)

#### Quick Setup
```bash
npm run db:setup
```
Runs migrations and seeds in Docker container (recommended for first-time setup).

#### Individual Commands
```bash
# Run pending migrations
docker-compose exec app npm run db:migrate

# Rollback the last migration
docker-compose exec app npm run db:rollback

# Run database seeds
docker-compose exec app npm run db:seed

# Reset database (rollback all + migrate + seed)
docker-compose exec app npm run db:reset
```

### Local Environment

```bash
# Run pending migrations
npm run db:migrate

# Rollback the last migration
npm run db:rollback

# Run database seeds
npm run db:seed

# Reset database (rollback all + migrate + seed)
npm run db:reset
```

## Migrations

Migrations are version-controlled database schema changes located in `src/migrations/`.

### Current Migrations

1. **`20250731170339_create_events_table.js`**
   - Creates the `events` table
   - Defines basic event schema

2. **`20250808161807_update_event_ids_to_uuid.js`**
   - Updates event IDs to use UUID format
   - Ensures unique identifier consistency

### Creating New Migrations

#### Docker Environment
```bash
docker-compose exec app npx knex migrate:make migration_name
```

#### Local Environment
```bash
npx knex migrate:make migration_name
```

### Migration Best Practices

1. **Descriptive Names**: Use clear, descriptive migration names
   ```bash
   npx knex migrate:make add_user_id_to_events
   npx knex migrate:make create_categories_table
   ```

2. **Reversible Changes**: Always implement both `up` and `down` methods
   ```javascript
   exports.up = function(knex) {
     return knex.schema.createTable('events', function(table) {
       table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
       table.string('title').notNullable();
       // ... other columns
     });
   };

   exports.down = function(knex) {
     return knex.schema.dropTable('events');
   };
   ```

3. **Test Migrations**: Always test both up and down migrations
   ```bash
   npm run db:migrate
   npm run db:rollback
   npm run db:migrate
   ```

### Migration Commands

```bash
# Check migration status
npx knex migrate:status

# Run specific migration
npx knex migrate:up 20250731170339_create_events_table.js

# Rollback to specific migration
npx knex migrate:down 20250731170339_create_events_table.js

# Rollback all migrations
npx knex migrate:rollback --all
```

## Database Seeds

Seeds populate the database with sample data for development and testing.

### Current Seeds

1. **`01_sample_events.js`**
   - Creates sample calendar events
   - Provides realistic test data

### Creating New Seeds

#### Docker Environment
```bash
docker-compose exec app npx knex seed:make seed_name
```

#### Local Environment
```bash
npx knex seed:make seed_name
```

### Seed Best Practices

1. **Idempotent Seeds**: Seeds should be safe to run multiple times
   ```javascript
   exports.seed = async function(knex) {
     // Delete existing entries
     await knex('events').del();
     
     // Insert seed entries
     await knex('events').insert([
       {
         id: '123e4567-e89b-12d3-a456-426614174000',
         title: 'Sample Event',
         // ... other fields
       }
     ]);
   };
   ```

2. **Realistic Data**: Use realistic sample data that represents actual use cases

3. **Consistent IDs**: Use consistent UUIDs for relationships between seeded data

### Seed Commands

```bash
# Run all seeds
npm run db:seed

# Run specific seed file
npx knex seed:run --specific=01_sample_events.js
```

## Database Schema

### Events Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `title` | VARCHAR | NOT NULL | Event title |
| `description` | TEXT | NULLABLE | Event description |
| `start_date` | TIMESTAMP | NOT NULL | Event start date/time |
| `end_date` | TIMESTAMP | NOT NULL | Event end date/time |
| `location` | VARCHAR | NULLABLE | Event location |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### Indexes

- Primary key index on `id`
- Index on `start_date` for efficient date queries
- Index on `created_at` for chronological sorting

## Database Operations

### Backup and Restore

#### Create Backup
```bash
# Docker environment
docker-compose exec db pg_dump -U postgres calendar_app_dev > backup.sql

# Local environment
pg_dump -U postgres -h localhost calendar_app_dev > backup.sql
```

#### Restore from Backup
```bash
# Docker environment
docker-compose exec -T db psql -U postgres calendar_app_dev < backup.sql

# Local environment
psql -U postgres -h localhost calendar_app_dev < backup.sql
```

### Database Reset

Complete database reset (useful for development):

```bash
# Using npm script (recommended)
npm run db:reset

# Manual steps
npm run db:rollback -- --all
npm run db:migrate
npm run db:seed
```

### Database Inspection

#### Connect to Database

**Docker Environment:**
```bash
docker-compose exec db psql -U postgres calendar_app_dev
```

**Local Environment:**
```bash
psql -U postgres -h localhost calendar_app_dev
```

#### Useful SQL Commands

```sql
-- List all tables
\dt

-- Describe events table
\d events

-- View all events
SELECT * FROM events;

-- Check migration status
SELECT * FROM knex_migrations;

-- Check seed status
SELECT * FROM knex_migrations_lock;
```

## Troubleshooting

### Common Issues

#### Migration Errors

**Error: Migration table already exists**
```bash
# Reset migration state
npx knex migrate:unlock
```

**Error: Migration failed**
```bash
# Check migration status
npx knex migrate:status

# Rollback and try again
npm run db:rollback
npm run db:migrate
```

#### Connection Issues

**Error: Connection refused**
- Verify PostgreSQL is running
- Check connection parameters in `.env`
- For Docker: Ensure containers are running

**Error: Database does not exist**
```bash
# Create database
createdb calendar_app_dev

# Or using psql
psql -U postgres -c "CREATE DATABASE calendar_app_dev;"
```

#### Permission Issues

**Error: Permission denied**
- Verify database user has necessary permissions
- Check user credentials in `.env`
- Ensure user can create/modify tables

### Performance Considerations

1. **Indexes**: Add indexes for frequently queried columns
2. **Connection Pooling**: Knex handles connection pooling automatically
3. **Query Optimization**: Use Knex query builder efficiently
4. **Migration Size**: Keep migrations focused and atomic

## Development Workflow

### Adding New Features

1. **Create Migration**: Define schema changes
2. **Update Models**: Modify Objection.js models
3. **Update Seeds**: Add sample data if needed
4. **Test Changes**: Verify migrations work correctly
5. **Update Documentation**: Document schema changes

### Schema Changes

1. **Plan Changes**: Design schema modifications carefully
2. **Create Migration**: Use descriptive migration names
3. **Test Migration**: Test both up and down migrations
4. **Update Application**: Modify models and handlers
5. **Update Tests**: Ensure tests reflect schema changes

## Related Documentation

- [Installation Guide](installation.md) - Database setup instructions
- [Development Guide](development.md) - Development workflow
- [Testing Guide](testing.md) - Database testing strategies
