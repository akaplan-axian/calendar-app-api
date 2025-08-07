const path = require('path');

describe('Database Config', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment variables
    originalEnv = { ...process.env };
    
    // Clear the module cache to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('development configuration', () => {
    it('should use default values when environment variables are not set', () => {
      // Clear relevant env vars
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_NAME;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      delete process.env.NODE_ENV;

      const config = require('../../src/config/database');

      expect(config.development).toEqual({
        client: 'pg',
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'calendar_app_dev',
          user: 'postgres',
          password: 'postgres',
        },
        migrations: {
          directory: path.join(__dirname, '../../src/migrations'),
          tableName: 'knex_migrations'
        },
        seeds: {
          directory: path.join(__dirname, '../../src/seeds')
        }
      });
    });

    it('should use environment variables when provided', () => {
      process.env.DB_HOST = 'custom-host';
      process.env.DB_PORT = '3306';
      process.env.DB_NAME = 'custom_db';
      process.env.DB_USER = 'custom_user';
      process.env.DB_PASSWORD = 'custom_password';

      const config = require('../../src/config/database');

      expect(config.development.connection).toEqual({
        host: 'custom-host',
        port: '3306',
        database: 'custom_db',
        user: 'custom_user',
        password: 'custom_password',
      });
    });
  });

  describe('test configuration', () => {
    it('should use default test database name', () => {
      delete process.env.DB_NAME;

      const config = require('../../src/config/database');

      expect(config.test.connection.database).toBe('calendar_app_test');
      expect(config.test.client).toBe('pg');
    });

    it('should not have seeds directory in test config', () => {
      const config = require('../../src/config/database');

      expect(config.test.seeds).toBeUndefined();
    });
  });

  describe('production configuration', () => {
    it('should use environment variables for production', () => {
      process.env.DB_HOST = 'prod-host';
      process.env.DB_PORT = '5432';
      process.env.DB_NAME = 'prod_db';
      process.env.DB_USER = 'prod_user';
      process.env.DB_PASSWORD = 'prod_password';
      process.env.DB_SSL = 'true';

      const config = require('../../src/config/database');

      expect(config.production).toEqual({
        client: 'pg',
        connection: {
          host: 'prod-host',
          port: '5432',
          database: 'prod_db',
          user: 'prod_user',
          password: 'prod_password',
          ssl: { rejectUnauthorized: false }
        },
        migrations: {
          directory: path.join(__dirname, '../../src/migrations'),
          tableName: 'knex_migrations'
        },
        pool: {
          min: 2,
          max: 10
        }
      });
    });

    it('should disable SSL when DB_SSL is not true', () => {
      process.env.DB_SSL = 'false';

      const config = require('../../src/config/database');

      expect(config.production.connection.ssl).toBe(false);
    });

    it('should disable SSL when DB_SSL is not set', () => {
      delete process.env.DB_SSL;

      const config = require('../../src/config/database');

      expect(config.production.connection.ssl).toBe(false);
    });
  });

  describe('current environment export', () => {
    it('should export development config when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

      const config = require('../../src/config/database');

      expect(config.current).toEqual(config.development);
    });

    it('should export test config when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';

      const config = require('../../src/config/database');

      expect(config.current).toEqual(config.test);
    });

    it('should export production config when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';

      const config = require('../../src/config/database');

      expect(config.current).toEqual(config.production);
    });
  });

  describe('path configurations', () => {
    it('should have correct migrations directory path', () => {
      const config = require('../../src/config/database');

      expect(config.development.migrations.directory).toBe(
        path.join(__dirname, '../../src/migrations')
      );
      expect(config.test.migrations.directory).toBe(
        path.join(__dirname, '../../src/migrations')
      );
      expect(config.production.migrations.directory).toBe(
        path.join(__dirname, '../../src/migrations')
      );
    });

    it('should have correct seeds directory path for development', () => {
      const config = require('../../src/config/database');

      expect(config.development.seeds.directory).toBe(
        path.join(__dirname, '../../src/seeds')
      );
    });
  });
});
