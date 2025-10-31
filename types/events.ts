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
  newEventName: string;
  copyAttendees?: boolean;
  copyMedia?: boolean;
  copySettings?: boolean;
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
  role: EventUserType;
  permissions: string[];
  notes: string | null;
  sendInvitation: boolean | null;
  invitationMessage: string | null;
  invitationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
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
