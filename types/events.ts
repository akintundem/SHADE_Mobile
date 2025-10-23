/**
 * Event related types
 */

import { EventType, EventStatus } from './enums';

export type Event = {
  id: string;
  name: string;
  description?: string;
  eventType: EventType;
  eventStatus: EventStatus;
  startDateTime: string;
  endDateTime?: string;
  registrationDeadline?: string;
  capacity?: number;
  currentAttendeeCount: number;
  isPublic: boolean;
  requiresApproval: boolean;
  qrCodeEnabled: boolean;
  qrCode?: string;
  coverImageUrl?: string;
  eventWebsiteUrl?: string;
  hashtag?: string;
  theme?: string;
  objectives?: string;
  targetAudience?: string;
  successMetrics?: string;
  brandingGuidelines?: string;
  venueRequirements?: string;
  technicalRequirements?: string;
  accessibilityFeatures?: string;
  emergencyPlan?: string;
  backupPlan?: string;
  postEventTasks?: string;
  metadata?: string;
  ownerId: string;
  venueId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEventRequest = {
  name: string;
  description?: string;
  eventType: EventType;
  eventStatus?: EventStatus;
  startDateTime: string;
  endDateTime?: string;
  registrationDeadline?: string;
  capacity?: number;
  isPublic?: boolean;
  requiresApproval?: boolean;
  qrCodeEnabled?: boolean;
  coverImageUrl?: string;
  eventWebsiteUrl?: string;
  hashtag?: string;
  theme?: string;
  objectives?: string;
  targetAudience?: string;
  successMetrics?: string;
  brandingGuidelines?: string;
  venueRequirements?: string;
  technicalRequirements?: string;
  accessibilityFeatures?: string;
  emergencyPlan?: string;
  backupPlan?: string;
  postEventTasks?: string;
};

export type UpdateEventRequest = {
  name?: string;
  description?: string;
  eventType?: EventType;
  eventStatus?: EventStatus;
  startDateTime?: string;
  endDateTime?: string;
  registrationDeadline?: string;
  capacity?: number;
  currentAttendeeCount?: number;
  isPublic?: boolean;
  requiresApproval?: boolean;
  qrCodeEnabled?: boolean;
  qrCode?: string;
  coverImageUrl?: string;
  eventWebsiteUrl?: string;
  hashtag?: string;
  theme?: string;
  objectives?: string;
  targetAudience?: string;
  successMetrics?: string;
  brandingGuidelines?: string;
  venueRequirements?: string;
  technicalRequirements?: string;
  accessibilityFeatures?: string;
  emergencyPlan?: string;
  backupPlan?: string;
  postEventTasks?: string;
  metadata?: string;
  ownerId?: string;
  venueId?: string;
  venueCleared?: boolean;
};

export type EventResponse = {
  id: string;
  name: string;
  description?: string;
  eventType: EventType;
  eventStatus: EventStatus;
  startDateTime: string;
  endDateTime?: string;
  registrationDeadline?: string;
  capacity?: number;
  currentAttendeeCount: number;
  isPublic: boolean;
  requiresApproval: boolean;
  qrCodeEnabled: boolean;
  qrCode?: string;
  coverImageUrl?: string;
  eventWebsiteUrl?: string;
  hashtag?: string;
  theme?: string;
  objectives?: string;
  targetAudience?: string;
  successMetrics?: string;
  brandingGuidelines?: string;
  venueRequirements?: string;
  technicalRequirements?: string;
  accessibilityFeatures?: string;
  emergencyPlan?: string;
  backupPlan?: string;
  postEventTasks?: string;
  metadata?: string;
  ownerId: string;
  venueId?: string;
  createdAt: string;
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
