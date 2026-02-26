/**
 * Error handling helpers for tests
 */

import { getErrorMessage, getErrorStatus, getErrorResponseData } from './types';
import type { TestResult } from './reporter';

/**
 * Create a test result from an error
 */
export function createErrorResult(
  name: string,
  err: unknown,
  request?: unknown
): TestResult {
  return {
    name,
    status: 'fail',
    statusCode: getErrorStatus(err),
    message: getErrorMessage(err),
    request,
    response: getErrorResponseData(err),
    error: err instanceof Error ? err.stack : undefined,
  };
}
