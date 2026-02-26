/**
 * Feeds Service E2E Tests
 *
 * Real end-to-end tests that hit the actual backend.
 * These tests authenticate with Auth0 and test all feed-related endpoints.
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
import { feedService } from '../../core/feeds/services/feeds';
import type { SecureUserResponse } from '../../core/auth/types/auth';
import {
  FeedPostCreateRequest,
  PostListRequest,
  CommentCreateRequest,
  CommentUpdateRequest,
  PostType,
  QuotePostRequest,
} from '../../core/feeds/types/feeds';
import { getErrorStatus } from '../lib/types';
import { createErrorResult } from '../lib/errorHelpers';

// Test state - shared across tests
interface TestState {
  isAuthenticated: boolean;
  userId: string | null;
  user: SecureUserResponse | null;
  eventId: string | null;
  createdPostId: string | null;
}

const testState: TestState = {
  isAuthenticated: false,
  userId: null,
  user: null,
  eventId: process.env.TEST_EVENT_ID?.trim() || null,
  createdPostId: null,
};

// Initialize test reporter
const reporter = new TestReporter('Feeds Service E2E Test Report');

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


describe('Feeds Service E2E Tests', () => {
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

  // Setup: Create a post before listing tests
  beforeAll(async () => {
    if (!testState.eventId || !testState.isAuthenticated) {
      return;
    }

    console.log('[Test Setup] Creating test post...');
    try {
      const postRequest: FeedPostCreateRequest = {
        type: PostType.TEXT,
        content: 'E2E test post created in setup',
      };
      const result = await feedService.createPost(testState.eventId, postRequest);
      testState.createdPostId = result.post.id;
      console.log(`[Test Setup] Created test post: ${testState.createdPostId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Test Setup] Failed to create test post:', errorMessage);
      // Continue anyway - tests will handle the missing postId
    }
  });

  // Generate and write report after all tests
  afterAll(() => {
    const report = reporter.generateReport();
    const reportPath = reporter.writeReport('test/reports', 'feeds_test_report');
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
  // LIST POSTS - GET /api/v1/events/{id}/posts
  // ============================================================================
  describe('1. List Posts', () => {
    const suite = reporter.startSuite('List Posts');

    it('should list posts for an event', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: PostListRequest = {
        page: 0,
        size: 10,
      };

      console.log(`[Test] Listing posts for event: ${testState.eventId}`);

      try {
        const result = await feedService.listPosts(testState.eventId, request);

        console.log(`[Test] Found posts`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts',
          status: 'pass',
          statusCode: 200,
          message: 'Posts listed',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts',
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

    it('should list posts with a small page size', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts (size=1)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: PostListRequest = {
        page: 0,
        size: 1,
      };

      console.log(`[Test] Listing posts with size=1 for event: ${testState.eventId}`);

      try {
        const result = await feedService.listPosts(testState.eventId, request);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts (size=1)',
          status: 'pass',
          statusCode: 200,
          message: 'Posts listed with size=1',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts (size=1)',
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
  // CREATE POST - POST /api/v1/events/{id}/posts
  // ============================================================================
  describe('2. Create Post', () => {
    const suite = reporter.startSuite('Create Post');

    it('should create a text post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: FeedPostCreateRequest = {
        type: PostType.TEXT,
        content: 'E2E test post content (additional post)',
      };

      console.log(`[Test] Creating text post for event: ${testState.eventId}`);

      try {
        const result = await feedService.createPost(testState.eventId, request);

        console.log(`[Test] Post created: ${result.post.id}`);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts',
          status: 'pass',
          statusCode: 200,
          message: 'Post created',
          request,
          response: result,
        });

        expect(result.post).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts',
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

    it('should create a short text post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts (short)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const request: FeedPostCreateRequest = {
        type: PostType.TEXT,
        content: 'Short post.',
      };

      console.log(`[Test] Creating short text post for event: ${testState.eventId}`);

      try {
        const result = await feedService.createPost(testState.eventId, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts (short)',
          status: 'pass',
          statusCode: 200,
          message: 'Short post created',
          request,
          response: result,
        });

        expect(result.post).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts (short)',
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
  // GET POST - GET /api/v1/events/{id}/posts/{postId}
  // ============================================================================
  describe('3. Get Post', () => {
    const suite = reporter.startSuite('Get Post');

    it('should get a post by ID', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdPostId).toBeDefined();
      
      if (!testState.eventId || !testState.createdPostId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts/{postId}',
          status: 'skip',
          message: 'Post ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting post: ${testState.createdPostId}`);

      try {
        const result = await feedService.getPost(testState.eventId, testState.createdPostId);

        console.log(`[Test] Got post: ${result.id}`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts/{postId}',
          status: 'pass',
          statusCode: 200,
          message: 'Post retrieved',
          request: { eventId: testState.eventId, postId: testState.createdPostId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.createdPostId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts/{postId}',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { eventId: testState.eventId, postId: testState.createdPostId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should get a post by ID (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdPostId).toBeDefined();
      
      if (!testState.eventId || !testState.createdPostId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts/{postId} (repeat)',
          status: 'skip',
          message: 'Post ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting post again: ${testState.createdPostId}`);

      try {
        const result = await feedService.getPost(testState.eventId, testState.createdPostId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts/{postId} (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Post retrieved (repeat)',
          request: { eventId: testState.eventId, postId: testState.createdPostId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.createdPostId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts/{postId} (repeat)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { eventId: testState.eventId, postId: testState.createdPostId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // REPOST - POST /api/v1/events/{id}/posts/{postId}/repost
  // ============================================================================
  describe('4. Repost', () => {
    const suite = reporter.startSuite('Repost');

    it('should repost a post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdPostId).toBeDefined();
      
      if (!testState.eventId || !testState.createdPostId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/repost',
          status: 'skip',
          message: 'Post ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Reposting post: ${testState.createdPostId}`);

      try {
        const result = await feedService.repost(testState.eventId, testState.createdPostId);

        console.log(`[Test] Reposted post: ${result.id}`);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/repost',
          status: 'pass',
          statusCode: 200,
          message: 'Post reposted',
          request: { eventId: testState.eventId, postId: testState.createdPostId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/repost',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { eventId: testState.eventId, postId: testState.createdPostId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should repost a newly created post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      
      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/repost (new)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      try {
        const createRequest: FeedPostCreateRequest = {
          type: PostType.TEXT,
          content: `Repost seed ${Date.now()}`,
        };
        const created = await feedService.createPost(testState.eventId, createRequest);

        const result = await feedService.repost(testState.eventId, created.post.id);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/repost (new)',
          status: 'pass',
          statusCode: 200,
          message: 'New post reposted',
          request: { eventId: testState.eventId, postId: created.post.id },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/repost (new)',
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
  // QUOTE POST - POST /api/v1/events/{id}/posts/{postId}/quote
  // ============================================================================
  describe('5. Quote Post', () => {
    const suite = reporter.startSuite('Quote Post');

    it('should quote an existing post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdPostId).toBeDefined();

      if (!testState.eventId || !testState.createdPostId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/quote',
          status: 'skip',
          message: 'Post ID not available (setup may have failed)',
        });
        return;
      }

      const request: QuotePostRequest = {
        quoteText: `Quote test ${Date.now()}`,
      };

      try {
        const result = await feedService.quotePost(testState.eventId, testState.createdPostId, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/quote',
          status: 'pass',
          statusCode: 200,
          message: 'Post quoted',
          request: { eventId: testState.eventId, postId: testState.createdPostId, ...request },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.quoteText).toBe(request.quoteText);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/quote',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { eventId: testState.eventId, postId: testState.createdPostId, ...request },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should quote a newly created post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/quote (new)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      try {
        const createRequest: FeedPostCreateRequest = {
          type: PostType.TEXT,
          content: `Quote seed ${Date.now()}`,
        };
        const created = await feedService.createPost(testState.eventId, createRequest);

        const request: QuotePostRequest = {
          quoteText: `Quoted ${created.post.id}`,
        };
        const result = await feedService.quotePost(testState.eventId, created.post.id, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/quote (new)',
          status: 'pass',
          statusCode: 200,
          message: 'New post quoted',
          request: { eventId: testState.eventId, postId: created.post.id, ...request },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.quoteText).toBe(request.quoteText);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/quote (new)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should return 404 for quoting a non-existent post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/quote (non-existent)',
          status: 'skip',
          message: 'Event ID not available (setup may have failed)',
        });
        return;
      }

      const fakePostId = '00000000-0000-0000-0000-000000000000';
      const request: QuotePostRequest = {
        quoteText: 'Should fail',
      };

      try {
        await feedService.quotePost(testState.eventId, fakePostId, request);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/quote (non-existent)',
          status: 'fail',
          message: 'Expected 404 but request succeeded',
          request: { eventId: testState.eventId, postId: fakePostId, ...request },
        });
        expect(true).toBe(false);
      } catch (err: any) {
        const status = err.response?.status || err.status;
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/quote (non-existent)',
          status: status === 404 ? 'pass' : 'fail',
          statusCode: status,
          message: status === 404 ? 'Got expected 404 for non-existent post' : err.message,
          request: { eventId: testState.eventId, postId: fakePostId, ...request },
          response: err.response?.data,
        });

        expect(status).toBe(404);
      }
    }, 15000);
  });

  // ============================================================================
  // LIKE POST - POST /api/v1/events/{id}/posts/{postId}/likes
  // ============================================================================
  describe('6. Like Post', () => {
    const suite = reporter.startSuite('Like Post');

    it('should like a post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdPostId).toBeDefined();

      if (!testState.eventId || !testState.createdPostId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/likes',
          status: 'skip',
          message: 'Post ID not available',
        });
        return;
      }

      try {
        await feedService.likePost(testState.eventId, testState.createdPostId);

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/likes',
          status: 'pass',
          statusCode: 200,
          message: 'Post liked',
          request: { eventId: testState.eventId, postId: testState.createdPostId },
        });
      } catch (err: unknown) {
        // 409 is acceptable if already liked
        const status = getErrorStatus(err);
        if (status === 409) {
          reporter.addResult(suite, {
            name: 'POST /api/v1/events/{id}/posts/{postId}/likes',
            status: 'pass',
            statusCode: 409,
            message: 'Post already liked (idempotent)',
          });
        } else {
          reporter.addResult(suite, createErrorResult('POST /api/v1/events/{id}/posts/{postId}/likes', err));
          throw err;
        }
      }
    }, 15000);

    it('should unlike a post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdPostId).toBeDefined();

      if (!testState.eventId || !testState.createdPostId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/posts/{postId}/likes',
          status: 'skip',
          message: 'Post ID not available',
        });
        return;
      }

      try {
        await feedService.unlikePost(testState.eventId, testState.createdPostId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/posts/{postId}/likes',
          status: 'pass',
          statusCode: 200,
          message: 'Post unliked',
          request: { eventId: testState.eventId, postId: testState.createdPostId },
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('DELETE /api/v1/events/{id}/posts/{postId}/likes', err));
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // COMMENTS - CRUD
  // ============================================================================
  describe('7. Comments', () => {
    const suite = reporter.startSuite('Comments');

    let createdCommentId: string | null = null;

    it('should create a comment on a post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdPostId).toBeDefined();

      if (!testState.eventId || !testState.createdPostId) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/comments',
          status: 'skip',
          message: 'Post ID not available',
        });
        return;
      }

      const request: CommentCreateRequest = {
        content: `E2E test comment ${Date.now()}`,
      };

      try {
        const result = await feedService.createComment(testState.eventId, testState.createdPostId, request);
        createdCommentId = result.id;

        reporter.addResult(suite, {
          name: 'POST /api/v1/events/{id}/posts/{postId}/comments',
          status: 'pass',
          statusCode: 201,
          message: 'Comment created',
          request,
          response: result,
        });

        expect(result.id).toBeDefined();
        expect(result.content).toBe(request.content);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('POST /api/v1/events/{id}/posts/{postId}/comments', err, request));
        throw err;
      }
    }, 15000);

    it('should get comments for a post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdPostId).toBeDefined();

      if (!testState.eventId || !testState.createdPostId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts/{postId}/comments',
          status: 'skip',
          message: 'Post ID not available',
        });
        return;
      }

      try {
        const result = await feedService.getComments(testState.eventId, testState.createdPostId, { page: 0, size: 10 });

        reporter.addResult(suite, {
          name: 'GET /api/v1/events/{id}/posts/{postId}/comments',
          status: 'pass',
          statusCode: 200,
          message: `Got ${result.content?.length || 0} comments`,
          request: { postId: testState.createdPostId },
          response: result,
        });

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('GET /api/v1/events/{id}/posts/{postId}/comments', err));
        throw err;
      }
    }, 15000);

    it('should update a comment', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdPostId).toBeDefined();

      if (!testState.eventId || !testState.createdPostId || !createdCommentId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/posts/{postId}/comments/{commentId}',
          status: 'skip',
          message: 'Comment ID not available',
        });
        return;
      }

      const request: CommentUpdateRequest = {
        content: `Updated E2E comment ${Date.now()}`,
      };

      try {
        const result = await feedService.updateComment(
          testState.eventId,
          testState.createdPostId,
          createdCommentId,
          request
        );

        reporter.addResult(suite, {
          name: 'PUT /api/v1/events/{id}/posts/{postId}/comments/{commentId}',
          status: 'pass',
          statusCode: 200,
          message: 'Comment updated',
          request,
          response: result,
        });

        expect(result).toBeDefined();
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('PUT /api/v1/events/{id}/posts/{postId}/comments/{commentId}', err, request));
        throw err;
      }
    }, 15000);

    it('should delete a comment', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();
      expect(testState.createdPostId).toBeDefined();

      if (!testState.eventId || !testState.createdPostId || !createdCommentId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/posts/{postId}/comments/{commentId}',
          status: 'skip',
          message: 'Comment ID not available',
        });
        return;
      }

      try {
        await feedService.deleteComment(testState.eventId, testState.createdPostId, createdCommentId);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/posts/{postId}/comments/{commentId}',
          status: 'pass',
          statusCode: 204,
          message: 'Comment deleted',
          request: { commentId: createdCommentId },
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('DELETE /api/v1/events/{id}/posts/{postId}/comments/{commentId}', err));
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // DELETE POST - DELETE /api/v1/events/{id}/posts/{postId}
  // ============================================================================
  describe('8. Delete Post', () => {
    const suite = reporter.startSuite('Delete Post');

    it('should delete a post', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.eventId).toBeDefined();

      if (!testState.eventId) {
        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/posts/{postId}',
          status: 'skip',
          message: 'Event ID not available',
        });
        return;
      }

      // Create a new post to delete
      try {
        const createRequest: FeedPostCreateRequest = {
          type: PostType.TEXT,
          content: `Delete target ${Date.now()}`,
        };
        const created = await feedService.createPost(testState.eventId, createRequest);

        await feedService.deletePost(testState.eventId, created.post.id);

        reporter.addResult(suite, {
          name: 'DELETE /api/v1/events/{id}/posts/{postId}',
          status: 'pass',
          statusCode: 204,
          message: 'Post deleted',
          request: { postId: created.post.id },
        });
      } catch (err: unknown) {
        reporter.addResult(suite, createErrorResult('DELETE /api/v1/events/{id}/posts/{postId}', err));
        throw err;
      }
    }, 20000);
  });
});
