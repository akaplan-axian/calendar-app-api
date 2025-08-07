const { getCalendarEvents, createCalendarEvent } = require('../../src/handlers/events');
const Event = require('../../src/models/Event');

// Mock the Event model
jest.mock('../../src/models/Event');

describe('Events Handlers', () => {
  let mockReq, mockRes, mockContext;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockContext = {};
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getCalendarEvents', () => {
    it('should return events successfully when events exist', async () => {
      const mockEvents = [
        { id: 'evt_1', title: 'Event 1', startDate: '2025-07-28T10:00:00Z' },
        { id: 'evt_2', title: 'Event 2', startDate: '2025-07-29T14:00:00Z' }
      ];

      const mockQuery = {
        orderBy: jest.fn().mockResolvedValue(mockEvents)
      };
      Event.query.mockReturnValue(mockQuery);

      await getCalendarEvents(mockContext, mockReq, mockRes);

      expect(Event.query).toHaveBeenCalled();
      expect(mockQuery.orderBy).toHaveBeenCalledWith('startDate', 'asc');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        events: mockEvents,
        message: 'Found 2 events'
      });
    });

    it('should return empty events array when no events exist', async () => {
      const mockEvents = [];

      const mockQuery = {
        orderBy: jest.fn().mockResolvedValue(mockEvents)
      };
      Event.query.mockReturnValue(mockQuery);

      await getCalendarEvents(mockContext, mockReq, mockRes);

      expect(Event.query).toHaveBeenCalled();
      expect(mockQuery.orderBy).toHaveBeenCalledWith('startDate', 'asc');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        events: mockEvents,
        message: 'No events found'
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      const mockQuery = {
        orderBy: jest.fn().mockRejectedValue(mockError)
      };
      Event.query.mockReturnValue(mockQuery);

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await getCalendarEvents(mockContext, mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching events:', mockError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Failed to fetch events'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('createCalendarEvent', () => {
    it('should create event successfully', async () => {
      const eventData = {
        title: 'New Event',
        description: 'Event description',
        startDate: '2025-07-28T10:00:00Z',
        endDate: '2025-07-28T11:00:00Z'
      };
      
      const createdEvent = {
        id: 'evt_123',
        ...eventData
      };

      mockReq.body = eventData;

      const mockQuery = {
        insert: jest.fn().mockResolvedValue(createdEvent)
      };
      Event.query.mockReturnValue(mockQuery);

      await createCalendarEvent(mockContext, mockReq, mockRes);

      expect(Event.query).toHaveBeenCalled();
      expect(mockQuery.insert).toHaveBeenCalledWith(eventData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: createdEvent.id,
        message: 'Event created successfully',
        event: createdEvent
      });
    });

    it('should handle validation errors', async () => {
      const eventData = { title: 'Invalid Event' };
      mockReq.body = eventData;

      const validationError = new Error('Validation failed');
      validationError.type = 'ValidationError';
      validationError.data = ['startDate is required'];

      const mockQuery = {
        insert: jest.fn().mockRejectedValue(validationError)
      };
      Event.query.mockReturnValue(mockQuery);

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await createCalendarEvent(mockContext, mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('Error creating event:', validationError);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: validationError.data
      });

      consoleSpy.mockRestore();
    });

    it('should handle unique constraint violations', async () => {
      const eventData = {
        id: 'existing_id',
        title: 'Duplicate Event',
        startDate: '2025-07-28T10:00:00Z',
        endDate: '2025-07-28T11:00:00Z'
      };
      mockReq.body = eventData;

      const constraintError = new Error('Unique constraint violation');
      constraintError.code = '23505';

      const mockQuery = {
        insert: jest.fn().mockRejectedValue(constraintError)
      };
      Event.query.mockReturnValue(mockQuery);

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await createCalendarEvent(mockContext, mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('Error creating event:', constraintError);
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Conflict',
        message: 'Event with this ID already exists'
      });

      consoleSpy.mockRestore();
    });

    it('should handle general database errors', async () => {
      const eventData = {
        title: 'Event',
        startDate: '2025-07-28T10:00:00Z',
        endDate: '2025-07-28T11:00:00Z'
      };
      mockReq.body = eventData;

      const dbError = new Error('Database connection failed');

      const mockQuery = {
        insert: jest.fn().mockRejectedValue(dbError)
      };
      Event.query.mockReturnValue(mockQuery);

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await createCalendarEvent(mockContext, mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('Error creating event:', dbError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Failed to create event'
      });

      consoleSpy.mockRestore();
    });
  });
});
