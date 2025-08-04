const request = require('supertest');
const app = require('../../src/express');
const { loadOpenAPISpec } = require('../../src/utils/openapi');

describe('OpenAPI Schema Handler', () => {
  describe('GET /api/openapi.json', () => {
    it('should return the OpenAPI specification in JSON format', async () => {
      const response = await request(app)
        .get('/api/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200);

      // Verify the response contains the expected OpenAPI structure
      expect(response.body).toHaveProperty('openapi', '3.0.3');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('title', 'Calendar App API');
      expect(response.body.info).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('paths');
      expect(response.body).toHaveProperty('components');
      
      // Check that paths object has the expected number of paths
      const pathKeys = Object.keys(response.body.paths);
      expect(pathKeys).toContain('/');
      expect(pathKeys).toContain('/health');
      expect(pathKeys).toContain('/api/events');
      expect(pathKeys).toContain('/api/openapi.json');
    });

    it('should return the same content as the loaded OpenAPI spec', async () => {
      const response = await request(app)
        .get('/api/openapi.json')
        .expect(200);

      const loadedSpec = loadOpenAPISpec();
      
      // The response should match the loaded specification
      expect(response.body).toEqual(loadedSpec);
    });

    it('should include the OpenAPI schema endpoint with correct operation', async () => {
      const response = await request(app)
        .get('/api/openapi.json')
        .expect(200);

      const pathKeys = Object.keys(response.body.paths);
      expect(pathKeys).toContain('/api/openapi.json');
      
      const openApiPath = response.body.paths['/api/openapi.json'];
      expect(openApiPath).toHaveProperty('get');
      expect(openApiPath.get).toHaveProperty('operationId', 'getOpenAPISchema');
      expect(openApiPath.get).toHaveProperty('summary', 'Get OpenAPI schema');
    });

    it('should include all expected components schemas', async () => {
      const response = await request(app)
        .get('/api/openapi.json')
        .expect(200);

      const expectedSchemas = [
        'ApiInfo',
        'HealthStatus',
        'EventsResponse',
        'CreateEventRequest',
        'Event',
        'CreateEventResponse',
        'ErrorResponse',
        'InternalServerErrorResponse',
        'ValidationErrorDetail',
        'ValidationErrorResponse'
      ];

      expectedSchemas.forEach(schema => {
        expect(response.body.components.schemas).toHaveProperty(schema);
      });
    });

    it('should include proper tags', async () => {
      const response = await request(app)
        .get('/api/openapi.json')
        .expect(200);

      expect(response.body.tags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'General' }),
          expect.objectContaining({ name: 'Health' }),
          expect.objectContaining({ name: 'Events' })
        ])
      );
    });
  });
});
