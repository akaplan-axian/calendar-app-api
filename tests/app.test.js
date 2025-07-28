const request = require('supertest');
const app = require('../src/express');

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

  test('POST /api/events should create event with valid data', async () => {
    const eventData = {
      title: 'Team Meeting',
      description: 'Weekly team sync meeting',
      startDate: '2025-07-28T14:00:00Z',
      endDate: '2025-07-28T15:00:00Z',
      location: 'Conference Room A'
    };

    const response = await request(app)
      .post('/api/events')
      .send(eventData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('message', 'Event created successfully');
    expect(response.body).toHaveProperty('event');
    expect(response.body.event).toHaveProperty('title', eventData.title);
    expect(response.body.event).toHaveProperty('startDate', eventData.startDate);
    expect(response.body.event).toHaveProperty('endDate', eventData.endDate);
  });

  test('POST /api/events should return validation error for missing required fields', async () => {
    const invalidEventData = {
      description: 'Meeting without title'
      // Missing required fields: title, startDate, endDate
    };

    const response = await request(app)
      .post('/api/events')
      .send(invalidEventData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
    expect(response.body).toHaveProperty('details');
    expect(Array.isArray(response.body.details)).toBe(true);
    expect(response.body.details.length).toBeGreaterThan(0);
  });

  test('POST /api/events should return validation error for invalid data types', async () => {
    const invalidEventData = {
      title: 123, // Should be string
      startDate: 'invalid-date', // Should be valid date-time format
      endDate: '2025-07-28T15:00:00Z'
    };

    const response = await request(app)
      .post('/api/events')
      .send(invalidEventData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
    expect(response.body).toHaveProperty('details');
    expect(Array.isArray(response.body.details)).toBe(true);
  });
});
