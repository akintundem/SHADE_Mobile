/**
 * Timeline Service E2E Tests
 *
 * Real end-to-end tests that hit the actual backend.
 * These tests authenticate with Auth0 and test all timeline-related endpoints.
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
import { timelineService } from '../../core/timeline/services/timeline';
import type { SecureUserResponse } from '../../core/auth/types/auth';
import {
  TaskAutoSaveRequest,
  ChecklistAutoSaveRequest,
  TimelineStatus,
} from '../../core/timeline/types/timeline';

// Test state - shared across tests
interface TestState {
  isAuthenticated: boolean;
  userId: string | null;
  user: SecureUserResponse | null;
  eventId: string | null;
  createdTaskId: string | null;
}

const testState: TestState = {
  isAuthenticated: false,
  userId: null,
  user: null,
  eventId: process.env.TEST_EVENT_ID?.trim() || null,
  createdTaskId: null,
};

// Initialize test reporter
const reporter = new TestReporter('Timeline Service E2E Test Report');

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

describe('Timeline Service E2E Tests', () => {
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
    const reportPath = reporter.writeReport('test/reports', 'timeline_test_report');
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
  // GET TASKS - GET /api/v1/events/{id}/tasks
  // ============================================================================
  describe('1. Get Tasks', () => {
    const suite = reporter.startSuite('Get Tasks');

    it('should get all tasks for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tasks',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting tasks for event: ${testState.eventId}`);

      try {
        const result = await timelineService.getAllTasks(testState.eventId);

        console.log(`[Test] Found ${result.length} tasks`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tasks',
          status: 'pass',
          statusCode: 200,
          message: 'Tasks retrieved',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tasks',
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

    it('should get tasks for an event (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tasks (repeat)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting tasks again for event: ${testState.eventId}`);

      try {
        const result = await timelineService.getAllTasks(testState.eventId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tasks (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Tasks retrieved (repeat)',
          request: { eventId: testState.eventId },
          response: result,
        });

        expect(Array.isArray(result)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/tasks (repeat)',
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
  // AUTO-SAVE TASK - PATCH /api/v1/events/{id}/tasks/auto-save
  // ============================================================================
  describe('2. Auto-Save Task', () => {
    const suite = reporter.startSuite('Auto-Save Task');

    it('should auto-save a task draft', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/tasks/auto-save',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: TaskAutoSaveRequest = {
        id: null,
        title: `E2E Test Task ${Date.now()}`,
        description: 'Created by E2E tests',
        status: TimelineStatus.PENDING,
        isDraft: true,
      };

      console.log(`[Test] Auto-saving task draft for event: ${testState.eventId}`);

      try {
        const result = await timelineService.autoSaveTask(testState.eventId, request);

        testState.createdTaskId = result.id;

        console.log(`[Test] Task draft saved: ${result.id}`);

        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/tasks/auto-save',
          status: 'pass',
          statusCode: 200,
          message: 'Task draft saved',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/tasks/auto-save',
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

    it('should update an existing task draft', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId || !testState.createdTaskId) {
        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/tasks/auto-save (update)',
          status: 'skip',
          message: 'Event or task ID not available',
        });
        return;
      }

      const request: TaskAutoSaveRequest = {
        id: testState.createdTaskId,
        title: `E2E Test Task Updated ${Date.now()}`,
        status: TimelineStatus.IN_PROGRESS,
      };

      console.log(`[Test] Updating task draft for event: ${testState.eventId}`);

      try {
        const result = await timelineService.autoSaveTask(testState.eventId, request);

        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/tasks/auto-save (update)',
          status: 'pass',
          statusCode: 200,
          message: 'Task draft updated',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.createdTaskId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PATCH /api/v1/events/{id}/tasks/auto-save (update)',
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
  // FINALIZE TASK - PUT /api/v1/events/{id}/tasks/{taskId}/finalize
  // ============================================================================
  describe('3. Finalize Task', () => {
    const suite = reporter.startSuite('Finalize Task');

    it('should finalize a task draft', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId || !testState.createdTaskId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/tasks/{taskId}/finalize',
          status: 'skip',
          message: 'Event or task ID not available',
        });
        return;
      }

      const request: TaskAutoSaveRequest = {
        id: testState.createdTaskId,
        title: `Finalized E2E Task ${Date.now()}`,
        description: 'Finalized by E2E tests',
        status: TimelineStatus.PENDING,
      };

      console.log(`[Test] Finalizing task: ${testState.createdTaskId}`);

      try {
        const result = await timelineService.finalizeTask(testState.eventId, testState.createdTaskId, request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/tasks/{taskId}/finalize',
          status: 'pass',
          statusCode: 200,
          message: 'Task finalized',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/tasks/{taskId}/finalize',
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
  // CHECKLIST ITEMS - CRUD
  // ============================================================================
  describe('4. Checklist Items', () => {
    const suite = reporter.startSuite('Checklist Items');

    let checklistItemId: string | null = null;

    it('should auto-save a checklist item', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdTaskId) {
        reporter.addResult(suite, {
          name: 'PATCH /api/v1/tasks/{taskId}/checklist/auto-save',
          status: 'skip',
          message: 'Task ID not available',
        });
        return;
      }

      const request: ChecklistAutoSaveRequest = {
        id: null,
        title: `E2E Checklist Item ${Date.now()}`,
        isDraft: true,
      };

      console.log(`[Test] Auto-saving checklist item for task: ${testState.createdTaskId}`);

      try {
        const result = await timelineService.autoSaveChecklistItem(testState.createdTaskId, request);
        checklistItemId = result.id;

        reporter.addResult(suite, {
          name: 'PATCH /api/v1/tasks/{taskId}/checklist/auto-save',
          status: 'pass',
          statusCode: 200,
          message: 'Checklist item saved',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PATCH /api/v1/tasks/{taskId}/checklist/auto-save',
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

    it('should finalize a checklist item', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdTaskId || !checklistItemId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/tasks/{taskId}/checklist/{itemId}/finalize',
          status: 'skip',
          message: 'Task or checklist item ID not available',
        });
        return;
      }

      const request: ChecklistAutoSaveRequest = {
        id: checklistItemId,
        title: `Finalized Checklist Item ${Date.now()}`,
      };

      console.log(`[Test] Finalizing checklist item: ${checklistItemId}`);

      try {
        const result = await timelineService.finalizeChecklistItem(testState.createdTaskId, checklistItemId, request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/tasks/{taskId}/checklist/{itemId}/finalize',
          status: 'pass',
          statusCode: 200,
          message: 'Checklist item finalized',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/tasks/{taskId}/checklist/{itemId}/finalize',
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

    it('should delete a checklist item', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.createdTaskId || !checklistItemId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/tasks/{taskId}/checklist/{itemId}',
          status: 'skip',
          message: 'Task or checklist item ID not available',
        });
        return;
      }

      console.log(`[Test] Deleting checklist item: ${checklistItemId}`);

      try {
        await timelineService.deleteChecklistItem(testState.createdTaskId, checklistItemId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/tasks/{taskId}/checklist/{itemId}',
          status: 'pass',
          statusCode: 204,
          message: 'Checklist item deleted',
          request: { taskId: testState.createdTaskId, itemId: checklistItemId },
        });
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/tasks/{taskId}/checklist/{itemId}',
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
  // DELETE TASK - DELETE /api/v1/events/{id}/tasks/{taskId}
  // ============================================================================
  describe('5. Delete Task', () => {
    const suite = reporter.startSuite('Delete Task');

    it('should delete a task', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId || !testState.createdTaskId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/tasks/{taskId}',
          status: 'skip',
          message: 'Event or task ID not available',
        });
        return;
      }

      console.log(`[Test] Deleting task: ${testState.createdTaskId}`);

      try {
        await timelineService.deleteTask(testState.eventId, testState.createdTaskId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/tasks/{taskId}',
          status: 'pass',
          statusCode: 204,
          message: 'Task deleted',
          request: { eventId: testState.eventId, taskId: testState.createdTaskId },
        });
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/tasks/{taskId}',
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
  // TIMELINE LIFECYCLE - Full create, finalize, checklist, delete
  // ============================================================================
  describe('6. Timeline Lifecycle', () => {
    const suite = reporter.startSuite('Timeline Lifecycle');

    it('should complete full task lifecycle with checklist', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'Timeline Lifecycle',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      try {
        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // 1. Create task draft
        const task = await timelineService.autoSaveTask(testState.eventId, {
          id: null,
          title: `Lifecycle Task ${Date.now()}`,
          description: 'Full lifecycle test',
          priority: 'HIGH',
          category: 'Testing',
          dueDate: dueDate.toISOString().slice(0, 19),
          isDraft: true,
        });
        expect(task.id).toBeDefined();

        // 2. Finalize the task
        const finalized = await timelineService.finalizeTask(testState.eventId, task.id, {
          id: task.id,
          title: task.title,
          description: task.description,
          priority: 'HIGH',
          category: 'Testing',
          dueDate: dueDate.toISOString().slice(0, 19),
        });
        expect(finalized).toBeDefined();

        // 3. Add checklist items
        const check1 = await timelineService.autoSaveChecklistItem(task.id, {
          id: null,
          title: 'Step 1: Prepare',
          isDraft: true,
        });
        expect(check1.id).toBeDefined();

        const check2 = await timelineService.autoSaveChecklistItem(task.id, {
          id: null,
          title: 'Step 2: Execute',
          isDraft: true,
        });
        expect(check2.id).toBeDefined();

        // 4. Finalize checklist items
        await timelineService.finalizeChecklistItem(task.id, check1.id, {
          id: check1.id,
          title: 'Step 1: Prepare',
        });
        await timelineService.finalizeChecklistItem(task.id, check2.id, {
          id: check2.id,
          title: 'Step 2: Execute',
        });

        // 5. Verify task appears in all tasks
        const allTasks = await timelineService.getAllTasks(testState.eventId);
        const found = allTasks.find(t => t.id === task.id);
        expect(found).toBeDefined();

        // 6. Delete the task
        await timelineService.deleteTask(testState.eventId, task.id);

        reporter.addResult(suite, {
          name: 'Timeline Lifecycle',
          status: 'pass',
          statusCode: 200,
          message: 'Complete lifecycle: draft -> finalize -> checklist -> verify -> delete',
          request: { eventId: testState.eventId },
        });
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'Timeline Lifecycle',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 60000);
  });
});
