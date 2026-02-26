/**
 * Auth Signup E2E Test
 *
 * Tests Auth0 signUp flow via authService.
 *
 * Requirements:
 * - .env with AUTH0_DOMAIN, AUTH0_CLIENT_ID
 * - Backend does NOT need to be running (signup goes to Auth0)
 */

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import { TestReporter } from '../lib/reporter';

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

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { ensureAuth0ForTests } from '../lib/auth0TestConfig';
import { authService } from '../../core/auth/services/authService';

const reporter = new TestReporter('Auth Signup E2E Test Report');

function generateTestEmail(): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `testuser_${timestamp}_${rand}@testcapsule.dev`;
}

const TEST_PASSWORD = 'TestPass1!Strong';

describe('Auth Signup E2E Tests', () => {
  beforeAll(() => {
    ensureAuth0ForTests();
  });

  afterAll(() => {
    const report = reporter.generateReport();
    const reportPath = reporter.writeReport('test/reports', 'signup_test_report');
    console.log('\n' + report);
    console.log(`\nReport written to: ${reportPath}`);
  });

  describe('1. authService.signUp (direct)', () => {
    const suite = reporter.startSuite('Auth0 signUp via authService');

    it('should sign up a new user via authService', async () => {
      const email = generateTestEmail();
      console.log(`\n[Signup Test] Email: ${email}`);

      try {
        const result = await authService.signUp({
          email,
          password: TEST_PASSWORD,
        });

        console.log(`[Signup Test] signUp SUCCESS:`, result);
        reporter.addResult(suite, {
          name: 'Auth0 signUp (direct)',
          status: 'pass',
          statusCode: 200,
          message: 'Sign up successful',
          request: { email, password: '***REDACTED***' },
          response: result,
        });
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      } catch (err: any) {
        console.error(`[Signup Test] signUp FAILED:`, err?.message);
        reporter.addResult(suite, {
          name: 'Auth0 signUp (direct)',
          status: 'fail',
          statusCode: err.response?.status || err.status,
          message: `${err.name}: ${err.message}`,
          request: { email, password: '***REDACTED***' },
          response: err.response?.data,
          error: err.stack,
        });
        throw err;
      }
    }, 30000);
  });

  describe('2. authService.signUp (app flow)', () => {
    const suite = reporter.startSuite('authService.signUp');

    it('should sign up a new user via authService', async () => {
      const email = generateTestEmail();
      console.log(`\n[Signup Test] Testing authService.signUp with ${email}`);

      try {
        const result = await authService.signUp({
          email,
          password: TEST_PASSWORD,
        });
        console.log(`[Signup Test] authService.signUp SUCCESS:`, result);
        reporter.addResult(suite, {
          name: 'authService.signUp',
          status: 'pass',
          statusCode: 200,
          message: 'authService signUp successful',
          request: { email, password: '***REDACTED***' },
          response: result,
        });
        expect(result.success).toBe(true);
      } catch (err: any) {
        console.error(`[Signup Test] authService.signUp FAILED:`, err?.message);
        reporter.addResult(suite, {
          name: 'authService.signUp',
          status: 'fail',
          message: `${err.name}: ${err.message}`,
          request: { email, password: '***REDACTED***' },
          error: err.stack,
        });
        throw err;
      }
    }, 30000);
  });

  describe('3. Password validation and duplicate email', () => {
    const suite = reporter.startSuite('Password and duplicate email');

    it('should reject a weak password', async () => {
      const email = generateTestEmail();
      try {
        await authService.signUp({
          email,
          password: 'weak',
        });
        console.log(`[Signup Test] UNEXPECTED: Weak password accepted`);
        reporter.addResult(suite, {
          name: 'Auth0 signUp (weak password)',
          status: 'fail',
          message: 'Weak password was unexpectedly accepted',
          request: { email, password: 'weak' },
        });
      } catch (err: any) {
        const isExpectedError =
          err.name === 'InvalidPasswordException' ||
          err.message?.toLowerCase().includes('password');
        reporter.addResult(suite, {
          name: 'Auth0 signUp (weak password)',
          status: isExpectedError ? 'pass' : 'fail',
          message: `${err.name}: ${err.message}`,
          request: { email, password: 'weak' },
        });
        expect(isExpectedError).toBe(true);
      }
    }, 30000);

    it('should reject duplicate email signup', async () => {
      const email = generateTestEmail();
      try {
        await authService.signUp({ email, password: TEST_PASSWORD });
        console.log(`[Signup Test] First signup succeeded`);
      } catch (err: any) {
        console.error(`[Signup Test] First signup failed:`, err?.message);
        reporter.addResult(suite, {
          name: 'Auth0 signUp (duplicate - first attempt)',
          status: 'fail',
          message: `First signup failed: ${err.name}: ${err.message}`,
          request: { email },
          error: err.stack,
        });
        throw err;
      }

      try {
        await authService.signUp({ email, password: TEST_PASSWORD });
        console.log(`[Signup Test] UNEXPECTED: Duplicate email accepted`);
        reporter.addResult(suite, {
          name: 'Auth0 signUp (duplicate email)',
          status: 'fail',
          message: 'Duplicate email was unexpectedly accepted',
          request: { email },
        });
      } catch (err: any) {
        const isExpectedError =
          err.name === 'UsernameExistsException' ||
          err.message?.toLowerCase().includes('exists') ||
          err.message?.toLowerCase().includes('already');
        reporter.addResult(suite, {
          name: 'Auth0 signUp (duplicate email)',
          status: isExpectedError ? 'pass' : 'fail',
          message: `${err.name}: ${err.message}`,
          request: { email },
        });
        expect(isExpectedError).toBe(true);
      }
    }, 30000);
  });
});
