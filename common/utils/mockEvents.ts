/**
 * Mock event data for development and testing
 * Use this when backend is not connected
 */

import { Event, EventListResponse } from '../../features/events/types/events';
import { EventType, EventStatus } from '../../features/events/types/enums';

// Helper to create dates relative to now
const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(18, 0, 0, 0);

const nextWeek = new Date(now);
nextWeek.setDate(nextWeek.getDate() + 7);
nextWeek.setHours(14, 0, 0, 0);

const nextMonth = new Date(now);
nextMonth.setMonth(nextMonth.getMonth() + 1);
nextMonth.setHours(16, 0, 0, 0);

const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(20, 0, 0, 0);

const lastWeek = new Date(now);
lastWeek.setDate(lastWeek.getDate() - 7);
lastWeek.setHours(19, 0, 0, 0);

const lastMonth = new Date(now);
lastMonth.setMonth(lastMonth.getMonth() - 1);
lastMonth.setHours(15, 0, 0, 0);

// Format date to ISO string
const toISO = (date: Date) => date.toISOString();

export const mockEvents: Event[] = [
  // Live Events (future dates, active statuses)
  {
    id: 'mock-event-1',
    name: 'Tech Innovation Summit 2024',
    description: 'Join us for an exciting day of tech talks, networking, and innovation. Featuring industry leaders and cutting-edge demonstrations.',
    eventType: EventType.CONFERENCE,
    eventStatus: EventStatus.REGISTRATION_OPEN,
    startDateTime: toISO(tomorrow),
    endDateTime: toISO(new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000)), // 8 hours later
    registrationDeadline: toISO(new Date(tomorrow.getTime() - 2 * 60 * 60 * 1000)), // 2 hours before
    capacity: 500,
    currentAttendeeCount: 342,
    isPublic: true,
    requiresApproval: false,
    coverImageUrl: null,
    eventWebsiteUrl: null,
    hashtag: '#TechSummit2024',
    theme: 'Innovation & Future Tech',
    objectives: 'Connect tech professionals and showcase latest innovations',
    targetAudience: 'Tech professionals, entrepreneurs, developers',
    successMetrics: null,
    brandingGuidelines: null,
    venueRequirements: 'Large conference hall with AV equipment',
    technicalRequirements: 'WiFi, projectors, microphones',
    accessibilityFeatures: 'Wheelchair accessible, sign language interpreter available',
    emergencyPlan: null,
    backupPlan: null,
    postEventTasks: null,
    metadata: null,
    ownerId: 'mock-owner-1',
    venueId: 'mock-venue-1',
    createdAt: toISO(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
    updatedAt: toISO(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)), // 1 day ago
  },
  {
    id: 'mock-event-2',
    name: 'Summer Music Festival',
    description: 'A vibrant outdoor music festival featuring local and international artists. Food trucks, art installations, and great vibes!',
    eventType: EventType.FESTIVAL,
    eventStatus: EventStatus.PUBLISHED,
    startDateTime: toISO(nextWeek),
    endDateTime: toISO(new Date(nextWeek.getTime() + 12 * 60 * 60 * 1000)), // 12 hours later
    registrationDeadline: toISO(new Date(nextWeek.getTime() - 24 * 60 * 60 * 1000)), // 1 day before
    capacity: 2000,
    currentAttendeeCount: 1245,
    isPublic: true,
    requiresApproval: false,
    coverImageUrl: null,
    eventWebsiteUrl: null,
    hashtag: '#SummerFest2024',
    theme: 'Music & Community',
    objectives: 'Celebrate music and bring community together',
    targetAudience: 'Music lovers, families, all ages',
    successMetrics: null,
    brandingGuidelines: null,
    venueRequirements: 'Outdoor venue with stage and sound system',
    technicalRequirements: 'Sound system, lighting, power generators',
    accessibilityFeatures: 'ADA accessible, accessible parking',
    emergencyPlan: null,
    backupPlan: 'Indoor venue backup in case of rain',
    postEventTasks: null,
    metadata: null,
    ownerId: 'mock-owner-2',
    venueId: 'mock-venue-2',
    createdAt: toISO(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)), // 60 days ago
    updatedAt: toISO(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
  },
  {
    id: 'mock-event-3',
    name: 'React Native Workshop',
    description: 'Hands-on workshop for building mobile apps with React Native. Perfect for beginners and intermediate developers.',
    eventType: EventType.WORKSHOP,
    eventStatus: EventStatus.IN_PROGRESS,
    startDateTime: toISO(now), // Currently happening
    endDateTime: toISO(new Date(now.getTime() + 4 * 60 * 60 * 1000)), // 4 hours from now
    registrationDeadline: toISO(new Date(now.getTime() - 1 * 60 * 60 * 1000)), // 1 hour ago
    capacity: 50,
    currentAttendeeCount: 48,
    isPublic: true,
    requiresApproval: false,
    coverImageUrl: null,
    eventWebsiteUrl: null,
    hashtag: '#ReactNativeWorkshop',
    theme: 'Mobile Development',
    objectives: 'Teach React Native fundamentals and best practices',
    targetAudience: 'Developers, students, tech enthusiasts',
    successMetrics: null,
    brandingGuidelines: null,
    venueRequirements: 'Classroom with computers and projectors',
    technicalRequirements: 'WiFi, computers, development environment setup',
    accessibilityFeatures: 'Wheelchair accessible',
    emergencyPlan: null,
    backupPlan: null,
    postEventTasks: null,
    metadata: null,
    ownerId: 'mock-owner-3',
    venueId: 'mock-venue-3',
    createdAt: toISO(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)), // 20 days ago
    updatedAt: toISO(now),
  },
  {
    id: 'mock-event-4',
    name: 'Networking Mixer',
    description: 'Casual networking event for professionals. Come meet new people, exchange ideas, and grow your network.',
    eventType: EventType.NETWORKING,
    eventStatus: EventStatus.PUBLISHED,
    startDateTime: toISO(nextMonth),
    endDateTime: toISO(new Date(nextMonth.getTime() + 3 * 60 * 60 * 1000)), // 3 hours later
    registrationDeadline: toISO(new Date(nextMonth.getTime() - 7 * 24 * 60 * 60 * 1000)), // 7 days before
    capacity: 100,
    currentAttendeeCount: 67,
    isPublic: true,
    requiresApproval: false,
    coverImageUrl: null,
    eventWebsiteUrl: null,
    hashtag: '#NetworkingMixer',
    theme: 'Professional Networking',
    objectives: 'Connect professionals and facilitate meaningful conversations',
    targetAudience: 'Professionals, entrepreneurs, job seekers',
    successMetrics: null,
    brandingGuidelines: null,
    venueRequirements: 'Cocktail venue with bar and seating',
    technicalRequirements: 'Sound system for background music',
    accessibilityFeatures: 'Wheelchair accessible',
    emergencyPlan: null,
    backupPlan: null,
    postEventTasks: null,
    metadata: null,
    ownerId: 'mock-owner-4',
    venueId: 'mock-venue-4',
    createdAt: toISO(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)), // 15 days ago
    updatedAt: toISO(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
  },
  {
    id: 'mock-event-5',
    name: 'Charity Gala Dinner',
    description: 'Elegant gala dinner to raise funds for local charities. Black tie optional. Silent auction and live entertainment.',
    eventType: EventType.CHARITY_EVENT,
    eventStatus: EventStatus.REGISTRATION_OPEN,
    startDateTime: toISO(new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000)), // 3 days after next week
    endDateTime: toISO(new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000)), // 5 hours later
    registrationDeadline: toISO(new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000)), // 1 day before
    capacity: 300,
    currentAttendeeCount: 189,
    isPublic: true,
    requiresApproval: true,
    coverImageUrl: null,
    eventWebsiteUrl: null,
    hashtag: '#CharityGala2024',
    theme: 'Giving Back',
    objectives: 'Raise funds for local charities and community support',
    targetAudience: 'Philanthropists, community leaders, donors',
    successMetrics: null,
    brandingGuidelines: null,
    venueRequirements: 'Elegant banquet hall with stage',
    technicalRequirements: 'Sound system, lighting, microphones',
    accessibilityFeatures: 'Wheelchair accessible, accessible restrooms',
    emergencyPlan: null,
    backupPlan: null,
    postEventTasks: null,
    metadata: null,
    ownerId: 'mock-owner-5',
    venueId: 'mock-venue-5',
    createdAt: toISO(new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)), // 45 days ago
    updatedAt: toISO(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
  },
  // Past Events
  {
    id: 'mock-event-6',
    name: 'Spring Conference 2024',
    description: 'Annual spring conference featuring keynote speakers and breakout sessions.',
    eventType: EventType.CONFERENCE,
    eventStatus: EventStatus.COMPLETED,
    startDateTime: toISO(lastMonth),
    endDateTime: toISO(new Date(lastMonth.getTime() + 8 * 60 * 60 * 1000)),
    registrationDeadline: toISO(new Date(lastMonth.getTime() - 7 * 24 * 60 * 60 * 1000)),
    capacity: 400,
    currentAttendeeCount: 385,
    isPublic: true,
    requiresApproval: false,
    coverImageUrl: null,
    eventWebsiteUrl: null,
    hashtag: '#SpringConf2024',
    theme: 'Spring Innovation',
    objectives: 'Share knowledge and connect professionals',
    targetAudience: 'Industry professionals',
    successMetrics: null,
    brandingGuidelines: null,
    venueRequirements: 'Conference center',
    technicalRequirements: 'AV equipment',
    accessibilityFeatures: 'Wheelchair accessible',
    emergencyPlan: null,
    backupPlan: null,
    postEventTasks: null,
    metadata: null,
    ownerId: 'mock-owner-6',
    venueId: 'mock-venue-6',
    createdAt: toISO(new Date(lastMonth.getTime() - 90 * 24 * 60 * 60 * 1000)),
    updatedAt: toISO(new Date(lastMonth.getTime() + 1 * 24 * 60 * 60 * 1000)),
  },
  {
    id: 'mock-event-7',
    name: 'Product Launch Party',
    description: 'Celebrate the launch of our new product with food, drinks, and live music.',
    eventType: EventType.PARTY,
    eventStatus: EventStatus.COMPLETED,
    startDateTime: toISO(lastWeek),
    endDateTime: toISO(new Date(lastWeek.getTime() + 4 * 60 * 60 * 1000)),
    registrationDeadline: toISO(new Date(lastWeek.getTime() - 1 * 24 * 60 * 60 * 1000)),
    capacity: 150,
    currentAttendeeCount: 142,
    isPublic: true,
    requiresApproval: false,
    coverImageUrl: null,
    eventWebsiteUrl: null,
    hashtag: '#ProductLaunch',
    theme: 'Celebration',
    objectives: 'Launch new product and celebrate with team',
    targetAudience: 'Team members, partners, media',
    successMetrics: null,
    brandingGuidelines: null,
    venueRequirements: 'Event space with bar',
    technicalRequirements: 'Sound system',
    accessibilityFeatures: 'Wheelchair accessible',
    emergencyPlan: null,
    backupPlan: null,
    postEventTasks: null,
    metadata: null,
    ownerId: 'mock-owner-7',
    venueId: 'mock-venue-7',
    createdAt: toISO(new Date(lastWeek.getTime() - 30 * 24 * 60 * 60 * 1000)),
    updatedAt: toISO(new Date(lastWeek.getTime() + 1 * 24 * 60 * 60 * 1000)),
  },
  {
    id: 'mock-event-8',
    name: 'Cancelled Workshop',
    description: 'This workshop was cancelled due to unforeseen circumstances.',
    eventType: EventType.WORKSHOP,
    eventStatus: EventStatus.CANCELLED,
    startDateTime: toISO(yesterday),
    endDateTime: toISO(new Date(yesterday.getTime() + 3 * 60 * 60 * 1000)),
    registrationDeadline: toISO(new Date(yesterday.getTime() - 2 * 24 * 60 * 60 * 1000)),
    capacity: 30,
    currentAttendeeCount: 25,
    isPublic: true,
    requiresApproval: false,
    coverImageUrl: null,
    eventWebsiteUrl: null,
    hashtag: null,
    theme: null,
    objectives: null,
    targetAudience: null,
    successMetrics: null,
    brandingGuidelines: null,
    venueRequirements: null,
    technicalRequirements: null,
    accessibilityFeatures: null,
    emergencyPlan: null,
    backupPlan: null,
    postEventTasks: null,
    metadata: null,
    ownerId: 'mock-owner-8',
    venueId: null,
    createdAt: toISO(new Date(yesterday.getTime() - 20 * 24 * 60 * 60 * 1000)),
    updatedAt: toISO(new Date(yesterday.getTime() - 1 * 24 * 60 * 60 * 1000)),
  },
];

/**
 * Get mock events list response
 */
export const getMockEvents = (
  params?: { page?: number; size?: number; status?: string; type?: string; q?: string }
): EventListResponse => {
  let filteredEvents = [...mockEvents];

  // Filter by status
  if (params?.status) {
    filteredEvents = filteredEvents.filter(
      event => event.eventStatus === params.status
    );
  }

  // Filter by type
  if (params?.type) {
    filteredEvents = filteredEvents.filter(
      event => event.eventType === params.type
    );
  }

  // Search by query
  if (params?.q) {
    const query = params.q.toLowerCase();
    filteredEvents = filteredEvents.filter(
      event =>
        event.name.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.hashtag?.toLowerCase().includes(query)
    );
  }

  // Pagination
  const page = params?.page || 1;
  const size = params?.size || 20;
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  return {
    events: paginatedEvents,
    total: filteredEvents.length,
    page,
    size: paginatedEvents.length,
  };
};

/**
 * Get a single mock event by ID
 */
export const getMockEvent = (eventId: string): Event | undefined => {
  return mockEvents.find(event => event.id === eventId);
};

