#!/usr/bin/env node
/**
 * Events Service Test Runner
 * 
 * Runs all events service tests and generates a comprehensive report.
 * 
 * Usage:
 *   npm run test:events
 *   or
 *   tsx test/events/run.ts
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const testFiles = [
  'test.ts',
];

async function runTests() {
  const testDir = path.join(__dirname);
  const results: Array<{ file: string; success: boolean; error?: string }> = [];

  console.log('🧪 Running Events Service Tests\n');
  console.log('='.repeat(50));
  console.log('');

  for (const testFile of testFiles) {
    const testPath = path.join(testDir, testFile);
    
    if (!fs.existsSync(testPath)) {
      console.log(`⏭️  Skipping ${testFile} (file not found)`);
      continue;
    }

    console.log(`\n📋 Running ${testFile}...`);
    console.log('-'.repeat(50));

    try {
      await runTestFile(testPath);
      results.push({ file: testFile, success: true });
      console.log(`✅ ${testFile} completed`);
    } catch (error: any) {
      results.push({ file: testFile, success: false, error: error.message });
      console.log(`❌ ${testFile} failed: ${error.message}`);
    }
  }

  // Summary
  console.log('\n');
  console.log('='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.file}: ${r.error}`);
    });
    process.exit(1);
  }
}

function runTestFile(testPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['tsx', testPath], {
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test exited with code ${code}`));
      }
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

// Run all tests
runTests().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
