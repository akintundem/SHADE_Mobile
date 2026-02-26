import { publishNotification } from './notificationBus';
import { NotificationInfo } from '../components/common/NotificationModal';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
  code?: string;
}

export class ErrorHandler {
  static handle(error: any, context?: string): void {
    const apiError = this.parseError(error);
    
    // Don't show alerts for network errors in background operations
    if (this.shouldShowAlert(apiError)) {
      this.showErrorAlert(apiError, context);
    }
  }

  static parseError(error: any): ApiError {
    if (error?.response) {
      // HTTP error response
      return {
        message: error.response.data?.message || error.message || 'Request failed',
        status: error.response.status,
        data: error.response.data,
        code: error.response.data?.code,
      };
    } else if (error?.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
        code: 'NETWORK_ERROR',
      };
    } else {
      // Other error
      return {
        message: error?.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  static shouldShowAlert(error: ApiError): boolean {
    // Don't show alerts for certain status codes or error types
    const silentErrors = [401, 403, 404]; // These are handled by the UI
    return !silentErrors.includes(error.status || 0);
  }

  static showErrorAlert(error: ApiError, context?: string): void {
    const title = context ? `Error in ${context}` : 'Error';
    const message = this.getUserFriendlyMessage(error);
    const notification: NotificationInfo = {
      type: 'error',
      title,
      message,
      code: error.code,
      retryable: false,
    };

    publishNotification(notification);
  }

  static getUserFriendlyMessage(error: ApiError): string {
    // Map technical error messages to user-friendly ones
    const friendlyMessages: Record<string, string> = {
      'NETWORK_ERROR': 'Please check your internet connection and try again.',
      'TIMEOUT': 'The request took too long. Please try again.',
      'SERVER_ERROR': 'Our servers are experiencing issues. Please try again later.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'UNAUTHORIZED': 'Please log in again to continue.',
      'FORBIDDEN': 'You don\'t have permission to perform this action.',
      'NOT_FOUND': 'The requested resource was not found.',
    };

    // Check for specific error codes first
    if (error.code && friendlyMessages[error.code]) {
      return friendlyMessages[error.code];
    }

    // Check for HTTP status codes
    if (error.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Please log in again to continue.';
        case 403:
          return 'You don\'t have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'This action conflicts with existing data.';
        case 422:
          return 'Please check your input and try again.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'Our servers are experiencing issues. Please try again later.';
        case 502:
        case 503:
        case 504:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return error.message;
      }
    }

    // Return the original message if no mapping found
    return error.message;
  }

  static getHttpStatus(error: unknown): number | undefined {
    if (error && typeof error === 'object' && 'response' in error) {
      const resp = (error as { response?: { status?: number } }).response;
      return resp?.status;
    }
    return undefined;
  }

  static isNetworkError(error: any): boolean {
    return !error?.response && error?.request;
  }

  static isTimeoutError(error: any): boolean {
    return error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
  }

  static isServerError(error: any): boolean {
    const status = error?.response?.status;
    return status >= 500 && status < 600;
  }

  static isClientError(error: any): boolean {
    const status = error?.response?.status;
    return status >= 400 && status < 500;
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, attempt), 16000);
  }

  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    _context?: string
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (this.isClientError(error) && error?.response?.status !== 429) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === maxAttempts - 1) {
          break;
        }
        
        // Wait before retrying
        const delay = this.getRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}

// Convenience function for common error handling
export const handleApiError = (error: any, context?: string) => {
  ErrorHandler.handle(error, context);
};
