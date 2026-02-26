import { http } from '../../../common/services/httpClient';
import {
    TicketResponse,
    TicketValidationResponse,
    TicketWalletResponse,
    TicketTypeResponse,
    IssueTicketRequest,
    ValidateTicketRequest,
    UpdateTicketRequest,
    TransferTicketRequest,
    ResendTicketRequest,
    BulkTicketActionRequest,
    BulkTicketActionResponse,
    CreateTicketTypeRequest,
    UpdateTicketTypeRequest,
    CloneTicketTypeRequest,
    CreateTicketTypeTemplateRequest,
    UpdateTicketTypeTemplateRequest,
    ApplyTicketTypeTemplateRequest,
    TicketTypeTemplateResponse,
    PaginatedTicketResponse,
    TicketStatus,
    TicketTypeCategory,
    TicketApprovalStatus,
    TicketWaitlistStatus,
    TicketCheckoutRequest,
    TicketCheckoutResponse,
    TicketPaymentInitResponse,
    CreateTicketApprovalRequest,
    TicketApprovalDecisionRequest,
    TicketApprovalRequestResponse,
    PaginatedTicketApprovalRequestResponse,
    CreateTicketWaitlistRequest,
    TicketWaitlistFulfillRequest,
    TicketWaitlistEntryResponse,
    PaginatedTicketWaitlistEntryResponse,
} from '../types/ticket';

export const ticketService = {
    // ==================== TICKET CRUD ====================

    /**
     * Issue tickets
     * Issue tickets to one or more attendees. Accepts a list of ticket requests.
     * For free tickets, automatically sets attendee RSVP to ACCEPTED.
     * Each request can issue multiple tickets (quantity) to a single attendee/email.
     * @param requests - List of issue ticket requests
     * @returns List of issued ticket responses
     */
    async issueTickets(requests: IssueTicketRequest[]): Promise<TicketResponse[]> {
        const res = await http.post<TicketResponse[]>('/api/v1/tickets', requests);
        return res.data;
    },

    /**
     * Get tickets for event
     * Get tickets for an event with pagination and filtering.
     * Use 'ticketId' filter to get a specific ticket by ID.
     * Supports filtering by status and ticketTypeId.
     * @param eventId - Event ID
     * @param options - Optional filters and pagination
     * @returns Paginated ticket responses
     */
    async getTicketsByEvent(
        eventId: string,
        options?: {
            ticketId?: string;
            status?: TicketStatus;
            ticketTypeId?: string;
            page?: number;
            size?: number;
            sortBy?: string;
            sortDirection?: 'ASC' | 'DESC';
        }
    ): Promise<PaginatedTicketResponse> {
        const params = new URLSearchParams();

        if (options?.ticketId) params.append('ticketId', options.ticketId);
        if (options?.status) params.append('status', options.status);
        if (options?.ticketTypeId) params.append('ticketTypeId', options.ticketTypeId);
        if (options?.page !== undefined) params.append('page', String(options.page));
        if (options?.size !== undefined) params.append('size', String(options.size));
        if (options?.sortBy) params.append('sortBy', options.sortBy);
        if (options?.sortDirection) params.append('sortDirection', options.sortDirection);

        const queryString = params.toString();
        const url = `/api/v1/tickets/events/${eventId}${queryString ? `?${queryString}` : ''}`;

        const res = await http.get<PaginatedTicketResponse>(url);
        return res.data;
    },

    /**
     * Validate ticket
     * Validate a ticket via QR code scanning.
     * Updates ticket status to VALIDATED and attendee check-in status.
     * @param request - Validate ticket request with QR code data and event ID
     * @returns Ticket validation response
     */
    async validateTicket(request: ValidateTicketRequest): Promise<TicketValidationResponse> {
        const res = await http.post<TicketValidationResponse>('/api/v1/tickets/validate', request);
        return res.data;
    },

    /**
     * Cancel ticket
     * Cancel a ticket. Cannot cancel if already validated.
     * @param ticketId - Ticket ID
     * @returns Cancelled ticket response
     */
    async cancelTicket(ticketId: string): Promise<TicketResponse> {
        const res = await http.post<TicketResponse>(`/api/v1/tickets/${ticketId}/cancel`);
        return res.data;
    },

    /**
     * Refund a ticket
     * Refunds a ticket and updates inventory counts.
     * @param ticketId - Ticket ID
     * @param reason - Optional refund reason
     * @returns Refunded ticket response
     */
    async refundTicket(ticketId: string, reason?: string): Promise<TicketResponse> {
        const params = reason ? { reason } : undefined;
        const res = await http.post<TicketResponse>(
            `/api/v1/tickets/${ticketId}/refund`,
            undefined,
            { params }
        );
        return res.data;
    },

    /**
     * Update ticket holder details
     * @param ticketId - Ticket ID
     * @param request - Update ticket request
     * @returns Updated ticket response
     */
    async updateTicket(ticketId: string, request: UpdateTicketRequest): Promise<TicketResponse> {
        const res = await http.put<TicketResponse>(`/api/v1/tickets/${ticketId}`, request);
        return res.data;
    },

    /**
     * Transfer ticket ownership
     * @param ticketId - Ticket ID
     * @param request - Transfer ticket request
     * @returns Updated ticket response
     */
    async transferTicket(ticketId: string, request: TransferTicketRequest): Promise<TicketResponse> {
        const res = await http.post<TicketResponse>(
            `/api/v1/tickets/${ticketId}/transfer`,
            request
        );
        return res.data;
    },

    /**
     * Resend ticket notifications
     * @param ticketId - Ticket ID
     * @param request - Resend options
     * @returns Ticket response
     */
    async resendTicket(ticketId: string, request?: ResendTicketRequest): Promise<TicketResponse> {
        const res = await http.post<TicketResponse>(
            `/api/v1/tickets/${ticketId}/resend`,
            request || {}
        );
        return res.data;
    },

    /**
     * Perform bulk ticket actions
     * @param request - Bulk action request
     * @returns Bulk action response
     */
    async bulkAction(request: BulkTicketActionRequest): Promise<BulkTicketActionResponse> {
        const res = await http.post<BulkTicketActionResponse>('/api/v1/tickets/bulk', request);
        return res.data;
    },

    /**
     * Get wallet pass data
     * Get wallet-ready data for adding the ticket to Apple or Google Wallet.
     * @param ticketId - Ticket ID
     * @returns Ticket wallet response
     */
    async getWalletPass(ticketId: string): Promise<TicketWalletResponse> {
        const res = await http.get<TicketWalletResponse>(`/api/v1/tickets/${ticketId}/wallet-pass`);
        return res.data;
    },

    // ==================== TICKET TYPE CRUD ====================

    /**
     * Create ticket type
     * Create a new ticket type for an event.
     * @param eventId - Event ID
     * @param request - Create ticket type request
     * @returns Created ticket type response
     */
    async createTicketType(
        eventId: string,
        request: CreateTicketTypeRequest
    ): Promise<TicketTypeResponse> {
        // API expects eventId in path only
        const payload = { ...request };
        const res = await http.post<TicketTypeResponse>(
            `/api/v1/events/${eventId}/ticket-types`,
            payload
        );
        return res.data;
    },

    /**
     * Get ticket types for event
     * Retrieve ticket types for an event with optional filters.
     * Supports filtering by ID, category, active status, and name.
     * @param eventId - Event ID
     * @param options - Optional filters
     * @returns List of ticket type responses
     */
    async getTicketTypes(
        eventId: string,
        options?: {
            id?: string;
            category?: TicketTypeCategory;
            activeOnly?: boolean;
            name?: string;
        }
    ): Promise<TicketTypeResponse[]> {
        const params = new URLSearchParams();

        if (options?.id) params.append('id', options.id);
        if (options?.category) params.append('category', options.category);
        if (options?.activeOnly !== undefined) params.append('activeOnly', String(options.activeOnly));
        if (options?.name) params.append('name', options.name);

        const queryString = params.toString();
        const url = `/api/v1/events/${eventId}/ticket-types${queryString ? `?${queryString}` : ''}`;

        const res = await http.get<TicketTypeResponse[]>(url);
        return res.data;
    },

    /**
     * Update ticket type
     * Update an existing ticket type for an event.
     * Supports optimistic locking via If-Match header.
     * @param eventId - Event ID
     * @param ticketTypeId - Ticket type ID
     * @param request - Update ticket type request
     * @param ifMatch - Optional version number for optimistic locking
     * @returns Updated ticket type response
     */
    async updateTicketType(
        eventId: string,
        ticketTypeId: string,
        request: UpdateTicketTypeRequest,
        ifMatch?: number
    ): Promise<TicketTypeResponse> {
        const headers: Record<string, string> = {};
        if (ifMatch !== undefined) {
            headers['If-Match'] = String(ifMatch);
        }

        const payload = { ...request };

        const res = await http.put<TicketTypeResponse>(
            `/api/v1/events/${eventId}/ticket-types/${ticketTypeId}`,
            payload,
            { headers }
        );
        return res.data;
    },

    /**
     * Delete ticket type
     * Delete a ticket type from an event (soft delete).
     * @param eventId - Event ID
     * @param ticketTypeId - Ticket type ID
     */
    async deleteTicketType(eventId: string, ticketTypeId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/ticket-types/${ticketTypeId}`);
    },

    /**
     * Clone a ticket type
     * @param eventId - Event ID
     * @param ticketTypeId - Ticket type ID
     * @param request - Optional clone request
     * @returns Cloned ticket type response
     */
    async cloneTicketType(
        eventId: string,
        ticketTypeId: string,
        request?: CloneTicketTypeRequest
    ): Promise<TicketTypeResponse> {
        const res = await http.post<TicketTypeResponse>(
            `/api/v1/events/${eventId}/ticket-types/${ticketTypeId}/clone`,
            request || {}
        );
        return res.data;
    },

    /**
     * Archive a ticket type
     * @param eventId - Event ID
     * @param ticketTypeId - Ticket type ID
     * @returns Archived ticket type response
     */
    async archiveTicketType(eventId: string, ticketTypeId: string): Promise<TicketTypeResponse> {
        const res = await http.post<TicketTypeResponse>(
            `/api/v1/events/${eventId}/ticket-types/${ticketTypeId}/archive`
        );
        return res.data;
    },

    /**
     * Restore a ticket type
     * @param eventId - Event ID
     * @param ticketTypeId - Ticket type ID
     * @returns Restored ticket type response
     */
    async restoreTicketType(eventId: string, ticketTypeId: string): Promise<TicketTypeResponse> {
        const res = await http.post<TicketTypeResponse>(
            `/api/v1/events/${eventId}/ticket-types/${ticketTypeId}/restore`
        );
        return res.data;
    },

    /**
     * Hard delete a ticket type
     * @param eventId - Event ID
     * @param ticketTypeId - Ticket type ID
     */
    async hardDeleteTicketType(eventId: string, ticketTypeId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/ticket-types/${ticketTypeId}/hard-delete`);
    },

    // ==================== TICKET TYPE TEMPLATES ====================

    /**
     * Create a ticket type template
     * @param request - Template creation request
     * @returns Created ticket type template response
     */
    async createTicketTypeTemplate(
        request: CreateTicketTypeTemplateRequest
    ): Promise<TicketTypeTemplateResponse> {
        const res = await http.post<TicketTypeTemplateResponse>(
            '/api/v1/ticket-type-templates',
            request
        );
        return res.data;
    },

    /**
     * List ticket type templates for the current user
     * @returns List of ticket type templates
     */
    async listTicketTypeTemplates(): Promise<TicketTypeTemplateResponse[]> {
        const res = await http.get<TicketTypeTemplateResponse[]>(
            '/api/v1/ticket-type-templates'
        );
        return res.data;
    },

    /**
     * Update a ticket type template
     * @param templateId - Template ID
     * @param request - Update request
     * @returns Updated ticket type template response
     */
    async updateTicketTypeTemplate(
        templateId: string,
        request: UpdateTicketTypeTemplateRequest
    ): Promise<TicketTypeTemplateResponse> {
        const res = await http.put<TicketTypeTemplateResponse>(
            `/api/v1/ticket-type-templates/${templateId}`,
            request
        );
        return res.data;
    },

    /**
     * Delete a ticket type template
     * @param templateId - Template ID
     */
    async deleteTicketTypeTemplate(templateId: string): Promise<void> {
        await http.delete(`/api/v1/ticket-type-templates/${templateId}`);
    },

    /**
     * Apply a ticket type template to an event
     * @param templateId - Template ID
     * @param eventId - Event ID
     * @param request - Optional apply request
     * @returns Created ticket type response
     */
    async applyTicketTypeTemplate(
        templateId: string,
        eventId: string,
        request?: ApplyTicketTypeTemplateRequest
    ): Promise<TicketTypeResponse> {
        const res = await http.post<TicketTypeResponse>(
            `/api/v1/ticket-type-templates/${templateId}/apply/events/${eventId}`,
            request || {}
        );
        return res.data;
    },

    // ==================== TICKET CHECKOUT ====================

    /**
     * Start a ticket checkout for an event.
     * @param eventId - Event ID
     * @param request - Checkout items and optional promotion code
     * @returns Checkout response with holds/reservations
     */
    async startTicketCheckout(
        eventId: string,
        request: TicketCheckoutRequest
    ): Promise<TicketCheckoutResponse> {
        const res = await http.post<TicketCheckoutResponse>(
            `/api/v1/events/${eventId}/tickets/checkout`,
            request
        );
        return res.data;
    },

    /**
     * Get an existing checkout by ID.
     * @param eventId - Event ID
     * @param checkoutId - Checkout ID
     * @returns Ticket checkout response
     */
    async getTicketCheckout(
        eventId: string,
        checkoutId: string
    ): Promise<TicketCheckoutResponse> {
        const res = await http.get<TicketCheckoutResponse>(
            `/api/v1/events/${eventId}/tickets/checkout/${checkoutId}`
        );
        return res.data;
    },

    /**
     * Start payment for an existing checkout.
     * @param eventId - Event ID
     * @param checkoutId - Checkout ID
     * @returns Payment initialization response
     */
    async startTicketPayment(
        eventId: string,
        checkoutId: string
    ): Promise<TicketPaymentInitResponse> {
        const res = await http.post<TicketPaymentInitResponse>(
            `/api/v1/events/${eventId}/tickets/checkout/${checkoutId}/start-payment`
        );
        return res.data;
    },

    /**
     * Cancel a checkout and release holds.
     * @param eventId - Event ID
     * @param checkoutId - Checkout ID
     * @returns Updated checkout response
     */
    async cancelTicketCheckout(
        eventId: string,
        checkoutId: string
    ): Promise<TicketCheckoutResponse> {
        const res = await http.post<TicketCheckoutResponse>(
            `/api/v1/events/${eventId}/tickets/checkout/${checkoutId}/cancel`
        );
        return res.data;
    },

    // ==================== TICKET APPROVAL REQUESTS ====================

    /**
     * Create ticket approval request
     * @param eventId - Event ID
     * @param request - Approval request
     * @returns Approval request response
     */
    async createApprovalRequest(
        eventId: string,
        request: CreateTicketApprovalRequest
    ): Promise<TicketApprovalRequestResponse> {
        const res = await http.post<TicketApprovalRequestResponse>(
            `/api/v1/events/${eventId}/tickets/requests`,
            request
        );
        return res.data;
    },

    /**
     * List approval requests for an event
     * @param eventId - Event ID
     * @param options - Optional filters and pagination
     * @returns Paginated approval requests
     */
    async listApprovalRequests(
        eventId: string,
        options?: {
            status?: TicketApprovalStatus;
            page?: number;
            size?: number;
            sortBy?: string;
            sortDirection?: 'ASC' | 'DESC';
        }
    ): Promise<PaginatedTicketApprovalRequestResponse> {
        const params = new URLSearchParams();
        if (options?.status) params.append('status', options.status);
        if (options?.page !== undefined) params.append('page', String(options.page));
        if (options?.size !== undefined) params.append('size', String(options.size));
        if (options?.sortBy) params.append('sortBy', options.sortBy);
        if (options?.sortDirection) params.append('sortDirection', options.sortDirection);

        const queryString = params.toString();
        const url = queryString
            ? `/api/v1/events/${eventId}/tickets/requests?${queryString}`
            : `/api/v1/events/${eventId}/tickets/requests`;

        const res = await http.get<PaginatedTicketApprovalRequestResponse>(url);
        return res.data;
    },

    /**
     * List current user's approval requests for an event
     * @param eventId - Event ID
     * @returns Approval requests
     */
    async listMyApprovalRequests(eventId: string): Promise<TicketApprovalRequestResponse[]> {
        const res = await http.get<TicketApprovalRequestResponse[]>(
            `/api/v1/events/${eventId}/tickets/requests/mine`
        );
        return res.data;
    },

    /**
     * Approve a ticket request
     * @param eventId - Event ID
     * @param requestId - Approval request ID
     * @param request - Optional decision request
     * @returns Approval request response
     */
    async approveRequest(
        eventId: string,
        requestId: string,
        request?: TicketApprovalDecisionRequest
    ): Promise<TicketApprovalRequestResponse> {
        const res = await http.post<TicketApprovalRequestResponse>(
            `/api/v1/events/${eventId}/tickets/requests/${requestId}/approve`,
            request || {}
        );
        return res.data;
    },

    /**
     * Reject a ticket request
     * @param eventId - Event ID
     * @param requestId - Approval request ID
     * @param request - Optional decision request
     * @returns Approval request response
     */
    async rejectRequest(
        eventId: string,
        requestId: string,
        request?: TicketApprovalDecisionRequest
    ): Promise<TicketApprovalRequestResponse> {
        const res = await http.post<TicketApprovalRequestResponse>(
            `/api/v1/events/${eventId}/tickets/requests/${requestId}/reject`,
            request || {}
        );
        return res.data;
    },

    /**
     * Cancel a ticket approval request
     * @param eventId - Event ID
     * @param requestId - Approval request ID
     * @returns Approval request response
     */
    async cancelApprovalRequest(
        eventId: string,
        requestId: string
    ): Promise<TicketApprovalRequestResponse> {
        const res = await http.delete<TicketApprovalRequestResponse>(
            `/api/v1/events/${eventId}/tickets/requests/${requestId}`
        );
        return res.data;
    },

    // ==================== TICKET WAITLIST ====================

    /**
     * Join ticket waitlist
     * @param eventId - Event ID
     * @param request - Waitlist request
     * @returns Waitlist entry response
     */
    async joinWaitlist(
        eventId: string,
        request: CreateTicketWaitlistRequest
    ): Promise<TicketWaitlistEntryResponse> {
        const res = await http.post<TicketWaitlistEntryResponse>(
            `/api/v1/events/${eventId}/tickets/waitlist`,
            request
        );
        return res.data;
    },

    /**
     * List waitlist entries for an event
     * @param eventId - Event ID
     * @param options - Optional filters and pagination
     * @returns Paginated waitlist entries
     */
    async listWaitlist(
        eventId: string,
        options?: {
            status?: TicketWaitlistStatus;
            page?: number;
            size?: number;
            sortBy?: string;
            sortDirection?: 'ASC' | 'DESC';
        }
    ): Promise<PaginatedTicketWaitlistEntryResponse> {
        const params = new URLSearchParams();
        if (options?.status) params.append('status', options.status);
        if (options?.page !== undefined) params.append('page', String(options.page));
        if (options?.size !== undefined) params.append('size', String(options.size));
        if (options?.sortBy) params.append('sortBy', options.sortBy);
        if (options?.sortDirection) params.append('sortDirection', options.sortDirection);

        const queryString = params.toString();
        const url = queryString
            ? `/api/v1/events/${eventId}/tickets/waitlist?${queryString}`
            : `/api/v1/events/${eventId}/tickets/waitlist`;

        const res = await http.get<PaginatedTicketWaitlistEntryResponse>(url);
        return res.data;
    },

    /**
     * List current user's waitlist entries for an event
     * @param eventId - Event ID
     * @returns Waitlist entry responses
     */
    async listMyWaitlist(eventId: string): Promise<TicketWaitlistEntryResponse[]> {
        const res = await http.get<TicketWaitlistEntryResponse[]>(
            `/api/v1/events/${eventId}/tickets/waitlist/mine`
        );
        return res.data;
    },

    /**
     * Fulfill a waitlist entry
     * @param eventId - Event ID
     * @param entryId - Waitlist entry ID
     * @param request - Fulfill request
     * @returns Waitlist entry response
     */
    async fulfillWaitlistEntry(
        eventId: string,
        entryId: string,
        request?: TicketWaitlistFulfillRequest
    ): Promise<TicketWaitlistEntryResponse> {
        const res = await http.post<TicketWaitlistEntryResponse>(
            `/api/v1/events/${eventId}/tickets/waitlist/${entryId}/fulfill`,
            request || {}
        );
        return res.data;
    },

    /**
     * Cancel a waitlist entry
     * @param eventId - Event ID
     * @param entryId - Waitlist entry ID
     * @returns Waitlist entry response
     */
    async cancelWaitlistEntry(eventId: string, entryId: string): Promise<TicketWaitlistEntryResponse> {
        const res = await http.delete<TicketWaitlistEntryResponse>(
            `/api/v1/events/${eventId}/tickets/waitlist/${entryId}`
        );
        return res.data;
    },
};
