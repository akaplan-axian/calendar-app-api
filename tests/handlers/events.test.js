const { getCalendarEvents, createCalendarEvent, getCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = require('../../src/handlers/events');
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

  describe('getCalendarEvent', () => {
    beforeEach(() => {
      mockContext = {
        request: {
          params: { id: 'evt_123' }
        }
      };
    });

    it('should return event successfully when event exists', async () => {
      const mockEvent = {
        id: 'evt_123',
        title: 'Test Event',
        startDate: '2025-07-28T10:00:00Z',
        endDate: '2025-07-28T11:00:00Z'
      };

      const mockQuery = {
        findById: jest.fn().mockResolvedValue(mockEvent)
      };
      Event.query.mockReturnValue(mockQuery);

      await getCalendarEvent(mockContext, mockReq, mockRes);

      expect(Event.query).toHaveBeenCalled();
      expect(mockQuery.findById).toHaveBeenCalledWith('evt_123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        event: mockEvent,
        message: 'Event retrieved successfully'
      });
    });

    it('should return 404 when event does not exist', async () => {
      const mockQuery = {
        findById: jest.fn().mockResolvedValue(null)
      };
      Event.query.mockReturnValue(mockQuery);

      await getCalendarEvent(mockContext, mockReq, mockRes);

      expect(mockQuery.findById).toHaveBeenCalledWith('evt_123');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Not found',
        message: "Event with ID 'evt_123' not found"
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      const mockQuery = {
        findById: jest.fn().mockRejectedValue(mockError)
      };
      Event.query.mockReturnValue(mockQuery);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await getCalendarEvent(mockContext, mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching event:', mockError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Failed to fetch event'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('updateCalendarEvent', () => {
    beforeEach(() => {
      mockContext = {
        request: {
          params: { id: 'evt_123' }
        }
      };
      mockReq.body = {
        title: 'Updated Event',
        startDate: '2025-07-28T10:00:00Z',
        endDate: '2025-07-28T11:00:00Z'
      };
    });

    it('should update event successfully', async () => {
      const updatedEvent = {
        id: 'evt_123',
        ...mockReq.body
      };

      const mockQuery = {
        patchAndFetchById: jest.fn().mockResolvedValue(updatedEvent)
      };
      Event.query.mockReturnValue(mockQuery);

      await updateCalendarEvent(mockContext, mockReq, mockRes);

      expect(Event.query).toHaveBeenCalled();
      expect(mockQuery.patchAndFetchById).toHaveBeenCalledWith('evt_123', mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: updatedEvent.id,
        message: 'Event updated successfully',
        event: updatedEvent
      });
    });

    it('should return 404 when event does not exist', async () => {
      const mockQuery = {
        patchAndFetchById: jest.fn().mockResolvedValue(null)
      };
      Event.query.mockReturnValue(mockQuery);

      await updateCalendarEvent(mockContext, mockReq, mockRes);

      expect(mockQuery.patchAndFetchById).toHaveBeenCalledWith('evt_123', mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Not found',
        message: "Event with ID 'evt_123' not found"
      });
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      validationError.type = 'ValidationError';
      validationError.data = ['title is required'];

      const mockQuery = {
        patchAndFetchById: jest.fn().mockRejectedValue(validationError)
      };
      Event.query.mockReturnValue(mockQuery);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await updateCalendarEvent(mockContext, mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('Error updating event:', validationError);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: validationError.data
      });

      consoleSpy.mockRestore();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');

      const mockQuery = {
        patchAndFetchById: jest.fn().mockRejectedValue(dbError)
      };
      Event.query.mockReturnValue(mockQuery);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await updateCalendarEvent(mockContext, mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('Error updating event:', dbError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Failed to update event'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('deleteCalendarEvent', () => {
    beforeEach(() => {
      mockContext = {
        request: {
          params: { id: 'evt_123' }
        }
      };
    });

    it('should delete event successfully', async () => {
      const mockQuery = {
        deleteById: jest.fn().mockResolvedValue(1) // 1 row deleted
      };
      Event.query.mockReturnValue(mockQuery);

      await deleteCalendarEvent(mockContext, mockReq, mockRes);

      expect(Event.query).toHaveBeenCalled();
      expect(mockQuery.deleteById).toHaveBeenCalledWith('evt_123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 'evt_123',
        message: 'Event deleted successfully'
      });
    });

    it('should return 404 when event does not exist', async () => {
      const mockQuery = {
        deleteById: jest.fn().mockResolvedValue(0) // 0 rows deleted
      };
      Event.query.mockReturnValue(mockQuery);

      await deleteCalendarEvent(mockContext, mockReq, mockRes);

      expect(mockQuery.deleteById).toHaveBeenCalledWith('evt_123');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Not found',
        message: "Event with ID 'evt_123' not found"
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');

      const mockQuery = {
        deleteById: jest.fn().mockRejectedValue(dbError)
      };
      Event.query.mockReturnValue(mockQuery);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await deleteCalendarEvent(mockContext, mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('Error deleting event:', dbError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Failed to delete event'
      });

      consoleSpy.mockRestore();
    });
  });
});
