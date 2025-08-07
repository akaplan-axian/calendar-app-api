const request = require('supertest');

describe('Express App', () => {
  let app;

  beforeEach(() => {
    // Use test-specific app that doesn't require database
    app = require('./test-express-app');
  });

  describe('Middleware Setup', () => {
    it('should have JSON parsing middleware', async () => {
      // Test JSON parsing by sending JSON data to an endpoint that accepts it
      const eventData = {
        title: 'Test Event',
        startDate: '2025-07-28T10:00:00Z',
        endDate: '2025-07-28T11:00:00Z'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      // The request should be processed (JSON parsed)
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Event created successfully');
    });

    it('should have URL encoded parsing middleware', async () => {
      // Test URL encoded parsing by sending form data to an endpoint
      const response = await request(app)
        .post('/api/events')
        .type('form')
        .send('title=Test Event&startDate=2025-07-28T10:00:00Z&endDate=2025-07-28T11:00:00Z')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Event created successfully');
    });
  });

  describe('Routes', () => {
    it('should handle root route', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Calendar App API',
        version: '1.0.0',
        status: 'running'
      });
    });

    it('should handle health route', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle events route', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body).toHaveProperty('events');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle POST to events route', async () => {
      const eventData = {
        title: 'Test Event',
        startDate: '2025-07-28T10:00:00Z',
        endDate: '2025-07-28T11:00:00Z'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Event created successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Route not found',
        path: '/unknown-route'
      });
    });

  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from helmet', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      // Helmet adds various security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
