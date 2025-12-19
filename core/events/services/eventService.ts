import { http } from '../../../common/services/httpClient';
import { ApiResponse } from '../../auth/types/auth';
import {
  Event,
  EventResponse,
  CreateEventRequest,
  UpdateEventRequest,
  EventRegistrationDeadlineRequest,
  EventCapacityResponse,
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
  EventType,
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

type EventsTimeframe = 'UPCOMING' | 'PAST';

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size?: number;
  number?: number;
  pageable?: Record<string, unknown>;
};

type EventsSortBy = 'startDateTime' | 'createdAt' | 'name' | 'currentAttendeeCount';
type SortDirection = 'ASC' | 'DESC';

type EventsQueryParams = {
  page?: number;
  size?: number;
  status?: EventStatus;
  eventType?: EventType;
  isPublic?: boolean;
  mine?: boolean;
  timeframe?: EventsTimeframe;
  startDateFrom?: string;
  startDateTo?: string;
  isArchived?: boolean;
  search?: string;
  sortBy?: EventsSortBy;
  sortDirection?: SortDirection;
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

const makeCacheKey = (prefix: string, params?: Record<string, unknown>) =>
  `${prefix}_${JSON.stringify(params || {})}`;

const fetchEventsPage = async (
  params?: Record<string, unknown>,
  cachePrefix?: string,
): Promise<PageResponse<EventResponse>> => {
  // MOCK for local dev
  const page = (params?.page as number) || 0;
  const size = (params?.size as number) || 20;
  
  const mockData: EventResponse[] = [
    {
      id: 'mock-event-1',
      name: 'Tech Innovation Summit 2024',
      description: 'Join us for an exciting day of tech talks, networking, and innovation. Featuring industry leaders and cutting-edge demonstrations.',
      eventType: 'CONFERENCE' as any,
      eventStatus: 'REGISTRATION_OPEN' as any,
      startDateTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      endDateTime: new Date(Date.now() + 86400000 + 28800000).toISOString(),
      registrationDeadline: new Date(Date.now() + 43200000).toISOString(),
      capacity: 500,
      currentAttendeeCount: 342,
      isPublic: true,
      requiresApproval: false,
      coverImageUrl: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000&auto=format&fit=crop',
      eventWebsiteUrl: 'https://example.com',
      hashtag: '#TechSummit2024',
      theme: 'Innovation',
      objectives: 'Networking',
      targetAudience: 'Techies',
      successMetrics: null,
      brandingGuidelines: null,
      venueRequirements: null,
      technicalRequirements: null,
      accessibilityFeatures: null,
      emergencyPlan: null,
      backupPlan: null,
      postEventTasks: null,
      metadata: null,
      ownerId: 'me',
      venueId: 'mock-venue-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  return {
    content: mockData,
    totalElements: mockData.length,
    totalPages: 1,
    size: 20,
    number: 0,
  };
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
    // MOCK for local dev
    return {
      id: eventId,
      name: 'Tech Innovation Summit 2024',
      description: 'Join us for an exciting day of tech talks, networking, and innovation. Featuring industry leaders and cutting-edge demonstrations.',
      eventType: 'CONFERENCE' as any,
      eventStatus: 'REGISTRATION_OPEN' as any,
      startDateTime: new Date(Date.now() + 86400000).toISOString(),
      endDateTime: new Date(Date.now() + 86400000 + 28800000).toISOString(),
      registrationDeadline: new Date(Date.now() + 43200000).toISOString(),
      capacity: 500,
      currentAttendeeCount: 342,
      isPublic: true,
      requiresApproval: false,
      coverImageUrl: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000&auto=format&fit=crop',
      eventWebsiteUrl: 'https://example.com',
      hashtag: '#TechSummit2024',
      theme: 'Innovation',
      objectives: 'Networking',
      targetAudience: 'Techies',
      successMetrics: null,
      brandingGuidelines: null,
      venueRequirements: null,
      technicalRequirements: null,
      accessibilityFeatures: null,
      emergencyPlan: null,
      backupPlan: null,
      postEventTasks: null,
      metadata: null,
      ownerId: 'me',
      venueId: 'mock-venue-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scope: 'FULL',
      venue: {
        id: 'mock-venue-1',
        name: 'Mock Venue',
        address: '123 Mock St',
        city: 'Mock City',
        state: 'MC',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437
      }
    } as EventResponseWithScope;
  },

  /**
   * Get event feed (always returns FEED scope)
   * Use this endpoint when you specifically want the feed view
   */
  async getEventFeed(
    eventId: string,
    params?: EventFeedRequest,
  ): Promise<EventFeedResponse> {
    // MOCK for local dev
    return {
      eventId: eventId,
      eventName: 'Tech Innovation Summit 2024',
      description: 'Join us for an exciting day of tech talks, networking, and innovation.',
      coverImageUrl: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000&auto=format&fit=crop',
      startDateTime: new Date().toISOString(),
      endDateTime: new Date(Date.now() + 28800000).toISOString(),
      hashtag: '#TechSummit2024',
      eventWebsiteUrl: 'https://example.com',
      posts: [
        {
          id: 'mock-post-1',
          type: 'TEXT',
          content: 'Welcome to the event!',
          authorName: 'Organizer',
          postedAt: new Date().toISOString(),
          likes: 10,
          comments: 2
        }
      ],
      currentPage: 0,
      pageSize: 20,
      totalPosts: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
      scope: 'FEED'
    };
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

  async archiveEvent(eventId: string): Promise<Event> {
    try {
      const res = await http.post<Event>(
        `/api/v1/events/${eventId}/archive`,
      );
      return res.data;
    } catch (error) {
      ErrorHandler.handle(error, 'archiveEvent');
      throw error;
    }
  },

  async getEvents(params?: EventsQueryParams): Promise<PageResponse<EventResponse>> {
    const query: Record<string, unknown> = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      status: params?.status,
      isPublic: params?.isPublic,
      mine: params?.mine,
      timeframe: params?.timeframe,
      startDateFrom: params?.startDateFrom,
      startDateTo: params?.startDateTo,
      isArchived: params?.isArchived,
      search: params?.search,
      sortBy: params?.sortBy,
      sortDirection: params?.sortDirection,
      eventType: params?.eventType,
    };

    // cache only public discovery queries (safe + useful offline)
    const cachePrefix = params?.isPublic ? 'events_public_query' : undefined;
    return fetchEventsPage(query, cachePrefix);
  },

  // Convenience wrappers for consolidated discovery presets
  async getPublicEvents(params?: Omit<EventsQueryParams, 'isPublic'>) {
    return eventService.getEvents({ ...params, isPublic: true });
  },

  async getFeaturedEvents(params?: Omit<EventsQueryParams, 'isPublic' | 'status' | 'sortBy' | 'sortDirection'>) {
    return eventService.getEvents({
      ...params,
      isPublic: true,
      status: EventStatus.PUBLISHED,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    });
  },

  async getTrendingEvents(params?: Omit<EventsQueryParams, 'isPublic' | 'status' | 'sortBy' | 'sortDirection'>) {
    return eventService.getEvents({
      ...params,
      isPublic: true,
      status: EventStatus.PUBLISHED,
      sortBy: 'currentAttendeeCount',
      sortDirection: 'DESC',
    });
  },

  async getUpcomingPublicEvents(params?: Omit<EventsQueryParams, 'isPublic' | 'timeframe'>) {
    return eventService.getEvents({
      ...params,
      isPublic: true,
      timeframe: 'UPCOMING',
    });
  },

  async getEventsByType(type: EventType, params?: Omit<EventsQueryParams, 'eventType'>) {
    return eventService.getEvents({ ...params, eventType: type });
  },

  async getEventsByStatus(status: EventStatus, params?: Omit<EventsQueryParams, 'status'>) {
    return eventService.getEvents({ ...params, status });
  },

  /**
   * Consolidated "my events" list endpoint.
   * Examples:
   * - GET /api/v1/events?mine=true
   * - GET /api/v1/events?mine=true&timeframe=UPCOMING
   * - GET /api/v1/events?mine=true&timeframe=PAST
   */
  async getMyEvents(
    params?: Pick<EventsQueryParams, 'page' | 'size' | 'timeframe' | 'sortBy' | 'sortDirection'>,
  ): Promise<PageResponse<EventResponse>> {
    // MOCK for local dev
    return this.getEvents({ ...params, mine: true });
  },

  async getEventCapacity(eventId: string): Promise<EventCapacityResponse> {
    // MOCK for local dev
    return {
      eventId,
      capacity: 500,
      currentAttendeeCount: 342,
      availableSpots: 158,
      utilizationPercentage: 68.4,
      isRegistrationOpen: true
    };
  },

  async getEventStatus(eventId: string): Promise<EventStatus> {
    // MOCK for local dev
    return EventStatus.PUBLISHED;
  },

  async updateEventStatus(
    eventId: string,
    eventStatus: EventStatus,
  ): Promise<EventResponse> {
    const res = await http.put<EventResponse>(`/api/v1/events/${eventId}/status`, {
      eventStatus,
    });
    return res.data;
  },

  async publishEvent(eventId: string): Promise<Event> {
    const res = await http.post<Event>(`/api/v1/events/${eventId}/publish`);
    return res.data;
  },

  async cancelEvent(eventId: string): Promise<EventResponse> {
    const res = await http.post<EventResponse>(`/api/v1/events/${eventId}/cancel`);
    return res.data;
  },

  async completeEvent(eventId: string): Promise<EventResponse> {
    const res = await http.post<EventResponse>(`/api/v1/events/${eventId}/complete`);
    return res.data;
  },

  async updateRegistration(
    eventId: string,
    action: 'open' | 'close',
  ): Promise<EventResponse> {
    const res = await http.post<EventResponse>(
      `/api/v1/events/${eventId}/registration?action=${action}`,
    );
    return res.data;
  },

  async updateRegistrationDeadline(
    eventId: string,
    payload: EventRegistrationDeadlineRequest,
  ): Promise<EventResponse> {
    const res = await http.put<EventResponse>(
      `/api/v1/events/${eventId}/registration-deadline`,
      payload,
    );
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
  ): Promise<EventResponse> {
    const res = await http.put<EventResponse>(
      `/api/v1/events/${eventId}/visibility`,
      payload,
    );
    return res.data;
  },

  async makeEventPublic(eventId: string): Promise<EventResponse> {
    return eventService.updateEventVisibility(eventId, { isPublic: true });
  },

  async makeEventPrivate(eventId: string): Promise<EventResponse> {
    return eventService.updateEventVisibility(eventId, { isPublic: false });
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
