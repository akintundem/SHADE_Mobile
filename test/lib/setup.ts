/**
 * Test Setup Utilities
 *
 * Sets up the test environment for testing core services:
 * - Mocks React Native modules for Node.js environment
 * - Auth uses Auth0 (set AUTH0_DOMAIN, AUTH0_CLIENT_ID in env for auth tests)
 * - Injects test HTTP client into core services
 * - Provides cleanup functions
 */

// Mock React Native modules before any imports
if (typeof global !== 'undefined') {
  // Mock Platform
  if (!global.Platform) {
    // @ts-ignore
    global.Platform = {
      OS: 'web',
      select: (obj: any) => obj.web || obj.default || obj.ios,
      Version: 1,
    };
  }

  // Mock AsyncStorage
  if (!global.AsyncStorage) {
    // @ts-ignore
    global.AsyncStorage = {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
      clear: async () => {},
      getAllKeys: async () => [],
      multiGet: async () => [],
      multiSet: async () => {},
      multiRemove: async () => {},
    };
  }
}

import { AxiosInstance } from 'axios';

// This will be set by the test file's mock
export let setTestHttpClient: ((client: AxiosInstance | null) => void) | null = null;

/**
 * Setup test environment for core service tests.
 * Auth uses Auth0 (AUTH0_DOMAIN, AUTH0_CLIENT_ID from env).
 *
 * @param testHttp - Test HTTP client instance
 * @param setClientFn - Function to set the test HTTP client in the mock
 * @returns Cleanup function to restore original state
 */
export function setupTestEnvironment(
  testHttp: AxiosInstance,
  setClientFn?: (client: AxiosInstance | null) => void
): () => void {
  if (setClientFn) {
    setClientFn(testHttp);
  }
  return () => {
    if (setClientFn) {
      setClientFn(null);
    }
  };
}

/**
 * Load configuration from environment variables.
 * Backend API: sade-mono (see test/README.md BACKEND section).
 */
export function loadTestConfig() {
  return {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
    accessToken: process.env.API_ACCESS_TOKEN || '',
    deviceId: process.env.API_DEVICE_ID || `test-device-${Date.now()}`,
    serviceApiKey: process.env.API_SERVICE_API_KEY || '',
    loginEmail: process.env.LOGIN_EMAIL || '',
    loginPassword: process.env.LOGIN_PASSWORD || '',
    // Auth0 (for auth tests)
    auth0Domain: process.env.AUTH0_DOMAIN || '',
    auth0ClientId: process.env.AUTH0_CLIENT_ID || '',
  };
}
