/**
 * Test Reporter
 * 
 * Collects test results and generates reports with full API response output
 */

export type TestStatus = 'pass' | 'fail' | 'skip';

export type TestResult = {
  name: string;
  status: TestStatus;
  statusCode?: number | string;
  message?: string;
  error?: string;
  response?: unknown; // Actual API response data
  request?: unknown;  // Request data sent
};

export type TestSuite = {
  name: string;
  results: TestResult[];
};

export class TestReporter {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;
  private suiteTitle: string;

  constructor(suiteTitle: string = 'Test Report') {
    this.suiteTitle = suiteTitle;
  }

  startSuite(name: string): TestSuite {
    const suite: TestSuite = {
      name,
      results: [],
    };
    this.suites.push(suite);
    this.currentSuite = suite;
    return suite;
  }

  addResult(suite: TestSuite, result: TestResult): void {
    suite.results.push(result);
  }

  private formatJson(data: unknown): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  generateReport(): string {
    let report = `# ${this.suiteTitle}\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += '---\n\n';

    for (const suite of this.suites) {
      report += `## ${suite.name}\n\n`;
      
      const passed = suite.results.filter(r => r.status === 'pass').length;
      const failed = suite.results.filter(r => r.status === 'fail').length;
      const skipped = suite.results.filter(r => r.status === 'skip').length;
      const total = suite.results.length;

      report += `**Summary:** ${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)\n\n`;

      // If suite has no results, it means tests failed before they could run
      if (total === 0) {
        report += `⚠️ **Note:** No test results recorded. Tests may have failed during setup or authentication, preventing this suite from running.\n\n`;
        report += '---\n\n';
        continue;
      }

      for (const result of suite.results) {
        const statusIcon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
        report += `### ${statusIcon} ${result.name}\n\n`;
        
        if (result.statusCode) {
          report += `**Status Code:** ${result.statusCode}\n\n`;
        }
        
        if (result.message) {
          report += `**Message:** ${result.message}\n\n`;
        }

        if (result.request) {
          report += `**Request:**\n\`\`\`json\n${this.formatJson(result.request)}\n\`\`\`\n\n`;
        }

        if (result.response) {
          report += `**Response:**\n\`\`\`json\n${this.formatJson(result.response)}\n\`\`\`\n\n`;
        }
        
        if (result.error) {
          report += `**Error:**\n\`\`\`\n${result.error}\n\`\`\`\n\n`;
        }

        report += '---\n\n';
      }
    }

    // Overall summary
    const allResults = this.suites.flatMap(s => s.results);
    const totalPassed = allResults.filter(r => r.status === 'pass').length;
    const totalFailed = allResults.filter(r => r.status === 'fail').length;
    const totalSkipped = allResults.filter(r => r.status === 'skip').length;
    const totalTests = allResults.length;

    report += '## Overall Summary\n\n';
    report += `- **Total Tests:** ${totalTests}\n`;
    report += `- **Passed:** ${totalPassed} ✅\n`;
    report += `- **Failed:** ${totalFailed} ❌\n`;
    report += `- **Skipped:** ${totalSkipped} ⏭️\n`;

    return report;
  }

  writeReport(outputDir: string = 'test/reports', filenamePrefix: string = 'test_report'): string {
    const fs = require('fs');
    const path = require('path');
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${filenamePrefix}_${timestamp}.md`;
    const filepath = path.join(outputDir, filename);

    const report = this.generateReport();
    fs.writeFileSync(filepath, report, 'utf8');

    return filepath;
  }
}
