/**
 * Attendee related types
 */

import { VisibilityLevel } from '../../auth/types/auth';

// ==================== Enums ====================

export enum AttendeeStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    DECLINED = 'DECLINED',
    TENTATIVE = 'TENTATIVE',
    NO_SHOW = 'NO_SHOW',
}

export enum AttendeeInviteStatus {
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    REVOKED = 'REVOKED',
    EXPIRED = 'EXPIRED',
}

// ==================== Attendee Response Types ====================

/**
 * Sanitized attendee response.
 * Attendees can be either:
 * - User-linked: Added by userId, has both userId and email (from user account)
 * - Email-only guest: Added by email only, has email but userId is null
 */
export type AttendeeResponse = {
    id: string; // UUID
    eventId: string; // UUID
    userId?: string | null; // UUID - User account ID if linked to platform user (null for email-only guests)
    name: string;
    email?: string | null; // Present for both user-linked attendees and email-only guests
    participationVisibility?: VisibilityLevel | null;

    // Status information
    rsvpStatus?: AttendeeStatus | null;
    checkedInAt?: string | null; // ISO datetime

    // Computed field
    isCheckedIn?: boolean | null; // Computed from checkedInAt

    // Metadata
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
};

// ==================== Attendee Request Types ====================

/**
 * Individual attendee information for bulk operations.
 * Supports adding attendees by userId (from directory) or email.
 */
export type AttendeeInfo = {
    userId?: string | null; // UUID - If provided, name/email will be auto-filled from user account
    email?: string | null; // Required if userId is not provided
    name?: string | null; // Required if userId is not provided, otherwise auto-filled
    participationVisibility?: VisibilityLevel | null;
};

/**
 * Bulk attendee creation request.
 * More efficient than repeating eventId for each attendee.
 */
export type BulkAttendeeCreateRequest = {
    eventId: string; // UUID, required
    attendees: AttendeeInfo[]; // Required, min: 1, max: 100 attendees
    sendEmail?: boolean | null; // Send email notification to attendees
    sendPushNotification?: boolean | null; // Send push notification (requires user account)
};

/**
 * Request for listing and filtering attendees.
 */
export type ListAttendeesRequest = {
    eventId: string; // UUID, required
    status?: string | null; // Filter by RSVP status (comma-separated): PENDING,CONFIRMED,DECLINED,TENTATIVE,NO_SHOW
    checkedIn?: boolean | null; // Filter by check-in status
    search?: string | null; // Search by name or email
    userId?: string | null; // UUID - Filter by user ID (from directory)
    email?: string | null; // Filter by email
    page?: number | null; // Page number (0-indexed), default: 0
    size?: number | null; // Page size, default: 20
    sortBy?: string | null; // Sort field: name, email, rsvpStatus, checkedInAt, createdAt (default: name)
    sortDirection?: string | null; // Sort direction: ASC or DESC (default: ASC)
};

// ==================== Paginated Response Types ====================

export type PaginatedAttendeeResponse = {
    content: AttendeeResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
};

// ==================== Attendee Invite Types ====================

export type CreateAttendeeInviteRequest = {
    inviteeUserId?: string | null; // UUID - invite existing user
    inviteeEmail?: string | null; // Email - invite by email
    message?: string | null;
    sendEmail?: boolean | null;
    sendPush?: boolean | null;
};

export type BulkAttendeeInviteRequest = {
    invites: CreateAttendeeInviteRequest[];
};

export type ListAttendeeInvitesRequest = {
    status?: AttendeeInviteStatus | null;
    page?: number | null;
    size?: number | null;
};

export type AttendeeInviteResponse = {
    inviteId: string; // UUID
    eventId?: string | null; // UUID
    inviterUserId?: string | null; // UUID
    inviteeUserId?: string | null; // UUID
    inviteeEmail?: string | null;
    status: AttendeeInviteStatus;
    expiresAt?: string | null; // ISO datetime
    respondedAt?: string | null; // ISO datetime
    message?: string | null;
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
};

export type PaginatedAttendeeInviteResponse = {
    content: AttendeeInviteResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
};

// ==================== RSVP Types ====================

export type UpdateRsvpStatusRequest = {
    status: AttendeeStatus;
};

export type RsvpStatusResponse = {
    eventId?: string | null; // UUID
    attendeeId?: string | null; // UUID
    status?: AttendeeStatus | null;
    updatedAt?: string | null; // ISO datetime
};

export type BulkRsvpUpdateItem = {
    attendeeId: string; // UUID
    status: AttendeeStatus;
};

export type BulkRsvpUpdateRequest = {
    updates: BulkRsvpUpdateItem[];
    note?: string | null;
};
