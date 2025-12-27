import api from './axios';

// Get all events with optional filters
export const getAllEvents = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.registrationOpen !== undefined) params.append('registrationOpen', filters.registrationOpen);

    const response = await api.get(`/events?${params.toString()}`);
    return { 
      success: true, 
      data: response.data.data.events, 
      pagination: response.data.data.pagination 
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch events',
    };
  }
};

// Get event by ID
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch event details',
    };
  }
};

// Create new event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create event',
    };
  }
};

// Update existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.patch(`/events/${eventId}`, eventData);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update event',
    };
  }
};

// Delete event
export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete event',
    };
  }
};

// Get event canteen QR code
export const getEventCanteenQR = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/canteen-qr`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch event canteen QR',
    };
  }
};
