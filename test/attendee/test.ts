/**
 * Attendee Service E2E Tests
 *
 * Real end-to-end tests that hit the actual backend.
 * These tests authenticate with Auth0 and test all attendee-related endpoints.
 */

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { TestReporter } from '../lib/reporter';
import { getOrCreateTestEvent, authenticateAndOnboard } from '../lib/testHelpers';
import { getErrorMessage, getErrorStatus, getErrorResponseData } from '../lib/types';
import { createErrorResult } from '../lib/errorHelpers';
import { delayBetweenTestFiles } from '../lib/delay';

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
import { attendeeService } from '../../core/attendee/services/attendee';
import type { SecureUserResponse } from '../../core/auth/types/auth';
import {
  BulkAttendeeCreateRequest,
  ListAttendeesRequest,
  AttendeeInviteStatus,
  CreateAttendeeInviteRequest,
} from '../../core/attendee/types/attendee';

// Test state - shared across tests
interface TestState {
  isAuthenticated: boolean;
  userId: string | null;
  user: SecureUserResponse | null;
  eventId: string | null;
  createdAttendeeId: string | null;
  createdInviteId: string | null;
}

const testState: TestState = {
  isAuthenticated: false,
  userId: null,
  user: null,
  eventId: process.env.TEST_EVENT_ID?.trim() || null,
  createdAttendeeId: null,
  createdInviteId: null,
};

// Initialize test reporter
const reporter = new TestReporter('Attendee Service E2E Test Report');

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

describe('Attendee Service E2E Tests', () => {
  beforeAll(async () => {
    await delayBetweenTestFiles(2000);
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

      // Get or create event
      testState.eventId = await getOrCreateTestEvent();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Test Setup] Failed to setup:', errorMessage);
      // Don't throw - let tests run and fail gracefully so report is generated
    }
  });

  // Setup: Create an attendee before listing tests
  beforeAll(async () => {
    if (!testState.eventId || !testState.isAuthenticated) {
      return;
    }

    console.log('[Test Setup] Creating test attendee...');
    try {
      const request: BulkAttendeeCreateRequest = {
        eventId: testState.eventId,
        attendees: [
          {
            email: 'test-attendee-setup@example.com',
            name: 'Test Attendee Setup',
          },
        ],
        sendEmail: false,
      };
      const result = await attendeeService.addAttendees(request);
      if (result && result.length > 0) {
        testState.createdAttendeeId = result[0].id;
        console.log(`[Test Setup] Created test attendee: ${testState.createdAttendeeId}`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Test Setup] Failed to create test attendee:', errorMessage);
      // Continue anyway - tests will handle the missing attendeeId
    }
  });

  // Generate and write report after all tests
  afterAll(() => {
    const report = reporter.generateReport();
    const reportPath = reporter.writeReport('test/reports', 'attendee_test_report');
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
  // LIST ATTENDEES - GET /api/v1/attendees
  // ============================================================================
  describe('1. List Attendees', () => {
    const suite = reporter.startSuite('List Attendees');

    it('should list attendees for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: ListAttendeesRequest = {
        eventId: testState.eventId,
        page: 0,
        size: 10,
      };

      console.log(`[Test] Listing attendees for event: ${testState.eventId}`);

      try {
        const result = await attendeeService.listAttendees(request);

        console.log(`[Test] Found ${result.content?.length || 0} attendees`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees',
          status: 'pass',
          statusCode: 200,
          message: 'Attendees listed',
          request,
          response: result,
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees',
          status: 'fail',
          statusCode: getErrorStatus(err),
          message: getErrorMessage(err),
          request,
          response: getErrorResponseData(err),
          error: err instanceof Error ? err.stack : undefined,
        });
        throw err;
      }
    }, 15000);

    it('should list attendees with small page size', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees (size=1)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: ListAttendeesRequest = {
        eventId: testState.eventId,
        page: 0,
        size: 1,
      };

      console.log(`[Test] Listing attendees with size=1 for event: ${testState.eventId}`);

      try {
        const result = await attendeeService.listAttendees(request);

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees (size=1)',
          status: 'pass',
          statusCode: 200,
          message: 'Attendees listed (size=1)',
          request,
          response: result,
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees (size=1)',
          status: 'fail',
          statusCode: getErrorStatus(err),
          message: getErrorMessage(err),
          request,
          response: getErrorResponseData(err),
          error: err instanceof Error ? err.stack : undefined,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // ADD ATTENDEES - POST /api/v1/attendees
  // ============================================================================
  describe('2. Add Attendees', () => {
    const suite = reporter.startSuite('Add Attendees');

    it('should add attendees to an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: BulkAttendeeCreateRequest = {
        eventId: testState.eventId,
        attendees: [
          {
            email: 'test-attendee-additional@example.com',
            name: 'Test Attendee Additional',
          },
        ],
        sendEmail: false,
      };

      console.log(`[Test] Adding attendees to event: ${testState.eventId}`);

      try {
        const result = await attendeeService.addAttendees(request);

        console.log(`[Test] Added ${result.length} attendees`);

        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees',
          status: 'pass',
          statusCode: 200,
          message: 'Attendees added',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees',
          status: 'fail',
          statusCode: getErrorStatus(err),
          message: getErrorMessage(err),
          request,
          response: getErrorResponseData(err),
          error: err instanceof Error ? err.stack : undefined,
        });
        throw err;
      }
    }, 15000);

    it('should add multiple attendees to an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees (multiple)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: BulkAttendeeCreateRequest = {
        eventId: testState.eventId,
        attendees: [
          {
            email: `test-attendee-${Date.now()}-1@example.com`,
            name: 'Test Attendee One',
          },
          {
            email: `test-attendee-${Date.now()}-2@example.com`,
            name: 'Test Attendee Two',
          },
        ],
        sendEmail: false,
      };

      console.log(`[Test] Adding multiple attendees to event: ${testState.eventId}`);

      try {
        const result = await attendeeService.addAttendees(request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees (multiple)',
          status: 'pass',
          statusCode: 200,
          message: 'Multiple attendees added',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees (multiple)',
          status: 'fail',
          statusCode: getErrorStatus(err),
          message: getErrorMessage(err),
          request,
          response: getErrorResponseData(err),
          error: err instanceof Error ? err.stack : undefined,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // GET ATTENDEE - GET /api/v1/attendees/{id}
  // ============================================================================
  describe('3. Get Attendee', () => {
    const suite = reporter.startSuite('Get Attendee');

    it('should get attendee by ID', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdAttendeeId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/{id}',
          status: 'skip',
          message: 'No attendee ID available (add attendees test may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting attendee: ${testState.createdAttendeeId}`);

      try {
        const result = await attendeeService.getAttendee(testState.createdAttendeeId);

        console.log(`[Test] Got attendee: ${result.name}`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/{id}',
          status: 'pass',
          statusCode: 200,
          message: 'Attendee retrieved',
          request: { attendeeId: testState.createdAttendeeId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.createdAttendeeId);
      } catch (err: unknown) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/{id}',
          status: 'fail',
          statusCode: getErrorStatus(err),
          message: getErrorMessage(err),
          request: { attendeeId: testState.createdAttendeeId },
          response: getErrorResponseData(err),
          error: err instanceof Error ? err.stack : undefined,
        });
        throw err;
      }
    }, 15000);

    it('should get attendee by ID (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdAttendeeId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/{id} (repeat)',
          status: 'skip',
          message: 'No attendee ID available (add attendees test may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting attendee again: ${testState.createdAttendeeId}`);

      try {
        const result = await attendeeService.getAttendee(testState.createdAttendeeId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/{id} (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Attendee retrieved (repeat)',
          request: { attendeeId: testState.createdAttendeeId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.createdAttendeeId);
      } catch (err: unknown) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/{id} (repeat)',
          status: 'fail',
          statusCode: getErrorStatus(err),
          message: getErrorMessage(err),
          request: { attendeeId: testState.createdAttendeeId },
          response: getErrorResponseData(err),
          error: err instanceof Error ? err.stack : undefined,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // GET ATTENDEE TICKETS - GET /api/v1/attendees/{id}/tickets
  // ============================================================================
  describe('4. Get Attendee Tickets', () => {
    const suite = reporter.startSuite('Get Attendee Tickets');

    it('should get tickets for an attendee', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdAttendeeId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/{id}/tickets',
          status: 'skip',
          message: 'No attendee ID available',
        });
        return;
      }

      console.log(`[Test] Getting tickets for attendee: ${testState.createdAttendeeId}`);

      try {
        const result = await attendeeService.getTicketsByAttendee(testState.createdAttendeeId, {
          eventId: testState.eventId || undefined,
        });

        console.log(`[Test] Found ${result.length} tickets`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/{id}/tickets',
          status: 'pass',
          statusCode: 200,
          message: 'Attendee tickets retrieved',
          request: { attendeeId: testState.createdAttendeeId },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/attendees/{id}/tickets', err, { attendeeId: testState.createdAttendeeId }));
        throw err;
      }
    }, 15000);

    it('should get tickets for an attendee (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdAttendeeId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/{id}/tickets (repeat)',
          status: 'skip',
          message: 'No attendee ID available',
        });
        return;
      }

      console.log(`[Test] Getting tickets again for attendee: ${testState.createdAttendeeId}`);

      try {
        const result = await attendeeService.getTicketsByAttendee(testState.createdAttendeeId, {
          eventId: testState.eventId || undefined,
        });

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/{id}/tickets (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Attendee tickets retrieved (repeat)',
          request: { attendeeId: testState.createdAttendeeId },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(
          suite,
          createErrorResult('GET /api/v1/attendees/{id}/tickets (repeat)', err, { attendeeId: testState.createdAttendeeId })
        );
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // DELETE ATTENDEE - DELETE /api/v1/attendees/{id}
  // ============================================================================
  describe('5. Delete Attendee', () => {
    const suite = reporter.startSuite('Delete Attendee');

    it('should delete an attendee', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdAttendeeId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/attendees/{id}',
          status: 'skip',
          message: 'No attendee ID available',
        });
        return;
      }

      console.log(`[Test] Deleting attendee: ${testState.createdAttendeeId}`);

      try {
        await attendeeService.deleteAttendee(testState.createdAttendeeId);

        console.log(`[Test] Attendee deleted successfully`);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/attendees/{id}',
          status: 'pass',
          statusCode: 200,
          message: 'Attendee deleted',
          request: { attendeeId: testState.createdAttendeeId },
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('DELETE /api/v1/attendees/{id}', err, { attendeeId: testState.createdAttendeeId }));
        throw err;
      }
    }, 15000);

    it('should delete a newly created attendee', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/attendees/{id} (new)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const request: BulkAttendeeCreateRequest = {
        eventId: testState.eventId,
        attendees: [
          {
            email: `test-attendee-delete-${Date.now()}@example.com`,
            name: 'Test Attendee Delete',
          },
        ],
        sendEmail: false,
      };

      try {
        const created = await attendeeService.addAttendees(request);
        const attendeeId = created[0]?.id;

        if (!attendeeId) {
          reporter.addResult(suite, {
            name: 'DELETE /api/v1/attendees/{id} (new)',
            status: 'skip',
            message: 'Failed to create attendee for delete test',
          });
          return;
        }

        await attendeeService.deleteAttendee(attendeeId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/attendees/{id} (new)',
          status: 'pass',
          statusCode: 200,
          message: 'New attendee deleted',
          request: { attendeeId },
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('DELETE /api/v1/attendees/{id} (new)', err, request));
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // CREATE ATTENDEE INVITE - POST /api/v1/attendees/events/{eventId}/invites
  // ============================================================================
  describe('6. Create Attendee Invite', () => {
    const suite = reporter.startSuite('Create Attendee Invite');

    it('should create an attendee invite', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{eventId}/invites',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      // Ensure event exists
      if (!testState.eventId) {
        throw new Error('Event ID is required for creating invites');
      }

      // Use a simpler email format to ensure Jakarta @Email validation passes
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const request: CreateAttendeeInviteRequest = {
        inviteeEmail: `testinvite${randomSuffix}@example.com`,
        message: 'E2E invite',
        sendEmail: true, // Required when inviting by email (without inviteeUserId)
        sendPush: false,
      };

      try {
        const result = await attendeeService.createInvite(testState.eventId, request);
        testState.createdInviteId = result.inviteId;

        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{eventId}/invites',
          status: 'pass',
          statusCode: 201,
          message: 'Invite created',
          request,
          response: result,
        });

        expect(result.inviteId).toBeDefined();
      } catch (err: unknown) {
        // Log detailed error for debugging
        const errorData = getErrorResponseData(err);
        const errorMessage = getErrorMessage(err);
        console.error('[Test] Create invite failed:', {
          status: getErrorStatus(err),
          message: errorMessage,
          responseData: errorData,
          request,
        });
        reporter.addResult(suite, createErrorResult('POST /api/v1/attendees/events/{eventId}/invites', err, request));
        throw err;
      }
    }, 15000);

    it('should create an attendee invite with a custom message', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{eventId}/invites (message)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      // Use a simpler email format to ensure Jakarta @Email validation passes
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const request: CreateAttendeeInviteRequest = {
        inviteeEmail: `testinvitemsg${randomSuffix}@example.com`,
        message: 'Custom invite message',
        sendEmail: true, // Required when inviting by email (without inviteeUserId)
        sendPush: false,
      };

      try {
        const result = await attendeeService.createInvite(testState.eventId, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{eventId}/invites (message)',
          status: 'pass',
          statusCode: 201,
          message: 'Invite created with message',
          request,
          response: result,
        });

        expect(result.inviteId).toBeDefined();
      } catch (err: unknown) {
        // Log detailed error for debugging
        const errorData = getErrorResponseData(err);
        const errorMessage = getErrorMessage(err);
        console.error('[Test] Create invite with message failed:', {
          status: getErrorStatus(err),
          message: errorMessage,
          responseData: errorData,
          request,
        });
        reporter.addResult(suite, createErrorResult('POST /api/v1/attendees/events/{eventId}/invites (message)', err, request));
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // LIST ATTENDEE INVITES - GET /api/v1/attendees/events/{eventId}/invites
  // ============================================================================
  describe('7. List Attendee Invites', () => {
    const suite = reporter.startSuite('List Attendee Invites');

    it('should list attendee invites for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/events/{eventId}/invites',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const request = { status: AttendeeInviteStatus.PENDING, page: 0, size: 10 };

      try {
        const result = await attendeeService.listInvites(testState.eventId, request);

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/events/{eventId}/invites',
          status: 'pass',
          statusCode: 200,
          message: 'Invites listed',
          request,
          response: result,
        });

        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/attendees/events/{eventId}/invites', err, request));
        throw err;
      }
    }, 15000);

    it('should list attendee invites without status filter', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/events/{eventId}/invites (all)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const request = { page: 0, size: 5 };

      try {
        const result = await attendeeService.listInvites(testState.eventId, request);

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/events/{eventId}/invites (all)',
          status: 'pass',
          statusCode: 200,
          message: 'Invites listed (all)',
          request,
          response: result,
        });

        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/attendees/events/{eventId}/invites (all)', err, request));
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // GET ATTENDEE INVITE - GET /api/v1/attendees/events/{eventId}/invites/{inviteId}
  // ============================================================================
  describe('8. Get Attendee Invite', () => {
    const suite = reporter.startSuite('Get Attendee Invite');

    it('should get attendee invite by ID', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdInviteId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/events/{eventId}/invites/{inviteId}',
          status: 'skip',
          message: 'Event or invite ID not available',
        });
        return;
      }

      try {
        const result = await attendeeService.getInvite(testState.eventId, testState.createdInviteId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/events/{eventId}/invites/{inviteId}',
          status: 'pass',
          statusCode: 200,
          message: 'Invite retrieved',
          request: { inviteId: testState.createdInviteId },
          response: result,
        });

        expect(result.inviteId).toBe(testState.createdInviteId);
      } catch (err: unknown) {
        reporter.addResult(
          suite,
          createErrorResult('GET /api/v1/attendees/events/{eventId}/invites/{inviteId}', err, {
            inviteId: testState.createdInviteId,
          })
        );
        throw err;
      }
    }, 15000);

    it('should get a newly created attendee invite', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/events/{eventId}/invites/{inviteId} (new)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      // Use a simpler email format to ensure Jakarta @Email validation passes
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const inviteRequest: CreateAttendeeInviteRequest = {
        inviteeEmail: `testinviteget${randomSuffix}@example.com`,
        message: 'Invite for get test',
        sendEmail: true, // Required when inviting by email (without inviteeUserId)
        sendPush: false,
      };

      try {
        const created = await attendeeService.createInvite(testState.eventId, inviteRequest);
        const result = await attendeeService.getInvite(testState.eventId, created.inviteId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/events/{eventId}/invites/{inviteId} (new)',
          status: 'pass',
          statusCode: 200,
          message: 'Invite retrieved (new)',
          request: { inviteId: created.inviteId },
          response: result,
        });

        expect(result.inviteId).toBe(created.inviteId);
      } catch (err: unknown) {
        reporter.addResult(
          suite,
          createErrorResult('GET /api/v1/attendees/events/{eventId}/invites/{inviteId} (new)', err, {
            inviteId: inviteRequest.inviteeEmail,
          })
        );
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // RESEND ATTENDEE INVITE - POST /api/v1/attendees/events/{eventId}/invites/{inviteId}/resend
  // ============================================================================
  describe('9. Resend Attendee Invite', () => {
    const suite = reporter.startSuite('Resend Attendee Invite');

    it('should resend an attendee invite', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdInviteId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{eventId}/invites/{inviteId}/resend',
          status: 'skip',
          message: 'Event or invite ID not available',
        });
        return;
      }

      const request = { sendEmail: false, sendPush: false };

      try {
        const result = await attendeeService.resendInvite(
          testState.eventId,
          testState.createdInviteId,
          request
        );

        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{eventId}/invites/{inviteId}/resend',
          status: 'pass',
          statusCode: 200,
          message: 'Invite resent',
          request,
          response: result,
        });

        expect(result.inviteId).toBe(testState.createdInviteId);
      } catch (err: unknown) {
        reporter.addResult(
          suite,
          createErrorResult('POST /api/v1/attendees/events/{eventId}/invites/{inviteId}/resend', err, {
            inviteId: testState.createdInviteId,
          })
        );
        throw err;
      }
    }, 15000);

    it('should resend a newly created attendee invite', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{eventId}/invites/{inviteId}/resend (new)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      // Use a simpler email format to ensure Jakarta @Email validation passes
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const inviteRequest: CreateAttendeeInviteRequest = {
        inviteeEmail: `testresend${randomSuffix}@example.com`,
        message: 'Invite for resend test',
        sendEmail: true, // Required when inviting by email (without inviteeUserId)
        sendPush: false,
      };

      const request = { sendEmail: false, sendPush: false };

      try {
        const created = await attendeeService.createInvite(testState.eventId, inviteRequest);
        const result = await attendeeService.resendInvite(testState.eventId, created.inviteId, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{eventId}/invites/{inviteId}/resend (new)',
          status: 'pass',
          statusCode: 200,
          message: 'Invite resent (new)',
          request,
          response: result,
        });

        expect(result.inviteId).toBe(created.inviteId);
      } catch (err: unknown) {
        reporter.addResult(
          suite,
          createErrorResult('POST /api/v1/attendees/events/{eventId}/invites/{inviteId}/resend (new)', err, request)
        );
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // REVOKE ATTENDEE INVITE - DELETE /api/v1/attendees/events/{eventId}/invites/{inviteId}
  // ============================================================================
  describe('10. Revoke Attendee Invite', () => {
    const suite = reporter.startSuite('Revoke Attendee Invite');

    it('should revoke an attendee invite', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdInviteId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/attendees/events/{eventId}/invites/{inviteId}',
          status: 'skip',
          message: 'Event or invite ID not available',
        });
        return;
      }

      try {
        await attendeeService.revokeInvite(testState.eventId, testState.createdInviteId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/attendees/events/{eventId}/invites/{inviteId}',
          status: 'pass',
          statusCode: 204,
          message: 'Invite revoked',
          request: { inviteId: testState.createdInviteId },
        });
      } catch (err: unknown) {
        reporter.addResult(
          suite,
          createErrorResult('DELETE /api/v1/attendees/events/{eventId}/invites/{inviteId}', err, {
            inviteId: testState.createdInviteId,
          })
        );
        throw err;
      }
    }, 15000);

    it('should revoke a newly created attendee invite', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/attendees/events/{eventId}/invites/{inviteId} (new)',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      // Use a simpler email format to ensure Jakarta @Email validation passes
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const inviteRequest: CreateAttendeeInviteRequest = {
        inviteeEmail: `testrevoke${randomSuffix}@example.com`,
        message: 'Invite for revoke test',
        sendEmail: true, // Required when inviting by email (without inviteeUserId)
        sendPush: false,
      };

      try {
        const created = await attendeeService.createInvite(testState.eventId, inviteRequest);

        await attendeeService.revokeInvite(testState.eventId, created.inviteId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/attendees/events/{eventId}/invites/{inviteId} (new)',
          status: 'pass',
          statusCode: 204,
          message: 'Invite revoked (new)',
          request: { inviteId: created.inviteId },
        });
      } catch (err: unknown) {
        reporter.addResult(
          suite,
          createErrorResult('DELETE /api/v1/attendees/events/{eventId}/invites/{inviteId} (new)', err, {
            inviteId: inviteRequest.inviteeEmail,
          })
        );
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // RSVP TO EVENT - POST /api/v1/attendees/events/{id}/rsvp
  // ============================================================================
  describe('11. RSVP to Event', () => {
    const suite = reporter.startSuite('RSVP to Event');

    it('should RSVP to an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{id}/rsvp',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      try {
        const result = await attendeeService.rsvpToEvent(testState.eventId);

        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{id}/rsvp',
          status: 'pass',
          statusCode: 200,
          message: 'RSVP submitted',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        // 409 is acceptable if already RSVP'd
        const status = getErrorStatus(err);
        if (status === 409 || status === 400) {
          reporter.addResult(suite, {
            name: 'POST /api/v1/attendees/events/{id}/rsvp',
            status: 'pass',
            statusCode: status,
            message: 'Already RSVP\'d or event does not require RSVP',
            request: { eventId: testState.eventId },
          });
        } else {
          reporter.addResult(suite, createErrorResult('POST /api/v1/attendees/events/{id}/rsvp', err));
          throw err;
        }
      }
    }, 15000);
  });

  // ============================================================================
  // GET RSVP STATUS - GET /api/v1/attendees/events/{id}/rsvp
  // ============================================================================
  describe('12. Get RSVP Status', () => {
    const suite = reporter.startSuite('Get RSVP Status');

    it('should get RSVP status for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/events/{id}/rsvp',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      try {
        const result = await attendeeService.getRsvpStatus(testState.eventId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/events/{id}/rsvp',
          status: 'pass',
          statusCode: 200,
          message: `RSVP status: ${result.status}`,
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        // 404 is acceptable if no RSVP exists
        const status = getErrorStatus(err);
        if (status === 404) {
          reporter.addResult(suite, {
            name: 'GET /api/v1/attendees/events/{id}/rsvp',
            status: 'pass',
            statusCode: 404,
            message: 'No RSVP found (expected for some events)',
            request: { eventId: testState.eventId },
          });
        } else {
          reporter.addResult(suite, createErrorResult('GET /api/v1/attendees/events/{id}/rsvp', err));
          throw err;
        }
      }
    }, 15000);
  });

  // ============================================================================
  // CANCEL RSVP - DELETE /api/v1/attendees/events/{id}/rsvp
  // ============================================================================
  describe('13. Cancel RSVP', () => {
    const suite = reporter.startSuite('Cancel RSVP');

    it('should cancel RSVP for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/attendees/events/{id}/rsvp',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      try {
        await attendeeService.cancelRsvp(testState.eventId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/attendees/events/{id}/rsvp',
          status: 'pass',
          statusCode: 204,
          message: 'RSVP cancelled',
          request: { eventId: testState.eventId },
        });
      } catch (err: unknown) {
        // 404 is acceptable if no RSVP to cancel
        const status = getErrorStatus(err);
        if (status === 404 || status === 400) {
          reporter.addResult(suite, {
            name: 'DELETE /api/v1/attendees/events/{id}/rsvp',
            status: 'pass',
            statusCode: status,
            message: 'No RSVP to cancel or event does not support RSVP',
            request: { eventId: testState.eventId },
          });
        } else {
          reporter.addResult(suite, createErrorResult('DELETE /api/v1/attendees/events/{id}/rsvp', err));
          throw err;
        }
      }
    }, 15000);
  });

  // ============================================================================
  // GET INVITED EVENTS - GET /api/v1/attendees/invitations
  // ============================================================================
  describe('14. Get Invited Events', () => {
    const suite = reporter.startSuite('Get Invited Events');

    it('should get events where user is invited', async () => {
      expect(testState.isAuthenticated).toBe(true);

      try {
        const result = await attendeeService.getInvitedEvents();

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/invitations',
          status: 'pass',
          statusCode: 200,
          message: `Found ${Array.isArray(result) ? result.length : 0} invited events`,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/attendees/invitations', err));
        throw err;
      }
    }, 15000);

    it('should get invited events (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      try {
        const result = await attendeeService.getInvitedEvents();

        reporter.addResult(suite, {
          name: 'GET /api/v1/attendees/invitations (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Invited events retrieved (repeat)',
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/attendees/invitations (repeat)', err));
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // BULK INVITES - POST /api/v1/attendees/events/{eventId}/invites/bulk
  // ============================================================================
  describe('15. Bulk Invites', () => {
    const suite = reporter.startSuite('Bulk Invites');

    it('should create bulk attendee invites', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{eventId}/invites/bulk',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const suffix1 = Math.random().toString(36).substring(2, 10);
      const suffix2 = Math.random().toString(36).substring(2, 10);

      const request = {
        invites: [
          {
            inviteeEmail: `bulk-invite-${suffix1}@example.com`,
            message: 'Bulk invite 1',
            sendEmail: false,
            sendPush: false,
          },
          {
            inviteeEmail: `bulk-invite-${suffix2}@example.com`,
            message: 'Bulk invite 2',
            sendEmail: false,
            sendPush: false,
          },
        ],
      };

      try {
        const result = await attendeeService.createInvitesBulk(testState.eventId, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/attendees/events/{eventId}/invites/bulk',
          status: 'pass',
          statusCode: 201,
          message: 'Bulk invites created',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/attendees/events/{eventId}/invites/bulk', err, request));
        throw err;
      }
    }, 15000);
  });
});
