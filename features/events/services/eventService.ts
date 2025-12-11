import { http } from '../../../common/services/httpClient';
import { ApiResponse } from '../../auth/types/auth';
import {
  Event,
  EventResponse,
  EventListResponse,
  CreateEventRequest,
  UpdateEventRequest,
  DuplicateEventRequest,
  UserEventRelationshipResponse,
  EventSummaryResponse,
  EventRegistrationDeadlineRequest,
  EventQRCodeResponse,
  EventVisibilityResponse,
  EventVisibilityUpdateRequest,
  EventValidationResponse,
  EventHealthCheckResponse,
  EventCollaboratorResponse,
  EventCollaboratorRequest,
  EventMediaResponse,
  EventMediaUploadRequest,
  EventPresignedUploadResponse,
  EventNotificationSettingsResponse,
  EventNotificationSettingsRequest,
  EventNotificationResponse,
  EventNotificationRequest,
  EventReminderResponse,
  EventReminderRequest,
  EventReminderUpdateRequest,
  EventCoverImageResponse,
  EventStatus,
  EventSharingOptionsResponse,
  EventShareRequest,
  EventShareResponse,
  EventData,
  EventFeedResponse,
  EventFeedRequest,
  EventResponseWithScope,
} from '../types/events';
import { ErrorHandler } from '../../../common/utils/errorHandler';
import { OfflineStorage, offlineUtils } from '../../../common/utils/offlineStorage';

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

const toListResponse = (
  events: EventResponse[],
  params?: PaginationParams,
): EventListResponse => ({
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
  cachePrefix?: string,
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
    const list = toListResponse(
      res.data,
      params as PaginationParams | undefined,
    );
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
  /**
   * Get event with scope-based response (FULL or FEED)
   * Returns EventResponseWithScope for owners/high-responsibility users
   * Returns EventFeedResponse for guests/low-responsibility users
   */
  async getEvent(
    eventId: string,
    params?: EventFeedRequest,
  ): Promise<EventData> {
    const queryString = buildQueryString(params);
    const res = await http.get<EventData>(
      `/api/v1/events/${eventId}${queryString}`,
    );
    return res.data;
  },

  /**
   * Get event feed (always returns FEED scope)
   * Use this endpoint when you specifically want the feed view
   */
  async getEventFeed(
    eventId: string,
    params?: EventFeedRequest,
  ): Promise<EventFeedResponse> {
    const queryString = buildQueryString(params);
    const res = await http.get<EventFeedResponse>(
      `/api/v1/events/${eventId}/feed${queryString}`,
    );
    return res.data;
  },

  async createEvent(
    request: CreateEventRequest,
    idempotencyKey?: string,
  ): Promise<Event> {
    try {
      const isOnline = await OfflineStorage.isOnline();

      if (!isOnline) {
        await offlineUtils.storeEventCreation(request);
        throw new Error("Event will be created when you're back online");
      }

      const headers: Record<string, string> = {};
      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      const res = await http.post<Event>('/api/v1/events', request, { headers });

      // Check for idempotency replay - event was already created
      // Axios normalizes headers to lowercase, so check both cases
      const replayHeader = res.headers['x-idempotency-replay'] || res.headers['X-Idempotency-Replay'];
      if (replayHeader === 'true') {
        // Event already exists, return the existing event
        // The response should contain the existing event data
      }

      return res.data;
    } catch (error) {
      ErrorHandler.handle(error, 'createEvent');
      throw error;
    }
  },

  async updateEvent(
    eventId: string,
    updates: UpdateEventRequest,
  ): Promise<EventResponse> {
    try {
      const isOnline = await OfflineStorage.isOnline();

      if (!isOnline) {
        await offlineUtils.storeEventUpdate(eventId, updates);
        throw new Error(
          'Update saved offline and will sync when you are back online',
        );
      }

      const res = await http.put<EventResponse>(
        `/api/v1/events/${eventId}`,
        updates,
      );
      return res.data;
    } catch (error) {
      ErrorHandler.handle(error, 'updateEvent');
      throw error;
    }
  },

  async archiveEvent(eventId: string, reason?: string): Promise<Event> {
    try {
      const query = reason
        ? `?reason=${encodeURIComponent(reason)}`
        : '';
      const res = await http.post<Event>(
        `/api/v1/events/${eventId}/archive${query}`,
      );
      return res.data;
    } catch (error) {
      ErrorHandler.handle(error, 'archiveEvent');
      throw error;
    }
  },

  async restoreEvent(eventId: string): Promise<Event> {
    try {
      const res = await http.post<Event>(`/api/v1/events/${eventId}/restore`);
      return res.data;
    } catch (error) {
      ErrorHandler.handle(error, 'restoreEvent');
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

  async getEvents(
    params?: PaginationParams & { type?: string; status?: string; q?: string },
  ) {
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
    return fetchEventList(
      `/api/v1/events/by-type/${type}`,
      params,
      `events_type_${type}`,
    );
  },

  async getEventsByStatus(status: string, params?: PaginationParams) {
    return fetchEventList(
      `/api/v1/events/by-status/${status}`,
      params,
      `events_status_${status}`,
    );
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

  async getEventsForUser(
    userId: string,
  ): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(
      `/api/v1/events/user/${userId}`,
    );
    return res.data;
  },

  async getEventsOwnedByUser(
    userId: string,
  ): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(
      `/api/v1/events/user/${userId}/owned`,
    );
    return res.data;
  },

  async getUpcomingEventsForUser(
    userId: string,
  ): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(
      `/api/v1/events/user/${userId}/upcoming`,
    );
    return res.data;
  },

  async getPastEventsForUser(
    userId: string,
  ): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(
      `/api/v1/events/user/${userId}/past`,
    );
    return res.data;
  },

  async getMyEventsSummary(): Promise<EventSummaryResponse> {
    const res = await http.get<EventSummaryResponse>(
      '/api/v1/events/my-events',
    );
    return res.data;
  },

  async getMyOwnedEvents(): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(
      '/api/v1/events/my-events/owned',
    );
    return res.data;
  },

  async getMyUpcomingEvents(): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(
      '/api/v1/events/my-events/upcoming',
    );
    return res.data;
  },

  async getMyPastEvents(): Promise<UserEventRelationshipResponse[]> {
    const res = await http.get<UserEventRelationshipResponse[]>(
      '/api/v1/events/my-events/past',
    );
    return res.data;
  },

  async getEventStatus(eventId: string): Promise<EventStatus> {
    const res = await http.get<EventStatus>(`/api/v1/events/${eventId}/status`);
    return res.data;
  },

  async updateEventStatus(
    eventId: string,
    eventStatus: EventStatus,
  ): Promise<Event> {
    const res = await http.put<Event>(`/api/v1/events/${eventId}/status`, {
      eventStatus,
    });
    return res.data;
  },

  async publishEvent(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/publish`);
    return res.data;
  },

  async cancelEvent(eventId: string, reason?: string): Promise<Event> {
    const res = await http.post<Event>(
      `/api/v1/events/${eventId}/cancel`,
      reason ? { reason } : undefined,
    );
    return res.data;
  },

  async completeEvent(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/complete`);
    return res.data;
  },

  async openRegistration(eventId: string): Promise<Event> {
    const res = await http.post<Event>(
      `/api/v1/events/${eventId}/open-registration`,
    );
    return res.data;
  },

  async closeRegistration(eventId: string): Promise<Event> {
    const res = await http.post<Event>(
      `/api/v1/events/${eventId}/close-registration`,
    );
    return res.data;
  },


  async updateRegistrationDeadline(
    eventId: string,
    payload: EventRegistrationDeadlineRequest,
  ): Promise<Event> {
    const res = await http.put<Event>(
      `/api/v1/events/${eventId}/registration-deadline`,
      payload,
    );
    return res.data;
  },

  async getEventQRCode(eventId: string): Promise<EventQRCodeResponse> {
    const res = await http.get<EventQRCodeResponse>(
      `/api/v1/events/${eventId}/qr-code`,
    );
    return res.data;
  },

  async generateEventQRCode(eventId: string): Promise<Event> {
    const res = await http.post<Event>(
      `/api/v1/events/${eventId}/qr-code/generate`,
    );
    return res.data;
  },

  async regenerateEventQRCode(eventId: string): Promise<Event> {
    const res = await http.post<Event>(
      `/api/v1/events/${eventId}/qr-code/regenerate`,
    );
    return res.data;
  },

  async disableEventQRCode(eventId: string): Promise<Event> {
    const res = await http.delete<Event>(`/api/v1/events/${eventId}/qr-code`);
    return res.data;
  },

  async getEventVisibility(eventId: string): Promise<EventVisibilityResponse> {
    const res = await http.get<EventVisibilityResponse>(
      `/api/v1/events/${eventId}/visibility`,
    );
    return res.data;
  },

  async updateEventVisibility(
    eventId: string,
    payload: EventVisibilityUpdateRequest,
  ): Promise<Event> {
    const res = await http.put<Event>(
      `/api/v1/events/${eventId}/visibility`,
      payload,
    );
    return res.data;
  },

  async makeEventPublic(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/make-public`);
    return res.data;
  },

  async makeEventPrivate(eventId: string): Promise<Event> {
    const res = await http.post<Event>(
      `/api/v1/events/${eventId}/make-private`,
    );
    return res.data;
  },

  async getSharingOptions(
    eventId: string,
  ): Promise<EventSharingOptionsResponse> {
    const res = await http.get<EventSharingOptionsResponse>(
      `/api/v1/events/${eventId}/share`,
    );
    return res.data;
  },

  async shareEvent(
    eventId: string,
    payload: EventShareRequest,
  ): Promise<EventShareResponse> {
    const res = await http.post<EventShareResponse>(
      `/api/v1/events/${eventId}/share`,
      payload,
    );
    return res.data;
  },

  // Event Collaborators API
  async getEventCollaborators(
    eventId: string,
    page: number = 0,
    size: number = 20,
  ): Promise<EventCollaboratorResponse[]> {
    const res = await http.get<EventCollaboratorResponse[]>(
      `/api/v1/events/${eventId}/collaborators?page=${page}&size=${size}`,
    );
    return res.data;
  },

  async addEventCollaborator(
    eventId: string,
    payload: EventCollaboratorRequest,
  ): Promise<EventCollaboratorResponse> {
    const res = await http.post<EventCollaboratorResponse>(
      `/api/v1/events/${eventId}/collaborators`,
      payload,
    );
    return res.data;
  },

  async updateEventCollaborator(
    eventId: string,
    collaboratorId: string,
    payload: Partial<EventCollaboratorRequest>,
  ): Promise<EventCollaboratorResponse> {
    const res = await http.put<EventCollaboratorResponse>(
      `/api/v1/events/${eventId}/collaborators/${collaboratorId}`,
      payload,
    );
    return res.data;
  },

  async removeEventCollaborator(
    eventId: string,
    collaboratorId: string,
  ): Promise<void> {
    await http.delete(`/api/v1/events/${eventId}/collaborators/${collaboratorId}`);
  },

  async duplicateEvent(
    eventId: string,
    request: DuplicateEventRequest,
  ): Promise<Event> {
    const res = await http.post<Event>(
      `/api/v1/events/${eventId}/duplicate`,
      request,
    );
    return res.data;
  },

  async validateEvent(eventId: string): Promise<EventValidationResponse> {
    const res = await http.get<EventValidationResponse>(
      `/api/v1/events/${eventId}/validation`,
    );
    return res.data;
  },

  async getEventHealth(eventId: string): Promise<EventHealthCheckResponse> {
    const res = await http.get<EventHealthCheckResponse>(
      `/api/v1/events/${eventId}/health`,
    );
    return res.data;
  },

  async getCollaborators(
    eventId: string,
    params?: PaginationParams,
  ): Promise<EventCollaboratorResponse[]> {
    const res = await http.get<EventCollaboratorResponse[]>(
      `/api/v1/events/${eventId}/collaborators${buildQueryString(params)}`,
    );
    return res.data;
  },

  async addCollaborator(
    eventId: string,
    payload: EventCollaboratorRequest,
  ): Promise<EventCollaboratorResponse> {
    const res = await http.post<EventCollaboratorResponse>(
      `/api/v1/events/${eventId}/collaborators`,
      payload,
    );
    return res.data;
  },

  async updateCollaborator(
    eventId: string,
    collaboratorId: string,
    payload: EventCollaboratorRequest,
  ): Promise<EventCollaboratorResponse> {
    const res = await http.put<EventCollaboratorResponse>(
      `/api/v1/events/${eventId}/collaborators/${collaboratorId}`,
      payload,
    );
    return res.data;
  },

  async removeCollaborator(
    eventId: string,
    collaboratorId: string,
  ): Promise<boolean> {
    await http.delete(
      `/api/v1/events/${eventId}/collaborators/${collaboratorId}`,
    );
    return true;
  },

  async getEventMedia(
    eventId: string,
    params?: { category?: string; type?: string },
  ): Promise<EventMediaResponse[]> {
    const res = await http.get<EventMediaResponse[]>(
      `/api/v1/events/${eventId}/media${buildQueryString(params)}`,
    );
    return res.data;
  },

  async uploadEventMedia(
    eventId: string,
    payload: EventMediaUploadRequest,
  ): Promise<EventPresignedUploadResponse> {
    const res = await http.post<EventPresignedUploadResponse>(
      `/api/v1/events/${eventId}/media`,
      payload,
    );
    return res.data;
  },

  async getEventMediaItem(
    eventId: string,
    mediaId: string,
  ): Promise<EventMediaResponse> {
    const res = await http.get<EventMediaResponse>(
      `/api/v1/events/${eventId}/media/${mediaId}`,
    );
    return res.data;
  },

  async updateEventMedia(
    eventId: string,
    mediaId: string,
    payload: Partial<EventMediaUploadRequest>,
  ): Promise<EventMediaResponse> {
    const res = await http.put<EventMediaResponse>(
      `/api/v1/events/${eventId}/media/${mediaId}`,
      payload,
    );
    return res.data;
  },

  async deleteEventMedia(eventId: string, mediaId: string): Promise<boolean> {
    await http.delete(`/api/v1/events/${eventId}/media/${mediaId}`);
    return true;
  },

  async getEventAssets(eventId: string): Promise<EventMediaResponse[]> {
    const res = await http.get<EventMediaResponse[]>(
      `/api/v1/events/${eventId}/assets`,
    );
    return res.data;
  },

  async uploadEventAsset(
    eventId: string,
    payload: EventMediaUploadRequest,
  ): Promise<EventPresignedUploadResponse> {
    const res = await http.post<EventPresignedUploadResponse>(
      `/api/v1/events/${eventId}/assets`,
      payload,
    );
    return res.data;
  },

  async updateEventCoverImage(
    eventId: string,
    payload: EventMediaUploadRequest,
  ): Promise<EventPresignedUploadResponse> {
    const res = await http.put<EventPresignedUploadResponse>(
      `/api/v1/events/${eventId}/cover-image`,
      payload,
    );
    return res.data;
  },

  async uploadCoverImage(
    eventId: string,
    uploadRequest: EventMediaUploadRequest,
    imageAsset: any,
  ): Promise<boolean> {
    try {
      // Step 1: Get presigned URL
      const presignedResponse = await this.updateEventCoverImage(
        eventId,
        uploadRequest,
      );

      // Step 2: Upload the actual file to the presigned URL
      if (presignedResponse.uploadUrl && imageAsset.uri) {
        // Prepare FormData for the upload
        const formData = new FormData();

        // Add any required fields from the presigned response
        if (presignedResponse.fields) {
          Object.entries(presignedResponse.fields).forEach(([key, value]) => {
            formData.append(key, value);
          });
        }

        // Add the file - React Native specific format
        formData.append('file', {
          uri: imageAsset.uri,
          type: imageAsset.type || 'image/jpeg',
          name: imageAsset.fileName || 'cover-image.jpg',
        } as any);

        // Create request headers
        const headers: Record<string, string> = {
          'Content-Type': 'multipart/form-data',
        };

        // Add any required headers from the presigned response
        if (presignedResponse.headers) {
          Object.assign(headers, presignedResponse.headers);
        }

        // Upload to presigned URL
        const uploadResponse = await fetch(presignedResponse.uploadUrl, {
          method: 'POST',
          body: formData,
          headers,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(
            `Upload failed (${uploadResponse.status}): ${errorText}`,
          );
        }

        return true;
      }

      throw new Error('No upload URL provided in presigned response');
    } catch (error) {
      ErrorHandler.handle(error, 'uploadCoverImage');
      throw error;
    }
  },

  async removeEventCoverImage(
    eventId: string,
  ): Promise<EventCoverImageResponse> {
    const res = await http.delete<EventCoverImageResponse>(
      `/api/v1/events/${eventId}/cover-image`,
    );
    return res.data;
  },

  async getNotificationSettings(
    eventId: string,
  ): Promise<EventNotificationSettingsResponse> {
    const res = await http.get<EventNotificationSettingsResponse>(
      `/api/v1/events/${eventId}/notifications`,
    );
    return res.data;
  },

  async updateNotificationSettings(
    eventId: string,
    payload: EventNotificationSettingsRequest,
  ): Promise<EventNotificationSettingsResponse> {
    const res = await http.put<EventNotificationSettingsResponse>(
      `/api/v1/events/${eventId}/notifications`,
      payload,
    );
    return res.data;
  },

  async sendEventNotification(
    eventId: string,
    payload: EventNotificationRequest,
  ): Promise<EventNotificationResponse> {
    const res = await http.post<EventNotificationResponse>(
      `/api/v1/events/${eventId}/notifications/send`,
      payload,
    );
    return res.data;
  },

  async getEventReminders(
    eventId: string,
    params?: PaginationParams,
  ): Promise<EventReminderResponse[]> {
    const res = await http.get<EventReminderResponse[]>(
      `/api/v1/events/${eventId}/reminders${buildQueryString(params)}`,
    );
    return res.data;
  },

  async createEventReminder(
    eventId: string,
    payload: EventReminderRequest,
  ): Promise<EventReminderResponse> {
    const res = await http.post<EventReminderResponse>(
      `/api/v1/events/${eventId}/reminders`,
      payload,
    );
    return res.data;
  },

  async updateEventReminder(
    eventId: string,
    reminderId: string,
    payload: EventReminderUpdateRequest,
  ): Promise<EventReminderResponse> {
    const res = await http.put<EventReminderResponse>(
      `/api/v1/events/${eventId}/reminders/${reminderId}`,
      payload,
    );
    return res.data;
  },

  async deleteEventReminder(
    eventId: string,
    reminderId: string,
  ): Promise<boolean> {
    await http.delete(`/api/v1/events/${eventId}/reminders/${reminderId}`);
    return true;
  },

  async getEventReminder(
    eventId: string,
    reminderId: string,
  ): Promise<EventReminderResponse> {
    const res = await http.get<EventReminderResponse>(
      `/api/v1/events/${eventId}/reminders/${reminderId}`,
    );
    return res.data;
  },

  async generateEventSuggestion(prompt: string) {
    const res = await http.post<
      ApiResponse<{
        suggestion: string;
        eventData: Partial<CreateEventRequest>;
      }>
    >('/api/v1/events/ai/generate', { prompt });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to generate event suggestion');
  },

  async optimizeEvent(
    eventId: string,
    optimizationType: 'budget' | 'timeline' | 'attendance',
  ) {
    const res = await http.post<
      ApiResponse<{ optimizedEvent: Event; recommendations: string[] }>
    >(`/api/v1/events/${eventId}/ai/optimize`, { optimizationType });
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to optimize event');
  },

  async healthCheck() {
    const res = await http.get<
      ApiResponse<{ status: string; timestamp: string }>
    >('/services/events/actuator/health');
    return res.data;
  },
};
