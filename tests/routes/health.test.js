const request = require('supertest');
const express = require('express');
const healthRouter = require('../../src/routes/health');

describe('Health Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/health', healthRouter);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
      
      // Verify timestamp is a valid ISO string
      expect(() => new Date(response.body.timestamp)).not.toThrow();
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return current timestamp', async () => {
      const beforeRequest = new Date();
      
      const response = await request(app)
        .get('/health')
        .expect(200);

      const afterRequest = new Date();
      const responseTimestamp = new Date(response.body.timestamp);

      // Timestamp should be between before and after request times
      expect(responseTimestamp.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(responseTimestamp.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });

    it('should return different timestamps on multiple calls', async () => {
      const response1 = await request(app)
        .get('/health')
        .expect(200);

      // Wait a small amount to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));

      const response2 = await request(app)
        .get('/health')
        .expect(200);

      expect(response1.body.timestamp).not.toBe(response2.body.timestamp);
    });

    it('should always return healthy status', async () => {
      // Make multiple requests to ensure consistent status
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .get('/health')
          .expect(200);

        expect(response.body.status).toBe('healthy');
      }
    });

    it('should have correct response structure', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Should only have status and timestamp properties
      const expectedKeys = ['status', 'timestamp'];
      const actualKeys = Object.keys(response.body);
      
      expect(actualKeys.sort()).toEqual(expectedKeys.sort());
    });
  });
});
