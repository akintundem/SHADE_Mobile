/**
 * Collaboration Service E2E Tests
 *
 * Real end-to-end tests that hit the actual backend.
 * These tests authenticate with Auth0 and test all collaboration-related endpoints.
 */

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { TestReporter } from '../lib/reporter';
import { getOrCreateTestEvent, authenticateAndOnboard } from '../lib/testHelpers';
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
import { collaborationService } from '../../core/collaboration/services/collaboration';
import type { SecureUserResponse } from '../../core/auth/types/auth';
import {
  EventCollaboratorRequest,
  CreateCollaboratorInviteRequest,
  EventUserType,
} from '../../core/collaboration/types/collaboration';

// Test state - shared across tests
interface TestState {
  isAuthenticated: boolean;
  userId: string | null;
  user: SecureUserResponse | null;
  eventId: string | null;
  createdCollaboratorId: string | null;
  createdCollaboratorUserId: string | null;
}

const testState: TestState = {
  isAuthenticated: false,
  userId: null,
  user: null,
  eventId: process.env.TEST_EVENT_ID?.trim() || null,
  createdCollaboratorId: null,
  createdCollaboratorUserId: null,
};

// Initialize test reporter
const reporter = new TestReporter('Collaboration Service E2E Test Report');

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

describe('Collaboration Service E2E Tests', () => {
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

  // Generate and write report after all tests
  afterAll(() => {
    const report = reporter.generateReport();
    const reportPath = reporter.writeReport('test/reports', 'collaboration_test_report');
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
  // GET COLLABORATORS - GET /api/v1/events/{id}/collaborators
  // ============================================================================
  describe('1. Get Collaborators', () => {
    const suite = reporter.startSuite('Get Collaborators');

    it('should get collaborators for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/collaborators',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting collaborators for event: ${testState.eventId}`);

      try {
        const result = await collaborationService.getCollaborators(testState.eventId, {
          page: 0,
          size: 10,
        });

        console.log(`[Test] Found ${result.length} collaborators`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/collaborators',
          status: 'pass',
          statusCode: 200,
          message: 'Collaborators retrieved',
          request: { eventId: testState.eventId, page: 0, size: 10 },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/collaborators',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { eventId: testState.eventId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should get collaborators with a small page size', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/collaborators (size=1)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting collaborators with size=1 for event: ${testState.eventId}`);

      try {
        const result = await collaborationService.getCollaborators(testState.eventId, {
          page: 0,
          size: 1,
        });

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/collaborators (size=1)',
          status: 'pass',
          statusCode: 200,
          message: 'Collaborators retrieved with size=1',
          request: { eventId: testState.eventId, page: 0, size: 1 },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/collaborators (size=1)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { eventId: testState.eventId, page: 0, size: 1 },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // LIST MY INVITES - GET /api/v1/collaborator-invites/incoming
  // ============================================================================
  describe('2. List My Invites', () => {
    const suite = reporter.startSuite('List My Invites');

    it('should list my collaborator invites', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log(`[Test] Listing my collaborator invites`);

      try {
        const result = await collaborationService.listMyInvites();

        console.log(`[Test] Found ${result.length} invites`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/collaborator-invites/incoming',
          status: 'pass',
          statusCode: 200,
          message: 'My invites retrieved',
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/collaborator-invites/incoming',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should list my collaborator invites (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Listing my collaborator invites (repeat)');

      try {
        const result = await collaborationService.listMyInvites();

        reporter.addResult(suite, {
          name: 'GET /api/v1/collaborator-invites/incoming (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'My invites retrieved (repeat)',
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/collaborator-invites/incoming (repeat)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // ADD COLLABORATOR - POST /api/v1/events/{id}/collaborators
  // ============================================================================
  describe('3. Add Collaborator', () => {
    const suite = reporter.startSuite('Add Collaborator');

    it('should add a collaborator to an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/collaborators',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      // Need a different user ID — use TEST_USER2 if available
      const user2Id = process.env.TEST_USER2_ID?.trim() || '';
      if (!user2Id) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/collaborators',
          status: 'skip',
          message: 'TEST_USER2_ID not available — need a second user to add as collaborator',
        });
        return;
      }

      const request: EventCollaboratorRequest = {
        userId: user2Id,
        role: EventUserType.COORDINATOR,
        sendInvitation: false,
      };

      console.log(`[Test] Adding collaborator to event: ${testState.eventId}`);

      try {
        const result = await collaborationService.addCollaborator(testState.eventId, request);
        testState.createdCollaboratorId = result.collaboratorId;
        testState.createdCollaboratorUserId = user2Id;

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/collaborators',
          status: 'pass',
          statusCode: 201,
          message: 'Collaborator added',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.collaboratorId).toBeDefined();
      } catch (err: any) {
        // 409 is acceptable if collaborator already exists
        const status = err.response?.status || err.status;
        if (status === 409) {
          reporter.addResult(suite, {
            name: 'POST /api/v1/events/{id}/collaborators',
            status: 'pass',
            statusCode: 409,
            message: 'Collaborator already exists (expected for repeat runs)',
            request,
          });
        } else {
          reporter.addResult(suite, {
            name: 'POST /api/v1/events/{id}/collaborators',
            status: 'fail',
            statusCode: status,
            message: err.message,
            request,
            response: err.response?.data,
            error: err.stack,
          });
          throw err;
        }
      }
    }, 15000);
  });

  // ============================================================================
  // UPDATE COLLABORATOR - PUT /api/v1/events/{id}/collaborators/{collaboratorId}
  // ============================================================================
  describe('4. Update Collaborator', () => {
    const suite = reporter.startSuite('Update Collaborator');

    it('should update a collaborator role', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId || !testState.createdCollaboratorId || !testState.createdCollaboratorUserId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/collaborators/{collaboratorId}',
          status: 'skip',
          message: 'Event or collaborator ID not available',
        });
        return;
      }

      const request: EventCollaboratorRequest = {
        userId: testState.createdCollaboratorUserId,
        role: EventUserType.STAFF,
      };

      console.log(`[Test] Updating collaborator: ${testState.createdCollaboratorId}`);

      try {
        const result = await collaborationService.updateCollaborator(
          testState.eventId,
          testState.createdCollaboratorId,
          request
        );

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/collaborators/{collaboratorId}',
          status: 'pass',
          statusCode: 200,
          message: 'Collaborator updated',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/collaborators/{collaboratorId}',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // REMOVE COLLABORATOR - DELETE /api/v1/events/{id}/collaborators/{collaboratorId}
  // ============================================================================
  describe('5. Remove Collaborator', () => {
    const suite = reporter.startSuite('Remove Collaborator');

    it('should remove a collaborator from an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId || !testState.createdCollaboratorId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/collaborators/{collaboratorId}',
          status: 'skip',
          message: 'Event or collaborator ID not available',
        });
        return;
      }

      console.log(`[Test] Removing collaborator: ${testState.createdCollaboratorId}`);

      try {
        await collaborationService.removeCollaborator(
          testState.eventId,
          testState.createdCollaboratorId
        );

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/collaborators/{collaboratorId}',
          status: 'pass',
          statusCode: 204,
          message: 'Collaborator removed',
          request: { collaboratorId: testState.createdCollaboratorId },
        });
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/collaborators/{collaboratorId}',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // COLLABORATOR INVITES - Create, List, Revoke
  // ============================================================================
  describe('6. Collaborator Invites', () => {
    const suite = reporter.startSuite('Collaborator Invites');

    let createdInviteId: string | null = null;

    it('should create a collaborator invite', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/collaborator-invites',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const request: CreateCollaboratorInviteRequest = {
        inviteeEmail: `collab-invite-${randomSuffix}@example.com`,
        role: EventUserType.VOLUNTEER,
        message: 'E2E test collaborator invite',
      };

      console.log(`[Test] Creating collaborator invite for event: ${testState.eventId}`);

      try {
        const result = await collaborationService.createInvite(testState.eventId, request);
        createdInviteId = result.inviteId;

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/collaborator-invites',
          status: 'pass',
          statusCode: 201,
          message: 'Collaborator invite created',
          request,
          response: result,
        });

        expect(result.inviteId).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/collaborator-invites',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should list collaborator invites for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/collaborator-invites',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      console.log(`[Test] Listing collaborator invites for event: ${testState.eventId}`);

      try {
        const result = await collaborationService.listEventInvites(testState.eventId, { page: 0, size: 10 });

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/collaborator-invites',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.content?.length || 0} invites`,
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/collaborator-invites',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should revoke a collaborator invite', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId || !createdInviteId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/collaborator-invites/{inviteId}',
          status: 'skip',
          message: 'Event or invite ID not available',
        });
        return;
      }

      console.log(`[Test] Revoking collaborator invite: ${createdInviteId}`);

      try {
        await collaborationService.revokeInvite(testState.eventId, createdInviteId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/collaborator-invites/{inviteId}',
          status: 'pass',
          statusCode: 204,
          message: 'Collaborator invite revoked',
          request: { inviteId: createdInviteId },
        });
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/collaborator-invites/{inviteId}',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // ACCEPT / DECLINE INVITE - POST accept, POST decline
  // ============================================================================
  describe('7. Accept / Decline Collaborator Invite', () => {
    const suite = reporter.startSuite('Accept / Decline Collaborator Invite');

    it('should return 404 when accepting non-existent invite', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const fakeInviteId = '00000000-0000-0000-0000-000000000000';

      try {
        await collaborationService.acceptInvite(fakeInviteId);
        reporter.addResult(suite, {
          name: 'POST /api/v1/collaborator-invites/{id}/accept',
          status: 'fail',
          message: 'Expected 404 but request succeeded',
          request: { inviteId: fakeInviteId },
        });
        expect(true).toBe(false);
      } catch (err: any) {
        const status = err.response?.status ?? err.status ?? 0;
        reporter.addResult(suite, {
          name: 'POST /api/v1/collaborator-invites/{id}/accept',
          status: status === 404 ? 'pass' : 'fail',
          statusCode: status,
          message: status === 404 ? 'Expected 404 for non-existent invite' : err.message,
          request: { inviteId: fakeInviteId },
          response: err.response?.data,
        });
        expect(status).toBe(404);
      }
    }, 15000);

    it('should return 404 when declining non-existent invite', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const fakeInviteId = '00000000-0000-0000-0000-000000000000';

      try {
        await collaborationService.declineInvite(fakeInviteId);
        reporter.addResult(suite, {
          name: 'POST /api/v1/collaborator-invites/{id}/decline',
          status: 'fail',
          message: 'Expected 404 but request succeeded',
          request: { inviteId: fakeInviteId },
        });
        expect(true).toBe(false);
      } catch (err: any) {
        const status = err.response?.status ?? err.status ?? 0;
        reporter.addResult(suite, {
          name: 'POST /api/v1/collaborator-invites/{id}/decline',
          status: status === 404 ? 'pass' : 'fail',
          statusCode: status,
          message: status === 404 ? 'Expected 404 for non-existent invite' : err.message,
          request: { inviteId: fakeInviteId },
          response: err.response?.data,
        });
        expect(status).toBe(404);
      }
    }, 15000);
  });
});
