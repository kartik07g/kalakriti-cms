
import api from '@/lib/axios';

export const getEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    throw error;
  }
};

export const eventsApi = {
  getAll: async () => {
    return getEvents();
  },
  
  getByType: async (eventType: string) => {
    try {
      const response = await api.get(`/events/${eventType}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event:', error);
      throw error;
    }
  },
};
