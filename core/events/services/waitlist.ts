import { http } from '../../../common/services/httpClient';
import {
    CreateEventWaitlistRequest,
    EventWaitlistEntryResponse,
    PaginatedEventWaitlistResponse,
    ListEventWaitlistRequest,
} from '../types/waitlist';

export const eventWaitlistService = {
    /**
     * Join event waitlist
     * Add yourself to the waitlist for an event that is at capacity.
     * @param eventId - Event ID
     * @param request - Optional waitlist request with email/name for non-authenticated users
     * @returns Created waitlist entry response
     */
    async joinWaitlist(
        eventId: string,
        request?: CreateEventWaitlistRequest
    ): Promise<EventWaitlistEntryResponse> {
        const res = await http.post<EventWaitlistEntryResponse>(
            `/api/v1/events/${eventId}/waitlist`,
            request || {}
        );
        return res.data;
    },

    /**
     * List waitlist entries for an event
     * Get all waitlist entries for an event (paginated).
     * Requires event management permissions.
     * @param eventId - Event ID
     * @param request - Optional filters and pagination
     * @returns Paginated waitlist entries
     */
    async listWaitlist(
        eventId: string,
        request?: ListEventWaitlistRequest
    ): Promise<PaginatedEventWaitlistResponse> {
        const params = new URLSearchParams();

        if (request?.status) {
            params.append('status', request.status);
        }
        if (request?.page !== undefined && request?.page !== null) {
            params.append('page', String(request.page));
        }
        if (request?.size !== undefined && request?.size !== null) {
            params.append('size', String(request.size));
        }

        const queryString = params.toString();
        const url = queryString
            ? `/api/v1/events/${eventId}/waitlist?${queryString}`
            : `/api/v1/events/${eventId}/waitlist`;

        const res = await http.get<PaginatedEventWaitlistResponse>(url);
        return res.data;
    },

    /**
     * Get current user's waitlist entries for an event
     * @param eventId - Event ID
     * @returns List of user's waitlist entries for this event
     */
    async getMyWaitlistEntries(eventId: string): Promise<EventWaitlistEntryResponse[]> {
        const res = await http.get<EventWaitlistEntryResponse[]>(
            `/api/v1/events/${eventId}/waitlist/my-entries`
        );
        return res.data;
    },

    /**
     * Cancel a waitlist entry
     * Remove yourself or another user from the event waitlist.
     * @param eventId - Event ID
     * @param entryId - Waitlist entry ID
     */
    async cancelWaitlistEntry(eventId: string, entryId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/waitlist/${entryId}`);
    },
};
