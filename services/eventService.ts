import { http } from './httpClient';
import {
  ApiResponse,
  Event,
  EventResponse,
  EventListResponse,
  CreateEventRequest,
  UpdateEventRequest,
  DuplicateEventRequest,
  UserEventRelationshipResponse,
  EventSummaryResponse,
  EventCapacityResponse,
  EventQRCodeResponse,
  EventVisibilityResponse,
  EventAnalyticsResponse,
  EventValidationResponse,
  EventHealthCheckResponse,
  EventCollaboratorResponse,
  EventMediaResponse,
  EventPresignedUploadResponse,
  EventNotificationSettingsResponse,
  EventNotificationResponse,
  EventReminderResponse,
  EventCoverImageResponse,
  EventStatus,
  EventUserType,
  EventNotificationChannel,
  EventNotificationPriority,
} from '../types';
import { ErrorHandler } from '../utils/errorHandler';
import { OfflineStorage, offlineUtils } from '../utils/offlineStorage';

type PaginationParams = {
  page?: number;
  size?: number;
  sort?: string;
};

type SearchEventsParams = PaginationParams & {
  q?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

type VisibilityRequest = {
  isPublic: boolean;
  requiresApproval?: boolean;
};

type CollaboratorRequest = {
  userId?: string;
  email: string;
  role: EventUserType;
  permissions?: string[];
  notes?: string;
  sendInvitation?: boolean;
  invitationMessage?: string;
};

type MediaUploadRequest = {
  fileName: string;
  contentType: string;
  category?: string;
  isPublic?: boolean;
  tags?: string;
  description?: string;
  metadata?: Record<string, string>;
};

type NotificationSettingsRequest = Partial<EventNotificationSettingsResponse>;

type SendNotificationRequest = {
  channel: EventNotificationChannel;
  subject: string;
  content: string;
  recipientUserIds?: string[];
  recipientEmails?: string[];
  scheduledAt?: string;
  includeEventDetails?: boolean;
  includeQRCode?: boolean;
  priority?: EventNotificationPriority;
  templateId?: string;
};

type CreateReminderRequest = {
  title: string;
  description?: string;
  reminderTime: string;
  channel: string;
  recipientUserIds?: string[];
  recipientEmails?: string[];
  reminderType?: string;
  isActive?: boolean;
  customMessage?: string;
  includeEventDetails?: boolean;
};

type UpdateReminderRequest = Partial<CreateReminderRequest>;

const buildQueryString = (params?: Record<string, unknown>) => {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => searchParams.append(key, String(item)));
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const toListResponse = (events: EventResponse[], params?: PaginationParams): EventListResponse => ({
  events,
  total: events.length,
  page: params?.page ?? 1,
  size: params?.size ?? events.length,
});

const makeCacheKey = (prefix: string, params?: Record<string, unknown>) =>
  `${prefix}_${JSON.stringify(params || {})}`;

const fetchEventList = async (
  endpoint: string,
  params?: Record<string, unknown>,
  cachePrefix?: string
): Promise<EventListResponse> => {
  const url = `${endpoint}${buildQueryString(params)}`;
  const cacheKey = cachePrefix ? makeCacheKey(cachePrefix, params) : undefined;
  const isOnline = await OfflineStorage.isOnline();

  if (!isOnline && cacheKey) {
    const cached = await OfflineStorage.getCache(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const res = await http.get<EventResponse[]>(url);
    const list = toListResponse(res.data, params as PaginationParams | undefined);
    if (cacheKey) {
      await OfflineStorage.setCache(cacheKey, list);
    }
    return list;
  } catch (error) {
    if (cacheKey) {
      const cached = await OfflineStorage.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }
    ErrorHandler.handle(error, url);
    throw error;
  }
};

export const eventService = {
  async getEvent(eventId: string): Promise<Event> {
    const res = await http.get<Event>(`/api/v1/events/${eventId}`);
    return res.data;
  },

  async createEvent(request: CreateEventRequest): Promise<Event> {
    try {
      const isOnline = await OfflineStorage.isOnline();

      if (!isOnline) {
        await offlineUtils.storeEventCreation(request);
        throw new Error("Event will be created when you're back online");
      }

      const res = await http.post<Event>('/api/v1/events', request);
      return res.data;
    } catch (error) {
      ErrorHandler.handle(error, 'createEvent');
      throw error;
    }
  },

  async updateEvent(eventId: string, updates: UpdateEventRequest): Promise<EventResponse> {
    try {
      const isOnline = await OfflineStorage.isOnline();

      if (!isOnline) {
        await offlineUtils.storeEventUpdate(eventId, updates);
        throw new Error('Update saved offline and will sync when you are back online');
      }

      const res = await http.put<EventResponse>(`/api/v1/events/${eventId}`, updates);
      return res.data;
    } catch (error) {
      ErrorHandler.handle(error, 'updateEvent');
      throw error;
    }
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      await http.delete(`/api/v1/events/${eventId}`);
      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'deleteEvent');
      throw error;
    }
  },

  async getEvents(params?: PaginationParams & { type?: string; status?: string; q?: string }) {
    const { q, type, status, ...rest } = params || {};
    if (q || type || status) {
      return eventService.searchEvents({
        q,
        type,
        status,
        page: rest.page,
        size: rest.size,
        sort: rest.sort,
      });
    }
    return fetchEventList('/api/v1/events/public', rest, 'events_public');
  },

  async getPublicEvents(params?: PaginationParams) {
    return fetchEventList('/api/v1/events/public', params, 'events_public');
  },

  async getFeaturedEvents(params?: PaginationParams) {
    return fetchEventList('/api/v1/events/featured', params, 'events_featured');
  },

  async getTrendingEvents(params?: PaginationParams) {
    return fetchEventList('/api/v1/events/trending', params, 'events_trending');
  },

  async getUpcomingPublicEvents(params?: PaginationParams) {
    return fetchEventList('/api/v1/events/upcoming', params, 'events_upcoming');
  },

  async getEventsByType(type: string, params?: PaginationParams) {
    return fetchEventList(`/api/v1/events/by-type/${type}`, params, `events_type_${type}`);
  },

  async getEventsByStatus(status: string, params?: PaginationParams) {
    return fetchEventList(`/api/v1/events/by-status/${status}`, params, `events_status_${status}`);
  },

  async searchEvents(params: SearchEventsParams = {}) {
    const { q, type, status, dateFrom, dateTo, ...pagination } = params;
    const query: Record<string, unknown> = { ...pagination };
    if (q) query.q = q;
    if (type) query.type = type;
    if (status) query.status = status;
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    return fetchEventList('/api/v1/events/search', query, 'events_search');
  },

  async getEventsForUser(userId: string): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(`/api/v1/events/user/${userId}`);
    return res.data;
  },

  async getEventsOwnedByUser(userId: string): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(`/api/v1/events/user/${userId}/owned`);
    return res.data;
  },

  async getUpcomingEventsForUser(userId: string): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(`/api/v1/events/user/${userId}/upcoming`);
    return res.data;
  },

  async getPastEventsForUser(userId: string): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(`/api/v1/events/user/${userId}/past`);
    return res.data;
  },

  async getMyEventsSummary(): Promise<EventSummaryResponse> {
    const res = await http.get<EventSummaryResponse>('/api/v1/events/my-events');
    return res.data;
  },

  async getMyOwnedEvents(): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>('/api/v1/events/my-events/owned');
    return res.data;
  },

  async getMyUpcomingEvents(): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>('/api/v1/events/my-events/upcoming');
    return res.data;
  },

  async getMyPastEvents(): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>('/api/v1/events/my-events/past');
    return res.data;
  },

  async getEventStatus(eventId: string): Promise<EventStatus> {
    const res = await http.get<EventStatus>(`/api/v1/events/${eventId}/status`);
    return res.data;
  },

  async updateEventStatus(eventId: string, eventStatus: EventStatus): Promise<Event> {
    const res = await http.put<Event>(`/api/v1/events/${eventId}/status`, { eventStatus });
    return res.data;
  },

  async publishEvent(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/publish`);
    return res.data;
  },

  async cancelEvent(eventId: string, reason?: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/cancel`, reason ? { reason } : undefined);
    return res.data;
  },

  async completeEvent(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/complete`);
    return res.data;
  },

  async openRegistration(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/open-registration`);
    return res.data;
  },

  async closeRegistration(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/close-registration`);
    return res.data;
  },

  async getEventCapacity(eventId: string): Promise<EventCapacityResponse> {
    const res = await http.get<EventCapacityResponse>(`/api/v1/events/${eventId}/capacity`);
    return res.data;
  },

  async updateEventCapacity(eventId: string, capacity: number): Promise<Event> {
    const res = await http.put<Event>(`/api/v1/events/${eventId}/capacity`, { capacity });
    return res.data;
  },

  async getAvailableCapacity(eventId: string): Promise<number> {
    const res = await http.get<number>(`/api/v1/events/${eventId}/capacity/available`);
    return res.data;
  },

  async updateRegistrationDeadline(eventId: string, deadline: string): Promise<Event> {
    const res = await http.put<Event>(`/api/v1/events/${eventId}/registration-deadline`, { deadline });
    return res.data;
  },

  async getEventQRCode(eventId: string): Promise<EventQRCodeResponse> {
    const res = await http.get<EventQRCodeResponse>(`/api/v1/events/${eventId}/qr-code`);
    return res.data;
  },

  async generateEventQRCode(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/qr-code/generate`);
    return res.data;
  },

  async regenerateEventQRCode(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/qr-code/regenerate`);
    return res.data;
  },

  async disableEventQRCode(eventId: string): Promise<Event> {
    const res = await http.delete<Event>(`/api/v1/events/${eventId}/qr-code`);
    return res.data;
  },

  async getEventVisibility(eventId: string): Promise<EventVisibilityResponse> {
    const res = await http.get<EventVisibilityResponse>(`/api/v1/events/${eventId}/visibility`);
    return res.data;
  },

  async updateEventVisibility(eventId: string, payload: VisibilityRequest): Promise<Event> {
    const res = await http.put<Event>(`/api/v1/events/${eventId}/visibility`, payload);
    return res.data;
  },

  async makeEventPublic(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/make-public`);
    return res.data;
  },

  async makeEventPrivate(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/make-private`);
    return res.data;
  },

  async getEventAnalytics(eventId: string): Promise<EventAnalyticsResponse> {
    const res = await http.get<EventAnalyticsResponse>(`/api/v1/events/${eventId}/analytics`);
    return res.data;
  },

  async duplicateEvent(eventId: string, request: DuplicateEventRequest): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/duplicate`, request);
    return res.data;
  },

  async validateEvent(eventId: string): Promise<EventValidationResponse> {
    const res = await http.get<EventValidationResponse>(`/api/v1/events/${eventId}/validation`);
    return res.data;
  },

  async getEventHealth(eventId: string): Promise<EventHealthCheckResponse> {
    const res = await http.get<EventHealthCheckResponse>(`/api/v1/events/${eventId}/health`);
    return res.data;
  },

  async getCollaborators(eventId: string, params?: PaginationParams): Promise<EventCollaboratorResponse[]> {
    const res = await http.get<EventCollaboratorResponse[]>(
      `/api/v1/events/${eventId}/collaborators${buildQueryString(params)}`
    );
    return res.data;
  },

  async addCollaborator(eventId: string, payload: CollaboratorRequest): Promise<EventCollaboratorResponse> {
    const res = await http.post<EventCollaboratorResponse>(`/api/v1/events/${eventId}/collaborators`, payload);
    return res.data;
  },

  async updateCollaborator(eventId: string, collaboratorId: string, payload: CollaboratorRequest): Promise<EventCollaboratorResponse> {
    const res = await http.put<EventCollaboratorResponse>(
      `/api/v1/events/${eventId}/collaborators/${collaboratorId}`,
      payload
    );
    return res.data;
  },

  async removeCollaborator(eventId: string, collaboratorId: string): Promise<boolean> {
    await http.delete(`/api/v1/events/${eventId}/collaborators/${collaboratorId}`);
    return true;
  },

  async getEventMedia(eventId: string, params?: { category?: string; type?: string }): Promise<EventMediaResponse[]> {
    const res = await http.get<EventMediaResponse[]>(
      `/api/v1/events/${eventId}/media${buildQueryString(params)}`
    );
    return res.data;
  },

  async uploadEventMedia(eventId: string, payload: MediaUploadRequest): Promise<EventPresignedUploadResponse> {
    const res = await http.post<EventPresignedUploadResponse>(`/api/v1/events/${eventId}/media`, payload);
    return res.data;
  },

  async getEventMediaItem(eventId: string, mediaId: string): Promise<EventMediaResponse> {
    const res = await http.get<EventMediaResponse>(`/api/v1/events/${eventId}/media/${mediaId}`);
    return res.data;
  },

  async updateEventMedia(eventId: string, mediaId: string, payload: Partial<MediaUploadRequest>): Promise<EventMediaResponse> {
    const res = await http.put<EventMediaResponse>(`/api/v1/events/${eventId}/media/${mediaId}`, payload);
    return res.data;
  },

  async deleteEventMedia(eventId: string, mediaId: string): Promise<boolean> {
    await http.delete(`/api/v1/events/${eventId}/media/${mediaId}`);
    return true;
  },

  async getEventAssets(eventId: string): Promise<EventMediaResponse[]> {
    const res = await http.get<EventMediaResponse[]>(`/api/v1/events/${eventId}/assets`);
    return res.data;
  },

  async uploadEventAsset(eventId: string, payload: MediaUploadRequest): Promise<EventPresignedUploadResponse> {
    const res = await http.post<EventPresignedUploadResponse>(`/api/v1/events/${eventId}/assets`, payload);
    return res.data;
  },

  async updateEventCoverImage(eventId: string, payload: MediaUploadRequest): Promise<EventPresignedUploadResponse> {
    const res = await http.put<EventPresignedUploadResponse>(`/api/v1/events/${eventId}/cover-image`, payload);
    return res.data;
  },

  async removeEventCoverImage(eventId: string): Promise<EventCoverImageResponse> {
    const res = await http.delete<EventCoverImageResponse>(`/api/v1/events/${eventId}/cover-image`);
    return res.data;
  },

  async getNotificationSettings(eventId: string): Promise<EventNotificationSettingsResponse> {
    const res = await http.get<EventNotificationSettingsResponse>(`/api/v1/events/${eventId}/notifications`);
    return res.data;
  },

  async updateNotificationSettings(eventId: string, payload: NotificationSettingsRequest): Promise<EventNotificationSettingsResponse> {
    const res = await http.put<EventNotificationSettingsResponse>(`/api/v1/events/${eventId}/notifications`, payload);
    return res.data;
  },

  async sendEventNotification(eventId: string, payload: SendNotificationRequest): Promise<EventNotificationResponse> {
    const res = await http.post<EventNotificationResponse>(`/api/v1/events/${eventId}/notifications/send`, payload);
    return res.data;
  },

  async getEventReminders(eventId: string, params?: PaginationParams): Promise<EventReminderResponse[]> {
    const res = await http.get<EventReminderResponse[]>(
      `/api/v1/events/${eventId}/reminders${buildQueryString(params)}`
    );
    return res.data;
  },

  async createEventReminder(eventId: string, payload: CreateReminderRequest): Promise<EventReminderResponse> {
    const res = await http.post<EventReminderResponse>(`/api/v1/events/${eventId}/reminders`, payload);
    return res.data;
  },

  async updateEventReminder(eventId: string, reminderId: string, payload: UpdateReminderRequest): Promise<EventReminderResponse> {
    const res = await http.put<EventReminderResponse>(
      `/api/v1/events/${eventId}/reminders/${reminderId}`,
      payload
    );
    return res.data;
  },

  async deleteEventReminder(eventId: string, reminderId: string): Promise<boolean> {
    await http.delete(`/api/v1/events/${eventId}/reminders/${reminderId}`);
    return true;
  },

  async getEventReminder(eventId: string, reminderId: string): Promise<EventReminderResponse> {
    const res = await http.get<EventReminderResponse>(`/api/v1/events/${eventId}/reminders/${reminderId}`);
    return res.data;
  },

  async generateEventSuggestion(prompt: string) {
    const res = await http.post<ApiResponse<{ suggestion: string; eventData: Partial<CreateEventRequest> }>>(
      '/api/v1/events/ai/generate',
      { prompt }
    );
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to generate event suggestion');
  },

  async optimizeEvent(eventId: string, optimizationType: 'budget' | 'timeline' | 'attendance') {
    const res = await http.post<ApiResponse<{ optimizedEvent: Event; recommendations: string[] }>>(
      `/api/v1/events/${eventId}/ai/optimize`,
      { optimizationType }
    );
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to optimize event');
  },

  async healthCheck() {
    const res = await http.get<ApiResponse<{ status: string; timestamp: string }>>('/services/events/actuator/health');
    return res.data;
  },
};
