const Event = require('../models/Event');

// Handler for getCalendarEvents operation
async function getCalendarEvents(c, req, res) {
  try {
    const events = await Event.query().orderBy('startDate', 'asc');
    
    const message = events.length > 0 
      ? `Found ${events.length} event${events.length === 1 ? '' : 's'}`
      : 'No events found';
    
    res.status(200).json({
      events: events,
      message: message
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

// Handler for getCalendarEvent operation (single event by ID)
async function getCalendarEvent(c, req, res) {
  try {
    const { id } = c.request.params;
    
    const event = await Event.query().findById(id);
    
    if (!event) {
      return res.status(404).json({
        error: 'Not found',
        message: `Event with ID '${id}' not found`
      });
    }
    
    res.status(200).json({
      event: event,
      message: 'Event retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch event'
    });
  }
}

// Handler for updateCalendarEvent operation
async function updateCalendarEvent(c, req, res) {
  try {
    const { id } = c.request.params;
    const eventData = req.body;
    
    // Check if event exists and update it
    const updatedEvent = await Event.query().patchAndFetchById(id, eventData);
    
    if (!updatedEvent) {
      return res.status(404).json({
        error: 'Not found',
        message: `Event with ID '${id}' not found`
      });
    }
    
    res.status(200).json({
      id: updatedEvent.id,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    
    // Handle validation errors
    if (error.type === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.data
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update event'
    });
  }
}

// Handler for deleteCalendarEvent operation
async function deleteCalendarEvent(c, req, res) {
  try {
    const { id } = c.request.params;
    
    // Delete the event and get the number of deleted rows
    const deletedCount = await Event.query().deleteById(id);
    
    if (deletedCount === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: `Event with ID '${id}' not found`
      });
    }
    
    res.status(200).json({
      id: id,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete event'
    });
  }
}

module.exports = {
  getCalendarEvents,
  createCalendarEvent,
  getCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
};
