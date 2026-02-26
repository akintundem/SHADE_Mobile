/**
 * Vitest Setup File
 * 
 * Sets up global mocks and configurations for vitest tests.
 * Note: Report cleanup is handled in globalSetup.ts which runs once before all tests.
 */

// Load environment variables from .env file FIRST
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Mock React Native __DEV__ global
if (typeof global !== 'undefined') {
  (global as any).__DEV__ = process.env.NODE_ENV !== 'production';
}

// Mock other React Native globals if needed
if (typeof global !== 'undefined') {
  if (!(global as any).Platform) {
    (global as any).Platform = {
      OS: 'web',
      select: (obj: any) => obj.web || obj.default || obj.ios,
      Version: 1,
    };
  }
}
