/**
 * Global Setup for Vitest
 * 
 * This runs ONCE before all tests, across all workers.
 * Use this for one-time setup tasks like cleaning the reports directory.
 */

import * as fs from 'fs';
import * as path from 'path';

export default function globalSetup() {
  // Only clean reports when CLEAN_REPORTS=true (set by test:all script)
  if (process.env.CLEAN_REPORTS === 'true') {
    cleanReportsDirectory();
  }
}

function cleanReportsDirectory(reportsDir: string = 'test/reports'): void {
  const reportsPath = path.resolve(process.cwd(), reportsDir);

  if (!fs.existsSync(reportsPath)) {
    fs.mkdirSync(reportsPath, { recursive: true });
    console.log(`[Global Setup] Created reports directory: ${reportsPath}`);
    return;
  }

  const files = fs.readdirSync(reportsPath);
  let removedCount = 0;
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(reportsPath, file);
      try {
        fs.unlinkSync(filePath);
        removedCount++;
      } catch (err) {
        // File may have been deleted by another process, ignore
      }
    }
  }
  
  if (removedCount > 0) {
    console.log(`[Global Setup] Cleaned ${removedCount} old report(s) from ${reportsDir}`);
  }
}
