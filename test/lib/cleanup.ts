/**
 * Test cleanup utilities
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Clean all files in the reports directory
 */
export function cleanReportsDirectory(reportsDir: string = 'test/reports'): void {
  const reportsPath = path.resolve(process.cwd(), reportsDir);
  
  if (!fs.existsSync(reportsPath)) {
    fs.mkdirSync(reportsPath, { recursive: true });
    return;
  }

  const files = fs.readdirSync(reportsPath);
  for (const file of files) {
    const filePath = path.join(reportsPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && file.endsWith('.md')) {
      fs.unlinkSync(filePath);
      console.log(`[Cleanup] Removed old report: ${file}`);
    }
  }
}
