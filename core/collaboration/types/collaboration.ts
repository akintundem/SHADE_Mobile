/**
 * Collaboration related types
 */

// Base Enums
export enum EventUserType {
    ORGANIZER = 'ORGANIZER',
    COORDINATOR = 'COORDINATOR',
    ATTENDEE = 'ATTENDEE',
    VOLUNTEER = 'VOLUNTEER',
    SPEAKER = 'SPEAKER',
    SPONSOR = 'SPONSOR',
    MEDIA = 'MEDIA',
    STAFF = 'STAFF',
    COLLABORATOR = 'COLLABORATOR',
    ADMIN = 'ADMIN',
  }
  
  export enum CollaboratorInviteStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    REVOKED = 'REVOKED',
    EXPIRED = 'EXPIRED',
  }
  
  export enum RegistrationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    WAITLISTED = 'WAITLISTED',
    REJECTED = 'REJECTED',
    TRANSFERRED = 'TRANSFERRED',
  }

  export enum EventPermission {
    VIEW_EVENT = 'VIEW_EVENT',
    EDIT_EVENT_DETAILS = 'EDIT_EVENT_DETAILS',
    MANAGE_COLLABORATORS = 'MANAGE_COLLABORATORS',
    MANAGE_INVITES = 'MANAGE_INVITES',
    MANAGE_SCHEDULE = 'MANAGE_SCHEDULE',
    MANAGE_BUDGET = 'MANAGE_BUDGET',
    MANAGE_TICKETS = 'MANAGE_TICKETS',
    MANAGE_CONTENT = 'MANAGE_CONTENT',
  }
  
  // Collaborator Response Types
  export type EventCollaboratorResponse = {
    collaboratorId: string; // UUID - Collaborator ID
    eventId: string; // UUID - Event ID
    userId: string; // UUID - User ID
    email?: string | null; // User email
    userName?: string | null; // User name
    role: EventUserType; // Collaborator role
    permissions?: EventPermission[] | null; // Custom permissions
    registrationStatus?: RegistrationStatus | null; // Registration status
    invitationSent?: boolean | null; // Whether invitation was sent
    invitationSentAt?: string | null; // ISO datetime - Invitation sent date
    addedAt?: string | null; // ISO datetime - Collaborator added date
    updatedAt?: string | null; // ISO datetime - Last updated date
  };
  
  // Collaborator Invite Response Types
  export type CollaboratorInviteResponse = {
    inviteId: string; // UUID - Invite ID
    eventId: string; // UUID - Event ID
    inviterUserId?: string | null; // UUID - User ID who sent the invite
    inviteeUserId?: string | null; // UUID - User ID who was invited (null if invite is by email)
    inviteeEmail?: string | null; // Email of the invitee
    role: EventUserType; // Role being granted on acceptance
    status: CollaboratorInviteStatus; // Invite status
    expiresAt?: string | null; // ISO datetime - Expiration date
    respondedAt?: string | null; // ISO datetime - Response date
    message?: string | null; // Optional invitation message
    createdAt?: string | null; // ISO datetime - Creation date
    updatedAt?: string | null; // ISO datetime - Last updated date
  };
  
  // Collaborator Request Types
  export type EventCollaboratorRequest = {
    userId: string; // Required, UUID - User ID of the collaborator
    role: EventUserType; // Required, role of the collaborator
    permissions?: EventPermission[] | null; // Custom permissions for the collaborator
    sendInvitation?: boolean | null; // Whether to send invitation email (optional, currently not used), default: false
  };
  
  // Collaborator Invite Request Types
  export type CreateCollaboratorInviteRequest = {
    inviteeUserId?: string | null; // UUID - Invitee userId (when inviting an existing user)
    inviteeEmail?: string | null; // Valid email - Invitee email (when inviting by email, including non-registered users)
    role: EventUserType; // Required, role being granted on acceptance
    message?: string | null; // Optional invitation message
    sendEmail?: boolean | null; // Send email (only meaningful if inviteeEmail is provided), default: true
    sendPush?: boolean | null; // Send push notification (only meaningful if inviteeUserId can be resolved), default: true
  };
  
  export type RespondToCollaboratorInviteRequest = {
    note?: string | null; // Optional response note (for audit/UI)
  };
  
  // Paginated Response Types
  export type PaginatedCollaboratorResponse = {
    content: EventCollaboratorResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
  };
  
  export type PaginatedCollaboratorInviteResponse = {
    content: CollaboratorInviteResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
  };
  
  // Collaborator List Request Types (for pagination)
  export type CollaboratorListRequest = {
    page?: number; // Page number (0-indexed), default: 0
    size?: number; // Page size, default: 20
  };
