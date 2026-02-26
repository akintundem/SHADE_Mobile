/**
 * Budget Service E2E Tests
 *
 * Real end-to-end tests that hit the actual backend.
 * These tests authenticate with Auth0 and test all budget-related endpoints.
 */

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { TestReporter } from '../lib/reporter';
import { getOrCreateTestEvent, authenticateAndOnboard } from '../lib/testHelpers';
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
import { budgetService } from '../../core/budget/services/budget';
import type { SecureUserResponse } from '../../core/auth/types/auth';
import {
  UpdateBudgetRequest,
  BudgetLineItemAutoSaveRequest,
} from '../../core/budget/types/budget';

// Test state - shared across tests
interface TestState {
  isAuthenticated: boolean;
  userId: string | null;
  user: SecureUserResponse | null;
  eventId: string | null;
  createdLineItemId: string | null;
}

const testState: TestState = {
  isAuthenticated: false,
  userId: null,
  user: null,
  eventId: process.env.TEST_EVENT_ID?.trim() || null,
  createdLineItemId: null,
};

// Initialize test reporter
const reporter = new TestReporter('Budget Service E2E Test Report');

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

describe('Budget Service E2E Tests', () => {
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
    const reportPath = reporter.writeReport('test/reports', 'budget_test_report');
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
  // GET BUDGET - GET /api/v1/events/{id}/budget
  // ============================================================================
  describe('1. Get Budget', () => {
    const suite = reporter.startSuite('Get Budget');

    it('should get budget for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting budget for event: ${testState.eventId}`);

      try {
        const result = await budgetService.getBudget(testState.eventId);

        console.log(`[Test] Got budget: totalBudget=${result.totalBudget}`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget',
          status: 'pass',
          statusCode: 200,
          message: 'Budget retrieved',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.eventId).toBe(testState.eventId);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{id}/budget', err, { eventId: testState.eventId }));
        throw err;
      }
    }, 15000);

    it('should get budget for an event (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget (repeat)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting budget again for event: ${testState.eventId}`);

      try {
        const result = await budgetService.getBudget(testState.eventId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Budget retrieved (repeat)',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.eventId).toBe(testState.eventId);
      } catch (err: unknown) {
        reporter.addResult(
          suite,
          createErrorResult('GET /api/v1/events/{id}/budget (repeat)', err, { eventId: testState.eventId })
        );
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // UPDATE BUDGET - PUT /api/v1/events/{id}/budget
  // ============================================================================
  describe('2. Update Budget', () => {
    const suite = reporter.startSuite('Update Budget');

    it('should update budget', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/budget',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: UpdateBudgetRequest = {
        totalBudget: 10000,
        contingencyPercentage: 10,
        currency: 'USD',
        notes: 'E2E test budget update',
      };

      console.log(`[Test] Updating budget for event: ${testState.eventId}`);

      try {
        const result = await budgetService.updateBudget(testState.eventId, request);

        console.log(`[Test] Updated budget: totalBudget=${result.totalBudget}`);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/budget',
          status: 'pass',
          statusCode: 200,
          message: 'Budget updated',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('PUT /api/v1/events/{id}/budget', err, request));
        throw err;
      }
    }, 15000);

    it('should update budget notes and contingency', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/budget (notes)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: UpdateBudgetRequest = {
        totalBudget: 15000,
        contingencyPercentage: 5,
        currency: 'USD',
        notes: `E2E update notes ${Date.now()}`,
      };

      console.log(`[Test] Updating budget notes for event: ${testState.eventId}`);

      try {
        const result = await budgetService.updateBudget(testState.eventId, request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/budget (notes)',
          status: 'pass',
          statusCode: 200,
          message: 'Budget notes updated',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('PUT /api/v1/events/{id}/budget (notes)', err, request));
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // GET CATEGORIES - GET /api/v1/events/{id}/budget/categories
  // ============================================================================
  describe('3. Get Categories', () => {
    const suite = reporter.startSuite('Get Categories');

    it('should get budget categories', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget/categories',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting categories for event: ${testState.eventId}`);

      try {
        const result = await budgetService.getCategories(testState.eventId);

        console.log(`[Test] Found ${result.length} categories`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget/categories',
          status: 'pass',
          statusCode: 200,
          message: 'Categories retrieved',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget/categories',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should get budget categories (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget/categories (repeat)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting categories again for event: ${testState.eventId}`);

      try {
        const result = await budgetService.getCategories(testState.eventId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget/categories (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Categories retrieved (repeat)',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget/categories (repeat)',
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
  // LINE ITEMS - GET /api/v1/events/{id}/budget/line-items
  // ============================================================================
  describe('4. Line Items', () => {
    const suite = reporter.startSuite('Line Items');

    it('should get line items', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget/line-items',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting line items for event: ${testState.eventId}`);

      try {
        const result = await budgetService.getLineItems(testState.eventId);

        console.log(`[Test] Found ${result.length} line items`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget/line-items',
          status: 'pass',
          statusCode: 200,
          message: 'Line items retrieved',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{id}/budget/line-items', err, { eventId: testState.eventId }));
        throw err;
      }
    }, 15000);

    it('should get line items (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget/line-items (repeat)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting line items again for event: ${testState.eventId}`);

      try {
        const result = await budgetService.getLineItems(testState.eventId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/budget/line-items (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Line items retrieved (repeat)',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(
          suite,
          createErrorResult('GET /api/v1/events/{id}/budget/line-items (repeat)', err, { eventId: testState.eventId })
        );
        throw err;
      }
    }, 15000);

    it('should auto-save line item draft', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/budget/line-items/auto-save',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      // First get categories to use one
      let categoryId = '';
      try {
        const categories = await budgetService.getCategories(testState.eventId);
        if (categories.length > 0) {
          categoryId = categories[0].id;
        }
      } catch (err) {
        // If categories fail, skip this test
        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/budget/line-items/auto-save',
          status: 'skip',
          message: 'Could not get categories for line item creation',
        });
        return;
      }

      if (!categoryId) {
        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/budget/line-items/auto-save',
          status: 'skip',
          message: 'No categories available',
        });
        return;
      }

      const request: BudgetLineItemAutoSaveRequest = {
        id: null,
        budgetCategoryId: categoryId,
        description: 'E2E test line item',
        estimatedCost: 100,
        isDraft: true,
      };

      console.log(`[Test] Auto-saving line item draft for event: ${testState.eventId}`);

      try {
        const result = await budgetService.autoSaveDraft(testState.eventId, request);

        testState.createdLineItemId = result.id;

        console.log(`[Test] Line item draft saved: ${result.id}`);

        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/budget/line-items/auto-save',
          status: 'pass',
          statusCode: 200,
          message: 'Line item draft saved',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('PATCH /api/v1/events/{id}/budget/line-items/auto-save', err, request));
        throw err;
      }
    }, 15000);

    it('should update an existing line item draft', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId || !testState.createdLineItemId) {
        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/budget/line-items/auto-save (update)',
          status: 'skip',
          message: 'Event or line item ID not available',
        });
        return;
      }

      const request: BudgetLineItemAutoSaveRequest = {
        id: testState.createdLineItemId,
        description: `E2E updated line item ${Date.now()}`,
        estimatedCost: 250,
        notes: 'Updated in E2E test',
      };

      console.log(`[Test] Updating line item draft for event: ${testState.eventId}`);

      try {
        const result = await budgetService.autoSaveDraft(testState.eventId, request);

        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/budget/line-items/auto-save (update)',
          status: 'pass',
          statusCode: 200,
          message: 'Line item draft updated',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.createdLineItemId);
      } catch (err: unknown) {
        reporter.addResult(
          suite,
          createErrorResult('PATCH /api/v1/events/{id}/budget/line-items/auto-save (update)', err, request)
        );
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // FINALIZE LINE ITEM - PUT /api/v1/events/{id}/budget/line-items/{itemId}/finalize
  // ============================================================================
  describe('5. Finalize Line Item', () => {
    const suite = reporter.startSuite('Finalize Line Item');

    it('should finalize a line item draft', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId || !testState.createdLineItemId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/budget/line-items/{itemId}/finalize',
          status: 'skip',
          message: 'Event or line item ID not available',
        });
        return;
      }

      const request: BudgetLineItemAutoSaveRequest = {
        id: testState.createdLineItemId,
        description: `Finalized E2E line item ${Date.now()}`,
        estimatedCost: 300,
      };

      console.log(`[Test] Finalizing line item: ${testState.createdLineItemId}`);

      try {
        const result = await budgetService.finalizeLineItem(testState.eventId, testState.createdLineItemId, request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/budget/line-items/{itemId}/finalize',
          status: 'pass',
          statusCode: 200,
          message: 'Line item finalized',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('PUT /api/v1/events/{id}/budget/line-items/{itemId}/finalize', err, request));
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // DELETE LINE ITEM - DELETE /api/v1/events/{id}/budget/line-items/{itemId}
  // ============================================================================
  describe('6. Delete Line Item', () => {
    const suite = reporter.startSuite('Delete Line Item');

    it('should create and delete a line item', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/budget/line-items/{itemId}',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      // First get categories
      let categoryId = '';
      try {
        const categories = await budgetService.getCategories(testState.eventId);
        if (categories.length > 0) {
          categoryId = categories[0].id;
        }
      } catch {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/budget/line-items/{itemId}',
          status: 'skip',
          message: 'Could not get categories',
        });
        return;
      }

      if (!categoryId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/budget/line-items/{itemId}',
          status: 'skip',
          message: 'No categories available',
        });
        return;
      }

      // Create a line item to delete
      const createRequest: BudgetLineItemAutoSaveRequest = {
        id: null,
        budgetCategoryId: categoryId,
        description: 'E2E delete target',
        estimatedCost: 50,
        isDraft: true,
      };

      try {
        const created = await budgetService.autoSaveDraft(testState.eventId, createRequest);
        console.log(`[Test] Created line item for deletion: ${created.id}`);

        await budgetService.deleteLineItem(testState.eventId, created.id);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/budget/line-items/{itemId}',
          status: 'pass',
          statusCode: 204,
          message: 'Line item deleted',
          request: { itemId: created.id },
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('DELETE /api/v1/events/{id}/budget/line-items/{itemId}', err, createRequest));
        throw err;
      }
    }, 20000);
  });

  // ============================================================================
  // BUDGET LIFECYCLE - Full create, update, finalize, delete cycle
  // ============================================================================
  describe('7. Budget Lifecycle', () => {
    const suite = reporter.startSuite('Budget Lifecycle');

    it('should complete full budget lifecycle', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'Budget Lifecycle',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      try {
        // 1. Get budget (creates if needed)
        const budget = await budgetService.getBudget(testState.eventId);
        expect(budget).toBeDefined();

        // 2. Update budget
        const updated = await budgetService.updateBudget(testState.eventId, {
          totalBudget: 20000,
          currency: 'USD',
          notes: 'Lifecycle test budget',
        });
        expect(updated).toBeDefined();

        // 3. Get categories
        const categories = await budgetService.getCategories(testState.eventId);
        expect(Array.isArray(categories)).toBe(true);

        // 4. Create line item draft
        let categoryId = categories.length > 0 ? categories[0].id : undefined;
        const draftRequest: BudgetLineItemAutoSaveRequest = {
          id: null,
          budgetCategoryId: categoryId,
          description: 'Lifecycle test expense',
          estimatedCost: 1000,
          isDraft: true,
        };
        const draft = await budgetService.autoSaveDraft(testState.eventId, draftRequest);
        expect(draft.id).toBeDefined();

        // 5. Finalize the line item
        const finalized = await budgetService.finalizeLineItem(testState.eventId, draft.id, {
          ...draftRequest,
          id: draft.id,
          estimatedCost: 1200,
        });
        expect(finalized).toBeDefined();

        // 6. Get all line items
        const lineItems = await budgetService.getLineItems(testState.eventId);
        expect(Array.isArray(lineItems)).toBe(true);
        const found = lineItems.find(item => item.id === draft.id);
        expect(found).toBeDefined();

        // 7. Delete the line item
        await budgetService.deleteLineItem(testState.eventId, draft.id);

        reporter.addResult(suite, {
          name: 'Budget Lifecycle',
          status: 'pass',
          statusCode: 200,
          message: 'Complete lifecycle: get -> update -> draft -> finalize -> list -> delete',
          request: { eventId: testState.eventId },
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('Budget Lifecycle', err, { eventId: testState.eventId }));
        throw err;
      }
    }, 45000);
  });
});
