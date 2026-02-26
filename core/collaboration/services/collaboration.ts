import { http } from '../../../common/services/httpClient';
import {
    EventCollaboratorResponse,
    CollaboratorInviteResponse,
    EventCollaboratorRequest,
    CreateCollaboratorInviteRequest,
    RespondToCollaboratorInviteRequest,
    CollaboratorListRequest,
    PaginatedCollaboratorInviteResponse
} from '../types/collaboration.ts';

/**
 * Builds query parameters from a CollaboratorListRequest object
 * @param request - Optional collaborator list request with pagination
 * @param queryParams - Optional existing URLSearchParams to append to (creates new one if not provided)
 * @returns URLSearchParams with all request parameters appended
 */
function buildCollaboratorListQueryParams(
    request?: CollaboratorListRequest,
    queryParams: URLSearchParams = new URLSearchParams()
): URLSearchParams {
    if (!request) {
        return queryParams;
    }

    if (request.page !== undefined) {
        queryParams.append('page', request.page.toString());
    }
    if (request.size !== undefined) {
        queryParams.append('size', request.size.toString());
    }

    return queryParams;
}

export const collaborationService = {
    // ==================== COLLABORATOR MANAGEMENT ====================

    /**
     * Get event collaborators
     * Gets list of event collaborators with pagination.
     * @param eventId - Event ID
     * @param request - Optional pagination request
     * @returns List of event collaborator responses
     */
    async getCollaborators(
        eventId: string,
        request?: CollaboratorListRequest
    ): Promise<EventCollaboratorResponse[]> {
        const queryParams = buildCollaboratorListQueryParams(request);
        const queryString = queryParams.toString();
        const url = queryString
            ? `/api/v1/events/${eventId}/collaborators?${queryString}`
            : `/api/v1/events/${eventId}/collaborators`;

        const res = await http.get<EventCollaboratorResponse[]>(url);
        return res.data;
    },

    /**
     * Add event collaborator
     * Adds a new collaborator to an event.
     * @param eventId - Event ID
     * @param request - Collaborator request with userId and role
     * @returns Created event collaborator response
     */
    async addCollaborator(
        eventId: string,
        request: EventCollaboratorRequest
    ): Promise<EventCollaboratorResponse> {
        const res = await http.post<EventCollaboratorResponse>(
            `/api/v1/events/${eventId}/collaborators`,
            request
        );
        return res.data;
    },

    /**
     * Update event collaborator
     * Updates collaborator information (role, permissions).
     * @param eventId - Event ID
     * @param collaboratorId - Collaborator ID
     * @param request - Collaborator request with updated information
     * @returns Updated event collaborator response
     */
    async updateCollaborator(
        eventId: string,
        collaboratorId: string,
        request: EventCollaboratorRequest
    ): Promise<EventCollaboratorResponse> {
        const res = await http.put<EventCollaboratorResponse>(
            `/api/v1/events/${eventId}/collaborators/${collaboratorId}`,
            request
        );
        return res.data;
    },

    /**
     * Remove event collaborator
     * Removes a collaborator from an event.
     * @param eventId - Event ID
     * @param collaboratorId - Collaborator ID
     */
    async removeCollaborator(eventId: string, collaboratorId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/collaborators/${collaboratorId}`);
    },

    // ==================== COLLABORATOR INVITE MANAGEMENT ====================

    /**
     * Create collaborator invite
     * Invites a user (by userId/email) to collaborate on an event.
     * @param eventId - Event ID
     * @param request - Create collaborator invite request
     * @returns Created collaborator invite response
     */
    async createInvite(
        eventId: string,
        request: CreateCollaboratorInviteRequest
    ): Promise<CollaboratorInviteResponse> {
        const res = await http.post<CollaboratorInviteResponse>(
            `/api/v1/events/${eventId}/collaborator-invites`,
            request
        );
        return res.data;
    },

    /**
     * List event collaborator invites
     * Lists pending/previous collaborator invites for an event (owner/admin only).
     * @param eventId - Event ID
     * @param request - Optional pagination request
     * @returns Paginated list of collaborator invite responses
     */
    async listEventInvites(
        eventId: string,
        request?: CollaboratorListRequest
    ): Promise<PaginatedCollaboratorInviteResponse> {
        const queryParams = buildCollaboratorListQueryParams(request);
        const queryString = queryParams.toString();
        const url = queryString
            ? `/api/v1/events/${eventId}/collaborator-invites?${queryString}`
            : `/api/v1/events/${eventId}/collaborator-invites`;

        const res = await http.get<PaginatedCollaboratorInviteResponse>(url);
        return res.data;
    },

    /**
     * Revoke collaborator invite
     * Revokes a pending collaborator invite.
     * @param eventId - Event ID
     * @param inviteId - Invite ID
     */
    async revokeInvite(eventId: string, inviteId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/collaborator-invites/${inviteId}`);
    },

    /**
     * List my collaborator invites
     * Lists pending collaborator invites for the authenticated user.
     * @returns List of collaborator invite responses
     */
    async listMyInvites(): Promise<CollaboratorInviteResponse[]> {
        const res = await http.get<CollaboratorInviteResponse[]>(
            '/api/v1/collaborator-invites/incoming'
        );
        return res.data;
    },

    /**
     * Accept collaborator invite
     * Accepts a collaborator invite (in-app).
     * @param inviteId - Invite ID
     * @param request - Optional response request with note
     * @returns Event collaborator response after acceptance
     */
    async acceptInvite(
        inviteId: string,
        request?: RespondToCollaboratorInviteRequest
    ): Promise<EventCollaboratorResponse> {
        const res = await http.post<EventCollaboratorResponse>(
            `/api/v1/collaborator-invites/${inviteId}/accept`,
            request || {}
        );
        return res.data;
    },

    /**
     * Accept collaborator invite by token
     * Accepts a collaborator invite using an email token (requires authentication).
     * @param token - Invite token from email
     * @returns Event collaborator response after acceptance
     */
    async acceptInviteByToken(token: string): Promise<EventCollaboratorResponse> {
        const params = new URLSearchParams();
        params.append('token', token);
        const url = `/api/v1/collaborator-invites/accept?${params.toString()}`;
        const res = await http.post<EventCollaboratorResponse>(url);
        return res.data;
    },

    /**
     * Decline collaborator invite
     * Declines a collaborator invite.
     * @param inviteId - Invite ID
     * @param request - Optional response request with note
     */
    async declineInvite(
        inviteId: string,
        request?: RespondToCollaboratorInviteRequest
    ): Promise<void> {
        await http.post(`/api/v1/collaborator-invites/${inviteId}/decline`, request || {});
    },
};

