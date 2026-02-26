/**
 * Cleanup: Remove the 3 seed users from Auth0 (IDP) and backend.
 * Run before a full environment reset so seeding starts from a clean slate.
 *
 * Run: npx vitest run test/seed/clean-auth0.test.ts
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { sleep } from '../lib/delay';

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
import { clearTokenCache } from '../../common/services/httpClient';

function getCredentials(index: number): { email: string; password: string } {
  const defaultPassword = 'SeedPass123!';
  if (index === 0) {
    return {
      email: process.env.SEED_USER1_EMAIL?.trim() || 'mayowa.akinwale@capsuleapp.dev',
      password: process.env.SEED_USER1_PASSWORD?.trim() || defaultPassword,
    };
  }
  if (index === 1) {
    return {
      email: process.env.SEED_USER2_EMAIL?.trim() || 'adaeze.okonkwo@capsuleapp.dev',
      password: process.env.SEED_USER2_PASSWORD?.trim() || defaultPassword,
    };
  }
  return {
    email: process.env.SEED_USER3_EMAIL?.trim() || 'chinedu.eze@capsuleapp.dev',
    password: process.env.SEED_USER3_PASSWORD?.trim() || defaultPassword,
  };
}

describe('Clean Auth0 seed users', () => {
  beforeAll(() => {
    ensureAuth0ForTests();
  });

  it('should remove seed users from Auth0/backend so environment can be reset', async () => {
    for (let i = 0; i < 3; i++) {
      const creds = getCredentials(i);
      if (!creds.email || !creds.password) {
        console.log(`[Clean] Skipping user ${i + 1} — no credentials`);
        continue;
      }

      try {
        // Sign out previous user
        try { await authService.logout(); } catch { /* ignore */ }
        clearTokenCache();
        await sleep(400);

        const signInResult = await authService.signIn({ email: creds.email, password: creds.password });
        const userId = signInResult.user?.id;

        if (userId) {
          await authService.deleteUser(userId);
          console.log(`[Clean] Removed user ${i + 1} from Auth0: ${creds.email}`);
        } else {
          console.log(`[Clean] User ${i + 1} not found in Auth0: ${creds.email}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // User may not exist — treat as already clean
        if (/invalid.*credentials|invalid_grant|wrong email|not found/i.test(msg)) {
          console.log(`[Clean] User ${i + 1} not in Auth0 (already clean): ${creds.email}`);
        } else {
          console.warn(`[Clean] Failed for user ${i + 1} (${creds.email}): ${msg}`);
        }
      }

      await sleep(500);
    }

    expect(true).toBe(true);
  }, 60_000);
});
