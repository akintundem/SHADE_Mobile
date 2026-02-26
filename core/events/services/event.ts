import { http } from '../../../common/services/httpClient';
import {
    EventResponse,
    EventListRequest,
    CreateEventRequest,
    CloneEventRequest,
    UpdateEventWithCoverUploadRequest,
    UpdateEventWithCoverUploadResponse,
    EventFeedRequest,
    EventFeedResponse,
    EventCapacityResponse,
    EventVisibilityResponse,
    PaginatedEventResponse,
    EventMediaUploadRequest,
    EventMediaUploadCompleteRequest,
    EventPresignedUploadResponse,
    EventMediaResponse,
    EventCoverImageResponse,
    EventCoverImageCompleteRequest,
    EventMediaRequest,
    EventReminderRequest,
    EventReminderResponse,
} from '../types/event';

/**
 * Builds query parameters from an EventListRequest object
 * @param request - Optional event list request with filters and pagination
 * @param queryParams - Optional existing URLSearchParams to append to (creates new one if not provided)
 * @returns URLSearchParams with all request parameters appended
 */
function buildEventListQueryParams(request?: EventListRequest, queryParams: URLSearchParams = new URLSearchParams()): URLSearchParams {
    if (!request) {
        return queryParams;
    }

    if (request.page !== undefined) {
        queryParams.append('page', request.page.toString());
    }
    if (request.size !== undefined) {
        queryParams.append('size', request.size.toString());
    }
    if (request.status) {
        queryParams.append('status', request.status);
    }
    if (request.eventType) {
        queryParams.append('eventType', request.eventType);
    }
    if (request.isPublic !== undefined && request.isPublic !== null) {
        queryParams.append('isPublic', request.isPublic.toString());
    }
    if (request.startDateFrom) {
        queryParams.append('startDateFrom', request.startDateFrom);
    }
    if (request.startDateTo) {
        queryParams.append('startDateTo', request.startDateTo);
    }
    if (request.isArchived !== undefined && request.isArchived !== null) {
        queryParams.append('isArchived', request.isArchived.toString());
    }
    if (request.mine !== undefined && request.mine !== null) {
        queryParams.append('mine', request.mine.toString());
    }
    if (request.timeframe) {
        queryParams.append('timeframe', request.timeframe);
    }
    if (request.search) {
        queryParams.append('search', request.search);
    }
    if (request.sortBy) {
        queryParams.append('sortBy', request.sortBy);
    }
    if (request.sortDirection) {
        queryParams.append('sortDirection', request.sortDirection);
    }

    return queryParams;
}

export const eventService = {
    /**
     * List events with pagination, filtering, and search
     * @param request - List request with filters and pagination
     * @returns Paginated list of events
     */
    async listEvents(request?: EventListRequest): Promise<PaginatedEventResponse> {
        const queryParams = buildEventListQueryParams(request);
        const queryString = queryParams.toString();
        const url = queryString ? `/api/v1/events?${queryString}` : '/api/v1/events';

        const res = await http.get<PaginatedEventResponse>(url);
        return res.data;
    },

    /**
     * List events owned by the current user
     * @param request - List request with filters and pagination
     * @returns Paginated list of user's events
     */
    async listMyEvents(request?: EventListRequest): Promise<PaginatedEventResponse> {
        const queryParams = new URLSearchParams();
        queryParams.append('mine', 'true');
        buildEventListQueryParams(request, queryParams);

        const res = await http.get<PaginatedEventResponse>(`/api/v1/events?${queryParams.toString()}`);
        return res.data;
    },

    /**
     * Get event by ID with optional view projection
     * @param eventId - Event ID
     * @param view - Optional view projection: 'capacity', 'visibility', 'full', 'feed'
     * @param feedRequest - Optional feed pagination request (for feed view)
     * @returns Event response, capacity response, visibility response, or feed response
     */
    async getEvent(
        eventId: string,
        view?: 'capacity' | 'visibility' | 'full' | 'feed',
        feedRequest?: EventFeedRequest
    ): Promise<EventResponse | EventCapacityResponse | EventVisibilityResponse | EventFeedResponse> {
        const queryParams = new URLSearchParams();

        if (view) {
            queryParams.append('view', view);
        }

        if (feedRequest && (view === 'feed' || !view)) {
            if (feedRequest.page !== undefined) {
                queryParams.append('page', feedRequest.page.toString());
            }
            if (feedRequest.size !== undefined) {
                queryParams.append('size', feedRequest.size.toString());
            }
            if (feedRequest.postType) {
                queryParams.append('postType', feedRequest.postType);
            }
        }

        const queryString = queryParams.toString();
        const url = queryString ? `/api/v1/events/${eventId}?${queryString}` : `/api/v1/events/${eventId}`;

        const res = await http.get<EventResponse | EventCapacityResponse | EventVisibilityResponse | EventFeedResponse>(url);
        return res.data;
    },

    /**
     * Get event capacity information
     * @param eventId - Event ID
     * @returns Event capacity response
     */
    async getEventCapacity(eventId: string): Promise<EventCapacityResponse> {
        const res = await http.get<EventCapacityResponse>(`/api/v1/events/${eventId}?view=capacity`);
        const data = res.data as EventCapacityResponse;
        const capacity = typeof data.capacity === 'number' ? data.capacity : null;
        const current = typeof data.currentAttendeeCount === 'number' ? data.currentAttendeeCount : 0;

        return {
            ...data,
            availableSpots:
                data.availableSpots ??
                (capacity !== null ? Math.max(capacity - current, 0) : null),
            utilizationPercentage:
                data.utilizationPercentage ??
                (capacity && capacity > 0 ? (current / capacity) * 100 : 0),
        };
    },

    /**
     * Get event visibility information
     * @param eventId - Event ID
     * @returns Event visibility response
     */
    async getEventVisibility(eventId: string): Promise<EventVisibilityResponse> {
        const res = await http.get<EventVisibilityResponse>(`/api/v1/events/${eventId}?view=visibility`);
        return res.data as EventVisibilityResponse;
    },

    /**
     * Get event feed (social feed with posts)
     * @param eventId - Event ID
     * @param feedRequest - Optional feed pagination request
     * @returns Event feed response
     */
    async getEventFeed(eventId: string, feedRequest?: EventFeedRequest): Promise<EventFeedResponse> {
        const queryParams = new URLSearchParams();

        if (feedRequest) {
            if (feedRequest.page !== undefined) {
                queryParams.append('page', feedRequest.page.toString());
            }
            if (feedRequest.size !== undefined) {
                queryParams.append('size', feedRequest.size.toString());
            }
            if (feedRequest.postType) {
                queryParams.append('postType', feedRequest.postType);
            }
        }

        const queryString = queryParams.toString();
        const url = queryString ? `/api/v1/events/${eventId}/feed?${queryString}` : `/api/v1/events/${eventId}/feed`;

        const res = await http.get<EventFeedResponse>(url);
        return res.data;
    },

    /**
     * Create a new event
     * @param request - Create event request
     * @param idempotencyKey - Optional idempotency key to prevent duplicate creation
     * @returns Created event
     */
    async createEvent(
        request: CreateEventRequest,
        idempotencyKey?: string
    ): Promise<EventResponse> {
        const headers: Record<string, string> = {};
        if (idempotencyKey) {
            headers['Idempotency-Key'] = idempotencyKey;
        }

        // Backend expects the event data wrapped in an 'event' field
        // Backend returns CreateEventWithCoverUploadResponse { event: EventResponse, coverUpload?: ... }
        const res = await http.post<{ event: EventResponse; coverUpload?: EventPresignedUploadResponse }>(
            '/api/v1/events',
            { event: request },
            { headers }
        );
        return res.data.event;
    },

    /**
     * Update an existing event
     * @param eventId - Event ID
     * @param request - Update event request with optional cover upload
     * @param ifMatch - Optional ETag for optimistic locking
     * @returns Updated event with optional presigned cover upload URL
     */
    async updateEvent(
        eventId: string,
        request: UpdateEventWithCoverUploadRequest,
        ifMatch?: string
    ): Promise<UpdateEventWithCoverUploadResponse> {
        const headers: Record<string, string> = {};
        if (ifMatch) {
            headers['If-Match'] = ifMatch;
        }

        const res = await http.put<UpdateEventWithCoverUploadResponse>(
            `/api/v1/events/${eventId}`,
            request,
            { headers }
        );
        return res.data;
    },

    /**
     * Update event registration state (open or close)
     * @param eventId - Event ID
     * @param action - 'open' or 'close'
     * @returns Updated event response
     */
    async updateRegistrationState(eventId: string, action: 'open' | 'close'): Promise<EventResponse> {
        const res = await http.post<EventResponse>(
            `/api/v1/events/${eventId}/registration`,
            undefined,
            { params: { action } }
        );
        return res.data;
    },

    /**
     * Archive an event (soft delete)
     * @param eventId - Event ID
     * @param reason - Optional archive reason
     * @returns Archived event response
     */
    async archiveEvent(eventId: string, reason?: string): Promise<EventResponse> {
        const params = reason ? { reason } : undefined;
        const res = await http.post<EventResponse>(
            `/api/v1/events/${eventId}/archive`,
            undefined,
            { params }
        );
        return res.data;
    },

    /**
     * Restore a previously archived event
     * @param eventId - Event ID
     * @returns Restored event response
     */
    async restoreEvent(eventId: string): Promise<EventResponse> {
        const res = await http.post<EventResponse>(`/api/v1/events/${eventId}/restore`);
        return res.data;
    },

    /**
     * Clone an existing event
     * @param eventId - Event ID to clone
     * @param request - Optional clone request with customization options
     * @returns Cloned event response
     */
    async cloneEvent(eventId: string, request?: CloneEventRequest): Promise<EventResponse> {
        const res = await http.post<EventResponse>(
            `/api/v1/events/${eventId}/clone`,
            request || {}
        );
        return res.data;
    },

    // Media Management

    /**
     * Get all media associated with an event
     * @param eventId - Event ID
     * @param category - Optional media category filter
     * @param type - Optional media type filter
     * @returns List of event media
     */
    async getEventMedia(
        eventId: string,
        category?: string,
        type?: string
    ): Promise<EventMediaResponse[]> {
        const queryParams = new URLSearchParams();
        if (category) {
            queryParams.append('category', category);
        }
        if (type) {
            queryParams.append('type', type);
        }

        const queryString = queryParams.toString();
        const url = queryString ? `/api/v1/events/${eventId}/media?${queryString}` : `/api/v1/events/${eventId}/media`;

        const res = await http.get<EventMediaResponse[]>(url);
        return res.data;
    },

    /**
     * Get presigned URL for uploading event media
     * @param eventId - Event ID
     * @param request - Media upload request with file metadata
     * @returns Presigned upload response
     */
    async uploadMedia(
        eventId: string,
        request: EventMediaUploadRequest
    ): Promise<EventPresignedUploadResponse> {
        const res = await http.post<EventPresignedUploadResponse>(
            `/api/v1/events/${eventId}/media`,
            request
        );
        return res.data;
    },

    /**
     * Complete media upload after S3 upload
     * @param eventId - Event ID
     * @param mediaId - Media ID from presigned upload response
     * @param request - Upload completion request with S3 object details
     * @returns Event media response
     */
    async completeMediaUpload(
        eventId: string,
        mediaId: string,
        request: EventMediaUploadCompleteRequest
    ): Promise<EventMediaResponse> {
        const res = await http.post<EventMediaResponse>(
            `/api/v1/events/${eventId}/media/${mediaId}/complete`,
            request
        );
        return res.data;
    },

    /**
     * Get specific media details
     * @param eventId - Event ID
     * @param mediaId - Media ID
     * @returns Event media response
     */
    async getMedia(eventId: string, mediaId: string): Promise<EventMediaResponse> {
        const res = await http.get<EventMediaResponse>(`/api/v1/events/${eventId}/media/${mediaId}`);
        return res.data;
    },

    /**
     * Update media information
     * @param eventId - Event ID
     * @param mediaId - Media ID
     * @param request - Media update request
     * @returns Updated event media response
     */
    async updateMedia(
        eventId: string,
        mediaId: string,
        request: EventMediaRequest
    ): Promise<EventMediaResponse> {
        const res = await http.put<EventMediaResponse>(
            `/api/v1/events/${eventId}/media/${mediaId}`,
            request
        );
        return res.data;
    },

    /**
     * Delete media from event
     * @param eventId - Event ID
     * @param mediaId - Media ID
     */
    async deleteMedia(eventId: string, mediaId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/media/${mediaId}`);
    },

    // Assets Management

    /**
     * Get all assets associated with an event
     * @param eventId - Event ID
     * @returns List of event assets
     */
    async getEventAssets(eventId: string): Promise<EventMediaResponse[]> {
        const res = await http.get<EventMediaResponse[]>(`/api/v1/events/${eventId}/assets`);
        return res.data;
    },

    /**
     * Get presigned URL for uploading event asset
     * @param eventId - Event ID
     * @param request - Asset upload request with file metadata
     * @returns Presigned upload response
     */
    async uploadAsset(
        eventId: string,
        request: EventMediaUploadRequest
    ): Promise<EventPresignedUploadResponse> {
        const res = await http.post<EventPresignedUploadResponse>(
            `/api/v1/events/${eventId}/assets`,
            request
        );
        return res.data;
    },

    /**
     * Complete asset upload after S3 upload
     * @param eventId - Event ID
     * @param assetId - Asset ID from presigned upload response
     * @param request - Upload completion request with S3 object details
     * @returns Event media response
     */
    async completeAssetUpload(
        eventId: string,
        assetId: string,
        request: EventMediaUploadCompleteRequest
    ): Promise<EventMediaResponse> {
        const res = await http.post<EventMediaResponse>(
            `/api/v1/events/${eventId}/assets/${assetId}/complete`,
            request
        );
        return res.data;
    },

    // Cover Image Management

    /**
     * Get presigned URL for uploading/updating event cover image
     * @param eventId - Event ID
     * @param request - Cover image upload request with file metadata
     * @returns Presigned upload response
     */
    async updateCoverImage(
        eventId: string,
        request: EventMediaUploadRequest
    ): Promise<EventPresignedUploadResponse> {
        const res = await http.put<EventPresignedUploadResponse>(
            `/api/v1/events/${eventId}/cover-image`,
            request
        );
        return res.data;
    },

    /**
     * Get presigned URL for creating event cover image (POST alias)
     * @param eventId - Event ID
     * @param request - Cover image upload request with file metadata
     * @returns Presigned upload response
     */
    async createCoverImageUpload(
        eventId: string,
        request: EventMediaUploadRequest
    ): Promise<EventPresignedUploadResponse> {
        const res = await http.post<EventPresignedUploadResponse>(
            `/api/v1/events/${eventId}/cover-image`,
            request
        );
        return res.data;
    },

    /**
     * Complete cover image upload after S3 upload (with coverId in path)
     * @param eventId - Event ID
     * @param coverId - Cover ID from presigned upload response
     * @param request - Upload completion request with S3 object details
     * @returns Event cover image response
     */
    async completeCoverImageUpload(
        eventId: string,
        coverId: string,
        request: EventMediaUploadCompleteRequest
    ): Promise<EventCoverImageResponse> {
        const res = await http.post<EventCoverImageResponse>(
            `/api/v1/events/${eventId}/cover-image/${coverId}/complete`,
            request
        );
        return res.data;
    },

    /**
     * Complete cover image upload after S3 upload (with coverId in body)
     * @param eventId - Event ID
     * @param request - Cover image complete request with coverId and upload details
     * @returns Event cover image response
     */
    async completeCoverImageUploadBody(
        eventId: string,
        request: EventCoverImageCompleteRequest
    ): Promise<EventCoverImageResponse> {
        const res = await http.post<EventCoverImageResponse>(
            `/api/v1/events/${eventId}/cover-image/complete`,
            request
        );
        return res.data;
    },

    /**
     * Remove cover image from event
     * @param eventId - Event ID
     * @returns Event cover image response
     */
    async removeCoverImage(eventId: string): Promise<EventCoverImageResponse> {
        const res = await http.delete<EventCoverImageResponse>(`/api/v1/events/${eventId}/cover-image`);
        return res.data;
    },

    // ==================== EVENT REMINDERS ====================

    /**
     * Get event reminders
     * Get all reminders for an event with pagination.
     * @param eventId - Event ID
     * @param page - Page number (0-indexed), default: 0
     * @param size - Page size, default: 20
     * @returns List of event reminder responses
     */
    async getReminders(
        eventId: string,
        page?: number,
        size?: number
    ): Promise<EventReminderResponse[]> {
        const queryParams = new URLSearchParams();
        if (page !== undefined) {
            queryParams.append('page', page.toString());
        }
        if (size !== undefined) {
            queryParams.append('size', size.toString());
        }

        const queryString = queryParams.toString();
        const url = queryString
            ? `/api/v1/events/${eventId}/reminders?${queryString}`
            : `/api/v1/events/${eventId}/reminders`;

        const res = await http.get<EventReminderResponse[]>(url);
        return res.data;
    },

    /**
     * Create event reminder
     * Create a new reminder for an event.
     * @param eventId - Event ID
     * @param request - Reminder request
     * @returns Created event reminder response
     */
    async createReminder(
        eventId: string,
        request: EventReminderRequest
    ): Promise<EventReminderResponse> {
        const res = await http.post<EventReminderResponse>(
            `/api/v1/events/${eventId}/reminders`,
            request
        );
        return res.data;
    },

    /**
     * Update event reminder
     * Update an existing reminder.
     * @param eventId - Event ID
     * @param reminderId - Reminder ID
     * @param request - Reminder update request
     * @returns Updated event reminder response
     */
    async updateReminder(
        eventId: string,
        reminderId: string,
        request: EventReminderRequest
    ): Promise<EventReminderResponse> {
        const res = await http.put<EventReminderResponse>(
            `/api/v1/events/${eventId}/reminders/${reminderId}`,
            request
        );
        return res.data;
    },

    /**
     * Delete event reminder
     * Delete a reminder.
     * @param eventId - Event ID
     * @param reminderId - Reminder ID
     */
    async deleteReminder(eventId: string, reminderId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/reminders/${reminderId}`);
    },

    /**
     * Get specific reminder
     * Get details of a specific reminder.
     * @param eventId - Event ID
     * @param reminderId - Reminder ID
     * @returns Event reminder response
     */
    async getReminder(eventId: string, reminderId: string): Promise<EventReminderResponse> {
        const res = await http.get<EventReminderResponse>(
            `/api/v1/events/${eventId}/reminders/${reminderId}`
        );
        return res.data;
    },

    /**
     * Get For You feed - personalized event recommendations
     * @param request - Optional list request with pagination
     * @returns Paginated list of recommended events
     */
    async getForYouFeed(request?: EventListRequest): Promise<PaginatedEventResponse> {
        const queryParams = buildEventListQueryParams(request);
        const queryString = queryParams.toString();
        const url = queryString ? `/api/v1/events/for-you?${queryString}` : '/api/v1/events/for-you';

        const res = await http.get<PaginatedEventResponse>(url);
        return res.data;
    },

    /**
     * Get Following feed - events from users you follow
     * @param request - Optional list request with pagination
     * @returns Paginated list of events from followed users
     */
    async getFollowingFeed(request?: EventListRequest): Promise<PaginatedEventResponse> {
        const queryParams = buildEventListQueryParams(request);
        const queryString = queryParams.toString();
        const url = queryString ? `/api/v1/events/following?${queryString}` : '/api/v1/events/following';

        const res = await http.get<PaginatedEventResponse>(url);
        return res.data;
    },

};
