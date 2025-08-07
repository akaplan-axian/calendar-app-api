const request = require('supertest');
const express = require('express');
const indexRouter = require('../../src/routes/index');

describe('Index Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/', indexRouter);
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Calendar App API',
        version: '1.0.0',
        status: 'running'
      });
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should have correct response structure', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      // Should have exactly these properties
      const expectedKeys = ['message', 'version', 'status'];
      const actualKeys = Object.keys(response.body);
      
      expect(actualKeys.sort()).toEqual(expectedKeys.sort());
    });

    it('should return consistent response on multiple calls', async () => {
      const response1 = await request(app)
        .get('/')
        .expect(200);

      const response2 = await request(app)
        .get('/')
        .expect(200);

      expect(response1.body).toEqual(response2.body);
    });

    it('should return correct API name', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('Calendar App API');
    });

    it('should return correct version', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.version).toBe('1.0.0');
    });

    it('should return running status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.status).toBe('running');
    });
  });
});
