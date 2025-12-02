/**
 * Event related types
 */

import { 
  EventNotificationChannel, 
  EventNotificationPriority, 
  EventStatus, 
  EventType, 
  EventUserType 
} from './enums';

// Re-export enums for convenience
export { EventStatus, EventType, EventUserType, EventNotificationChannel, EventNotificationPriority };

export type Event = {
  id: string;
  name: string;
  description: string | null;
  eventType: EventType;
  eventStatus: EventStatus;
  startDateTime: string | null;
  endDateTime: string | null;
  registrationDeadline: string | null;
  capacity: number | null;
  currentAttendeeCount: number | null;
  isPublic: boolean | null;
  requiresApproval: boolean | null;
  qrCodeEnabled: boolean | null;
  qrCode: string | null;
  coverImageUrl: string | null;
  eventWebsiteUrl: string | null;
  hashtag: string | null;
  theme: string | null;
  objectives: string | null;
  targetAudience: string | null;
  successMetrics: string | null;
  brandingGuidelines: string | null;
  venueRequirements: string | null;
  technicalRequirements: string | null;
  accessibilityFeatures: string | null;
  emergencyPlan: string | null;
  backupPlan: string | null;
  postEventTasks: string | null;
  metadata: string | null;
  ownerId: string;
  venueId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventResponse = Event;

export type EventListResponse = {
  events: EventResponse[];
  total: number;
  page: number;
  size: number;
};

export type CreateEventRequest = {
  name: string;
  description?: string;
  eventType: EventType;
  eventStatus?: EventStatus;
  startDateTime?: string | null;
  endDateTime?: string | null;
  registrationDeadline?: string | null;
  capacity?: number | null;
  currentAttendeeCount?: number | null;
  isPublic?: boolean | null;
  requiresApproval?: boolean | null;
  qrCodeEnabled?: boolean | null;
  qrCode?: string | null;
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
  ownerId?: string;
  venueId?: string | null;
};

export type UpdateEventRequest = {
  name?: string;
  description?: string | null;
  eventType?: EventType;
  eventStatus?: EventStatus;
  startDateTime?: string | null;
  endDateTime?: string | null;
  registrationDeadline?: string | null;
  capacity?: number | null;
  currentAttendeeCount?: number | null;
  isPublic?: boolean | null;
  requiresApproval?: boolean | null;
  qrCodeEnabled?: boolean | null;
  qrCode?: string | null;
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
  ownerId?: string;
  venueId?: string | null;
  venueCleared?: boolean;
};

export type DuplicateEventRequest = {
  newEventName?: string;
  copyAttendees?: boolean;
  copyMedia?: boolean;
  copySettings?: boolean;
};

export type EventCapacityUpdateRequest = {
  capacity: number;
};

export type EventRegistrationDeadlineRequest = {
  deadline: string;
};

export type EventVisibilityUpdateRequest = {
  isPublic: boolean;
  requiresApproval?: boolean;
};

export type EventSharingOptionsResponse = {
  eventId: string;
  availableChannels: string[];
  shareLink: string | null;
  qrCodeAvailable: boolean;
  isPublic: boolean | null;
  socialMediaOptions?: string[] | null;
  emailOptions?: string[] | null;
  defaultMessage?: string | null;
};

export type EventShareRequest = {
  channel: 'EMAIL' | 'LINK' | 'SOCIAL';
  recipients?: string[];
  message?: string | null;
  includeEventDetails?: boolean;
  includeQRCode?: boolean;
  expirationDate?: string | null;
};

export type EventShareResponse = {
  shareId: string;
  eventId: string;
  channel: string;
  recipientCount: number;
  successfulRecipients: string[];
  failedRecipients: string[];
  status: string;
  shareLink: string | null;
  message: string | null;
  includeEventDetails: boolean | null;
  includeQRCode: boolean | null;
  createdAt: string;
  expirationDate: string | null;
};

export type UserEventRelationshipResponse = {
  eventId: string;
  eventName: string;
  eventDescription: string | null;
  eventType: EventType;
  eventStatus: EventStatus;
  startDateTime: string | null;
  endDateTime: string | null;
  userRole: EventUserType | null;
  registrationStatus: string | null;
  registrationDate: string | null;
  isOwner: boolean;
  capacity: number | null;
  currentAttendeeCount: number | null;
  isPublic: boolean | null;
  coverImageUrl: string | null;
  eventWebsiteUrl: string | null;
  hashtag: string | null;
};

export type EventSummaryResponse = {
  totalEvents: number;
  ownedEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  events: UserEventRelationshipResponse[];
};

export type EventCapacityResponse = {
  eventId: string;
  capacity: number | null;
  currentAttendeeCount: number | null;
  availableSpots: number;
  utilizationPercentage: number;
  isRegistrationOpen: boolean;
};

export type EventQRCodeResponse = {
  eventId: string;
  qrCode: string | null;
  qrCodeEnabled: boolean | null;
  qrCodeImageUrl: string | null;
  qrCodeImageBase64?: string | null;
  generatedAt: string | null;
};

export type EventVisibilityResponse = {
  eventId: string;
  isPublic: boolean | null;
  requiresApproval: boolean | null;
  accessLevel: string;
  updatedAt: string | null;
};

export type EventAnalyticsResponse = {
  eventId: string;
  totalViews: number;
  uniqueVisitors: number;
  registrationRate: number;
  attendanceRate: number;
  engagementMetrics: Record<string, unknown>;
  socialMetrics: Record<string, unknown>;
  geographicDistribution: Record<string, unknown>;
  analyticsPeriod: string;
};

export type EventValidationResponse = {
  eventId: string;
  isValid: boolean;
  validationScore: number;
  errors: string[];
  warnings: string[];
  validationDetails: Record<string, unknown>;
  validatedAt: string;
};

export type EventHealthCheckResponse = {
  eventId: string;
  healthStatus: string;
  healthScore: number;
  issues: string[];
  recommendations: string[];
  componentHealth: Record<string, unknown>;
  checkedAt: string;
};

export type EventCollaboratorResponse = {
  collaboratorId: string;
  eventId: string;
  userId: string | null;
  email: string;
  userName?: string;
  role: EventUserType;
  permissions: string[];
  registrationStatus?: string;
  notes: string | null;
  sendInvitation: boolean | null;
  invitationMessage: string | null;
  invitationSent: boolean;
  invitationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventCollaboratorRequest = {
  userId?: string;
  email: string;
  role: EventUserType;
  permissions?: string[];
  notes?: string;
  sendInvitation?: boolean;
  invitationMessage?: string;
};

export type EventMediaResponse = {
  id: string;
  eventId: string;
  fileName: string;
  url: string;
  contentType: string;
  category: string | null;
  isPublic: boolean | null;
  tags: string[] | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type EventMediaUploadRequest = {
  fileName: string;
  contentType: string;
  fileSize?: number;
  category?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string | string[];
  metadata?: Record<string, string>;
};

export type EventPresignedUploadResponse = {
  fileId: string;
  uploadUrl: string;
  expiresAt: string;
  fields?: Record<string, string>;
  headers?: Record<string, string>;
};

export type EventNotificationSettingsResponse = {
  eventId: string;
  enabled: boolean;
  channels: Partial<Record<EventNotificationChannel, boolean>>;
  reminderOffsets?: number[] | null;
  preferences?: Record<string, unknown> | null;
  updatedAt: string | null;
};

export type EventNotificationSettingsRequest = Partial<EventNotificationSettingsResponse>;

export type EventNotificationResponse = {
  notificationId: string;
  eventId: string;
  channel: EventNotificationChannel;
  subject: string;
  content: string;
  status: string;
  priority: EventNotificationPriority;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventNotificationRequest = {
  channel: EventNotificationChannel;
  subject: string;
  content: string;
  recipientUserIds?: string[];
  recipientEmails?: string[];
  scheduledAt?: string;
  includeEventDetails?: boolean;
  includeQRCode?: boolean;
  priority?: EventNotificationPriority;
  templateId?: string;
};

export type EventReminderResponse = {
  reminderId: string;
  eventId: string;
  title: string;
  description: string | null;
  reminderTime: string;
  channel: string;
  recipientUserIds: string[] | null;
  recipientEmails: string[] | null;
  reminderType: string | null;
  isActive: boolean;
  customMessage: string | null;
  includeEventDetails: boolean | null;
  createdAt: string;
  updatedAt: string;
};

export type EventReminderRequest = {
  title: string;
  description?: string;
  reminderTime: string;
  channel: string;
  recipientUserIds?: string[];
  recipientEmails?: string[];
  reminderType?: string;
  isActive?: boolean;
  customMessage?: string;
  includeEventDetails?: boolean;
};

export type EventReminderUpdateRequest = Partial<EventReminderRequest>;

export type EventCoverImageResponse = {
  eventId: string;
  coverImageUrl: string | null;
  updatedAt: string;
};

export type Location = {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
};

// Event Scope Types
export type EventScope = 'FULL' | 'FEED';

// Venue DTO (referenced in EventResponse)
export type VenueDTO = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  amenities?: string[];
  contactInfo?: Record<string, unknown>;
};

// Feed Post Types
export type FeedPostType = 'VIDEO' | 'IMAGE' | 'TEXT';

export type FeedPost = {
  id: string; // UUID
  type: FeedPostType;
  content?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  postedAt: string; // ISO datetime
  likes?: number;
  comments?: number;
};

// Event Feed Request (for pagination)
export type EventFeedRequest = {
  page?: number; // Default: 0 (0-indexed)
  size?: number; // Default: 20, Max: 50
  postType?: FeedPostType | 'ALL'; // Filter by post type
};

// Event Feed Response (for guests)
export type EventFeedResponse = {
  eventId: string; // UUID
  eventName: string;
  description?: string;
  coverImageUrl?: string;
  startDateTime: string; // ISO datetime
  endDateTime?: string; // ISO datetime
  hashtag?: string;
  eventWebsiteUrl?: string;
  posts: FeedPost[];
  // Pagination metadata
  currentPage: number;
  pageSize: number;
  totalPosts: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  scope: 'FEED'; // Always FEED for this response type
};

// Updated EventResponse with scope field
export type EventResponseWithScope = EventResponse & {
  scope: 'FULL';
  venue?: VenueDTO;
};

// Union type for Event Data
export type EventData = EventResponseWithScope | EventFeedResponse;

// Type guard functions
export function isFullEventResponse(
  data: EventData,
): data is EventResponseWithScope {
  return 'scope' in data && data.scope === 'FULL';
}

export function isFeedResponse(data: EventData): data is EventFeedResponse {
  return 'scope' in data && data.scope === 'FEED';
}
