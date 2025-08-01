const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { loadOpenAPISpec, getOpenAPISchema, clearCache } = require('../../src/utils/openapi');

// Mock dependencies
jest.mock('fs');
jest.mock('js-yaml');

describe('OpenAPI Utils', () => {
  const mockOpenAPISpec = {
    openapi: '3.0.0',
    info: {
      title: 'Calendar API',
      version: '1.0.0'
    },
    components: {
      schemas: {
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        }
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    clearCache(); // Clear cache before each test
  });

  describe('loadOpenAPISpec', () => {
    it('should load and cache OpenAPI specification', () => {
      const mockYamlContent = 'openapi: 3.0.0\ninfo:\n  title: Calendar API';
      
      fs.readFileSync.mockReturnValue(mockYamlContent);
      yaml.load.mockReturnValue(mockOpenAPISpec);

      const result = loadOpenAPISpec();

      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.join(__dirname, '../../src/openapi/openapi.yaml'),
        'utf8'
      );
      expect(yaml.load).toHaveBeenCalledWith(mockYamlContent);
      expect(result).toEqual(mockOpenAPISpec);
    });

    it('should return cached specification on subsequent calls', () => {
      const mockYamlContent = 'openapi: 3.0.0\ninfo:\n  title: Calendar API';
      
      fs.readFileSync.mockReturnValue(mockYamlContent);
      yaml.load.mockReturnValue(mockOpenAPISpec);

      // First call
      const result1 = loadOpenAPISpec();
      
      // Second call
      const result2 = loadOpenAPISpec();

      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      expect(yaml.load).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockOpenAPISpec);
      expect(result2).toEqual(mockOpenAPISpec);
      expect(result1).toBe(result2); // Should be the same cached object
    });

    it('should handle file read errors', () => {
      const error = new Error('File not found');
      fs.readFileSync.mockImplementation(() => {
        throw error;
      });

      expect(() => loadOpenAPISpec()).toThrow('File not found');
    });

    it('should handle YAML parsing errors', () => {
      const mockYamlContent = 'invalid: yaml: content:';
      const yamlError = new Error('Invalid YAML');
      
      fs.readFileSync.mockReturnValue(mockYamlContent);
      yaml.load.mockImplementation(() => {
        throw yamlError;
      });

      expect(() => loadOpenAPISpec()).toThrow('Invalid YAML');
    });
  });

  describe('getOpenAPISchema', () => {
    beforeEach(() => {
      const mockYamlContent = 'openapi: 3.0.0';
      fs.readFileSync.mockReturnValue(mockYamlContent);
      yaml.load.mockReturnValue(mockOpenAPISpec);
    });

    it('should return schema for existing schema name', () => {
      const result = getOpenAPISchema('Event');

      expect(result).toEqual(mockOpenAPISpec.components.schemas.Event);
    });

    it('should return schema for another existing schema name', () => {
      const result = getOpenAPISchema('User');

      expect(result).toEqual(mockOpenAPISpec.components.schemas.User);
    });

    it('should return undefined for non-existing schema name', () => {
      const result = getOpenAPISchema('NonExistentSchema');

      expect(result).toBeUndefined();
    });

    it('should handle missing components section', () => {
      const specWithoutComponents = {
        openapi: '3.0.0',
        info: { title: 'API', version: '1.0.0' }
      };
      
      yaml.load.mockReturnValue(specWithoutComponents);
      clearCache(); // Clear cache to force reload

      const result = getOpenAPISchema('Event');

      expect(result).toBeUndefined();
    });

    it('should handle missing schemas section', () => {
      const specWithoutSchemas = {
        openapi: '3.0.0',
        info: { title: 'API', version: '1.0.0' },
        components: {}
      };
      
      yaml.load.mockReturnValue(specWithoutSchemas);
      clearCache(); // Clear cache to force reload

      const result = getOpenAPISchema('Event');

      expect(result).toBeUndefined();
    });
  });

  describe('clearCache', () => {
    it('should clear the cached specification', () => {
      const mockYamlContent = 'openapi: 3.0.0';
      fs.readFileSync.mockReturnValue(mockYamlContent);
      yaml.load.mockReturnValue(mockOpenAPISpec);

      // Load spec to cache it
      loadOpenAPISpec();
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);

      // Clear cache
      clearCache();

      // Load spec again - should read from file again
      loadOpenAPISpec();
      expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    });
  });
});
