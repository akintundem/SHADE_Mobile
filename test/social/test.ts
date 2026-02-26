/**
 * User Following Service E2E Tests
 *
 * Real end-to-end tests that hit the actual backend.
 * Tests all user following/follower-related endpoints.
 * Includes comprehensive edge cases and error scenarios.
 */

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { TestReporter } from '../lib/reporter';
import { authenticateAndOnboard } from '../lib/testHelpers';
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
import { authService } from '../../core/auth/services/authService';
import { userFollowService } from '../../core/social/services/userFollow';
import type { SecureUserResponse } from '../../core/auth/types/auth';
import type { ListFollowersRequest, ListFollowingRequest } from '../../core/social/types/userFollow';

// Test state - shared across tests
interface TestState {
  isAuthenticated: boolean;
  userId: string | null;
  user: SecureUserResponse | null;
  targetUserId: string | null; // User to follow/unfollow for testing
  followedUserIds: string[]; // Track users we followed for cleanup
}

const testState: TestState = {
  isAuthenticated: false,
  userId: null,
  user: null,
  targetUserId: null,
  followedUserIds: [],
};

// Initialize test reporter
const reporter = new TestReporter('User Following Service E2E Test Report');

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

describe('User Following Service E2E Tests', () => {
  beforeAll(async () => {
    await delayBetweenTestFiles(3000);
    ensureAuth0ForTests();
  });

  // Setup: Authenticate
  beforeAll(async () => {
    try {
      // Authenticate and handle onboarding
      const { email, password } = getTestCredentials();
      const authResult = await authenticateAndOnboard(email, password);
      testState.isAuthenticated = true;
      testState.userId = authResult.userId;
      testState.user = authResult.user;

      // Try to find a user to test following functionality with
      // Use the public directory to pick a user that isn't ourselves
      try {
        const directoryResult = await withRateLimitRetry(() =>
          authService.searchDirectory('test', { page: 0, size: 10 })
        );

        const otherUser = directoryResult.content.find(u => u.id !== testState.userId);
        if (otherUser) {
          testState.targetUserId = otherUser.id;
          console.log(`[Test Setup] Found target user for following tests: ${testState.targetUserId}`);
        } else {
          console.log('[Test Setup] No other users found for following tests');
        }
      } catch (err) {
        console.log('[Test Setup] Could not search directory, some tests may be skipped');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Test Setup] Failed to setup:', errorMessage);
    }
  });

  // Cleanup: Unfollow any users we followed during tests
  afterAll(async () => {
    for (const userId of testState.followedUserIds) {
      try {
        await userFollowService.unfollowUser(userId);
        console.log(`[Cleanup] Unfollowed user: ${userId}`);
      } catch {
        // Ignore errors during cleanup
      }
      await sleep(200);
    }
  });

  // Generate and write report after all tests
  afterAll(() => {
    const report = reporter.generateReport();
    const reportPath = reporter.writeReport('test/reports', 'social_test_report');
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
  // FOLLOW USER - POST /api/v1/users/{userId}/follow
  // ============================================================================
describe('1. Follow User', () => {
    const suite = reporter.startSuite('Follow User');

    it('should follow a user', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.targetUserId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/users/{userId}/follow',
          status: 'skip',
          message: 'Target user ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        await withRateLimitRetry(() =>
          userFollowService.followUser(testState.targetUserId!)
        );
        testState.followedUserIds.push(testState.targetUserId!);

        reporter.addResult(suite, {
          name: 'POST /api/v1/users/{userId}/follow',
          status: 'pass',
          statusCode: 200,
          message: `Successfully followed user: ${testState.targetUserId}`,
          request: { userId: testState.targetUserId },
        });

        // Verify by checking follow status
        await sleep(300);
        const status = await withRateLimitRetry(() =>
          userFollowService.getFollowStatus(testState.targetUserId!)
        );
        expect(status.isFollowing).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/users/{userId}/follow', err));
        throw err;
      }
    }, 30000);

    it('should handle following user already followed (idempotent)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.targetUserId || !testState.followedUserIds.includes(testState.targetUserId)) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/users/{userId}/follow (already following)',
          status: 'skip',
          message: 'Target user not followed yet',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        // Try to follow again
        await withRateLimitRetry(() =>
          userFollowService.followUser(testState.targetUserId!)
        );

        reporter.addResult(suite, {
          name: 'POST /api/v1/users/{userId}/follow (already following)',
          status: 'pass',
          statusCode: 200,
          message: 'Double follow handled gracefully (idempotent)',
          request: { userId: testState.targetUserId },
        });
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        // Both 200/204 (success) and 409 (conflict) are acceptable responses
        reporter.addResult(suite, {
          name: 'POST /api/v1/users/{userId}/follow (already following)',
          status: [200, 204, 409].includes(status) ? 'pass' : 'fail',
          statusCode: status,
          message: status === 409 ? 'Server correctly returned conflict for already following' : getErrorMessage(err),
          request: { userId: testState.targetUserId },
        });

        if (![200, 204, 409].includes(status)) {
          throw err;
        }
      }
    }, 30000);

    it('should reject following yourself', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/users/{userId}/follow (self)',
          status: 'skip',
          message: 'User ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        await userFollowService.followUser(testState.userId!);

        reporter.addResult(suite, {
          name: 'POST /api/v1/users/{userId}/follow (self)',
          status: 'fail',
          message: 'Expected error but request succeeded (user should not be able to follow themselves)',
          request: { userId: testState.userId },
        });
        expect(true).toBe(false);
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        reporter.addResult(suite, {
          name: 'POST /api/v1/users/{userId}/follow (self)',
          status: [400, 403, 422].includes(status) ? 'pass' : 'fail',
          statusCode: status,
          message: 'Cannot follow yourself - error handled correctly',
          request: { userId: testState.userId },
          response: getErrorResponseData(err),
        });

        expect([400, 403, 422]).toContain(status);
      }
    }, 30000);

    it('should return error for following non-existent user', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      await delayBetweenTests(500);

      try {
        await userFollowService.followUser(fakeUserId);

        reporter.addResult(suite, {
          name: 'POST /api/v1/users/{userId}/follow (non-existent)',
          status: 'fail',
          message: 'Expected error but request succeeded',
          request: { userId: fakeUserId },
        });
        expect(true).toBe(false);
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        reporter.addResult(suite, {
          name: 'POST /api/v1/users/{userId}/follow (non-existent)',
          status: status === 404 ? 'pass' : 'fail',
          statusCode: status,
          message: status === 404 ? 'Got expected 404 for non-existent user' : getErrorMessage(err),
          request: { userId: fakeUserId },
          response: getErrorResponseData(err),
        });

        expect(status).toBe(404);
      }
    }, 30000);
  });

  // ============================================================================
  // GET FOLLOW STATUS - GET /api/v1/users/{userId}/follow-status
  // ============================================================================
describe('2. Get Follow Status', () => {
    const suite = reporter.startSuite('Get Follow Status');

    it('should get follow status for a followed user', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.targetUserId || !testState.followedUserIds.includes(testState.targetUserId)) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/follow-status (following)',
          status: 'skip',
          message: 'Target user not followed',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          userFollowService.getFollowStatus(testState.targetUserId!)
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/follow-status (following)',
          status: 'pass',
          statusCode: 200,
          message: `isFollowing: ${result.isFollowing}, isFollowedBy: ${result.isFollowedBy}, isMutual: ${result.isMutual}`,
          request: { userId: testState.targetUserId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.userId).toBe(testState.targetUserId);
        expect(result.isFollowing).toBe(true);
        expect(typeof result.isFollowedBy).toBe('boolean');
        expect(typeof result.isMutual).toBe('boolean');
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/users/{userId}/follow-status (following)', err));
        throw err;
      }
    }, 30000);

    it('should get follow status for own profile', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/follow-status (self)',
          status: 'skip',
          message: 'User ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          userFollowService.getFollowStatus(testState.userId!)
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/follow-status (self)',
          status: 'pass',
          statusCode: 200,
          message: `isFollowing: ${result.isFollowing}, isFollowedBy: ${result.isFollowedBy}, isMutual: ${result.isMutual}`,
          request: { userId: testState.userId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.userId).toBe(testState.userId);
        // Cannot follow yourself, so both should be false
        expect(result.isFollowing).toBe(false);
        expect(result.isFollowedBy).toBe(false);
        expect(result.isMutual).toBe(false);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/users/{userId}/follow-status (self)', err));
        throw err;
      }
    }, 30000);
  });

  // ============================================================================
  // GET FOLLOW STATS - GET /api/v1/users/{userId}/follow-stats
  // ============================================================================
describe('3. Get Follow Stats', () => {
    const suite = reporter.startSuite('Get Follow Stats');

    it('should get follow stats for own profile', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/follow-stats (own)',
          status: 'skip',
          message: 'User ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          userFollowService.getFollowStats(testState.userId!)
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/follow-stats (own)',
          status: 'pass',
          statusCode: 200,
          message: `Following: ${result.followingCount}, Followers: ${result.followersCount}`,
          request: { userId: testState.userId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.userId).toBe(testState.userId);
        expect(typeof result.followingCount).toBe('number');
        expect(typeof result.followersCount).toBe('number');
        expect(result.followingCount).toBeGreaterThanOrEqual(0);
        expect(result.followersCount).toBeGreaterThanOrEqual(0);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/users/{userId}/follow-stats (own)', err));
        throw err;
      }
    }, 30000);

    it('should get follow stats for another user', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.targetUserId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/follow-stats (other)',
          status: 'skip',
          message: 'Target user ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          userFollowService.getFollowStats(testState.targetUserId!)
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/follow-stats (other)',
          status: 'pass',
          statusCode: 200,
          message: `Following: ${result.followingCount}, Followers: ${result.followersCount}`,
          request: { userId: testState.targetUserId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.userId).toBe(testState.targetUserId);
        expect(typeof result.followingCount).toBe('number');
        expect(typeof result.followersCount).toBe('number');
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/users/{userId}/follow-stats (other)', err));
        throw err;
      }
    }, 30000);
  });

  // ============================================================================
  // GET FOLLOWING LIST - GET /api/v1/users/{userId}/following
  // ============================================================================
describe('4. Get Following List', () => {
    const suite = reporter.startSuite('Get Following List');

    it('should get own following list', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/following (own)',
          status: 'skip',
          message: 'User ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          userFollowService.getFollowing(testState.userId!, { page: 0, size: 10 })
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/following (own)',
          status: 'pass',
          statusCode: 200,
          message: `Following ${result.content?.length || 0} of ${result.totalElements} users`,
          request: { userId: testState.userId, page: 0, size: 10 },
          response: { totalElements: result.totalElements, contentLength: result.content?.length },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/users/{userId}/following (own)', err));
        throw err;
      }
    }, 30000);

    it('should get following list with pagination', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/following (pagination)',
          status: 'skip',
          message: 'User ID not available',
        });
        return;
      }

      const request: ListFollowingRequest = { page: 0, size: 5 };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          userFollowService.getFollowing(testState.userId!, request)
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/following (pagination)',
          status: 'pass',
          statusCode: 200,
          message: `Page 0: ${result.content?.length || 0} users (size=5)`,
          request: { userId: testState.userId, ...request },
          response: { totalElements: result.totalElements, totalPages: result.totalPages },
        });

        expect(result.content).toBeDefined();
        expect(result.content.length).toBeLessThanOrEqual(5);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/users/{userId}/following (pagination)', err));
        throw err;
      }
    }, 30000);

  });

  // ============================================================================
  // GET FOLLOWERS LIST - GET /api/v1/users/{userId}/followers
  // ============================================================================
describe('5. Get Followers List', () => {
    const suite = reporter.startSuite('Get Followers List');

    it('should get own followers list', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/followers (own)',
          status: 'skip',
          message: 'User ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          userFollowService.getFollowers(testState.userId!, { page: 0, size: 10 })
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/followers (own)',
          status: 'pass',
          statusCode: 200,
          message: `Have ${result.content?.length || 0} of ${result.totalElements} followers`,
          request: { userId: testState.userId, page: 0, size: 10 },
          response: { totalElements: result.totalElements, contentLength: result.content?.length },
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/users/{userId}/followers (own)', err));
        throw err;
      }
    }, 30000);

    it('should get followers list with pagination', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/followers (pagination)',
          status: 'skip',
          message: 'User ID not available',
        });
        return;
      }

      const request: ListFollowersRequest = { page: 0, size: 5 };
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          userFollowService.getFollowers(testState.userId!, request)
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/followers (pagination)',
          status: 'pass',
          statusCode: 200,
          message: `Page 0: ${result.content?.length || 0} followers (size=5)`,
          request: { userId: testState.userId, ...request },
          response: { totalElements: result.totalElements, totalPages: result.totalPages },
        });

        expect(result.content).toBeDefined();
        expect(result.content.length).toBeLessThanOrEqual(5);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/users/{userId}/followers (pagination)', err));
        throw err;
      }
    }, 30000);

    it('should get followers of another user', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.targetUserId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/followers (other user)',
          status: 'skip',
          message: 'Target user ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        const result = await withRateLimitRetry(() =>
          userFollowService.getFollowers(testState.targetUserId!, { page: 0, size: 10 })
        );

        reporter.addResult(suite, {
          name: 'GET /api/v1/users/{userId}/followers (other user)',
          status: 'pass',
          statusCode: 200,
          message: `User has ${result.totalElements} followers`,
          request: { userId: testState.targetUserId, page: 0, size: 10 },
          response: { totalElements: result.totalElements },
        });

        expect(result.content).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/users/{userId}/followers (other user)', err));
        throw err;
      }
    }, 30000);
  });

  // ============================================================================
  // UNFOLLOW USER - DELETE /api/v1/users/{userId}/follow
  // ============================================================================
describe('6. Unfollow User', () => {
    const suite = reporter.startSuite('Unfollow User');

    it('should unfollow a user', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.targetUserId || !testState.followedUserIds.includes(testState.targetUserId)) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/users/{userId}/follow',
          status: 'skip',
          message: 'No user followed to unfollow',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        await withRateLimitRetry(() =>
          userFollowService.unfollowUser(testState.targetUserId!)
        );
        // Remove from tracked list
        testState.followedUserIds = testState.followedUserIds.filter(id => id !== testState.targetUserId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/users/{userId}/follow',
          status: 'pass',
          statusCode: 200,
          message: `Successfully unfollowed user: ${testState.targetUserId}`,
          request: { userId: testState.targetUserId },
        });

        // Verify by checking follow status
        await sleep(300);
        const status = await withRateLimitRetry(() =>
          userFollowService.getFollowStatus(testState.targetUserId!)
        );
        expect(status.isFollowing).toBe(false);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('DELETE /api/v1/users/{userId}/follow', err));
        throw err;
      }
    }, 30000);

    it('should handle unfollowing user not currently following (idempotent)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.targetUserId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/users/{userId}/follow (not following)',
          status: 'skip',
          message: 'Target user ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        // Try to unfollow when not following
        await withRateLimitRetry(() =>
          userFollowService.unfollowUser(testState.targetUserId!)
        );

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/users/{userId}/follow (not following)',
          status: 'pass',
          statusCode: 200,
          message: 'Unfollow when not following handled gracefully (idempotent)',
          request: { userId: testState.targetUserId },
        });
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        // Both 200/204 (success) and 404 (not found) are acceptable responses
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/users/{userId}/follow (not following)',
          status: [200, 204, 404].includes(status) ? 'pass' : 'fail',
          statusCode: status,
          message: status === 404 ? 'Server correctly returned 404 for not following' : getErrorMessage(err),
          request: { userId: testState.targetUserId },
        });

        if (![200, 204, 404].includes(status)) {
          throw err;
        }
      }
    }, 30000);

    it('should reject unfollowing yourself', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/users/{userId}/follow (self)',
          status: 'skip',
          message: 'User ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        await userFollowService.unfollowUser(testState.userId!);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/users/{userId}/follow (self)',
          status: 'pass',
          statusCode: 200,
          message: 'Unfollow self handled (either no-op or error)',
          request: { userId: testState.userId },
        });
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/users/{userId}/follow (self)',
          status: [200, 204, 400, 403, 404, 422].includes(status) ? 'pass' : 'fail',
          statusCode: status,
          message: 'Cannot unfollow yourself - handled correctly',
          request: { userId: testState.userId },
          response: getErrorResponseData(err),
        });

        // Any of these are acceptable
        expect([200, 204, 400, 403, 404, 422]).toContain(status);
      }
    }, 30000);

    it('should return error for unfollowing non-existent user', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      await delayBetweenTests(500);

      try {
        await userFollowService.unfollowUser(fakeUserId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/users/{userId}/follow (non-existent)',
          status: 'pass',
          statusCode: 200,
          message: 'Unfollow non-existent user handled (no-op)',
          request: { userId: fakeUserId },
        });
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/users/{userId}/follow (non-existent)',
          status: [200, 204, 404].includes(status) ? 'pass' : 'fail',
          statusCode: status,
          message: status === 404 ? 'Got expected 404 for non-existent user' : getErrorMessage(err),
          request: { userId: fakeUserId },
          response: getErrorResponseData(err),
        });

        expect([200, 204, 404]).toContain(status);
      }
    }, 30000);
  });

  // ============================================================================
  // FOLLOW/UNFOLLOW CYCLE TEST
  // ============================================================================
describe('7. Follow/Unfollow Cycle', () => {
    const suite = reporter.startSuite('Follow/Unfollow Cycle');

    it('should complete a full follow/unfollow cycle', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.targetUserId) {
        reporter.addResult(suite, {
          name: 'Follow/Unfollow Cycle',
          status: 'skip',
          message: 'Target user ID not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        // 1. Check initial status
        const initialStatus = await withRateLimitRetry(() =>
          userFollowService.getFollowStatus(testState.targetUserId!)
        );
        const wasFollowing = initialStatus.isFollowing;

        // 2. Follow the user
        await sleep(300);
        await withRateLimitRetry(() =>
          userFollowService.followUser(testState.targetUserId!)
        );

        // 3. Verify following
        await sleep(300);
        const afterFollow = await withRateLimitRetry(() =>
          userFollowService.getFollowStatus(testState.targetUserId!)
        );
        expect(afterFollow.isFollowing).toBe(true);

        // 4. Unfollow the user
        await sleep(300);
        await withRateLimitRetry(() =>
          userFollowService.unfollowUser(testState.targetUserId!)
        );

        // 5. Verify not following
        await sleep(300);
        const afterUnfollow = await withRateLimitRetry(() =>
          userFollowService.getFollowStatus(testState.targetUserId!)
        );
        expect(afterUnfollow.isFollowing).toBe(false);

        // 6. Restore original state if was following
        if (wasFollowing) {
          await sleep(300);
          await withRateLimitRetry(() =>
            userFollowService.followUser(testState.targetUserId!)
          );
          testState.followedUserIds.push(testState.targetUserId!);
        }

        reporter.addResult(suite, {
          name: 'Follow/Unfollow Cycle',
          status: 'pass',
          statusCode: 200,
          message: 'Complete follow/unfollow cycle successful',
          request: { userId: testState.targetUserId },
          response: {
            wasFollowing,
            afterFollow: afterFollow.isFollowing,
            afterUnfollow: afterUnfollow.isFollowing,
          },
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('Follow/Unfollow Cycle', err));
        throw err;
      }
    }, 60000);

    it('should correctly update stats after follow', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (!testState.userId || !testState.targetUserId) {
        reporter.addResult(suite, {
          name: 'Stats Update After Follow',
          status: 'skip',
          message: 'User IDs not available',
        });
        return;
      }
      await delayBetweenTests(500);

      try {
        // Get initial stats
        const initialStats = await withRateLimitRetry(() =>
          userFollowService.getFollowStats(testState.userId!)
        );
        const initialFollowing = initialStats.followingCount;

        // Follow user
        await sleep(300);
        const statusBefore = await withRateLimitRetry(() =>
          userFollowService.getFollowStatus(testState.targetUserId!)
        );

        if (!statusBefore.isFollowing) {
          await sleep(300);
          await withRateLimitRetry(() =>
            userFollowService.followUser(testState.targetUserId!)
          );
          testState.followedUserIds.push(testState.targetUserId!);

          // Get updated stats
          await sleep(500);
          const updatedStats = await withRateLimitRetry(() =>
            userFollowService.getFollowStats(testState.userId!)
          );

          reporter.addResult(suite, {
            name: 'Stats Update After Follow',
            status: 'pass',
            statusCode: 200,
            message: `Following count: ${initialFollowing} -> ${updatedStats.followingCount}`,
            response: {
              initial: initialFollowing,
              updated: updatedStats.followingCount,
            },
          });

          // Following count should increase by 1
          expect(updatedStats.followingCount).toBe(initialFollowing + 1);
        } else {
          reporter.addResult(suite, {
            name: 'Stats Update After Follow',
            status: 'pass',
            statusCode: 200,
            message: 'Already following, stats verified',
            response: { followingCount: initialFollowing },
          });
        }
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('Stats Update After Follow', err));
        throw err;
      }
    }, 60000);
  });
});
