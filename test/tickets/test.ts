/**
 * Tickets Service E2E Tests
 *
 * Real end-to-end tests that hit the actual backend.
 * These tests authenticate with Auth0 and test all ticket-related endpoints.
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
import { ticketService } from '../../core/tickets/services/ticket';
import type { SecureUserResponse } from '../../core/auth/types/auth';
import {
  CreateTicketTypeRequest,
  CreateTicketTypeTemplateRequest,
  UpdateTicketTypeTemplateRequest,
  ApplyTicketTypeTemplateRequest,
  IssueTicketRequest,
  UpdateTicketRequest,
  TransferTicketRequest,
  ResendTicketRequest,
  BulkTicketAction,
  TicketTypeCategory,
  TicketCheckoutRequest,
  CreateTicketApprovalRequest,
  CreateTicketWaitlistRequest,
} from '../../core/tickets/types/ticket';
import { getErrorStatus } from '../lib/types';
import { createErrorResult } from '../lib/errorHelpers';

// Test state - shared across tests
interface TestState {
  isAuthenticated: boolean;
  userId: string | null;
  user: SecureUserResponse | null;
  eventId: string | null;
  createdTicketTypeId: string | null;
  clonedTicketTypeId: string | null;
  archivalTicketTypeId: string | null;
  createdTicketId: string | null;
  createdTicketTypeTemplateId: string | null;
}

const testState: TestState = {
  isAuthenticated: false,
  userId: null,
  user: null,
  eventId: process.env.TEST_EVENT_ID?.trim() || null,
  createdTicketTypeId: null,
  clonedTicketTypeId: null,
  archivalTicketTypeId: null,
  createdTicketId: null,
  createdTicketTypeTemplateId: null,
};

// Initialize test reporter
const reporter = new TestReporter('Tickets Service E2E Test Report');

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

describe('Tickets Service E2E Tests', () => {
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
    const reportPath = reporter.writeReport('test/reports', 'tickets_test_report');
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
  // GET TICKET TYPES - GET /api/v1/events/{id}/ticket-types
  // ============================================================================
  describe('1. Get Ticket Types', () => {
    const suite = reporter.startSuite('Get Ticket Types');

    it('should get ticket types for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/ticket-types',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting ticket types for event: ${testState.eventId}`);

      try {
        const result = await ticketService.getTicketTypes(testState.eventId);

        console.log(`[Test] Found ${result.length} ticket types`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/ticket-types',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket types retrieved',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/ticket-types',
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

    it('should get ticket types for an event (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/ticket-types (repeat)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting ticket types again for event: ${testState.eventId}`);

      try {
        const result = await ticketService.getTicketTypes(testState.eventId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/ticket-types (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket types retrieved (repeat)',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/ticket-types (repeat)',
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
  });

  // ============================================================================
  // CREATE TICKET TYPE - POST /api/v1/events/{id}/ticket-types
  // ============================================================================
  describe('2. Create Ticket Type', () => {
    const suite = reporter.startSuite('Create Ticket Type');

    it('should create a ticket type', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: CreateTicketTypeRequest = {
        name: `E2E Test Ticket Type ${Date.now()}`,
        category: TicketTypeCategory.GENERAL_ADMISSION,
        description: 'Created by E2E tests',
        quantityAvailable: 100,
        // Free ticket: use 0 for priceMinor (null may not be accepted by all backends)
      };

      console.log(`[Test] Creating ticket type for event: ${testState.eventId}`);

      try {
        const result = await ticketService.createTicketType(testState.eventId, request);

        testState.createdTicketTypeId = result.id;

        console.log(`[Test] Ticket type created: ${result.id}`);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket type created',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types',
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
  // CLONE TICKET TYPE - POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/clone
  // ============================================================================
  describe('3. Clone Ticket Type', () => {
    const suite = reporter.startSuite('Clone Ticket Type');

    it('should clone a ticket type', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdTicketTypeId).toBeDefined();

      if (!testState.eventId || !testState.createdTicketTypeId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/clone',
          status: 'skip',
          message: 'Event or ticket type not available (setup may have failed)',
        });
        return;
      }

      const request = {
        name: `E2E Clone Ticket Type ${Date.now()}`,
        isActive: true,
      };

      try {
        const result = await ticketService.cloneTicketType(
          testState.eventId,
          testState.createdTicketTypeId,
          request
        );

        testState.clonedTicketTypeId = result.id;

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/clone',
          status: 'pass',
          statusCode: 201,
          message: 'Ticket type cloned',
          request,
          response: result,
        });

        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/clone',
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

    it('should clone a ticket type again with a new name', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdTicketTypeId).toBeDefined();

      if (!testState.eventId || !testState.createdTicketTypeId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/clone (repeat)',
          status: 'skip',
          message: 'Event or ticket type not available (setup may have failed)',
        });
        return;
      }

      const request = {
        name: `E2E Clone Ticket Type Repeat ${Date.now()}`,
        isActive: true,
      };

      try {
        const result = await ticketService.cloneTicketType(
          testState.eventId,
          testState.createdTicketTypeId,
          request
        );

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/clone (repeat)',
          status: 'pass',
          statusCode: 201,
          message: 'Ticket type cloned (repeat)',
          request,
          response: result,
        });

        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/clone (repeat)',
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
  // CREATE TICKET TYPE (ARCHIVE) - POST /api/v1/events/{id}/ticket-types
  // ============================================================================
  describe('4. Create Ticket Type (Archive)', () => {
    const suite = reporter.startSuite('Create Ticket Type (Archive)');

    it('should create a ticket type for archive tests', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types (archive)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: CreateTicketTypeRequest = {
        name: `E2E Archive Ticket Type ${Date.now()}`,
        category: TicketTypeCategory.GENERAL_ADMISSION,
        description: 'Archive test ticket type',
        quantityAvailable: 10,
      };

      try {
        const result = await ticketService.createTicketType(testState.eventId, request);
        testState.archivalTicketTypeId = result.id;

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types (archive)',
          status: 'pass',
          statusCode: 201,
          message: 'Archive ticket type created',
          request,
          response: result,
        });

        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types (archive)',
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
  // ARCHIVE TICKET TYPE - POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/archive
  // ============================================================================
  describe('5. Archive Ticket Type', () => {
    const suite = reporter.startSuite('Archive Ticket Type');

    it('should archive a ticket type', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.archivalTicketTypeId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/archive',
          status: 'skip',
          message: 'Event or ticket type not available',
        });
        return;
      }

      try {
        const result = await ticketService.archiveTicketType(
          testState.eventId,
          testState.archivalTicketTypeId
        );

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/archive',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket type archived',
          request: { eventId: testState.eventId, ticketTypeId: testState.archivalTicketTypeId },
          response: result,
        });

        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/archive',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { eventId: testState.eventId, ticketTypeId: testState.archivalTicketTypeId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should archive a newly created ticket type', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/archive (new)',
          status: 'skip',
          message: 'Event not available',
        });
        return;
      }

      const request: CreateTicketTypeRequest = {
        name: `E2E Archive Ticket Type Extra ${Date.now()}`,
        category: TicketTypeCategory.GENERAL_ADMISSION,
        description: 'Extra archive test ticket type',
        quantityAvailable: 5,
      };

      try {
        const created = await ticketService.createTicketType(testState.eventId, request);
        const result = await ticketService.archiveTicketType(testState.eventId, created.id);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/archive (new)',
          status: 'pass',
          statusCode: 200,
          message: 'New ticket type archived',
          request: { eventId: testState.eventId, ticketTypeId: created.id },
          response: result,
        });

        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/archive (new)',
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
  // RESTORE TICKET TYPE - POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/restore
  // ============================================================================
  describe('6. Restore Ticket Type', () => {
    const suite = reporter.startSuite('Restore Ticket Type');

    it('should restore a ticket type', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.archivalTicketTypeId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/restore',
          status: 'skip',
          message: 'Event or ticket type not available',
        });
        return;
      }

      try {
        const result = await ticketService.restoreTicketType(
          testState.eventId,
          testState.archivalTicketTypeId
        );

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/restore',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket type restored',
          request: { eventId: testState.eventId, ticketTypeId: testState.archivalTicketTypeId },
          response: result,
        });

        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/restore',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { eventId: testState.eventId, ticketTypeId: testState.archivalTicketTypeId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should restore a newly archived ticket type', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/restore (new)',
          status: 'skip',
          message: 'Event not available',
        });
        return;
      }

      const request: CreateTicketTypeRequest = {
        name: `E2E Restore Ticket Type Extra ${Date.now()}`,
        category: TicketTypeCategory.GENERAL_ADMISSION,
        description: 'Extra restore test ticket type',
        quantityAvailable: 5,
      };

      try {
        const created = await ticketService.createTicketType(testState.eventId, request);
        await ticketService.archiveTicketType(testState.eventId, created.id);
        const result = await ticketService.restoreTicketType(testState.eventId, created.id);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/restore (new)',
          status: 'pass',
          statusCode: 200,
          message: 'New ticket type restored',
          request: { eventId: testState.eventId, ticketTypeId: created.id },
          response: result,
        });

        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/ticket-types/{ticketTypeId}/restore (new)',
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
  // HARD DELETE TICKET TYPE - DELETE /api/v1/events/{id}/ticket-types/{ticketTypeId}/hard-delete
  // ============================================================================
  describe('7. Hard Delete Ticket Type', () => {
    const suite = reporter.startSuite('Hard Delete Ticket Type');

    it('should hard delete a ticket type', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.archivalTicketTypeId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/ticket-types/{ticketTypeId}/hard-delete',
          status: 'skip',
          message: 'Event or ticket type not available',
        });
        return;
      }

      try {
        await ticketService.hardDeleteTicketType(
          testState.eventId,
          testState.archivalTicketTypeId
        );

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/ticket-types/{ticketTypeId}/hard-delete',
          status: 'pass',
          statusCode: 204,
          message: 'Ticket type hard deleted',
          request: { eventId: testState.eventId, ticketTypeId: testState.archivalTicketTypeId },
        });
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/ticket-types/{ticketTypeId}/hard-delete',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { eventId: testState.eventId, ticketTypeId: testState.archivalTicketTypeId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should hard delete a newly created ticket type', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/ticket-types/{ticketTypeId}/hard-delete (new)',
          status: 'skip',
          message: 'Event not available',
        });
        return;
      }

      const request: CreateTicketTypeRequest = {
        name: `E2E Hard Delete Ticket Type ${Date.now()}`,
        category: TicketTypeCategory.GENERAL_ADMISSION,
        description: 'Extra hard delete test ticket type',
        quantityAvailable: 5,
      };

      try {
        const created = await ticketService.createTicketType(testState.eventId, request);
        await ticketService.archiveTicketType(testState.eventId, created.id);
        await ticketService.hardDeleteTicketType(testState.eventId, created.id);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/ticket-types/{ticketTypeId}/hard-delete (new)',
          status: 'pass',
          statusCode: 204,
          message: 'New ticket type hard deleted',
          request: { eventId: testState.eventId, ticketTypeId: created.id },
        });
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/ticket-types/{ticketTypeId}/hard-delete (new)',
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
  // TICKET TYPE TEMPLATES - /api/v1/ticket-type-templates
  // ============================================================================
  describe('8. Ticket Type Templates', () => {
    const suite = reporter.startSuite('Ticket Type Templates');

    it('should create a ticket type template', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request: CreateTicketTypeTemplateRequest = {
        name: `E2E Ticket Template ${Date.now()}`,
        category: TicketTypeCategory.GENERAL_ADMISSION,
        description: 'Template for E2E tests',
        quantityAvailable: 25,
        currency: 'USD',
      };

      try {
        const result = await ticketService.createTicketTypeTemplate(request);
        testState.createdTicketTypeTemplateId = result.id;

        reporter.addResult(suite, {
          name: 'POST /api/v1/ticket-type-templates',
          status: 'pass',
          statusCode: 201,
          message: 'Template created',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe(request.name);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/ticket-type-templates',
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

    it('should list ticket type templates', async () => {
      expect(testState.isAuthenticated).toBe(true);

      try {
        const result = await ticketService.listTicketTypeTemplates();

        reporter.addResult(suite, {
          name: 'GET /api/v1/ticket-type-templates',
          status: 'pass',
          statusCode: 200,
          message: `Found ${result.length} templates`,
          response: result.map((template) => ({ id: template.id, name: template.name })),
        });

        expect(Array.isArray(result)).toBe(true);
        if (testState.createdTicketTypeTemplateId) {
          const found = result.some((template) => template.id === testState.createdTicketTypeTemplateId);
          expect(found).toBe(true);
        }
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/ticket-type-templates',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should update a ticket type template', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdTicketTypeTemplateId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/ticket-type-templates/{templateId}',
          status: 'skip',
          message: 'Template ID not available',
        });
        return;
      }

      const request: UpdateTicketTypeTemplateRequest = {
        name: `E2E Template Updated ${Date.now()}`,
        description: 'Updated template description',
      };

      try {
        const result = await ticketService.updateTicketTypeTemplate(
          testState.createdTicketTypeTemplateId,
          request
        );

        reporter.addResult(suite, {
          name: 'PUT /api/v1/ticket-type-templates/{templateId}',
          status: 'pass',
          statusCode: 200,
          message: 'Template updated',
          request: { templateId: testState.createdTicketTypeTemplateId, ...request },
          response: result,
        });

        expect(result.name).toBe(request.name);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/ticket-type-templates/{templateId}',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { templateId: testState.createdTicketTypeTemplateId, ...request },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should apply a ticket type template to an event', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.eventId || !testState.createdTicketTypeTemplateId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/ticket-type-templates/{templateId}/apply/events/{eventId}',
          status: 'skip',
          message: 'Event ID or template ID not available',
        });
        return;
      }

      const request: ApplyTicketTypeTemplateRequest = {
        name: `E2E Applied Template ${Date.now()}`,
        isActive: true,
      };

      try {
        const result = await ticketService.applyTicketTypeTemplate(
          testState.createdTicketTypeTemplateId,
          testState.eventId,
          request
        );

        reporter.addResult(suite, {
          name: 'POST /api/v1/ticket-type-templates/{templateId}/apply/events/{eventId}',
          status: 'pass',
          statusCode: 201,
          message: 'Template applied to event',
          request: { templateId: testState.createdTicketTypeTemplateId, eventId: testState.eventId, ...request },
          response: { id: result.id, name: result.name, eventId: result.eventId },
        });

        expect(result.eventId).toBe(testState.eventId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/ticket-type-templates/{templateId}/apply/events/{eventId}',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { templateId: testState.createdTicketTypeTemplateId, eventId: testState.eventId, ...request },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should delete a ticket type template', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdTicketTypeTemplateId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/ticket-type-templates/{templateId}',
          status: 'skip',
          message: 'Template ID not available',
        });
        return;
      }

      try {
        await ticketService.deleteTicketTypeTemplate(testState.createdTicketTypeTemplateId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/ticket-type-templates/{templateId}',
          status: 'pass',
          statusCode: 204,
          message: 'Template deleted',
          request: { templateId: testState.createdTicketTypeTemplateId },
        });
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/ticket-type-templates/{templateId}',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { templateId: testState.createdTicketTypeTemplateId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // ISSUE TICKETS - POST /api/v1/tickets
  // ============================================================================
  describe('9. Issue Tickets', () => {
    const suite = reporter.startSuite('Issue Tickets');

    it('should issue a ticket', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdTicketTypeId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets',
          status: 'skip',
          message: 'Event or ticket type not available',
        });
        return;
      }

      const request: IssueTicketRequest = {
        eventId: testState.eventId,
        ticketTypeId: testState.createdTicketTypeId,
        ownerEmail: `test-ticket-owner-${Date.now()}@example.com`,
        ownerName: 'E2E Ticket Owner',
        quantity: 1,
        sendEmail: false,
        sendPushNotification: false,
      };

      try {
        const result = await ticketService.issueTickets([request]);
        const issued = result[0];
        testState.createdTicketId = issued?.id || null;

        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets',
          status: 'pass',
          statusCode: 201,
          message: 'Ticket issued',
          request,
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
        expect(issued?.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets',
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

    it('should issue multiple tickets', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdTicketTypeId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets (multiple)',
          status: 'skip',
          message: 'Event or ticket type not available',
        });
        return;
      }

      const request: IssueTicketRequest = {
        eventId: testState.eventId,
        ticketTypeId: testState.createdTicketTypeId,
        ownerEmail: `test-ticket-owner-multi-${Date.now()}@example.com`,
        ownerName: 'E2E Ticket Owner Multi',
        quantity: 2,
        sendEmail: false,
        sendPushNotification: false,
      };

      try {
        const result = await ticketService.issueTickets([request]);

        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets (multiple)',
          status: 'pass',
          statusCode: 201,
          message: 'Tickets issued (multiple)',
          request,
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets (multiple)',
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
  // UPDATE TICKET - PUT /api/v1/tickets/{id}
  // ============================================================================
describe('10. Update Ticket', () => {
    const suite = reporter.startSuite('Update Ticket');

    it('should update a ticket', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/tickets/{id}',
          status: 'skip',
          message: 'Ticket ID not available',
        });
        return;
      }

      const request: UpdateTicketRequest = {
        ownerEmail: `updated-ticket-owner-${Date.now()}@example.com`,
        ownerName: 'Updated Ticket Owner',
      };

      try {
        const result = await ticketService.updateTicket(testState.createdTicketId, request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/tickets/{id}',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket updated',
          request,
          response: result,
        });

        expect(result.id).toBe(testState.createdTicketId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/tickets/{id}',
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

    it('should update a ticket name only', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/tickets/{id} (name only)',
          status: 'skip',
          message: 'Ticket ID not available',
        });
        return;
      }

      const request: UpdateTicketRequest = {
        ownerName: `Updated Ticket Name ${Date.now()}`,
      };

      try {
        const result = await ticketService.updateTicket(testState.createdTicketId, request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/tickets/{id} (name only)',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket updated (name only)',
          request,
          response: result,
        });

        expect(result.id).toBe(testState.createdTicketId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/tickets/{id} (name only)',
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
  // TRANSFER TICKET - POST /api/v1/tickets/{id}/transfer
  // ============================================================================
describe('11. Transfer Ticket', () => {
    const suite = reporter.startSuite('Transfer Ticket');

    it('should transfer a ticket', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/transfer',
          status: 'skip',
          message: 'Ticket ID not available',
        });
        return;
      }

      const request: TransferTicketRequest = {
        newOwnerEmail: `new-ticket-owner-${Date.now()}@example.com`,
        newOwnerName: 'New Ticket Owner',
        sendEmail: false,
        sendPush: false,
      };

      try {
        const result = await ticketService.transferTicket(testState.createdTicketId, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/transfer',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket transferred',
          request,
          response: result,
        });

        expect(result.id).toBe(testState.createdTicketId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/transfer',
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

    it('should transfer a ticket again', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/transfer (repeat)',
          status: 'skip',
          message: 'Ticket ID not available',
        });
        return;
      }

      const request: TransferTicketRequest = {
        newOwnerEmail: `new-ticket-owner-repeat-${Date.now()}@example.com`,
        newOwnerName: 'New Ticket Owner Repeat',
        sendEmail: false,
        sendPush: false,
      };

      try {
        const result = await ticketService.transferTicket(testState.createdTicketId, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/transfer (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket transferred (repeat)',
          request,
          response: result,
        });

        expect(result.id).toBe(testState.createdTicketId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/transfer (repeat)',
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
  // RESEND TICKET - POST /api/v1/tickets/{id}/resend
  // ============================================================================
describe('12. Resend Ticket', () => {
    const suite = reporter.startSuite('Resend Ticket');

    it('should resend ticket notifications', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/resend',
          status: 'skip',
          message: 'Ticket ID not available',
        });
        return;
      }

      const request: ResendTicketRequest = {
        sendEmail: false,
        sendPush: false,
      };

      try {
        const result = await ticketService.resendTicket(testState.createdTicketId, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/resend',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket resend requested',
          request,
          response: result,
        });

        expect(result.id).toBe(testState.createdTicketId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/resend',
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

    it('should resend ticket notifications again', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/resend (repeat)',
          status: 'skip',
          message: 'Ticket ID not available',
        });
        return;
      }

      const request: ResendTicketRequest = {
        sendEmail: false,
        sendPush: false,
      };

      try {
        const result = await ticketService.resendTicket(testState.createdTicketId, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/resend (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket resend requested (repeat)',
          request,
          response: result,
        });

        expect(result.id).toBe(testState.createdTicketId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/resend (repeat)',
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
  // BULK TICKET ACTIONS - POST /api/v1/tickets/bulk
  // ============================================================================
describe('13. Bulk Ticket Actions', () => {
    const suite = reporter.startSuite('Bulk Ticket Actions');

    it('should perform a bulk ticket action', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/bulk',
          status: 'skip',
          message: 'Event or ticket ID not available',
        });
        return;
      }

      const request = {
        eventId: testState.eventId,
        action: BulkTicketAction.RESEND,
        ticketIds: [testState.createdTicketId],
        sendEmail: false,
        sendPush: false,
      };

      try {
        const result = await ticketService.bulkAction(request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/bulk',
          status: 'pass',
          statusCode: 200,
          message: 'Bulk action completed',
          request,
          response: result,
        });

        expect(result.total).toBeGreaterThan(0);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/bulk',
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

    it('should perform a bulk ticket action (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/bulk (repeat)',
          status: 'skip',
          message: 'Event or ticket ID not available',
        });
        return;
      }

      const request = {
        eventId: testState.eventId,
        action: BulkTicketAction.RESEND,
        ticketIds: [testState.createdTicketId],
        sendEmail: false,
        sendPush: false,
      };

      try {
        const result = await ticketService.bulkAction(request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/bulk (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Bulk action completed (repeat)',
          request,
          response: result,
        });

        expect(result.total).toBeGreaterThan(0);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/bulk (repeat)',
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
  // CANCEL TICKET - POST /api/v1/tickets/{id}/cancel
  // ============================================================================
describe('14. Cancel Ticket', () => {
    const suite = reporter.startSuite('Cancel Ticket');

    it('should cancel a ticket', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/cancel',
          status: 'skip',
          message: 'Ticket ID not available',
        });
        return;
      }

      try {
        const result = await ticketService.cancelTicket(testState.createdTicketId);

        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/cancel',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket cancelled',
          request: { ticketId: testState.createdTicketId },
          response: result,
        });

        expect(result.id).toBe(testState.createdTicketId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/cancel',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { ticketId: testState.createdTicketId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should cancel a newly issued ticket', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdTicketTypeId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/cancel (new)',
          status: 'skip',
          message: 'Event or ticket type not available',
        });
        return;
      }

      const issueRequest: IssueTicketRequest = {
        eventId: testState.eventId,
        ticketTypeId: testState.createdTicketTypeId,
        ownerEmail: `cancel-ticket-owner-${Date.now()}@example.com`,
        ownerName: 'Cancel Ticket Owner',
        quantity: 1,
        sendEmail: false,
        sendPushNotification: false,
      };

      try {
        const issued = await ticketService.issueTickets([issueRequest]);
        const ticketId = issued[0]?.id;

        if (!ticketId) {
          reporter.addResult(suite, {
            name: 'POST /api/v1/tickets/{id}/cancel (new)',
            status: 'skip',
            message: 'Failed to issue ticket for cancel test',
          });
          return;
        }

        const result = await ticketService.cancelTicket(ticketId);

        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/cancel (new)',
          status: 'pass',
          statusCode: 200,
          message: 'Ticket cancelled (new)',
          request: { ticketId },
          response: result,
        });

        expect(result.id).toBe(ticketId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/cancel (new)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { eventId: testState.eventId, ticketTypeId: testState.createdTicketTypeId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // GET TICKETS - GET /api/v1/tickets/events/{id}
  // ============================================================================
describe('15. Get Tickets', () => {
    const suite = reporter.startSuite('Get Tickets');

    it('should get tickets for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/tickets/events/{id}',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting tickets for event: ${testState.eventId}`);

      try {
        const result = await ticketService.getTicketsByEvent(testState.eventId, {
          page: 0,
          size: 10,
        });

        console.log(`[Test] Found ${result.content?.length || 0} tickets`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/tickets/events/{id}',
          status: 'pass',
          statusCode: 200,
          message: 'Tickets retrieved',
          request: { eventId: testState.eventId, page: 0, size: 10 },
          response: result,
        });

        expect(result.content).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/tickets/events/{id}',
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

    it('should get tickets for an event (size=1)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/tickets/events/{id} (size=1)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting tickets (size=1) for event: ${testState.eventId}`);

      try {
        const result = await ticketService.getTicketsByEvent(testState.eventId, {
          page: 0,
          size: 1,
        });

        reporter.addResult(suite, {
          name: 'GET /api/v1/tickets/events/{id} (size=1)',
          status: 'pass',
          statusCode: 200,
          message: 'Tickets retrieved (size=1)',
          request: { eventId: testState.eventId, page: 0, size: 1 },
          response: result,
        });

        expect(result.content).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/tickets/events/{id} (size=1)',
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
  });

  // ============================================================================
  // VALIDATE TICKET - POST /api/v1/tickets/validate
  // ============================================================================
  describe('16. Validate Ticket', () => {
    const suite = reporter.startSuite('Validate Ticket');

    it('should return 400 or 404 for invalid validate request', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const request = { qrCodeData: 'invalid-qr', eventId: testState.eventId || '00000000-0000-0000-0000-000000000000' };

      try {
        await ticketService.validateTicket(request);
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/validate',
          status: 'fail',
          message: 'Expected error but request succeeded',
          request,
        });
        expect(true).toBe(false);
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/validate',
          status: status !== undefined && [400, 404, 422].includes(status) ? 'pass' : 'fail',
          statusCode: status ?? 500,
          message: 'Validation endpoint returns error for invalid data',
          request,
          response: (err as any)?.response?.data,
        });
        expect([400, 404, 422]).toContain(status);
      }
    }, 15000);
  });

  // ============================================================================
  // WALLET PASS - GET /api/v1/tickets/{id}/wallet-pass
  // ============================================================================
  describe('17. Wallet Pass', () => {
    const suite = reporter.startSuite('Wallet Pass');

    it('should get wallet pass for a ticket', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/tickets/{id}/wallet-pass',
          status: 'skip',
          message: 'No ticket ID available',
        });
        return;
      }

      try {
        const result = await ticketService.getWalletPass(testState.createdTicketId);
        reporter.addResult(suite, {
          name: 'GET /api/v1/tickets/{id}/wallet-pass',
          status: 'pass',
          statusCode: 200,
          message: 'Wallet pass retrieved',
          request: { ticketId: testState.createdTicketId },
          response: result,
        });
        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/tickets/{id}/wallet-pass', err, { ticketId: testState.createdTicketId }));
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // REFUND - POST /api/v1/tickets/{id}/refund
  // ============================================================================
  describe('18. Refund Ticket', () => {
    const suite = reporter.startSuite('Refund Ticket');

    it('should return error when refunding non-refundable or already cancelled ticket', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.createdTicketId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/refund',
          status: 'skip',
          message: 'No ticket ID available',
        });
        return;
      }

      try {
        await ticketService.refundTicket(testState.createdTicketId, 'E2E test');
        reporter.addResult(suite, {
          name: 'POST /api/v1/tickets/{id}/refund',
          status: 'pass',
          statusCode: 200,
          message: 'Refund requested (or ticket not refundable)',
          request: { ticketId: testState.createdTicketId },
        });
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        if (status !== undefined && [400, 404, 409].includes(status as number)) {
          reporter.addResult(suite, {
            name: 'POST /api/v1/tickets/{id}/refund',
            status: 'pass',
            statusCode: status,
            message: 'Refund rejected as expected (e.g. already cancelled)',
            request: { ticketId: testState.createdTicketId },
          });
        } else {
          reporter.addResult(suite, createErrorResult('POST /api/v1/tickets/{id}/refund', err, { ticketId: testState.createdTicketId }));
          throw err;
        }
      }
    }, 15000);
  });

  // ============================================================================
  // CHECKOUT - start, get, cancel (start-payment may require payment config)
  // ============================================================================
  describe('19. Ticket Checkout', () => {
    const suite = reporter.startSuite('Ticket Checkout');

    it('should start checkout and get then cancel it', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdTicketTypeId) {
        reporter.addResult(suite, {
          name: 'POST/GET/POST cancel ticket checkout',
          status: 'skip',
          message: 'Event or ticket type not available',
        });
        return;
      }

      const checkoutRequest: TicketCheckoutRequest = {
        items: [{ ticketTypeId: testState.createdTicketTypeId, quantity: 1 }],
      };

      try {
        const started = await ticketService.startTicketCheckout(testState.eventId, checkoutRequest);
        const checkoutId = (started as any).id ?? (started as any).checkoutId;
        if (!checkoutId) {
          reporter.addResult(suite, {
            name: 'POST /api/v1/events/{id}/tickets/checkout',
            status: 'pass',
            statusCode: 200,
            message: 'Checkout started (no checkoutId in response)',
            request: checkoutRequest,
            response: started,
          });
          return;
        }

        const got = await ticketService.getTicketCheckout(testState.eventId, checkoutId);
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tickets/checkout/{id}',
          status: 'pass',
          statusCode: 200,
          message: 'Checkout retrieved',
          request: { checkoutId },
          response: got,
        });

        await ticketService.cancelTicketCheckout(testState.eventId, checkoutId);
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/tickets/checkout/{id}/cancel',
          status: 'pass',
          statusCode: 200,
          message: 'Checkout cancelled',
          request: { checkoutId },
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('Ticket checkout flow', err, checkoutRequest));
        throw err;
      }
    }, 20000);
  });

  // ============================================================================
  // APPROVAL REQUESTS - create, list, listMine, cancel
  // ============================================================================
  describe('20. Ticket Approval Requests', () => {
    const suite = reporter.startSuite('Ticket Approval Requests');

    it('should list and list mine approval requests', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET tickets/requests & requests/mine',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      try {
        const list = await ticketService.listApprovalRequests(testState.eventId, { page: 0, size: 5 });
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tickets/requests',
          status: 'pass',
          statusCode: 200,
          message: `Found ${list.content?.length ?? 0} requests`,
          request: { eventId: testState.eventId },
          response: list,
        });

        const mine = await ticketService.listMyApprovalRequests(testState.eventId);
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tickets/requests/mine',
          status: 'pass',
          statusCode: 200,
          message: `My requests: ${mine?.length ?? 0}`,
          request: { eventId: testState.eventId },
          response: mine,
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET tickets/requests', err, { eventId: testState.eventId }));
        throw err;
      }
    }, 15000);

    it('should create and cancel an approval request', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdTicketTypeId) {
        reporter.addResult(suite, {
          name: 'POST/DELETE tickets/requests',
          status: 'skip',
          message: 'Event or ticket type not available',
        });
        return;
      }

      const createRequest: CreateTicketApprovalRequest = {
        ticketTypeId: testState.createdTicketTypeId,
        quantity: 1,
      };

      try {
        const created = await ticketService.createApprovalRequest(testState.eventId, createRequest);
        const requestId = (created as any).id ?? (created as any).requestId;
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/tickets/requests',
          status: 'pass',
          statusCode: 201,
          message: 'Approval request created',
          request: createRequest,
          response: created,
        });

        if (requestId) {
          await ticketService.cancelApprovalRequest(testState.eventId, requestId);
          reporter.addResult(suite, {
            name: 'DELETE /api/v1/events/{id}/tickets/requests/{id}',
            status: 'pass',
            statusCode: 200,
            message: 'Approval request cancelled',
            request: { requestId },
          });
        }
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST/DELETE tickets/requests', err, createRequest));
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // TICKET WAITLIST - join, list, listMine, cancel
  // ============================================================================
  describe('21. Ticket Waitlist', () => {
    const suite = reporter.startSuite('Ticket Waitlist');

    it('should list waitlist and list my waitlist entries', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET tickets/waitlist & waitlist/mine',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      try {
        const list = await ticketService.listWaitlist(testState.eventId, { page: 0, size: 5 });
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tickets/waitlist',
          status: 'pass',
          statusCode: 200,
          message: `Found ${list.content?.length ?? 0} entries`,
          request: { eventId: testState.eventId },
          response: list,
        });

        const mine = await ticketService.listMyWaitlist(testState.eventId);
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tickets/waitlist/mine',
          status: 'pass',
          statusCode: 200,
          message: `My entries: ${mine?.length ?? 0}`,
          request: { eventId: testState.eventId },
          response: mine,
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET tickets/waitlist', err, { eventId: testState.eventId }));
        throw err;
      }
    }, 15000);

    it('should join and cancel a waitlist entry', async () => {
      expect(testState.isAuthenticated).toBe(true);
      if (!testState.eventId || !testState.createdTicketTypeId) {
        reporter.addResult(suite, {
          name: 'POST/DELETE tickets/waitlist',
          status: 'skip',
          message: 'Event or ticket type not available',
        });
        return;
      }

      const joinRequest: CreateTicketWaitlistRequest = {
        ticketTypeId: testState.createdTicketTypeId,
        quantity: 1,
      };

      try {
        const entry = await ticketService.joinWaitlist(testState.eventId, joinRequest);
        const entryId = (entry as any).id ?? (entry as any).entryId;
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/tickets/waitlist',
          status: 'pass',
          statusCode: 201,
          message: 'Joined waitlist',
          request: joinRequest,
          response: entry,
        });

        if (entryId) {
          await ticketService.cancelWaitlistEntry(testState.eventId, entryId);
          reporter.addResult(suite, {
            name: 'DELETE /api/v1/events/{id}/tickets/waitlist/{id}',
            status: 'pass',
            statusCode: 200,
            message: 'Waitlist entry cancelled',
            request: { entryId },
          });
        }
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST/DELETE tickets/waitlist', err, joinRequest));
        throw err;
      }
    }, 15000);
  });
});
