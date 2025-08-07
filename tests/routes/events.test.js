const request = require('supertest');
const express = require('express');
const eventsRouter = require('../../src/routes/events');

describe('Events Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/events', eventsRouter);
  });

  describe('GET /api/events', () => {
    it('should return events endpoint information', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body).toEqual({
        events: [],
        message: 'Calendar events endpoint - ready for implementation'
      });
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('POST /api/events', () => {
    it('should create event with all fields', async () => {
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
      expect(response.body.id).toMatch(/^evt_[a-z0-9]{9}$/);
      expect(response.body).toHaveProperty('message', 'Event created successfully');
      expect(response.body).toHaveProperty('event');
      expect(response.body.event).toEqual({
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location
      });
    });

    it('should create event with required fields only', async () => {
      const eventData = {
        title: 'Simple Event',
        startDate: '2025-07-28T14:00:00Z',
        endDate: '2025-07-28T15:00:00Z'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Event created successfully');
      expect(response.body.event).toEqual({
        title: eventData.title,
        description: '',
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: ''
      });
    });

    it('should handle missing optional fields gracefully', async () => {
      const eventData = {
        title: 'Event Without Optional Fields',
        startDate: '2025-07-28T14:00:00Z',
        endDate: '2025-07-28T15:00:00Z'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      expect(response.body.event.description).toBe('');
      expect(response.body.event.location).toBe('');
    });

    it('should generate unique IDs for different events', async () => {
      const eventData = {
        title: 'Test Event',
        startDate: '2025-07-28T14:00:00Z',
        endDate: '2025-07-28T15:00:00Z'
      };

      const response1 = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      const response2 = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      expect(response1.body.id).not.toBe(response2.body.id);
      expect(response1.body.id).toMatch(/^evt_[a-z0-9]{9}$/);
      expect(response2.body.id).toMatch(/^evt_[a-z0-9]{9}$/);
    });

    it('should return JSON content type', async () => {
      const eventData = {
        title: 'Test Event',
        startDate: '2025-07-28T14:00:00Z',
        endDate: '2025-07-28T15:00:00Z'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({})
        .expect(201);

      expect(response.body.event).toEqual({
        title: undefined,
        description: '',
        startDate: undefined,
        endDate: undefined,
        location: ''
      });
    });

    it('should preserve all provided fields in response', async () => {
      const eventData = {
        title: 'Detailed Event',
        description: 'A very detailed event description',
        startDate: '2025-07-28T14:00:00Z',
        endDate: '2025-07-28T15:00:00Z',
        location: 'Main Conference Room',
        extraField: 'This should not appear in response'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);

      // Should only include the expected fields
      expect(response.body.event).toEqual({
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location
      });
      expect(response.body.event).not.toHaveProperty('extraField');
    });
  });
});
