/**
 * Event related types
 */

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
  
  // Event Create/Update with Cover Upload Types
  export type CreateEventWithCoverUploadRequest = {
    event: CreateEventRequest; // Required, event creation payload
    coverUpload: EventMediaUploadRequest; // Required, cover image upload metadata
  };
  
  export type CreateEventWithCoverUploadResponse = {
    event: EventResponse; // Created event details
    coverUpload: EventPresignedUploadResponse; // Presigned upload details for uploading the cover image to S3
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
    id: string; // UUID
    capacity?: number | null;
    currentAttendeeCount?: number | null;
    registrationDeadline?: string | null; // ISO datetime
  };

  // Event Visibility Response Type
  export type EventVisibilityResponse = {
    id: string; // UUID
    isPublic?: boolean | null;
    requiresApproval?: boolean | null;
    eventStatus?: EventStatus | null;
  };
  
  