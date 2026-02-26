/**
 * Event Waitlist types
 *
 * For joining the waitlist when an event is at capacity.
 * This is separate from Ticket Waitlist (which is for specific ticket types).
 */

// ==================== Enums ====================

export enum EventWaitlistStatus {
    WAITING = 'WAITING',
    PROMOTED = 'PROMOTED',
    CANCELLED = 'CANCELLED',
}

// ==================== Request Types ====================

export type CreateEventWaitlistRequest = {
    email?: string | null; // Required for non-authenticated users
    name?: string | null; // Required for non-authenticated users
};

// ==================== Response Types ====================

export type EventWaitlistEntryResponse = {
    id: string; // UUID
    eventId: string; // UUID
    requesterId?: string | null; // UUID (null for non-authenticated users)
    requesterEmail?: string | null;
    requesterName?: string | null;
    status: EventWaitlistStatus;
    promotedById?: string | null; // UUID - user who promoted the entry
    promotedAt?: string | null; // ISO datetime
    cancelledAt?: string | null; // ISO datetime
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
};

// ==================== Paginated Response ====================

export type PaginatedEventWaitlistResponse = {
    content: EventWaitlistEntryResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
};

// ==================== List Request ====================

export type ListEventWaitlistRequest = {
    status?: EventWaitlistStatus | null;
    page?: number; // Default: 0
    size?: number; // Default: 20, max: 100
};
