const path = require('path');

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
    },
    seeds: {
      directory: path.join(__dirname, '../seeds')
    }
  },
  
  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'calendar_app_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    migrations: {
      directory: path.join(__dirname, '../migrations'),
      tableName: 'knex_migrations'
    }
  },
  
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: path.join(__dirname, '../migrations'),
      tableName: 'knex_migrations'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};

// Export the full config object for knexfile.js
module.exports = config;

// Also export the current environment config for direct use in the app
module.exports.current = config[process.env.NODE_ENV || 'development'];
