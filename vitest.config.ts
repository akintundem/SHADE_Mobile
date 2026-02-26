import { defineConfig } from 'vitest/config';
import path from 'path';

// Load .env file at config time
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts', 'test/**/test.ts'],
    exclude: ['node_modules', '**/node_modules/**'],
    globalSetup: './test/lib/globalSetup.ts',
    setupFiles: ['./test/lib/vitest-setup.ts'],
    // Run tests sequentially to avoid rate limiting from backend
    sequence: {
      concurrent: false,
      shuffle: false,
    },
    // CRITICAL: Disable file parallelism to run test files one at a time
    fileParallelism: false,
    // Limit concurrency to 1 to ensure sequential execution
    maxConcurrency: 1,
    // Use single thread pool to ensure complete sequential execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Increase test timeout to account for delays and retries
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  esbuild: {
    target: 'node20',
  },
  resolve: {
    alias: {
      'react-native': path.resolve(__dirname, 'test/lib/react-native-mock.ts'),
      '@react-native': path.resolve(__dirname, 'test/lib/react-native-mock.ts'),
    },
  },
});
