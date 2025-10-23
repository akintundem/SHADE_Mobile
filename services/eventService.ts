import { http } from './httpClient';
import { 
  ApiResponse, 
  Event, 
  CreateEventRequest, 
  UpdateEventRequest, 
  EventResponse 
} from '../types';
import { ErrorHandler } from '../utils/errorHandler';
import { OfflineStorage, offlineUtils } from '../utils/offlineStorage';

export const eventService = {
  // Get Event by ID
  async getEvent(eventId: string) {
    const res = await http.get<EventResponse>(`/api/v1/events/${eventId}`);
    return res.data;
  },

  // Create Event
  async createEvent(request: CreateEventRequest) {
    try {
      const isOnline = await OfflineStorage.isOnline();
      
      if (!isOnline) {
        // Store for later sync when online
        await offlineUtils.storeEventCreation(request);
        throw new Error('Event will be created when you\'re back online');
      }
      
      const res = await http.post<EventResponse>('/api/v1/events', request);
      return res.data;
    } catch (error) {
      ErrorHandler.handle(error, 'createEvent');
      throw error;
    }
  },

  // Update Event
  async updateEvent(eventId: string, updates: UpdateEventRequest) {
    const res = await http.put<EventResponse>(`/api/v1/events/${eventId}`, updates);
    return res.data;
  },

  // Delete Event
  async deleteEvent(eventId: string) {
    await http.delete(`/api/v1/events/${eventId}`);
    return true;
  },

  async getEvents(params?: {
    page?: number;
    size?: number;
    category?: string;
    status?: string;
    organizerId?: string;
  }) {
    try {
      const isOnline = await OfflineStorage.isOnline();
      
      // Try to get cached data first
      const cacheKey = `events_${JSON.stringify(params || {})}`;
      const cachedData = await OfflineStorage.getCache(cacheKey);
      
      if (!isOnline && cachedData) {
        return cachedData;
      }
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.size) queryParams.append('size', params.size.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.organizerId) queryParams.append('organizerId', params.organizerId);

      const queryString = queryParams.toString();
      const url = queryString ? `/api/v1/events?${queryString}` : '/api/v1/events';
      
      const res = await http.get<ApiResponse<{ events: Event[]; total: number; page: number; size: number }>>(url);
      const body = res.data;
      if (body.status === 200 && body.data) {
        // Cache the result
        await OfflineStorage.setCache(cacheKey, body.data);
        return body.data;
      }
      throw new Error(body.message || 'Failed to get events');
    } catch (error) {
      // If online request fails, try to return cached data
      if (error?.status !== 0) { // Not a network error
        const cacheKey = `events_${JSON.stringify(params || {})}`;
        const cachedData = await OfflineStorage.getCache(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      ErrorHandler.handle(error, 'getEvents');
      throw error;
    }
  },

  async searchEvents(query: string, filters?: {
    category?: string;
    location?: string;
    dateRange?: { start: string; end: string };
    priceRange?: { min: number; max: number };
  }) {
    const searchParams = new URLSearchParams({ q: query });
    if (filters?.category) searchParams.append('category', filters.category);
    if (filters?.location) searchParams.append('location', filters.location);
    if (filters?.dateRange) {
      searchParams.append('startDate', filters.dateRange.start);
      searchParams.append('endDate', filters.dateRange.end);
    }
    if (filters?.priceRange) {
      searchParams.append('minPrice', filters.priceRange.min.toString());
      searchParams.append('maxPrice', filters.priceRange.max.toString());
    }

    const res = await http.get<ApiResponse<{ events: Event[]; total: number }>>(`/api/v1/events/search?${searchParams.toString()}`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to search events');
  },

  // AI-powered features
  async generateEventSuggestion(prompt: string) {
    const res = await http.post<ApiResponse<{ suggestion: string; eventData: Partial<CreateEventRequest> }>>('/api/v1/events/ai/generate', {
      prompt,
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to generate event suggestion');
  },

  async optimizeEvent(eventId: string, optimizationType: 'budget' | 'timeline' | 'attendance') {
    const res = await http.post<ApiResponse<{ optimizedEvent: Event; recommendations: string[] }>>(`/api/v1/events/${eventId}/ai/optimize`, {
      optimizationType,
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to optimize event');
  },

  // Event analytics
  async getEventAnalytics(eventId: string) {
    const res = await http.get<ApiResponse<{
      totalViews: number;
      registrations: number;
      attendance: number;
      engagement: number;
      demographics: Record<string, number>;
    }>>(`/api/v1/events/${eventId}/analytics`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to get event analytics');
  },

  // Event status management
  async publishEvent(eventId: string) {
    const res = await http.post<ApiResponse<Event>>(`/api/v1/events/${eventId}/publish`);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to publish event');
  },

  async cancelEvent(eventId: string, reason?: string) {
    const res = await http.post<ApiResponse<Event>>(`/api/v1/events/${eventId}/cancel`, {
      reason,
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to cancel event');
  },

  // Health check
  async healthCheck() {
    const res = await http.get<ApiResponse<{ status: string; timestamp: string }>>('/services/events/actuator/health');
    return res.data;
  },
};
