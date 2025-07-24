const request = require('supertest');
const app = require('../index');

describe('Calendar App API', () => {
  test('GET / should return API information', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Calendar App API');
    expect(response.body).toHaveProperty('version', '1.0.0');
    expect(response.body).toHaveProperty('status', 'running');
  });

  test('GET /health should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/events should return events endpoint', async () => {
    const response = await request(app)
      .get('/api/events')
      .expect(200);

    expect(response.body).toHaveProperty('events');
    expect(response.body.events).toEqual([]);
    expect(response.body).toHaveProperty('message');
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Route not found');
    expect(response.body).toHaveProperty('path', '/nonexistent');
  });
});
