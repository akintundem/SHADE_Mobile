/**
 * Event related types
 */

import { TicketTypeSummary } from '../../tickets/types/ticket';

// Base Enums
export enum EventType {
    CONFERENCE = 'CONFERENCE',
    WORKSHOP = 'WORKSHOP',
    SEMINAR = 'SEMINAR',
    MEETING = 'MEETING',
    PARTY = 'PARTY',
    WEDDING = 'WEDDING',
    BIRTHDAY = 'BIRTHDAY',
    CORPORATE_EVENT = 'CORPORATE_EVENT',
    TRADE_SHOW = 'TRADE_SHOW',
    CONCERT = 'CONCERT',
    FESTIVAL = 'FESTIVAL',
    SPORTS_EVENT = 'SPORTS_EVENT',
    CHARITY_EVENT = 'CHARITY_EVENT',
    NETWORKING = 'NETWORKING',
    TRAINING = 'TRAINING',
    RETREAT = 'RETREAT',
    OTHER = 'OTHER',
  }
  
  export enum EventStatus {
    DRAFT = 'DRAFT',
    PLANNING = 'PLANNING',
    PUBLISHED = 'PUBLISHED',
    REGISTRATION_OPEN = 'REGISTRATION_OPEN',
    REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    POSTPONED = 'POSTPONED',
  }
  
  export enum EventScope {
    FULL = 'FULL',
    FEED = 'FEED',
  }

  // Event Access Type - determines how users can access event content
  export enum EventAccessType {
    OPEN = 'OPEN',                 // Open to all (default)
    RSVP_REQUIRED = 'RSVP_REQUIRED', // Requires RSVP confirmation
    INVITE_ONLY = 'INVITE_ONLY',   // By invitation only
    TICKETED = 'TICKETED',         // Requires valid ticket
  }

  // User's access status for an event
  export enum UserAccessStatus {
    OWNER = 'OWNER',
    ORGANIZER = 'ORGANIZER',
    COORDINATOR = 'COORDINATOR',
    COLLABORATOR = 'COLLABORATOR',
    TICKET_HOLDER = 'TICKET_HOLDER',
    RSVP_CONFIRMED = 'RSVP_CONFIRMED',
    RSVP_PENDING = 'RSVP_PENDING',
    INVITE_ACCEPTED = 'INVITE_ACCEPTED',
    INVITE_PENDING = 'INVITE_PENDING',
    TICKET_PENDING = 'TICKET_PENDING',
    MEMBER = 'MEMBER',
    PUBLIC_VIEWER = 'PUBLIC_VIEWER',
    NO_ACCESS = 'NO_ACCESS',
  }

  // User context for event - provides user-specific information
  // eventRole matches EventUserType values from the backend collaborator role field
  export type UserEventContext = {
    accessStatus: UserAccessStatus;
    isOwner: boolean;
    isCollaborator: boolean;

    /** Collaborator role string from the backend (EventUserType enum value) */
    eventRole?: EventUserType | null;

    /** Backend-computed permission flags */
    canBuyTicket?: boolean | null;
    canRsvp?: boolean | null;
    canViewFeeds?: boolean | null;
    primaryAction?: string | null;

    hasRsvp?: boolean | null;
    rsvpStatus?: string | null;

    hasInvite?: boolean | null;
    inviteStatus?: string | null;

    hasValidTicket?: boolean | null;
    ticketStatus?: string | null;
    ticketId?: string | null;
    ticketTypeName?: string | null;
  };

  export enum AttendeeStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    DECLINED = 'DECLINED',
    TENTATIVE = 'TENTATIVE',
    NO_SHOW = 'NO_SHOW',
  }
  
  // Venue Types
  export type VenueDto = {
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zipCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    googlePlaceId?: string | null;
    googlePlaceData?: string | null;
  };
  
  // Event Response Types
  export type EventResponse = {
    id: string; // UUID
    name: string;
    description?: string | null;
    eventType: EventType;
    eventStatus: EventStatus;
    startDateTime?: string | null; // ISO datetime
    endDateTime?: string | null; // ISO datetime
    registrationDeadline?: string | null; // ISO datetime
    capacity?: number | null;
    currentAttendeeCount?: number | null;
    isPublic?: boolean | null;
    requiresApproval?: boolean | null;
    coverImageUrl?: string | null;
    eventWebsiteUrl?: string | null;
    hashtag?: string | null;
    theme?: string | null;
    objectives?: string | null;
    targetAudience?: string | null;
    successMetrics?: string | null;
    brandingGuidelines?: string | null;
    venueRequirements?: string | null;
    technicalRequirements?: string | null;
    accessibilityFeatures?: string | null;
    emergencyPlan?: string | null;
    backupPlan?: string | null;
    postEventTasks?: string | null;
    metadata?: string | null;
    ownerId?: string | null; // UUID
    venueId?: string | null; // UUID
    venue?: VenueDto | null;
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
    scope?: EventScope; // FULL or FEED
    feedsPublicAfterEvent?: boolean | null;
    
    // New access control fields
    accessType?: EventAccessType | null;
    userContext?: UserEventContext | null;
    ticketTypes?: TicketTypeSummary[] | null;
  };
  
  // Event Request Types
  export type CreateEventRequest = {
    name: string; // Required, max 255 characters
    description?: string | null; // Max 10000 characters
    eventType: EventType; // Required
    eventStatus?: EventStatus | null;
    startDateTime?: string | null; // ISO datetime, must be in present or future
    endDateTime?: string | null; // ISO datetime
    registrationDeadline?: string | null; // ISO datetime
    capacity?: number | null;
    currentAttendeeCount?: number | null;
    isPublic?: boolean | null; // Default: true
    requiresApproval?: boolean | null; // Default: false
    coverImageUrl?: string | null; // Do not set on create - use presigned upload flow
    eventWebsiteUrl?: string | null;
    hashtag?: string | null;
    theme?: string | null;
    objectives?: string | null;
    targetAudience?: string | null;
    successMetrics?: string | null;
    brandingGuidelines?: string | null;
    venueRequirements?: string | null;
    technicalRequirements?: string | null;
    accessibilityFeatures?: string | null;
    emergencyPlan?: string | null;
    backupPlan?: string | null;
    postEventTasks?: string | null;
    metadata?: string | null;
    venue?: VenueDto | null;
    feedsPublicAfterEvent?: boolean | null;
    accessType?: EventAccessType | null;
  };
  
  export type UpdateEventRequest = {
    name?: string | null; // Max 255 characters
    description?: string | null; // Max 10000 characters
    eventType?: EventType | null;
    eventStatus?: EventStatus | null;
    startDateTime?: string | null; // ISO datetime
    endDateTime?: string | null; // ISO datetime
    registrationDeadline?: string | null; // ISO datetime
    capacity?: number | null;
    currentAttendeeCount?: number | null;
    isPublic?: boolean | null;
    requiresApproval?: boolean | null;
    coverImageUrl?: string | null; // Do not set on update - use presigned upload flow
    eventWebsiteUrl?: string | null;
    hashtag?: string | null;
    theme?: string | null;
    objectives?: string | null;
    targetAudience?: string | null;
    successMetrics?: string | null;
    brandingGuidelines?: string | null;
    venueRequirements?: string | null;
    technicalRequirements?: string | null;
    accessibilityFeatures?: string | null;
    emergencyPlan?: string | null;
    backupPlan?: string | null;
    postEventTasks?: string | null;
    metadata?: string | null;
    ownerId?: string | null; // UUID
    venueId?: string | null; // UUID
    venueCleared?: boolean | null; // Set to true to remove venue association
    venue?: VenueDto | null;
    feedsPublicAfterEvent?: boolean | null;
    accessType?: EventAccessType | null;
  };
  
  export type CloneEventRequest = {
    name?: string | null; // Max 255 characters. If not provided, will use original name with ' (Copy)' suffix
    startDateTime?: string | null; // ISO datetime. If not provided, will use original start date/time
    endDateTime?: string | null; // ISO datetime. If not provided, will use original end date/time
    cloneTicketTypes?: boolean | null; // Whether to clone ticket types from the original event, default: false
    cloneVenue?: boolean | null; // Whether to clone venue information from the original event, default: true
    cloneMedia?: boolean | null; // Whether to clone media/assets from the original event, default: false
    eventStatus?: EventStatus | null; // Status for the cloned event. If not provided, will default to DRAFT
  };
  
  // Event List/Filter Types
  export type EventListRequest = {
    page?: number; // Default: 0, min: 0
    size?: number; // Default: 20, min: 1, max: 100
    status?: EventStatus | null;
    eventType?: EventType | null;
    isPublic?: boolean | null;
    startDateFrom?: string | null; // ISO datetime
    startDateTo?: string | null; // ISO datetime
    isArchived?: boolean | null; // Default: false
    mine?: boolean | null; // Filter to events owned by current user
    timeframe?: string | null; // 'UPCOMING' | 'PAST' (only meaningful with mine=true)
    search?: string | null; // Search term to match against event name, description, hashtag, or theme
    sortBy?: string | null; // 'startDateTime' | 'createdAt' | 'name' | 'currentAttendeeCount', default: 'startDateTime'
    sortDirection?: 'ASC' | 'DESC' | null; // Default: 'ASC'
  };
  
  // Event Media Upload Types
  export type EventMediaUploadRequest = {
    fileName: string; // Required, original file name
    contentType: string; // Required, MIME content type (e.g., "image/jpeg")
    category?: string | null; // Optional category to group the media
    isPublic?: boolean | null; // Default: true
    tags?: string | null; // Comma separated tags
    description?: string | null; // Human readable description
    metadata?: Record<string, string> | null; // Arbitrary metadata to attach
  };
  
  export type EventMediaUploadCompleteRequest = {
    objectKey?: string | null; // S3 object key (should match the objectKey from the presign response)
    resourceUrl?: string | null; // Non-presigned resource URL (no query params)
    fileName: string; // Required, original file name
    contentType: string; // Required, MIME content type
    category?: string | null; // Optional category to group the media
    isPublic?: boolean | null; // Default: false
    tags?: string | null; // Comma separated tags
    description?: string | null; // Human readable description
    metadata?: string | null; // Arbitrary metadata (stored as string/JSON)
  };

  export type EventMediaRequest = {
    mediaType: string; // e.g., "image", "video", "document"
    mediaName: string;
    description?: string | null;
    category?: string | null;
    isPublic?: boolean | null;
    tags?: string | null;
    metadata?: string | null;
    mediaUrl?: string | null;
  };
  
  export type EventPresignedUploadResponse = {
    mediaId: string; // UUID - identifier that should be referenced once upload completes
    objectKey: string; // S3 object key that will be created
    uploadMethod: string; // HTTP method to use when uploading (e.g., "PUT")
    uploadUrl: string; // URL to upload the media/asset to
    headers: Record<string, string>; // Headers that must be included when uploading
    resourceUrl: string; // URL where the media will be accessible after processing
    expiresAt: string; // ISO datetime - expiration timestamp for the presigned request
  };
  
  // Event Media Response Types
  export type EventMediaResponse = {
    mediaId: string; // UUID
    eventId: string; // UUID
    mediaType?: string | null;
    mediaName?: string | null;
    description?: string | null;
    category?: string | null;
    mediaUrl?: string | null;
    thumbnailUrl?: string | null;
    fileSize?: number | null; // File size in bytes
    mimeType?: string | null; // File MIME type
    width?: number | null; // Media width (for images/videos)
    height?: number | null; // Media height (for images/videos)
    duration?: number | null; // Media duration (for videos/audio)
    isPublic?: boolean | null;
    tags?: string | null;
    metadata?: string | null;
    uploadedAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
  };
  
  export type EventCoverImageResponse = {
    eventId: string; // UUID
    coverImageUrl: string;
    updatedAt: string; // ISO datetime
  };
  
  // Event Cover Image Complete Types
  export type EventCoverImageCompleteRequest = {
    coverId: string; // UUID - Cover object ID returned from the presigned upload response
    upload: EventMediaUploadCompleteRequest; // Upload completion payload
  };
  
  export type UpdateEventWithCoverUploadRequest = {
    event: UpdateEventRequest; // Required, event update payload
    coverUpload?: EventMediaUploadRequest | null; // Optional, cover image upload metadata (if omitted, cover image is unchanged)
  };
  
  export type UpdateEventWithCoverUploadResponse = {
    event: EventResponse; // Updated event details
    coverUpload?: EventPresignedUploadResponse | null; // Presigned upload details (null when no cover update requested)
  };
  
  // Event Feed Request Types
  export type EventFeedRequest = {
    page?: number; // Default: 0, min: 0
    size?: number; // Default: 20, min: 1, max: 100
    postType?: string | null; // Filter by post type (VIDEO, IMAGE, TEXT)
  };

  // Event Feed Types
  export type FeedPost = {
    id: string; // UUID
    type?: string | null; // Post type: VIDEO, IMAGE, TEXT
    content?: string | null; // Post content/text
    mediaUrl?: string | null; // Media URL (for videos/images)
    thumbnailUrl?: string | null; // Thumbnail URL (for videos)
    authorName?: string | null;
    authorAvatarUrl?: string | null;
    postedAt?: string | null; // ISO datetime
    likes?: number | null;
    comments?: number | null;
  };
  
  export type EventFeedResponse = {
    eventId: string; // UUID
    eventName?: string | null;
    description?: string | null;
    coverImageUrl?: string | null;
    startDateTime?: string | null; // ISO datetime
    endDateTime?: string | null; // ISO datetime
    hashtag?: string | null;
    eventWebsiteUrl?: string | null;
    posts?: FeedPost[] | null; // List of feed posts (videos, pictures, tweets)
    currentPage?: number | null; // Current page number (0-indexed)
    pageSize?: number | null; // Number of items per page
    totalPosts?: number | null; // Total number of posts available
    totalPages?: number | null; // Total number of pages
    hasNext?: boolean | null; // Whether there is a next page
    hasPrevious?: boolean | null; // Whether there is a previous page
    scope?: EventScope; // Event scope: FULL (full details) or FEED (feed view), default: FEED
    feedsPublicAfterEvent?: boolean | null;
    
    // New access control fields
    accessType?: EventAccessType | null;
    userContext?: UserEventContext | null;
  };
  
  // Attendee Types
  export type AttendeeResponse = {
    id: string; // UUID
    eventId: string; // UUID
    userId?: string | null; // UUID - User account ID if attendee is linked to a user in the platform (null for email-only guests)
    name: string;
    email?: string | null; // Email address - present for both user-linked attendees and email-only guests
    rsvpStatus?: AttendeeStatus | null;
    checkedInAt?: string | null; // ISO datetime
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
    isCheckedIn?: boolean | null; // Computed dynamically from checkedInAt
  };
  
  // Paginated Response Types
  export type PaginatedEventResponse = {
    content: EventResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
  };
  
  export type PaginatedAttendeeResponse = {
    content: AttendeeResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
  };
  
  // API Response Types (reusing from security types if needed, but included here for completeness)
  export type ApiResponse<T> = {
    status: number;
    message: string;
    data: T | null;
  };
  
  export type ApiErrorResponse = {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
    validationErrors?: Record<string, string>;
  };
  
  export type ApiMessageResponse = {
    success: boolean;
    message: string;
  };

  // Event Capacity Response Type
  export type EventCapacityResponse = {
    eventId: string; // UUID
    capacity?: number | null;
    currentAttendeeCount?: number | null;
    registrationDeadline?: string | null; // ISO datetime
    availableSpots?: number | null;
    utilizationPercentage?: number | null;
    isRegistrationOpen?: boolean | null;
  };

  // Event Visibility Response Type
  export type EventVisibilityResponse = {
    eventId: string; // UUID
    isPublic?: boolean | null;
    requiresApproval?: boolean | null;
    registrationDeadline?: string | null; // ISO datetime
    accessLevel?: string | null;
    updatedAt?: string | null; // ISO datetime
  };
  
  // Event Collaborator Types
  export enum EventUserType {
    ORGANIZER = 'ORGANIZER',
    COORDINATOR = 'COORDINATOR',
    STAFF = 'STAFF',
    COLLABORATOR = 'COLLABORATOR',
    VOLUNTEER = 'VOLUNTEER',
    VENDOR = 'VENDOR',
    SPEAKER = 'SPEAKER',
    SPONSOR = 'SPONSOR',
    MEDIA = 'MEDIA',
    ATTENDEE = 'ATTENDEE',
    ADMIN = 'ADMIN',
  }
  
  export type EventCollaboratorResponse = {
    collaboratorId: string; // UUID
    eventId: string; // UUID
    userId?: string | null; // UUID - User account ID if collaborator is linked to a user
    email: string;
    userName?: string | null;
    role: EventUserType;
    permissions?: string[] | null;
    notes?: string | null;
    invitationMessage?: string | null;
    registrationStatus?: string | null; // PENDING, CONFIRMED, ACCEPTED, DECLINED, REJECTED
    invitedAt?: string | null; // ISO datetime
    respondedAt?: string | null; // ISO datetime
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
  };
  
  export type EventCollaboratorRequest = {
    userId?: string | null; // UUID - User account ID if collaborator is linked to a user
    email: string;
    role: EventUserType;
    sendInvitation?: boolean;
    permissions?: string[] | null;
    notes?: string | null;
    invitationMessage?: string | null;
  };

  export enum RecipientType {
    ALL_COLLABORATORS = 'ALL_COLLABORATORS',
    ALL_GUESTS = 'ALL_GUESTS',
    SPECIFIC_PERSON = 'SPECIFIC_PERSON',
  }

  export enum EmailTemplateType {
    EVENT_REMINDER = 'EVENT_REMINDER',
    REGISTRATION_CONFIRMATION = 'REGISTRATION_CONFIRMATION',
    CUSTOM = 'CUSTOM',
  }

  export type EventReminderRequest = {
    title: string; // Required, max 200 chars
    description?: string | null;
    reminderTime?: string | null; // ISO datetime - if not provided, defaults to 5 minutes from now
    channel: string; // Required, max 30 chars (email, sms, push)
    emailTemplateType?: EmailTemplateType | null; // Required when channel is 'email'
    recipientTypes?: RecipientType[] | null; // Options: ALL_COLLABORATORS, ALL_GUESTS, SPECIFIC_PERSON
    recipientUserIds?: string[] | null; // UUID list (required if SPECIFIC_PERSON is in recipientTypes)
    recipientEmails?: string[] | null; // Email list (required if SPECIFIC_PERSON is in recipientTypes)
    reminderType?: string | null; // event_start, registration_deadline, custom (default: custom), max 30 chars
    isActive?: boolean | null; // Default: true
    customMessage?: string | null;
    includeEventDetails?: boolean | null; // Default: true
  };

  export type EventReminderUpdateRequest = Partial<EventReminderRequest>;

  export type EventReminderResponse = {
    reminderId: string; // UUID
    eventId?: string | null; // UUID
    title: string;
    description?: string | null;
    reminderTime?: string | null; // ISO datetime
    channel: string;
    reminderType?: string | null;
    isActive?: boolean | null;
    customMessage?: string | null;
    recipientCount?: number | null;
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
    wasSent?: boolean | null;
    sentAt?: string | null; // ISO datetime
  };

  // Type aliases for backward compatibility
  export type Event = EventResponse;
  export type EventData =
    | EventResponse
    | EventFeedResponse
    | EventCapacityResponse
    | EventVisibilityResponse;

  // Helper type guards
  export function isFullEventResponse(data: EventData): data is EventResponse {
    return 'name' in data && 'eventType' in data;
  }

  export function isFeedResponse(data: EventData): data is EventFeedResponse {
    return 'posts' in data && 'eventId' in data;
  }

