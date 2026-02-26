/**
 * Shared types for E2E tests
 */

import type { AxiosError } from 'axios';

/**
 * Type for API errors in tests
 * This represents the enhanced error from httpClient interceptor
 */
export interface ApiError extends Error {
  response?: {
    status?: number;
    data?: unknown;
  };
  status?: number;
  data?: unknown;
  validationErrors?: Record<string, unknown>;
  originalError?: unknown;
  stack?: string;
}

/**
 * Type guard to check if error is an AxiosError
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error) || isAxiosError(error)) {
    return error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Safely extract status code from unknown error
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  if (isApiError(error)) {
    return error.response?.status || error.status;
  }
  return undefined;
}

/**
 * Safely extract response data from unknown error
 */
export function getErrorResponseData(error: unknown): unknown {
  if (isAxiosError(error)) {
    return error.response?.data;
  }
  if (isApiError(error)) {
    return error.response?.data || error.data;
  }
  return undefined;
}
