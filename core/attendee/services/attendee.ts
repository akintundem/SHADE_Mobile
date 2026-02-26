import { http } from '../../../common/services/httpClient';
import {
    AttendeeResponse,
    BulkAttendeeCreateRequest,
    ListAttendeesRequest,
    PaginatedAttendeeResponse,
    AttendeeInviteStatus,
    CreateAttendeeInviteRequest,
    BulkAttendeeInviteRequest,
    ListAttendeeInvitesRequest,
    AttendeeInviteResponse,
    PaginatedAttendeeInviteResponse,
    UpdateRsvpStatusRequest,
    RsvpStatusResponse,
    BulkRsvpUpdateRequest,
} from '../types/attendee';
import { TicketResponse, TicketStatus } from '../../tickets/types/ticket';
import { EventResponse, PaginatedEventResponse } from '../../events/types/event';

export const attendeeService = {
    // ==================== ATTENDEE CRUD ====================

    /**
     * Add attendees
     * Add one or more attendees to an event.
     * Supports adding by userId (from directory) or email.
     * Works for both single and multiple attendees.
     * Optional notification preferences allow event owner to send email or push notifications.
     * @param request - Bulk attendee create request
     * @returns List of created attendee responses
     */
    async addAttendees(request: BulkAttendeeCreateRequest): Promise<AttendeeResponse[]> {
        const res = await http.post<AttendeeResponse[]>('/api/v1/attendees', request);
        return res.data;
    },

    /**
     * Get attendee by ID
     * Retrieve detailed information about a specific attendee.
     * Returns both user-linked attendees (with userId) and email-only guests (without userId).
     * @param attendeeId - Attendee ID
     * @returns Attendee response
     */
    async getAttendee(attendeeId: string): Promise<AttendeeResponse> {
        const res = await http.get<AttendeeResponse>(`/api/v1/attendees/${attendeeId}`);
        return res.data;
    },

    /**
     * Delete attendee
     * Remove an attendee from an event.
     * Works for both user-linked attendees (added by userId) and email-only guests (added by email).
     * @param attendeeId - Attendee ID
     */
    async deleteAttendee(attendeeId: string): Promise<void> {
        await http.delete(`/api/v1/attendees/${attendeeId}`);
    },

    /**
     * List or filter attendees
     * List and filter attendees for an event with pagination.
     * Returns a combination of both user-linked attendees (added by userId) and email-only guests (added by email).
     * Supports filtering by status, check-in status, search, userId, and email.
     * @param request - List attendees request with eventId and optional filters
     * @returns Paginated attendee responses
     */
    async listAttendees(request: ListAttendeesRequest): Promise<PaginatedAttendeeResponse> {
        const params = new URLSearchParams();

        params.append('eventId', request.eventId);
        if (request.status) params.append('status', request.status);
        if (request.checkedIn !== undefined && request.checkedIn !== null) {
            params.append('checkedIn', String(request.checkedIn));
        }
        if (request.search) params.append('search', request.search);
        if (request.userId) params.append('userId', request.userId);
        if (request.email) params.append('email', request.email);
        if (request.page !== undefined && request.page !== null) {
            params.append('page', String(request.page));
        }
        if (request.size !== undefined && request.size !== null) {
            params.append('size', String(request.size));
        }
        if (request.sortBy) params.append('sortBy', request.sortBy);
        if (request.sortDirection) params.append('sortDirection', request.sortDirection);

        const queryString = params.toString();
        const url = `/api/v1/attendees?${queryString}`;

        const res = await http.get<PaginatedAttendeeResponse>(url);
        return res.data;
    },

    // ==================== INVITE MANAGEMENT ====================

    /**
     * Update attendee invite RSVP status
     * Update attendee invite RSVP status by inviteId or token.
     * Status can be any valid AttendeeInviteStatus (ACCEPTED, DECLINED, REVOKED, EXPIRED).
     * Works for both user-linked attendees and email-only guests.
     * @param options - Either inviteId or token must be provided
     * @param status - The new invite status
     * @returns Attendee response if status is ACCEPTED, undefined otherwise
     */
    async updateInviteStatus(
        options: { inviteId?: string; token?: string },
        status: AttendeeInviteStatus
    ): Promise<AttendeeResponse | undefined> {
        const params = new URLSearchParams();

        if (options.inviteId) params.append('inviteId', options.inviteId);
        if (options.token) params.append('token', options.token);
        params.append('status', status);

        const queryString = params.toString();
        const url = `/api/v1/attendees/invites?${queryString}`;

        const res = await http.post<AttendeeResponse | undefined>(url);
        return res.data;
    },

    // ==================== ATTENDEE TICKETS ====================

    /**
     * Get tickets for attendee
     * Get all tickets issued to a specific attendee.
     * Optionally filter by event and status.
     * @param attendeeId - Attendee ID
     * @param options - Optional filters
     * @returns List of ticket responses
     */
    async getTicketsByAttendee(
        attendeeId: string,
        options?: {
            eventId?: string;
            status?: TicketStatus;
        }
    ): Promise<TicketResponse[]> {
        const params = new URLSearchParams();

        if (options?.eventId) params.append('eventId', options.eventId);
        if (options?.status) params.append('status', options.status);

        const queryString = params.toString();
        const url = `/api/v1/attendees/${attendeeId}/tickets${queryString ? `?${queryString}` : ''}`;

        const res = await http.get<TicketResponse[]>(url);
        return res.data;
    },

    // ==================== INVITES ====================

    /**
     * Create attendee invite
     * Invite a user (by userId/email) to attend an event.
     * @param eventId - Event ID
     * @param request - Invite request
     * @returns Created invite response
     */
    async createInvite(
        eventId: string,
        request: CreateAttendeeInviteRequest
    ): Promise<AttendeeInviteResponse> {
        const res = await http.post<AttendeeInviteResponse>(
            `/api/v1/attendees/events/${eventId}/invites`,
            request
        );
        return res.data;
    },

    /**
     * Bulk create attendee invites
     * @param eventId - Event ID
     * @param request - Bulk invite request
     * @returns List of invite responses
     */
    async createInvitesBulk(
        eventId: string,
        request: BulkAttendeeInviteRequest
    ): Promise<AttendeeInviteResponse[]> {
        const res = await http.post<AttendeeInviteResponse[]>(
            `/api/v1/attendees/events/${eventId}/invites/bulk`,
            request
        );
        return res.data;
    },

    /**
     * List attendee invites for an event
     * @param eventId - Event ID
     * @param request - Optional filters and pagination
     * @returns Paginated invite response
     */
    async listInvites(
        eventId: string,
        request?: ListAttendeeInvitesRequest
    ): Promise<PaginatedAttendeeInviteResponse> {
        const params = new URLSearchParams();
        if (request?.status) params.append('status', request.status);
        if (request?.page !== undefined && request?.page !== null) {
            params.append('page', String(request.page));
        }
        if (request?.size !== undefined && request?.size !== null) {
            params.append('size', String(request.size));
        }

        const queryString = params.toString();
        const url = queryString
            ? `/api/v1/attendees/events/${eventId}/invites?${queryString}`
            : `/api/v1/attendees/events/${eventId}/invites`;

        const res = await http.get<PaginatedAttendeeInviteResponse>(url);
        return res.data;
    },

    /**
     * Get attendee invite by ID
     * @param eventId - Event ID
     * @param inviteId - Invite ID
     * @returns Invite response
     */
    async getInvite(eventId: string, inviteId: string): Promise<AttendeeInviteResponse> {
        const res = await http.get<AttendeeInviteResponse>(
            `/api/v1/attendees/events/${eventId}/invites/${inviteId}`
        );
        return res.data;
    },

    /**
     * Revoke attendee invite
     * @param eventId - Event ID
     * @param inviteId - Invite ID
     */
    async revokeInvite(eventId: string, inviteId: string): Promise<void> {
        await http.delete(`/api/v1/attendees/events/${eventId}/invites/${inviteId}`);
    },

    /**
     * Resend attendee invite
     * @param eventId - Event ID
     * @param inviteId - Invite ID
     * @param options - Notification options
     * @returns Updated invite response
     */
    async resendInvite(
        eventId: string,
        inviteId: string,
        options?: { sendEmail?: boolean; sendPush?: boolean }
    ): Promise<AttendeeInviteResponse> {
        const params = new URLSearchParams();
        if (options?.sendEmail !== undefined) {
            params.append('sendEmail', String(options.sendEmail));
        }
        if (options?.sendPush !== undefined) {
            params.append('sendPush', String(options.sendPush));
        }

        const queryString = params.toString();
        const url = queryString
            ? `/api/v1/attendees/events/${eventId}/invites/${inviteId}/resend?${queryString}`
            : `/api/v1/attendees/events/${eventId}/invites/${inviteId}/resend`;

        const res = await http.post<AttendeeInviteResponse>(url);
        return res.data;
    },

    // ==================== RSVP ====================

    /**
     * Get events where the current user has been invited as an attendee.
     * @param request - Optional pagination/filter request
     * @returns Paginated event response
     */
    async getInvitedEvents(request?: {
        page?: number;
        size?: number;
    }): Promise<PaginatedEventResponse> {
        const params = new URLSearchParams();
        if (request?.page !== undefined) params.append('page', String(request.page));
        if (request?.size !== undefined) params.append('size', String(request.size));

        const queryString = params.toString();
        const url = queryString
            ? `/api/v1/attendees/invitations?${queryString}`
            : '/api/v1/attendees/invitations';

        const res = await http.get<PaginatedEventResponse>(url);
        return res.data;
    },

    /**
     * RSVP to an event
     * @param eventId - Event ID
     * @returns Updated event response
     */
    async rsvpToEvent(eventId: string): Promise<EventResponse> {
        const res = await http.post<EventResponse>(
            `/api/v1/attendees/events/${eventId}/rsvp`
        );
        return res.data;
    },

    /**
     * Get current RSVP status for an event
     * @param eventId - Event ID
     * @returns RSVP status response
     */
    async getRsvpStatus(eventId: string): Promise<RsvpStatusResponse> {
        const res = await http.get<RsvpStatusResponse>(
            `/api/v1/attendees/events/${eventId}/rsvp`
        );
        return res.data;
    },

    /**
     * Update RSVP status for an event
     * @param eventId - Event ID
     * @param request - RSVP status update request
     * @returns RSVP status response
     */
    async updateRsvpStatus(
        eventId: string,
        request: UpdateRsvpStatusRequest
    ): Promise<RsvpStatusResponse> {
        const res = await http.put<RsvpStatusResponse>(
            `/api/v1/attendees/events/${eventId}/rsvp`,
            request
        );
        return res.data;
    },

    /**
     * Cancel RSVP for an event
     * @param eventId - Event ID
     * @returns RSVP status response
     */
    async cancelRsvp(eventId: string): Promise<RsvpStatusResponse> {
        const res = await http.delete<RsvpStatusResponse>(
            `/api/v1/attendees/events/${eventId}/rsvp`
        );
        return res.data;
    },

    /**
     * Bulk update RSVP statuses for an event
     * @param eventId - Event ID
     * @param request - Bulk RSVP update request
     * @returns List of RSVP status responses
     */
    async bulkUpdateRsvpStatus(
        eventId: string,
        request: BulkRsvpUpdateRequest
    ): Promise<RsvpStatusResponse[]> {
        const res = await http.post<RsvpStatusResponse[]>(
            `/api/v1/attendees/events/${eventId}/rsvp/bulk`,
            request
        );
        return res.data;
    },
};
