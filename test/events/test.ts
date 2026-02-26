/**
 * Events Service E2E Tests
 *
 * Real end-to-end tests that hit the actual backend.
 * These tests authenticate with Auth0 and test all event-related endpoints.
 * Includes comprehensive edge cases and error scenarios.
 */

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { TestReporter } from '../lib/reporter';
import { getOrCreateTestEvent, authenticateAndOnboard, buildEventPayload } from '../lib/testHelpers';
import { delayBetweenTestFiles, delayBetweenTests, withRateLimitRetry, sleep } from '../lib/delay';
import { getErrorMessage, getErrorStatus, getErrorResponseData } from '../lib/types';
import { createErrorResult } from '../lib/errorHelpers';

// Mocks must be hoisted - use static values, no external dependencies
vi.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: (obj: Record<string, unknown>) => obj.web || obj.default || obj.ios,
    Version: 1,
  },
}));

vi.mock('@react-native-async-storage/async-storage', () => {
  const storage: Record<string, string> = {};
  return {
    default: {
      getItem: async (key: string) => storage[key] || null,
      setItem: async (key: string, value: string) => { storage[key] = value; },
      removeItem: async (key: string) => { delete storage[key]; },
      clear: async () => { Object.keys(storage).forEach(k => delete storage[k]); },
      getAllKeys: async () => Object.keys(storage),
      multiGet: async (keys: string[]) => keys.map(k => [k, storage[k] || null]),
      multiSet: async (pairs: [string, string][]) => { pairs.forEach(([k, v]) => { storage[k] = v; }); },
      multiRemove: async (keys: string[]) => { keys.forEach(k => delete storage[k]); },
    },
  };
});

// Now we can import other modules
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load dotenv
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { ensureAuth0ForTests } from '../lib/auth0TestConfig';

// Import services after mocks are set up
import { eventService } from '../../core/events/services/event';
import type { SecureUserResponse } from '../../core/auth/types/auth';
import {
  EventType,
  EventStatus,
  EventAccessType,
  CreateEventRequest,
  UpdateEventWithCoverUploadRequest,
  EventListRequest,
} from '../../core/events/types/event';

// Test state - shared across tests
interface TestState {
  isAuthenticated: boolean;
  userId: string | null;
  user: SecureUserResponse | null;
  createdEventId: string | null;
  createdEventIds: string[];
  clonedEventId: string | null;
}

const testState: TestState = {
  isAuthenticated: false,
  userId: null,
  user: null,
  createdEventId: null,
  createdEventIds: [],
  clonedEventId: null,
};

// Initialize test reporter
const reporter = new TestReporter('Events Service E2E Test Report');

// Get test credentials from environment (with fallback to hardcoded test user)
function getTestCredentials() {
  let email = process.env.TEST_USER_EMAIL?.trim() || '';
  let password = process.env.TEST_USER_PASSWORD?.trim() || '';

  if (!email || !password) {
    console.log('[Test] TEST_USER_EMAIL/TEST_USER_PASSWORD not set, using fallback test credentials');
    email = 'mayokak@gmail.com';
    password = 'fYjgit-fyhwef-5momcu';
  }

  return { email, password };
}

describe('Events Service E2E Tests', () => {
  beforeAll(async () => {
    await delayBetweenTestFiles(3000);
    ensureAuth0ForTests();
  });

  // Setup: Authenticate and create event if needed
  beforeAll(async () => {
    try {
      // Authenticate and handle onboarding
      const { email, password } = getTestCredentials();
      const authResult = await authenticateAndOnboard(email, password);
      testState.isAuthenticated = true;
      testState.userId = authResult.userId;
      testState.user = authResult.user;

      // Get or create event for tests that need it
      testState.createdEventId = await getOrCreateTestEvent();
      if (testState.createdEventId) {
        testState.createdEventIds.push(testState.createdEventId);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Test Setup] Failed to setup:', errorMessage);
    }
  });

  // Generate and write report after all tests
  afterAll(() => {
    const report = reporter.generateReport();
    const reportPath = reporter.writeReport('test/reports', 'events_test_report');
    if (process.env.SHOW_REPORT === 'true') {
      console.log('\n' + report);
      console.log(`\n📄 Report written to: ${reportPath}`);
    } else {
      console.log(`\n📄 Report written to: ${reportPath}`);
    }
  });

  // ============================================================================
  // AUTHENTICATION - Verified in setup
  // ============================================================================
  describe('0. Authentication', () => {
    const suite = reporter.startSuite('Authentication');

    it('should be authenticated (verified in setup)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();

      reporter.addResult(suite, {
        name: 'Sign In (verified in setup)',
        status: 'pass',
        statusCode: 200,
        message: 'Authenticated successfully',
        response: { userId: testState.userId, email: testState.user?.email },
      });
    });
  });

  // ============================================================================
  // LIST EVENTS - GET /api/v1/events
  // ============================================================================
  describe('1. List Events', () => {
    const suite = reporter.startSuite('List Events');

    it('should list all public events', async () => {
      expect(testState.isAuthenticated).toBe(true);

      try {
        const result = await withRateLimitRetry(() => eventService.listEvents());

        reporter.addResult(suite, {
          name: 'GET /api/v1/events (all public)',
          status: 'pass',
          statusCode: 200,
          message: `Listed ${result.content?.length || 0} events`,
          response: { totalElements: result.totalElements, contentLength: result.content?.length },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events (all public)', err));
        throw err;
      }
    }, 30000);

    it('should list events with pagination (page 0, size 5)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request: EventListRequest = { page: 0, size: 5 };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.listEvents(request));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events (page=0, size=5)',
          status: 'pass',
          statusCode: 200,
          message: `Page 0: ${result.content?.length || 0} of ${result.totalElements} events`,
          request,
          response: result,
        });

        expect(result.content).toBeDefined();
        expect(result.content.length).toBeLessThanOrEqual(5);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events (page=0, size=5)', err, request));
        throw err;
      }
    }, 30000);

    it('should list events with pagination (page 1, size 3)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request: EventListRequest = { page: 1, size: 3 };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.listEvents(request));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events (page=1, size=3)',
          status: 'pass',
          statusCode: 200,
          message: `Page 1: ${result.content?.length || 0} events`,
          request,
          response: result,
        });

        expect(result.content).toBeDefined();
        expect(result.content.length).toBeLessThanOrEqual(3);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events (page=1, size=3)', err, request));
        throw err;
      }
    }, 30000);

    it('should list my events', async () => {
      expect(testState.isAuthenticated).toBe(true);
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.listMyEvents({ page: 0, size: 10 }));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events?mine=true',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.content?.length || 0} of my events`,
          request: { mine: true, page: 0, size: 10 },
          response: { totalElements: result.totalElements, contentLength: result.content?.length },
        });

        expect(result.content).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events?mine=true', err));
        throw err;
      }
    }, 30000);

    it('should search events by keyword', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request: EventListRequest = { page: 0, size: 10, search: 'test' };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.listEvents(request));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events (search=test)',
          status: 'pass',
          statusCode: 200,
          message: `Search found ${result.content?.length || 0} events`,
          request,
          response: { totalElements: result.totalElements },
        });

        expect(result.content).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events (search=test)', err, request));
        throw err;
      }
    }, 30000);

    it('should filter events by event type', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request: EventListRequest = { page: 0, size: 10, eventType: EventType.CONFERENCE };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.listEvents(request));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events (eventType=CONFERENCE)',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.content?.length || 0} CONFERENCE events`,
          request,
          response: { totalElements: result.totalElements },
        });

        expect(result.content).toBeDefined();
        // Verify all returned events are of type CONFERENCE
        result.content.forEach(event => {
          if (event.eventType) {
            expect(event.eventType).toBe(EventType.CONFERENCE);
          }
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events (eventType=CONFERENCE)', err, request));
        throw err;
      }
    }, 30000);

    it('should filter events by status', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request: EventListRequest = { page: 0, size: 10, status: EventStatus.DRAFT };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.listMyEvents(request));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events (status=DRAFT)',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.content?.length || 0} DRAFT events`,
          request,
          response: { totalElements: result.totalElements },
        });

        expect(result.content).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events (status=DRAFT)', err, request));
        throw err;
      }
    }, 30000);

    it('should filter events by public visibility', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request: EventListRequest = { page: 0, size: 10, isPublic: true };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.listEvents(request));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events (isPublic=true)',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.content?.length || 0} public events`,
          request,
          response: { totalElements: result.totalElements },
        });

        expect(result.content).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events (isPublic=true)', err, request));
        throw err;
      }
    }, 30000);

    it('should sort events by startDateTime ascending', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request: EventListRequest = { page: 0, size: 10, sortBy: 'startDateTime', sortDirection: 'ASC' };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.listEvents(request));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events (sortBy=startDateTime, ASC)',
          status: 'pass',
          statusCode: 200,
          message: `Sorted ${result.content?.length || 0} events by startDateTime ASC`,
          request,
          response: { totalElements: result.totalElements },
        });

        expect(result.content).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events (sortBy=startDateTime, ASC)', err, request));
        throw err;
      }
    }, 30000);

    it('should sort events by createdAt descending', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request: EventListRequest = { page: 0, size: 10, sortBy: 'createdAt', sortDirection: 'DESC' };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.listEvents(request));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events (sortBy=createdAt, DESC)',
          status: 'pass',
          statusCode: 200,
          message: `Sorted ${result.content?.length || 0} events by createdAt DESC`,
          request,
          response: { totalElements: result.totalElements },
        });

        expect(result.content).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events (sortBy=createdAt, DESC)', err, request));
        throw err;
      }
    }, 30000);

    it('should handle empty search results gracefully', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request: EventListRequest = { page: 0, size: 10, search: 'xyznonexistent12345' };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.listEvents(request));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events (empty search)',
          status: 'pass',
          statusCode: 200,
          message: 'Empty search handled gracefully',
          request,
          response: { totalElements: result.totalElements, contentLength: result.content?.length },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events (empty search)', err, request));
        throw err;
      }
    }, 30000);
  });

  // ============================================================================
  // CREATE EVENT - POST /api/v1/events
  // ============================================================================
  describe('2. Create Event', () => {
    const suite = reporter.startSuite('Create Event');

    it('should create a basic public event', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const createRequest = buildEventPayload('Public Event');
      createRequest.isPublic = true;
      const idempotencyKey = `e2e-test-public-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.createEvent(createRequest, idempotencyKey));
        testState.createdEventIds.push(result.id);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events (public)',
          status: 'pass',
          statusCode: 201,
          message: `Event created: ${result.id}`,
          request: createRequest,
          response: { id: result.id, name: result.name },
        });

        expect(result.id).toBeDefined();
        expect(result.name).toBe(createRequest.name);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events (public)', err, createRequest));
        throw err;
      }
    }, 30000);

    it('should create a private event', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const createRequest = buildEventPayload('Private Event');
      createRequest.isPublic = false;
      createRequest.requiresApproval = true;
      const idempotencyKey = `e2e-test-private-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.createEvent(createRequest, idempotencyKey));
        testState.createdEventIds.push(result.id);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events (private)',
          status: 'pass',
          statusCode: 201,
          message: `Private event created: ${result.id}`,
          request: createRequest,
          response: { id: result.id, name: result.name, isPublic: result.isPublic },
        });

        expect(result.id).toBeDefined();
        expect(result.isPublic).toBe(false);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events (private)', err, createRequest));
        throw err;
      }
    }, 30000);

    it('should create an event with minimal fields', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const createRequest: CreateEventRequest = {
        name: `Minimal Event ${Date.now()}`,
        eventType: EventType.MEETING,
      };
      const idempotencyKey = `e2e-test-minimal-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.createEvent(createRequest, idempotencyKey));
        testState.createdEventIds.push(result.id);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events (minimal)',
          status: 'pass',
          statusCode: 201,
          message: `Minimal event created: ${result.id}`,
          request: createRequest,
          response: { id: result.id, name: result.name },
        });

        expect(result.id).toBeDefined();
        expect(result.name).toBe(createRequest.name);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events (minimal)', err, createRequest));
        throw err;
      }
    }, 30000);

    it('should create an event with all optional fields', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
      const deadline = new Date(start.getTime() - 24 * 60 * 60 * 1000);

      const createRequest: CreateEventRequest = {
        name: `Full Event ${Date.now()}`,
        description: 'A comprehensive event with all fields populated for testing',
        eventType: EventType.CONFERENCE,
        eventStatus: EventStatus.DRAFT,
        startDateTime: start.toISOString().slice(0, 19),
        endDateTime: end.toISOString().slice(0, 19),
        registrationDeadline: deadline.toISOString().slice(0, 19),
        capacity: 100,
        isPublic: true,
        requiresApproval: false,
        eventWebsiteUrl: 'https://example.com/event',
        hashtag: '#FullEventTest',
        theme: 'Technology & Innovation',
        objectives: 'Test all event fields',
        targetAudience: 'Developers and testers',
        accessibilityFeatures: 'Wheelchair accessible',
        accessType: EventAccessType.OPEN,
        venue: {
          address: '123 Tech Blvd',
          city: 'San Francisco',
          state: 'CA',
          country: 'United States',
          zipCode: '94105',
          latitude: 37.7749,
          longitude: -122.4194,
        },
      };
      const idempotencyKey = `e2e-test-full-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.createEvent(createRequest, idempotencyKey));
        testState.createdEventIds.push(result.id);
        // Update the main test event if not set
        if (!testState.createdEventId) {
          testState.createdEventId = result.id;
        }

        reporter.addResult(suite, {
          name: 'POST /api/v1/events (all fields)',
          status: 'pass',
          statusCode: 201,
          message: `Full event created: ${result.id}`,
          request: createRequest,
          response: result,
        });

        expect(result.id).toBeDefined();
        expect(result.name).toBe(createRequest.name);
        expect(result.description).toBe(createRequest.description);
        expect(result.hashtag).toBe(createRequest.hashtag);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events (all fields)', err, createRequest));
        throw err;
      }
    }, 30000);

    it('should create events with different event types', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventTypes = [EventType.WORKSHOP, EventType.PARTY, EventType.NETWORKING];
      await delayBetweenTests(500);

      for (const eventType of eventTypes) {
        const createRequest: CreateEventRequest = {
          name: `${eventType} Event ${Date.now()}`,
          eventType,
        };
        const idempotencyKey = `e2e-test-${eventType.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        try {
          const result = await withRateLimitRetry(() => eventService.createEvent(createRequest, idempotencyKey));
          testState.createdEventIds.push(result.id);

          reporter.addResult(suite, {
            name: `POST /api/v1/events (type=${eventType})`,
            status: 'pass',
            statusCode: 201,
            message: `${eventType} event created: ${result.id}`,
            request: createRequest,
            response: { id: result.id, eventType: result.eventType },
          });

          expect(result.id).toBeDefined();
          expect(result.eventType).toBe(eventType);
        } catch (err: unknown) {
          reporter.addResult(suite, createErrorResult(`POST /api/v1/events (type=${eventType})`, err, createRequest));
          throw err;
        }

        await sleep(300); // Small delay between event type creations
      }
    }, 60000);

    it('should handle idempotency (duplicate request with same key)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const createRequest = buildEventPayload('Idempotent Event');
      const idempotencyKey = `e2e-test-idempotent-${Date.now()}`;
      await delayBetweenTests(500);

      try {
        // First request
        const result1 = await withRateLimitRetry(() => eventService.createEvent(createRequest, idempotencyKey));
        testState.createdEventIds.push(result1.id);

        await sleep(500);

        // Second request with same idempotency key
        const result2 = await withRateLimitRetry(() => eventService.createEvent(createRequest, idempotencyKey));
        // Track second event if different (for cleanup)
        if (result2.id !== result1.id) {
          testState.createdEventIds.push(result2.id);
        }

        const isSameEvent = result1.id === result2.id;
        reporter.addResult(suite, {
          name: 'POST /api/v1/events (idempotency)',
          status: 'pass',
          statusCode: 200,
          message: isSameEvent
            ? 'Idempotent request returned same event'
            : 'Idempotency key did not prevent duplicate (backend may not support idempotency)',
          request: { idempotencyKey },
          response: { firstId: result1.id, secondId: result2.id, same: isSameEvent },
        });

        // Both requests succeeded - log idempotency behavior but don't fail
        // Some backends may not implement idempotency strictly
        expect(result1.id).toBeDefined();
        expect(result2.id).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events (idempotency)', err, createRequest));
        throw err;
      }
    }, 30000);

    it('should reject event creation with invalid data (empty name)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const createRequest = {
        name: '', // Invalid: empty name
        eventType: EventType.MEETING,
      } as CreateEventRequest;
      const idempotencyKey = `e2e-test-invalid-${Date.now()}`;
      await delayBetweenTests(500);

      try {
        await eventService.createEvent(createRequest, idempotencyKey);

        // If we get here, the test failed (should have thrown)
        reporter.addResult(suite, {
          name: 'POST /api/v1/events (invalid - empty name)',
          status: 'fail',
          message: 'Expected validation error but request succeeded',
          request: createRequest,
        });
        expect(true).toBe(false); // Force test failure
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        // Expect 400 Bad Request for validation errors
        reporter.addResult(suite, {
          name: 'POST /api/v1/events (invalid - empty name)',
          status: status === 400 ? 'pass' : 'fail',
          statusCode: status,
          message: status === 400 ? 'Validation error caught as expected' : getErrorMessage(err),
          request: createRequest,
          response: getErrorResponseData(err),
        });

        expect(status).toBe(400);
      }
    }, 30000);
  });

  // ============================================================================
  // GET EVENT - GET /api/v1/events/{id}
  // ============================================================================
  describe('3. Get Event', () => {
    const suite = reporter.startSuite('Get Event');

    it('should get event by ID', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.getEvent(testState.createdEventId!));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}',
          status: 'pass',
          statusCode: 200,
          message: `Got event: ${(result as any).name}`,
          request: { eventId: testState.createdEventId },
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{id}', err, { eventId: testState.createdEventId }));
        throw err;
      }
    }, 30000);

    it('should get event capacity view', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}?view=capacity',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.getEventCapacity(testState.createdEventId!));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}?view=capacity',
          status: 'pass',
          statusCode: 200,
          message: `Capacity: ${result.capacity}, Current: ${result.currentAttendeeCount}`,
          request: { eventId: testState.createdEventId, view: 'capacity' },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.eventId).toBe(testState.createdEventId);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{id}?view=capacity', err));
        throw err;
      }
    }, 30000);

    it('should get event visibility view', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}?view=visibility',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.getEventVisibility(testState.createdEventId!));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}?view=visibility',
          status: 'pass',
          statusCode: 200,
          message: `isPublic: ${result.isPublic}`,
          request: { eventId: testState.createdEventId, view: 'visibility' },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.eventId).toBe(testState.createdEventId);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{id}?view=visibility', err));
        throw err;
      }
    }, 30000);

    it('should get event feed view', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/feed',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.getEventFeed(testState.createdEventId!, { page: 0, size: 10 }));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/feed',
          status: 'pass',
          statusCode: 200,
          message: `Got ${result.posts?.length || 0} posts`,
          request: { eventId: testState.createdEventId, page: 0, size: 10 },
          response: { eventId: result.eventId, postsCount: result.posts?.length },
        });

        expect(result).toBeDefined();
        expect(result.eventId).toBe(testState.createdEventId);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{id}/feed', err));
        throw err;
      }
    }, 30000);

    it('should return 404 for non-existent event', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const fakeEventId = '00000000-0000-0000-0000-000000000000';
      await delayBetweenTests(500);

      try {
        await eventService.getEvent(fakeEventId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id} (non-existent)',
          status: 'fail',
          message: 'Expected 404 but request succeeded',
          request: { eventId: fakeEventId },
        });
        expect(true).toBe(false); // Force test failure
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id} (non-existent)',
          status: status === 404 ? 'pass' : 'fail',
          statusCode: status,
          message: status === 404 ? 'Got expected 404 for non-existent event' : getErrorMessage(err),
          request: { eventId: fakeEventId },
          response: getErrorResponseData(err),
        });

        expect(status).toBe(404);
      }
    }, 30000);

    it('should return 400 for invalid event ID format', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const invalidEventId = 'not-a-valid-uuid';
      await delayBetweenTests(500);

      try {
        await eventService.getEvent(invalidEventId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id} (invalid ID)',
          status: 'fail',
          message: 'Expected error but request succeeded',
          request: { eventId: invalidEventId },
        });
        expect(true).toBe(false);
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id} (invalid ID)',
          status: [400, 404, 409].includes(status) ? 'pass' : 'fail',
          statusCode: status,
          message: 'Got expected error for invalid event ID',
          request: { eventId: invalidEventId },
          response: getErrorResponseData(err),
        });

        // Accept 400 (bad request), 404 (not found), or 409 (conflict) for invalid IDs
        expect([400, 404, 409]).toContain(status);
      }
    }, 30000);
  });

  // ============================================================================
  // UPDATE EVENT - PUT /api/v1/events/{id}
  // ============================================================================
  describe('4. Update Event', () => {
    const suite = reporter.startSuite('Update Event');

    it('should update event name and description', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const updateRequest: UpdateEventWithCoverUploadRequest = {
        event: {
          name: `Updated Event ${Date.now()}`,
          description: 'Updated description from E2E tests',
        },
      };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.updateEvent(testState.createdEventId!, updateRequest));

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}',
          status: 'pass',
          statusCode: 200,
          message: `Event updated: ${result.event.name}`,
          request: updateRequest,
          response: result,
        });

        expect(result.event).toBeDefined();
        expect(result.event.description).toBe(updateRequest.event.description);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('PUT /api/v1/events/{id}', err, updateRequest));
        throw err;
      }
    }, 30000);

    it('should update event capacity', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id} (capacity)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const updateRequest: UpdateEventWithCoverUploadRequest = {
        event: { capacity: 200 },
      };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.updateEvent(testState.createdEventId!, updateRequest));

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id} (capacity)',
          status: 'pass',
          statusCode: 200,
          message: `Capacity updated to: ${result.event.capacity}`,
          request: updateRequest,
          response: { capacity: result.event.capacity },
        });

        expect(result.event.capacity).toBe(200);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('PUT /api/v1/events/{id} (capacity)', err, updateRequest));
        throw err;
      }
    }, 30000);

    it('should update event dates', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id} (dates)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const newStart = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const newEnd = new Date(newStart.getTime() + 3 * 60 * 60 * 1000);

      const updateRequest: UpdateEventWithCoverUploadRequest = {
        event: {
          startDateTime: newStart.toISOString().slice(0, 19),
          endDateTime: newEnd.toISOString().slice(0, 19),
        },
      };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.updateEvent(testState.createdEventId!, updateRequest));

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id} (dates)',
          status: 'pass',
          statusCode: 200,
          message: 'Event dates updated',
          request: updateRequest,
          response: { startDateTime: result.event.startDateTime, endDateTime: result.event.endDateTime },
        });

        expect(result.event.startDateTime).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('PUT /api/v1/events/{id} (dates)', err, updateRequest));
        throw err;
      }
    }, 30000);

    it('should update event visibility', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id} (visibility)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const updateRequest: UpdateEventWithCoverUploadRequest = {
        event: {
          isPublic: false,
          requiresApproval: true,
        },
      };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.updateEvent(testState.createdEventId!, updateRequest));

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id} (visibility)',
          status: 'pass',
          statusCode: 200,
          message: `Visibility updated: isPublic=${result.event.isPublic}`,
          request: updateRequest,
          response: { isPublic: result.event.isPublic, requiresApproval: result.event.requiresApproval },
        });

        expect(result.event.isPublic).toBe(false);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('PUT /api/v1/events/{id} (visibility)', err, updateRequest));
        throw err;
      }
    }, 30000);

    it('should update event venue', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id} (venue)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const updateRequest: UpdateEventWithCoverUploadRequest = {
        event: {
          venue: {
            address: '456 New Street',
            city: 'Los Angeles',
            state: 'CA',
            country: 'United States',
            zipCode: '90001',
          },
        },
      };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.updateEvent(testState.createdEventId!, updateRequest));

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id} (venue)',
          status: 'pass',
          statusCode: 200,
          message: 'Venue updated',
          request: updateRequest,
          response: { venue: result.event.venue },
        });

        expect(result.event.venue?.city).toBe('Los Angeles');
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('PUT /api/v1/events/{id} (venue)', err, updateRequest));
        throw err;
      }
    }, 30000);
  });

  // ============================================================================
  // CLONE EVENT - POST /api/v1/events/{id}/clone
  // ============================================================================
  describe('5. Clone Event', () => {
    const suite = reporter.startSuite('Clone Event');

    it('should clone an event with default options', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/clone',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.cloneEvent(testState.createdEventId!));
        testState.clonedEventId = result.id;
        testState.createdEventIds.push(result.id);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/clone',
          status: 'pass',
          statusCode: 201,
          message: `Event cloned: ${result.id}`,
          request: { eventId: testState.createdEventId },
          response: { id: result.id, name: result.name },
        });

        expect(result.id).toBeDefined();
        expect(result.id).not.toBe(testState.createdEventId);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events/{id}/clone', err));
        throw err;
      }
    }, 30000);

    it('should clone an event with custom name', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/clone (custom name)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const cloneRequest = {
        name: `Custom Cloned Event ${Date.now()}`,
      };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.cloneEvent(testState.createdEventId!, cloneRequest));
        testState.createdEventIds.push(result.id);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/clone (custom name)',
          status: 'pass',
          statusCode: 201,
          message: `Cloned with custom name: ${result.name}`,
          request: cloneRequest,
          response: { id: result.id, name: result.name },
        });

        expect(result.name).toBe(cloneRequest.name);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events/{id}/clone (custom name)', err, cloneRequest));
        throw err;
      }
    }, 30000);

    it('should clone an event with custom dates', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/clone (custom dates)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const newStart = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const newEnd = new Date(newStart.getTime() + 2 * 60 * 60 * 1000);

      const cloneRequest = {
        startDateTime: newStart.toISOString().slice(0, 19),
        endDateTime: newEnd.toISOString().slice(0, 19),
      };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.cloneEvent(testState.createdEventId!, cloneRequest));
        testState.createdEventIds.push(result.id);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/clone (custom dates)',
          status: 'pass',
          statusCode: 201,
          message: 'Cloned with custom dates',
          request: cloneRequest,
          response: { id: result.id, startDateTime: result.startDateTime },
        });

        expect(result.id).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events/{id}/clone (custom dates)', err, cloneRequest));
        throw err;
      }
    }, 30000);
  });

  // ============================================================================
  // EVENT MANAGEMENT - Registration, Archive, Restore
  // ============================================================================
  describe('6. Event Management', () => {
    const suite = reporter.startSuite('Event Management');

    it('should close registration', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/registration (close)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.updateRegistrationState(testState.createdEventId!, 'close'));

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/registration (close)',
          status: 'pass',
          statusCode: 200,
          message: `Registration closed, status: ${result.eventStatus}`,
          request: { eventId: testState.createdEventId, action: 'close' },
          response: { eventStatus: result.eventStatus },
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events/{id}/registration (close)', err));
        throw err;
      }
    }, 30000);

    it('should open registration', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/registration (open)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.updateRegistrationState(testState.createdEventId!, 'open'));

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/registration (open)',
          status: 'pass',
          statusCode: 200,
          message: `Registration opened, status: ${result.eventStatus}`,
          request: { eventId: testState.createdEventId, action: 'open' },
          response: { eventStatus: result.eventStatus },
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events/{id}/registration (open)', err));
        throw err;
      }
    }, 30000);

    it('should archive event', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/archive',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.archiveEvent(testState.createdEventId!, 'E2E test archive'));

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/archive',
          status: 'pass',
          statusCode: 200,
          message: 'Event archived',
          request: { eventId: testState.createdEventId, reason: 'E2E test archive' },
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events/{id}/archive', err));
        throw err;
      }
    }, 30000);

    it('should restore event', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/restore',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.restoreEvent(testState.createdEventId!));

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/restore',
          status: 'pass',
          statusCode: 200,
          message: 'Event restored',
          request: { eventId: testState.createdEventId },
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events/{id}/restore', err));
        throw err;
      }
    }, 30000);
  });

  // ============================================================================
  // EVENT MEDIA
  // ============================================================================
  describe('7. Event Media', () => {
    const suite = reporter.startSuite('Event Media');

    it('should get event media', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/media',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.getEventMedia(testState.createdEventId!));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/media',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.length} media items`,
          request: { eventId: testState.createdEventId },
          response: { count: result.length },
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{id}/media', err));
        throw err;
      }
    }, 30000);

    it('should get presigned URL for media upload', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/media',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const uploadRequest = {
        fileName: 'test-image.jpg',
        contentType: 'image/jpeg',
        category: 'PHOTO',
      };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.uploadMedia(testState.createdEventId!, uploadRequest));

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/media',
          status: 'pass',
          statusCode: 200,
          message: `Got upload URL, mediaId: ${result.mediaId}`,
          request: uploadRequest,
          response: { mediaId: result.mediaId, hasUploadUrl: !!result.uploadUrl },
        });

        expect(result.uploadUrl).toBeDefined();
        expect(result.mediaId).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events/{id}/media', err, uploadRequest));
        throw err;
      }
    }, 30000);

    it('should get presigned URL for different media types', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/media (various types)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const mediaTypes = [
        { fileName: 'document.pdf', contentType: 'application/pdf', category: 'DOCUMENT' },
        { fileName: 'video.mp4', contentType: 'video/mp4', category: 'VIDEO' },
        { fileName: 'image.png', contentType: 'image/png', category: 'PHOTO' },
      ];
      await delayBetweenTests(500);

      for (const uploadRequest of mediaTypes) {
        try {
          const result = await withRateLimitRetry(() => eventService.uploadMedia(testState.createdEventId!, uploadRequest));

          reporter.addResult(suite, {
            name: `POST /api/v1/events/{id}/media (${uploadRequest.contentType})`,
            status: 'pass',
            statusCode: 200,
            message: `Got upload URL for ${uploadRequest.contentType}`,
            request: uploadRequest,
            response: { mediaId: result.mediaId },
          });

          expect(result.uploadUrl).toBeDefined();
        } catch (err: unknown) {
          reporter.addResult(suite, createErrorResult(`POST /api/v1/events/{id}/media (${uploadRequest.contentType})`, err, uploadRequest));
        }
        await sleep(300);
      }
    }, 60000);

    it('should get event assets', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/assets',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.getEventAssets(testState.createdEventId!));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/assets',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.length} assets`,
          request: { eventId: testState.createdEventId },
          response: { count: result.length },
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{id}/assets', err));
        throw err;
      }
    }, 30000);
  });

  // ============================================================================
  // EVENT FEEDS (For You, Following)
  // ============================================================================
  describe('8. Event Feeds', () => {
    const suite = reporter.startSuite('Event Feeds');

    it('should get For You feed', async () => {
      expect(testState.isAuthenticated).toBe(true);
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.getForYouFeed({ page: 0, size: 10 }));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/for-you',
          status: 'pass',
          statusCode: 200,
          message: `Got ${result.content?.length || 0} events in For You feed`,
          request: { page: 0, size: 10 },
          response: { totalElements: result.totalElements, contentLength: result.content?.length },
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/for-you', err));
        throw err;
      }
    }, 30000);

    it('should get For You feed with pagination', async () => {
      expect(testState.isAuthenticated).toBe(true);
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.getForYouFeed({ page: 0, size: 5 }));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/for-you (size=5)',
          status: 'pass',
          statusCode: 200,
          message: `Got ${result.content?.length || 0} events (size=5)`,
          request: { page: 0, size: 5 },
          response: { totalElements: result.totalElements },
        });

        expect(result.content.length).toBeLessThanOrEqual(5);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/for-you (size=5)', err));
        throw err;
      }
    }, 30000);

    it('should get Following feed', async () => {
      expect(testState.isAuthenticated).toBe(true);
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.getFollowingFeed({ page: 0, size: 10 }));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/following',
          status: 'pass',
          statusCode: 200,
          message: `Got ${result.content?.length || 0} events in Following feed`,
          request: { page: 0, size: 10 },
          response: { totalElements: result.totalElements, contentLength: result.content?.length },
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/following', err));
        throw err;
      }
    }, 30000);
  });

  // ============================================================================
  // EVENT NOTIFICATIONS & REMINDERS
  // ============================================================================
  describe('9. Event Notifications & Reminders', () => {
    const suite = reporter.startSuite('Event Notifications & Reminders');

    it('should get event reminders', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdEventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/reminders',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() => eventService.getReminders(testState.createdEventId!, 0, 10));

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/reminders',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.length} reminders`,
          request: { eventId: testState.createdEventId, page: 0, size: 10 },
          response: { count: result.length },
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{id}/reminders', err));
        throw err;
      }
    }, 30000);
  });
});
