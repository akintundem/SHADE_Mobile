import { http } from '../../../common/services/httpClient';
import {
    EventResponse,
    EventListRequest,
    CreateEventWithCoverUploadRequest,
    CreateEventWithCoverUploadResponse,
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
        return res.data as EventCapacityResponse;
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
     * Create a new event with cover image upload
     * @param request - Create event request with cover upload metadata
     * @param idempotencyKey - Optional idempotency key to prevent duplicate creation
     * @returns Created event with presigned cover upload URL
     */
    async createEvent(
        request: CreateEventWithCoverUploadRequest,
        idempotencyKey?: string
    ): Promise<CreateEventWithCoverUploadResponse> {
        const headers: Record<string, string> = {};
        if (idempotencyKey) {
            headers['Idempotency-Key'] = idempotencyKey;
        }

        const res = await http.post<CreateEventWithCoverUploadResponse>(
            '/api/v1/events',
            request,
            { headers }
        );
        return res.data;
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
        request: any // EventMediaRequest type - would need to be added to types
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
};