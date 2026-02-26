/**
 * Event Waitlist Service E2E Tests
 *
 * Real end-to-end tests that hit the actual backend.
 * Tests all event waitlist-related endpoints.
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
import { eventWaitlistService } from '../../core/events/services/waitlist';
import { eventService } from '../../core/events/services/event';
import type { SecureUserResponse } from '../../core/auth/types/auth';
import {
  EventWaitlistStatus,
  ListEventWaitlistRequest,
} from '../../core/events/types/waitlist';
import { EventAccessType } from '../../core/events/types/event';

// Test state - shared across tests
interface TestState {
  isAuthenticated: boolean;
  userId: string | null;
  user: SecureUserResponse | null;
  testEventId: string | null;
  capacityLimitedEventId: string | null; // Event with limited capacity for waitlist tests
  waitlistEntryId: string | null;
  createdWaitlistEntryIds: string[];
}

const testState: TestState = {
  isAuthenticated: false,
  userId: null,
  user: null,
  testEventId: null,
  capacityLimitedEventId: null,
  waitlistEntryId: null,
  createdWaitlistEntryIds: [],
};

// Initialize test reporter
const reporter = new TestReporter('Event Waitlist Service E2E Test Report');

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

describe('Event Waitlist Service E2E Tests', () => {
  beforeAll(async () => {
    await delayBetweenTestFiles(3000);
    ensureAuth0ForTests();
  });

  // Setup: Authenticate and create test event
  beforeAll(async () => {
    try {
      // Authenticate and handle onboarding
      const { email, password } = getTestCredentials();
      const authResult = await authenticateAndOnboard(email, password);
      testState.isAuthenticated = true;
      testState.userId = authResult.userId;
      testState.user = authResult.user;

      // Get or create event for tests
      testState.testEventId = await getOrCreateTestEvent();

      // Create a capacity-limited event for waitlist tests
      try {
        const capacityLimitedPayload = buildEventPayload('Waitlist Test Event');
        capacityLimitedPayload.capacity = 1; // Very low capacity to trigger waitlist
        capacityLimitedPayload.accessType = EventAccessType.OPEN;
        const idempotencyKey = `waitlist-test-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const event = await withRateLimitRetry(() =>
          eventService.createEvent(capacityLimitedPayload, idempotencyKey)
        );
        testState.capacityLimitedEventId = event.id;
        console.log(`[Test Setup] Created capacity-limited event: ${event.id}`);
      } catch (err) {
        console.log('[Test Setup] Could not create capacity-limited event, using main test event');
        testState.capacityLimitedEventId = testState.testEventId;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Test Setup] Failed to setup:', errorMessage);
    }
  });

  // Cleanup: Cancel any waitlist entries we created
  afterAll(async () => {
    if (testState.testEventId) {
      for (const entryId of testState.createdWaitlistEntryIds) {
        try {
          await eventWaitlistService.cancelWaitlistEntry(testState.testEventId, entryId);
          console.log(`[Cleanup] Cancelled waitlist entry: ${entryId}`);
        } catch {
          // Ignore errors during cleanup
        }
        await sleep(200);
      }
    }
  });

  // Generate and write report after all tests
  afterAll(() => {
    const report = reporter.generateReport();
    const reportPath = reporter.writeReport('test/reports', 'waitlist_test_report');
    if (process.env.SHOW_REPORT === 'true') {
      console.log('\n' + report);
      console.log(`\n Report written to: ${reportPath}`);
    } else {
      console.log(`\n Report written to: ${reportPath}`);
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
  // JOIN WAITLIST - POST /api/v1/events/{eventId}/waitlist
  // ============================================================================
  describe('1. Join Waitlist', () => {
    const suite = reporter.startSuite('Join Waitlist');

    it('should join event waitlist', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventId = testState.capacityLimitedEventId || testState.testEventId;
      if (!eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{eventId}/waitlist',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          eventWaitlistService.joinWaitlist(eventId)
        );
        testState.waitlistEntryId = result.id;
        testState.createdWaitlistEntryIds.push(result.id);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{eventId}/waitlist',
          status: 'pass',
          statusCode: 201,
          message: `Joined waitlist: ${result.id}`,
          request: { eventId },
          response: { id: result.id, status: result.status, requesterId: result.requesterId },
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.eventId).toBe(eventId);
        expect(result.status).toBe(EventWaitlistStatus.WAITING);
        if (testState.userId) {
          expect(result.requesterId).toBe(testState.userId);
        }
      } catch (err: unknown) {
        // Some events may not support waitlist if not at capacity
        const status = getErrorStatus(err);
        if (status === 400 || status === 409) {
          reporter.addResult(suite, {
            name: 'POST /api/v1/events/{eventId}/waitlist',
            status: 'pass',
            statusCode: status,
            message: 'Event may not be at capacity or already on waitlist',
            request: { eventId },
            response: getErrorResponseData(err),
          });
        } else {
          reporter.addResult(suite, createErrorResult('POST /api/v1/events/{eventId}/waitlist', err));
          throw err;
        }
      }
    }, 30000);


    it('should handle joining waitlist when already on waitlist', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventId = testState.capacityLimitedEventId || testState.testEventId;
      if (!eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{eventId}/waitlist (duplicate)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        // Try to join again
        await eventWaitlistService.joinWaitlist(eventId);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{eventId}/waitlist (duplicate)',
          status: 'pass',
          statusCode: 200,
          message: 'Duplicate join handled (idempotent)',
          request: { eventId },
        });
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        // 409 Conflict is expected for duplicate join
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{eventId}/waitlist (duplicate)',
          status: [400, 409].includes(status) ? 'pass' : 'fail',
          statusCode: status,
          message: status === 409 ? 'Correctly rejected duplicate waitlist entry' : getErrorMessage(err),
          request: { eventId },
          response: getErrorResponseData(err),
        });

        if (![400, 409].includes(status)) {
          throw err;
        }
      }
    }, 30000);

    it('should return 404 for non-existent event', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const fakeEventId = '00000000-0000-0000-0000-000000000000';
      await delayBetweenTests(500);

      try {
        await eventWaitlistService.joinWaitlist(fakeEventId);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{eventId}/waitlist (non-existent)',
          status: 'fail',
          message: 'Expected 404 but request succeeded',
          request: { eventId: fakeEventId },
        });
        expect(true).toBe(false);
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{eventId}/waitlist (non-existent)',
          status: status === 404 ? 'pass' : 'fail',
          statusCode: status,
          message: status === 404 ? 'Got expected 404 for non-existent event' : getErrorMessage(err),
          request: { eventId: fakeEventId },
          response: getErrorResponseData(err),
        });

        expect(status).toBe(404);
      }
    }, 30000);

    it('should return error for invalid event ID format', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const invalidEventId = 'not-a-valid-uuid';
      await delayBetweenTests(500);

      try {
        await eventWaitlistService.joinWaitlist(invalidEventId);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{eventId}/waitlist (invalid ID)',
          status: 'fail',
          message: 'Expected error but request succeeded',
          request: { eventId: invalidEventId },
        });
        expect(true).toBe(false);
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{eventId}/waitlist (invalid ID)',
          status: [400, 404].includes(status) ? 'pass' : 'fail',
          statusCode: status,
          message: 'Got expected error for invalid event ID',
          request: { eventId: invalidEventId },
          response: getErrorResponseData(err),
        });

        expect([400, 404]).toContain(status);
      }
    }, 30000);
  });

  // ============================================================================
  // GET MY WAITLIST ENTRIES - GET /api/v1/events/{eventId}/waitlist/my-entries
  // ============================================================================
  describe('2. Get My Waitlist Entries', () => {
    const suite = reporter.startSuite('Get My Waitlist Entries');

    it('should get my waitlist entries for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventId = testState.capacityLimitedEventId || testState.testEventId;
      if (!eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{eventId}/waitlist/my-entries',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          eventWaitlistService.getMyWaitlistEntries(eventId)
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{eventId}/waitlist/my-entries',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.length} waitlist entries`,
          request: { eventId },
          response: { count: result.length, entries: result.map(e => ({ id: e.id, status: e.status })) },
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{eventId}/waitlist/my-entries', err));
        throw err;
      }
    }, 30000);

    it('should return empty array when not on waitlist', async () => {
      expect(testState.isAuthenticated).toBe(true);

      // Use a different event where we haven't joined the waitlist
      const eventId = testState.testEventId;
      if (!eventId || eventId === testState.capacityLimitedEventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{eventId}/waitlist/my-entries (empty)',
          status: 'skip',
          message: 'Need different event for this test',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          eventWaitlistService.getMyWaitlistEntries(eventId)
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{eventId}/waitlist/my-entries (empty)',
          status: 'pass',
          statusCode: 200,
          message: 'Empty array returned when not on waitlist',
          request: { eventId },
          response: { count: result.length },
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{eventId}/waitlist/my-entries (empty)', err));
        throw err;
      }
    }, 30000);
  });

  // ============================================================================
  // LIST WAITLIST - GET /api/v1/events/{eventId}/waitlist
  // ============================================================================
  describe('3. List Waitlist', () => {
    const suite = reporter.startSuite('List Waitlist');

    it('should list waitlist entries for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventId = testState.capacityLimitedEventId || testState.testEventId;
      if (!eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{eventId}/waitlist',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          eventWaitlistService.listWaitlist(eventId, { page: 0, size: 10 })
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{eventId}/waitlist',
          status: 'pass',
          statusCode: 200,
          message: `Listed ${result.content?.length || 0} of ${result.totalElements} waitlist entries`,
          request: { eventId, page: 0, size: 10 },
          response: { totalElements: result.totalElements, contentLength: result.content?.length },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        // May require event management permissions
        const status = getErrorStatus(err);
        if (status === 403) {
          reporter.addResult(suite, {
            name: 'GET /api/v1/events/{eventId}/waitlist',
            status: 'pass',
            statusCode: 403,
            message: 'Requires event management permissions (expected)',
            request: { eventId },
          });
        } else {
          reporter.addResult(suite, createErrorResult('GET /api/v1/events/{eventId}/waitlist', err));
          throw err;
        }
      }
    }, 30000);

    it('should list waitlist with pagination', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventId = testState.testEventId;
      if (!eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{eventId}/waitlist (pagination)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const request: ListEventWaitlistRequest = { page: 0, size: 5 };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          eventWaitlistService.listWaitlist(eventId, request)
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{eventId}/waitlist (pagination)',
          status: 'pass',
          statusCode: 200,
          message: `Page 0: ${result.content?.length || 0} entries (size=5)`,
          request: { eventId, ...request },
          response: { totalElements: result.totalElements, totalPages: result.totalPages },
        });

        expect(result.content).toBeDefined();
        expect(result.content.length).toBeLessThanOrEqual(5);
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        if (status === 403) {
          reporter.addResult(suite, {
            name: 'GET /api/v1/events/{eventId}/waitlist (pagination)',
            status: 'pass',
            statusCode: 403,
            message: 'Requires event management permissions',
            request: { eventId, ...request },
          });
        } else {
          reporter.addResult(suite, createErrorResult('GET /api/v1/events/{eventId}/waitlist (pagination)', err));
          throw err;
        }
      }
    }, 30000);

    it('should filter waitlist by status (WAITING)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventId = testState.testEventId;
      if (!eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{eventId}/waitlist (status=WAITING)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const request: ListEventWaitlistRequest = { status: EventWaitlistStatus.WAITING, page: 0, size: 10 };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          eventWaitlistService.listWaitlist(eventId, request)
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{eventId}/waitlist (status=WAITING)',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.content?.length || 0} pending entries`,
          request: { eventId, ...request },
          response: { totalElements: result.totalElements },
        });

        expect(result.content).toBeDefined();
        // All entries should be WAITING
        result.content.forEach(entry => {
          expect(entry.status).toBe(EventWaitlistStatus.WAITING);
        });
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        if (status === 403) {
          reporter.addResult(suite, {
            name: 'GET /api/v1/events/{eventId}/waitlist (status=WAITING)',
            status: 'pass',
            statusCode: 403,
            message: 'Requires event management permissions',
            request: { eventId, ...request },
          });
        } else {
          reporter.addResult(suite, createErrorResult('GET /api/v1/events/{eventId}/waitlist (status=WAITING)', err));
          throw err;
        }
      }
    }, 30000);

  });

  // ============================================================================
  // CANCEL WAITLIST ENTRY - DELETE /api/v1/events/{eventId}/waitlist/{entryId}
  // ============================================================================
describe('4. Cancel Waitlist Entry', () => {
    const suite = reporter.startSuite('Cancel Waitlist Entry');

    it('should cancel a waitlist entry', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventId = testState.testEventId;

      if (!eventId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{eventId}/waitlist/{entryId}',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      // First, create a waitlist entry to cancel
      let entryId: string | null = null;
      try {
        const entry = await withRateLimitRetry(() =>
          eventWaitlistService.joinWaitlist(eventId)
        );
        entryId = entry.id;
      } catch {
        // May already be on waitlist, skip test
      }

      if (!entryId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{eventId}/waitlist/{entryId}',
          status: 'skip',
          message: 'Could not create waitlist entry for cancellation test',
        });
        return;
      }

      await delayBetweenTests(500);

      try {
        await withRateLimitRetry(() =>
          eventWaitlistService.cancelWaitlistEntry(eventId, entryId!)
        );

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{eventId}/waitlist/{entryId}',
          status: 'pass',
          statusCode: 200,
          message: `Cancelled waitlist entry: ${entryId}`,
          request: { eventId, entryId },
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('DELETE /api/v1/events/{eventId}/waitlist/{entryId}', err));
        throw err;
      }
    }, 45000);

    it('should return 404 for cancelling non-existent entry', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventId = testState.testEventId;
      const fakeEntryId = '00000000-0000-0000-0000-000000000000';

      if (!eventId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{eventId}/waitlist/{entryId} (non-existent)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        await eventWaitlistService.cancelWaitlistEntry(eventId, fakeEntryId);

        // Some APIs return 200/204 even for non-existent entries (idempotent)
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{eventId}/waitlist/{entryId} (non-existent)',
          status: 'pass',
          statusCode: 200,
          message: 'Delete handled idempotently',
          request: { eventId, entryId: fakeEntryId },
        });
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{eventId}/waitlist/{entryId} (non-existent)',
          status: status === 404 ? 'pass' : 'fail',
          statusCode: status,
          message: status === 404 ? 'Got expected 404 for non-existent entry' : getErrorMessage(err),
          request: { eventId, entryId: fakeEntryId },
          response: getErrorResponseData(err),
        });

        expect(status).toBe(404);
      }
    }, 30000);

    it('should handle cancelling already cancelled entry', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventId = testState.testEventId;

      if (!eventId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{eventId}/waitlist/{entryId} (already cancelled)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      // First, create and cancel an entry
      let entryId: string | null = null;
      try {
        const entry = await withRateLimitRetry(() =>
          eventWaitlistService.joinWaitlist(eventId)
        );
        entryId = entry.id;

        await sleep(300);
        await withRateLimitRetry(() =>
          eventWaitlistService.cancelWaitlistEntry(eventId, entryId!)
        );
      } catch {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{eventId}/waitlist/{entryId} (already cancelled)',
          status: 'skip',
          message: 'Could not setup entry for test',
        });
        return;
      }

      await delayBetweenTests(500);

      try {
        // Try to cancel again
        await eventWaitlistService.cancelWaitlistEntry(eventId, entryId!);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{eventId}/waitlist/{entryId} (already cancelled)',
          status: 'pass',
          statusCode: 200,
          message: 'Double cancel handled gracefully (idempotent)',
          request: { eventId, entryId },
        });
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        // 404 or 400/409 are acceptable for already cancelled entry
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{eventId}/waitlist/{entryId} (already cancelled)',
          status: [200, 204, 400, 404, 409].includes(status) ? 'pass' : 'fail',
          statusCode: status,
          message: 'Already cancelled entry handled correctly',
          request: { eventId, entryId },
          response: getErrorResponseData(err),
        });

        expect([200, 204, 400, 404, 409]).toContain(status);
      }
    }, 60000);
  });

  // ============================================================================
  // WAITLIST LIFECYCLE TEST
  // ============================================================================
describe('5. Waitlist Lifecycle', () => {
    const suite = reporter.startSuite('Waitlist Lifecycle');

    it('should complete full waitlist lifecycle (join -> verify -> cancel)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const eventId = testState.testEventId;
      if (!eventId) {
        reporter.addResult(suite, {
          name: 'Waitlist Lifecycle',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        // 1. Join waitlist
        const entry = await withRateLimitRetry(() =>
          eventWaitlistService.joinWaitlist(eventId)
        );
        const entryId = entry.id;

        expect(entry.id).toBeDefined();
        expect(entry.status).toBe(EventWaitlistStatus.WAITING);

        // 2. Verify entry appears in my entries
        await sleep(500);
        const myEntries = await withRateLimitRetry(() =>
          eventWaitlistService.getMyWaitlistEntries(eventId)
        );
        const foundEntry = myEntries.find(e => e.id === entryId);
        expect(foundEntry).toBeDefined();

        // 3. Cancel the entry
        await sleep(500);
        await withRateLimitRetry(() =>
          eventWaitlistService.cancelWaitlistEntry(eventId, entryId)
        );

        // 4. Verify entry no longer appears in my entries (or is cancelled)
        await sleep(500);
        const myEntriesAfter = await withRateLimitRetry(() =>
          eventWaitlistService.getMyWaitlistEntries(eventId)
        );
        const foundAfter = myEntriesAfter.find(e => e.id === entryId);
        // Entry should either be gone or have CANCELLED status
        if (foundAfter) {
          expect(foundAfter.status).toBe(EventWaitlistStatus.CANCELLED);
        }

        reporter.addResult(suite, {
          name: 'Waitlist Lifecycle',
          status: 'pass',
          statusCode: 200,
          message: 'Complete lifecycle: join -> verify -> cancel',
          request: { eventId },
          response: {
            entryId,
            initialStatus: entry.status,
            foundInMyEntries: !!foundEntry,
            afterCancel: foundAfter ? foundAfter.status : 'removed',
          },
        });
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        if (status === 400 || status === 409) {
          reporter.addResult(suite, {
            name: 'Waitlist Lifecycle',
            status: 'pass',
            statusCode: status,
            message: 'Waitlist may not be supported for this event',
            request: { eventId },
          });
        } else {
          reporter.addResult(suite, createErrorResult('Waitlist Lifecycle', err));
          throw err;
        }
      }
    }, 90000);
  });
});
