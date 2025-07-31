const Event = require('../models/Event');

// Handler for getCalendarEvents operation
async function getCalendarEvents(c, req, res) {
  try {
    const events = await Event.query().orderBy('startDate', 'asc');
    
    res.status(200).json({
      events: events,
      message: events.length > 0 ? `Found ${events.length} events` : 'No events found'
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch events'
    });
  }
}

// Handler for createCalendarEvent operation
async function createCalendarEvent(c, req, res) {
  try {
    // The request body is already validated by openapi-backend
    const eventData = req.body;
    
    // Create the event using Objection.js
    const event = await Event.query().insert(eventData);
    
    res.status(201).json({
      id: event.id,
      message: 'Event created successfully',
      event: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle validation errors
    if (error.type === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.data
      });
    }
    
    // Handle database constraint errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        error: 'Conflict',
        message: 'Event with this ID already exists'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create event'
    });
  }
}

module.exports = {
  getCalendarEvents,
  createCalendarEvent
};
