/**
 * Auth Service E2E Tests
 *
 * Real end-to-end tests that hit the actual backend.
 * These tests authenticate with Auth0 and test all auth-related endpoints.
 *
 * Requirements:
 * - .env with AUTH0_DOMAIN, AUTH0_CLIENT_ID, API_BASE_URL
 * - .env with TEST_USER_EMAIL and TEST_USER_PASSWORD (Auth0 user)
 * - Backend must be running
 */

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { TestReporter } from '../lib/reporter';
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

// Import authService after mocks are set up
import { authService } from '../../core/auth/services/authService';
import type {
  SecureAuthResponse,
  AuthSessionResponse,
  SecureUserResponse,
  JitSignupRequest,
  UpdateUserProfileRequest,
} from '../../core/auth/types/auth';

// Test state - shared across tests
interface TestState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  accessToken: string | null;
  userId: string | null;
  user: SecureUserResponse | null;
}

const testState: TestState = {
  isAuthenticated: false,
  isOnboarded: false,
  accessToken: null,
  userId: null,
  user: null,
};

// Initialize test reporter
const reporter = new TestReporter('Auth Service E2E Test Report');

// Get test credentials from environment (with fallback to hardcoded test user)
function getTestCredentials() {
  // Try environment variables first
  let email = process.env.TEST_USER_EMAIL?.trim() || '';
  let password = process.env.TEST_USER_PASSWORD?.trim() || '';

  // Fallback to hardcoded test user if env vars not set
  if (!email || !password) {
    console.log('[Test] TEST_USER_EMAIL/TEST_USER_PASSWORD not set, using fallback test credentials');
    email = 'mayokak@gmail.com';
    password = 'fYjgit-fyhwef-5momcu';
  }

  return { email, password };
}

describe('Auth Service E2E Tests', () => {
  beforeAll(async () => {
    await delayBetweenTestFiles(2000);
    ensureAuth0ForTests();
  });

  // Generate and write report after all tests
  afterAll(() => {
    const report = reporter.generateReport();
    const reportPath = reporter.writeReport('test/reports', 'auth_test_report');
    if (process.env.SHOW_REPORT === 'true') {
      console.log('\n' + report);
      console.log(`\n📄 Report written to: ${reportPath}`);
    } else {
      console.log(`\n📄 Report written to: ${reportPath}`);
    }
  });

  // ============================================================================
  // SIGN IN - This MUST run first and succeed for other tests to work
  // ============================================================================
  describe('1. Sign In', () => {
    const suite = reporter.startSuite('Sign In');
    it('should sign in with valid credentials', async () => {
      const { email, password } = getTestCredentials();

      console.log(`[Test] Attempting sign in for: ${email}`);

      try {
        const result: SecureAuthResponse = await authService.signIn({
          email,
          password,
        });

        // Store auth state for subsequent tests
        testState.isAuthenticated = true;
        testState.accessToken = result.accessToken;
        testState.userId = result.user.id;
        testState.user = result.user;
        testState.isOnboarded = !result.onboardingRequired;

        console.log(`[Test] Sign in successful!`);
        console.log(`[Test]   User ID: ${result.user.id}`);
        console.log(`[Test]   Email: ${result.user.email}`);
        console.log(`[Test]   Onboarding required: ${result.onboardingRequired}`);

        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/signin (via Auth0)',
          status: 'pass',
          statusCode: 200,
          message: 'Sign in successful',
          request: { email, password: '***REDACTED***' },
          response: {
            message: result.message,
            user: result.user,
            tokenType: result.tokenType,
            onboardingRequired: result.onboardingRequired,
            accessToken: result.accessToken ? `${result.accessToken.substring(0, 50)}...` : null,
          },
        });

        // Assertions - these will FAIL if not met
        expect(result.user).toBeDefined();
        expect(result.user.id).toBeDefined();
        expect(result.user.id.length).toBeGreaterThan(0);
        expect(result.user.email).toBe(email);
        expect(result.accessToken).toBeDefined();
        expect(result.accessToken.length).toBeGreaterThan(0);
        expect(result.tokenType).toBe('Bearer');
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/signin (via Auth0)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { email, password: '***REDACTED***' },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 30000); // 30 second timeout for auth

    it('should sign in again with valid credentials', async () => {
      const { email, password } = getTestCredentials();

      console.log(`[Test] Attempting second sign in for: ${email}`);

      // Sign out first to allow signing in again
      try {
        await authService.logout();
        testState.isAuthenticated = false;
        testState.accessToken = null;
        testState.userId = null;
        testState.user = null;
        testState.isOnboarded = false;
        console.log('[Test] Signed out before second sign in');
      } catch (err) {
        console.warn('[Test] Error signing out (may not be signed in):', err);
      }

      try {
        const result: SecureAuthResponse = await authService.signIn({
          email,
          password,
        });

        testState.isAuthenticated = true;
        testState.accessToken = result.accessToken;
        testState.userId = result.user.id;
        testState.user = result.user;
        testState.isOnboarded = !result.onboardingRequired;

        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/signin (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Sign in successful (repeat)',
          request: { email, password: '***REDACTED***' },
          response: {
            message: result.message,
            user: result.user,
            tokenType: result.tokenType,
            onboardingRequired: result.onboardingRequired,
            accessToken: result.accessToken ? `${result.accessToken.substring(0, 50)}...` : null,
          },
        });

        expect(result.user).toBeDefined();
        expect(result.user.email).toBe(email);
        expect(result.accessToken).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/signin (repeat)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { email, password: '***REDACTED***' },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 30000);

    it('should complete onboarding if required', async () => {
      // Skip if not authenticated
      expect(testState.isAuthenticated).toBe(true);

      if (testState.isOnboarded) {
        console.log('[Test] User is already onboarded, skipping onboarding step');
        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/signup (onboarding)',
          status: 'skip',
          message: 'User already onboarded',
        });
        return;
      }

      console.log('[Test] User needs onboarding, completing now...');

      // Complete onboarding by updating profile with required fields
      const signupRequest: JitSignupRequest = {
        email: testState.user?.email || getTestCredentials().email,
        name: testState.user?.name || 'Test User',
        username: testState.user?.username || `testuser_${Date.now()}`,
        phoneNumber: '+15555550123',
        acceptTerms: true,
        acceptPrivacy: true,
        marketingOptIn: false,
      };

      try {
        const session = await authService.completeSignup(signupRequest);
        const updated = session.user;
        testState.isOnboarded = !session.onboardingRequired;
        testState.user = updated;
        testState.userId = updated.id;

        console.log('[Test] Onboarding completed successfully');
        console.log(`[Test]   Name: ${updated.name}`);
        console.log(`[Test]   Username: ${updated.username}`);

        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/signup (onboarding)',
          status: 'pass',
          statusCode: 200,
          message: 'Onboarding completed',
          request: signupRequest,
          response: updated,
        });

        expect(updated).toBeDefined();
        expect(updated.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/signup (onboarding)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: signupRequest,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should complete onboarding with alternate profile details if required', async () => {
      expect(testState.isAuthenticated).toBe(true);

      if (testState.isOnboarded) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/signup (onboarding, alternate)',
          status: 'skip',
          message: 'User already onboarded',
        });
        return;
      }

      const signupRequest: JitSignupRequest = {
        email: testState.user?.email || getTestCredentials().email,
        name: 'Alternate Test User',
        username: `altuser_${Date.now()}`,
        phoneNumber: '+15555550124',
        acceptTerms: true,
        acceptPrivacy: true,
        marketingOptIn: true,
      };

      try {
        const session = await authService.completeSignup(signupRequest);
        testState.isOnboarded = !session.onboardingRequired;
        testState.user = session.user;
        testState.userId = session.user.id;

        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/signup (onboarding, alternate)',
          status: 'pass',
          statusCode: 200,
          message: 'Onboarding completed (alternate)',
          request: signupRequest,
          response: session.user,
        });

        expect(session.user).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/signup (onboarding, alternate)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: signupRequest,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // GET AUTH SESSION
  // ============================================================================
  describe('2. Get Auth Session', () => {
    const suite = reporter.startSuite('Get Auth Session');

    it('should get the current auth session', async () => {
      // Ensure we're authenticated first
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Fetching auth session...');

      try {
        const result: AuthSessionResponse = await authService.getAuthSession();

        console.log('[Test] Auth session retrieved:');
        console.log(`[Test]   User ID: ${result.user.id}`);
        console.log(`[Test]   Email: ${result.user.email}`);
        console.log(`[Test]   Onboarding required: ${result.onboardingRequired}`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/session',
          status: 'pass',
          statusCode: 200,
          message: 'Auth session retrieved',
          response: result,
        });

        expect(result.user).toBeDefined();
        expect(result.user.id).toBe(testState.userId);
        expect(result.user.email).toBeDefined();
        expect(typeof result.onboardingRequired).toBe('boolean');
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/session',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should get the current auth session (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Fetching auth session again...');

      try {
        const result: AuthSessionResponse = await authService.getAuthSession();

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/session (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Auth session retrieved (repeat)',
          response: result,
        });

        expect(result.user).toBeDefined();
        expect(result.user.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/session (repeat)',
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
  // UPDATE USER PROFILE
  // ============================================================================
  describe('3. Update User Profile', () => {
    const suite = reporter.startSuite('Update User Profile');

    it('should update user profile name', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();

      const newName = `Test User ${Date.now()}`;
      const updateRequest: UpdateUserProfileRequest = {
        name: newName,
      };

      console.log(`[Test] Updating user profile name to: ${newName}`);

      try {
        const updated = await authService.updateUserProfile(testState.userId!, updateRequest);

        console.log('[Test] Profile updated successfully');
        console.log(`[Test]   New name: ${updated.name}`);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId} (name)',
          status: 'pass',
          statusCode: 200,
          message: 'Profile name updated',
          request: updateRequest,
          response: updated,
        });

        expect(updated).toBeDefined();
        expect(updated.name).toBe(newName);
        expect(updated.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId} (name)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: updateRequest,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should update user profile with date of birth', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();

      const updateRequest: UpdateUserProfileRequest = {
        name: testState.user?.name || 'Test User',
        dateOfBirth: '1990-01-15',
      };

      console.log('[Test] Updating user profile with date of birth...');

      try {
        const updated = await authService.updateUserProfile(testState.userId!, updateRequest);

        console.log('[Test] Profile updated with DOB');
        console.log(`[Test]   Date of birth: ${updated.dateOfBirth}`);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId} (dateOfBirth)',
          status: 'pass',
          statusCode: 200,
          message: 'Profile DOB updated',
          request: updateRequest,
          response: updated,
        });

        expect(updated).toBeDefined();
        expect(updated.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId} (dateOfBirth)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: updateRequest,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // USER DIRECTORY
  // ============================================================================
  describe('4. User Directory', () => {
    const suite = reporter.startSuite('User Directory');

    it('should list all public users in directory', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Listing public users directory...');

      try {
        const result = await authService.listDirectory({ page: 0, size: 10 });

        console.log(`[Test] Directory listed: ${result.content?.length || 0} users found`);
        console.log(`[Test]   Total elements: ${result.totalElements}`);
        console.log(`[Test]   Total pages: ${result.totalPages}`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/directory (list all)',
          status: 'pass',
          statusCode: 200,
          message: 'Directory listing retrieved',
          request: { page: 0, size: 10 },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
        expect(typeof result.totalElements).toBe('number');
        expect(typeof result.totalPages).toBe('number');
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/directory (list all)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { page: 0, size: 10 },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should search directory for users', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Searching directory for "test"...');

      try {
        const result = await authService.searchDirectory('test', { page: 0, size: 10 });

        console.log(`[Test] Directory search: ${result.content?.length || 0} users found`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/directory (search)',
          status: 'pass',
          statusCode: 200,
          message: 'Directory search completed',
          request: { searchTerm: 'test', page: 0, size: 10 },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/directory (search)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { searchTerm: 'test', page: 0, size: 10 },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should paginate directory results', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Testing directory pagination...');

      try {
        const page0 = await authService.listDirectory({ page: 0, size: 5 });
        const page1 = await authService.listDirectory({ page: 1, size: 5 });

        console.log(`[Test] Page 0: ${page0.content?.length || 0} users`);
        console.log(`[Test] Page 1: ${page1.content?.length || 0} users`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/directory (pagination)',
          status: 'pass',
          statusCode: 200,
          message: 'Pagination test completed',
          request: { page0: { page: 0, size: 5 }, page1: { page: 1, size: 5 } },
          response: { page0, page1 },
        });

        expect(page0.content).toBeDefined();
        expect(page1.content).toBeDefined();
        expect(Array.isArray(page0.content)).toBe(true);
        expect(Array.isArray(page1.content)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/directory (pagination)',
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
  // LOCATION SEARCH
  // ============================================================================
  describe('5. Location Search', () => {
    const suite = reporter.startSuite('Location Search');

    it('should search locations with query', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Searching locations for "San Francisco"...');

      try {
        const result = await authService.searchLocations('San Francisco', { page: 0, size: 10 });

        console.log(`[Test] Location search: ${result.content?.length || 0} locations found`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/locations/search (with query)',
          status: 'pass',
          statusCode: 200,
          message: 'Location search completed',
          request: { query: 'San Francisco', page: 0, size: 10 },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/locations/search (with query)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { query: 'San Francisco', page: 0, size: 10 },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should search locations without query', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Searching locations without query...');

      try {
        const result = await authService.searchLocations(undefined, { page: 0, size: 10 });

        console.log(`[Test] Location search (no query): ${result.content?.length || 0} locations found`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/locations/search (no query)',
          status: 'pass',
          statusCode: 200,
          message: 'Location search completed (no query)',
          request: { query: undefined, page: 0, size: 10 },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/locations/search (no query)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { query: undefined, page: 0, size: 10 },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // PROFILE IMAGE
  // ============================================================================
  describe('6. Profile Image', () => {
    const suite = reporter.startSuite('Profile Image');

    it('should get profile image upload URL', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Getting profile image upload URL...');

      const requestData = {
        fileName: 'test-profile-image.jpg',
        contentType: 'image/jpeg',
      };

      try {
        const result = await authService.getProfileImageUploadUrl(requestData);

        console.log('[Test] Upload URL received:');
        console.log(`[Test]   Object key: ${result.objectKey}`);
        console.log(`[Test]   Expires at: ${result.expiresAt}`);

        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/profile-image/upload-url',
          status: 'pass',
          statusCode: 200,
          message: 'Upload URL generated',
          request: requestData,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.uploadUrl).toBeDefined();
        expect(result.uploadUrl.length).toBeGreaterThan(0);
        expect(result.objectKey).toBeDefined();
        expect(result.resourceUrl).toBeDefined();
        expect(result.uploadMethod).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/profile-image/upload-url',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: requestData,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should get profile image upload URL for png', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Getting profile image upload URL (png)...');

      const requestData = {
        fileName: 'test-profile-image.png',
        contentType: 'image/png',
      };

      try {
        const result = await authService.getProfileImageUploadUrl(requestData);

        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/profile-image/upload-url (png)',
          status: 'pass',
          statusCode: 200,
          message: 'Upload URL generated (png)',
          request: requestData,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.uploadUrl).toBeDefined();
        expect(result.objectKey).toBeDefined();
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'POST /api/v1/auth/profile-image/upload-url (png)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: requestData,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);
  });

  // ============================================================================
  // VALIDATE TOKEN
  // ============================================================================
  describe('7. Token Validation', () => {
    const suite = reporter.startSuite('Token Validation');

    it('should validate the current access token', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.accessToken).toBeDefined();

      console.log('[Test] Validating access token...');

      try {
        const result = await authService.validateToken({
          token: testState.accessToken!,
        });

        console.log('[Test] Token validation result:');
        console.log(`[Test]   Valid: ${result.valid}`);
        console.log(`[Test]   User ID: ${result.user?.id || 'N/A'}`);

        reporter.addResult(suite, {
          name: 'Token validation (via Auth0)',
          status: 'pass',
          statusCode: 200,
          message: 'Token validated successfully',
          request: { token: `${testState.accessToken!.substring(0, 50)}...` },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.valid).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user?.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'Token validation (via Auth0)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should validate the current access token (repeat)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.accessToken).toBeDefined();

      console.log('[Test] Validating access token again...');

      try {
        const result = await authService.validateToken({
          token: testState.accessToken!,
        });

        reporter.addResult(suite, {
          name: 'Token validation (repeat)',
          status: 'pass',
          statusCode: 200,
          message: 'Token validated successfully (repeat)',
          request: { token: `${testState.accessToken!.substring(0, 50)}...` },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.valid).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'Token validation (repeat)',
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
  // USER POSTS AND SETTINGS
  // ============================================================================
  describe('8. User Posts and Settings', () => {
    const suite = reporter.startSuite('User Posts and Settings');

    it('should get my posts', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/me/posts',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting my posts`);

      try {
        const result = await authService.getMyPosts(0, 10);

        console.log(`[Test] Got ${result.posts?.length || 0} posts`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/me/posts',
          status: 'pass',
          statusCode: 200,
          message: 'User posts retrieved',
          request: { page: 0, size: 10 },
          response: result,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.posts)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/me/posts',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should get my posts with small page size', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/me/posts (size=1)',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting my posts (size=1)`);

      try {
        const result = await authService.getMyPosts(0, 1);

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/me/posts (size=1)',
          status: 'pass',
          statusCode: 200,
          message: 'User posts retrieved (size=1)',
          request: { page: 0, size: 1 },
          response: result,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.posts)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/me/posts (size=1)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should get user posts by id (self)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/{userId}/posts',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting posts for user: ${testState.userId}`);

      try {
        const result = await authService.getUserPosts(testState.userId, 0, 10);

        console.log(`[Test] Got ${result.posts?.length || 0} posts`);

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/{userId}/posts',
          status: 'pass',
          statusCode: 200,
          message: 'User posts retrieved',
          request: { userId: testState.userId, page: 0, size: 10 },
          response: result,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.posts)).toBe(true);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/{userId}/posts',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should update my notification settings', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/notification-settings',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      const request = {
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        eventRemindersEnabled: true,
      };

      console.log('[Test] Updating my notification settings');

      try {
        const result = await authService.updateMyNotificationSettings(request);

        console.log(`[Test] Notification settings updated`);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/notification-settings',
          status: 'pass',
          statusCode: 200,
          message: 'Notification settings updated',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/notification-settings',
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

    it('should update my notification settings (disable all)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/notification-settings (disable)',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      const request = {
        emailNotificationsEnabled: false,
        pushNotificationsEnabled: false,
        eventRemindersEnabled: false,
      };

      console.log('[Test] Disabling my notification settings');

      try {
        const result = await authService.updateMyNotificationSettings(request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/notification-settings (disable)',
          status: 'pass',
          statusCode: 200,
          message: 'Notification settings disabled',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/notification-settings (disable)',
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

    it('should update notification settings for user id (self)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId}/notification-settings',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      const request = {
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        eventRemindersEnabled: false,
      };

      console.log(`[Test] Updating notification settings for user: ${testState.userId}`);

      try {
        const result = await authService.updateNotificationSettings(testState.userId, request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId}/notification-settings',
          status: 'pass',
          statusCode: 200,
          message: 'Notification settings updated for user',
          request: { userId: testState.userId, ...request },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId}/notification-settings',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { userId: testState.userId, ...request },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should update my privacy settings', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/privacy-settings',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      const request = {
        profileVisibility: 'PUBLIC' as const,
        searchVisibility: true,
      };

      console.log('[Test] Updating my privacy settings');

      try {
        const result = await authService.updateMyPrivacySettings(request);

        console.log(`[Test] Privacy settings updated`);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/privacy-settings',
          status: 'pass',
          statusCode: 200,
          message: 'Privacy settings updated',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/privacy-settings',
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

    it('should update my privacy settings (private)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/privacy-settings (private)',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      const request = {
        profileVisibility: 'PRIVATE' as const,
        searchVisibility: false,
      };

      console.log('[Test] Updating my privacy settings to private');

      try {
        const result = await authService.updateMyPrivacySettings(request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/privacy-settings (private)',
          status: 'pass',
          statusCode: 200,
          message: 'Privacy settings updated (private)',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/privacy-settings (private)',
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

    it('should update privacy settings for user id (self)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId}/privacy-settings',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      const request = {
        profileVisibility: 'PUBLIC' as const,
        searchVisibility: true,
      };

      console.log(`[Test] Updating privacy settings for user: ${testState.userId}`);

      try {
        const result = await authService.updatePrivacySettings(testState.userId, request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId}/privacy-settings',
          status: 'pass',
          statusCode: 200,
          message: 'Privacy settings updated for user',
          request: { userId: testState.userId, ...request },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId}/privacy-settings',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { userId: testState.userId, ...request },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should update my security settings', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/security-settings',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      const request = {
        mfaEnabled: false,
        autoAcceptInvitations: false,
      };

      console.log('[Test] Updating my security settings');

      try {
        const result = await authService.updateMySecuritySettings(request);

        console.log(`[Test] Security settings updated`);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/security-settings',
          status: 'pass',
          statusCode: 200,
          message: 'Security settings updated',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/security-settings',
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

    it('should update my security settings (auto-accept)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/security-settings (auto-accept)',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      const request = {
        mfaEnabled: false,
        autoAcceptInvitations: true,
      };

      console.log('[Test] Updating my security settings (auto-accept)');

      try {
        const result = await authService.updateMySecuritySettings(request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/security-settings (auto-accept)',
          status: 'pass',
          statusCode: 200,
          message: 'Security settings updated (auto-accept)',
          request,
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/me/security-settings (auto-accept)',
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

    it('should update security settings for user id (self)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();
      
      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId}/security-settings',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      const request = {
        mfaEnabled: false,
        autoAcceptInvitations: true,
      };

      console.log(`[Test] Updating security settings for user: ${testState.userId}`);

      try {
        const result = await authService.updateSecuritySettings(testState.userId, request);

        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId}/security-settings',
          status: 'pass',
          statusCode: 200,
          message: 'Security settings updated for user',
          request: { userId: testState.userId, ...request },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.userId);
      } catch (err: any) {
        reporter.addResult(suite, {
          name: 'PUT /api/v1/auth/users/{userId}/security-settings',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: err.message,
          request: { userId: testState.userId, ...request },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

  });

  // ============================================================================
  // ADMIN USER ACCESS
  // ============================================================================
  describe('9. Admin User Access', () => {
    const suite = reporter.startSuite('Admin User Access');

    it('should get user by id (admin or forbidden)', async () => {
      expect(testState.isAuthenticated).toBe(true);
      expect(testState.userId).toBeDefined();

      if (!testState.userId) {
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/{userId}',
          status: 'skip',
          message: 'User ID not available (setup may have failed)',
        });
        return;
      }

      console.log(`[Test] Getting user by id: ${testState.userId}`);

      try {
        const result = await authService.getUser(testState.userId);

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/{userId}',
          status: 'pass',
          statusCode: 200,
          message: 'User retrieved',
          request: { userId: testState.userId },
          response: result,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(testState.userId);
      } catch (err: any) {
        const status = err.response?.status || err.status;
        if (status === 401 || status === 403) {
          reporter.addResult(suite, {
            name: 'GET /api/v1/auth/users/{userId}',
            status: 'pass',
            statusCode: status,
            message: 'Access denied for non-admin user',
            request: { userId: testState.userId },
            response: err.response?.data,
          });
          return;
        }

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/{userId}',
          status: 'fail',
          statusCode: status,
          message: err.message,
          request: { userId: testState.userId },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should search users with term (admin or forbidden)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      const searchTerm = testState.user?.email?.split('@')[0] || 'test';

      console.log(`[Test] Searching users with term: ${searchTerm}`);

      try {
        const result = await authService.searchSecureUsers(searchTerm, { page: 0, size: 5 });

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/search',
          status: 'pass',
          statusCode: 200,
          message: 'User search completed',
          request: { searchTerm, page: 0, size: 5 },
          response: result,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (err: any) {
        const status = err.response?.status || err.status;
        if (status === 401 || status === 403) {
          reporter.addResult(suite, {
            name: 'GET /api/v1/auth/users/search',
            status: 'pass',
            statusCode: status,
            message: 'Access denied for non-admin user',
            request: { searchTerm, page: 0, size: 5 },
            response: err.response?.data,
          });
          return;
        }

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/search',
          status: 'fail',
          statusCode: status,
          message: err.message,
          request: { searchTerm, page: 0, size: 5 },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 15000);

    it('should reject empty search term (bad request or forbidden)', async () => {
      expect(testState.isAuthenticated).toBe(true);

      console.log('[Test] Searching users with empty term');

      try {
        const result = await authService.searchSecureUsers('', { page: 0, size: 5 });

        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/search (empty)',
          status: 'fail',
          statusCode: 200,
          message: 'Expected error for empty searchTerm',
          request: { searchTerm: '', page: 0, size: 5 },
          response: result,
        });

        expect(false).toBe(true);
      } catch (err: any) {
        const status = err.response?.status || err.status;
        const isExpected = status === 400 || status === 401 || status === 403;
        reporter.addResult(suite, {
          name: 'GET /api/v1/auth/users/search (empty)',
          status: isExpected ? 'pass' : 'fail',
          statusCode: status,
          message: isExpected ? 'Request rejected as expected' : err.message,
          request: { searchTerm: '', page: 0, size: 5 },
          response: err.response?.data,
          error: isExpected ? undefined : err.stack,
        });

        expect(isExpected).toBe(true);
      }
    }, 15000);
  });
});
