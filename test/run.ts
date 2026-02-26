#!/usr/bin/env node
/**
 * Root Test Runner
 *
 * Runs all E2E test suites against the sade-mono backend (see test/README.md).
 * Same coverage as: npm run test:all
 *
 * Usage:
 *   npx tsx test/run.ts
 *   npm run test:all
 */

import { spawn } from 'child_process';

const testFiles = [
  'test/auth/test.ts',
  'test/events/test.ts',
  'test/attendee/test.ts',
  'test/budget/test.ts',
  'test/collaboration/test.ts',
  'test/feeds/test.ts',
  'test/tickets/test.ts',
  'test/timeline/test.ts',
  'test/waitlist/test.ts',
  'test/social/test.ts',
];

async function runAllTests() {
  console.log('🧪 Running E2E tests (backend: sade-mono)\n');
  console.log('='.repeat(60));

  const proc = spawn(
    'npx',
    ['vitest', 'run', ...testFiles, '--reporter=verbose'],
    {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
      env: { ...process.env, CLEAN_REPORTS: 'true' },
    }
  );

  return new Promise<void>((resolve, reject) => {
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Tests exited with code ${code}`));
    });
    proc.on('error', reject);
  });
}

runAllTests().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
