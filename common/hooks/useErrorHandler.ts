import { useState, useCallback } from 'react';
import { ErrorInfo } from '../components/common/ErrorModal';

export interface ErrorHandler {
  error: ErrorInfo | null;
  showError: (error: ErrorInfo) => void;
  hideError: () => void;
  handleError: (error: unknown, context?: string) => void;
}

export function useErrorHandler(): ErrorHandler {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const showError = useCallback((errorInfo: ErrorInfo) => {
    setError(errorInfo);
  }, []);

  const hideError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown, context?: string) => {
    let errorInfo: ErrorInfo;
    
    if (err instanceof Error) {
      errorInfo = {
        title: 'An Error Occurred',
        message: err.message,
        code: err.name,
        details: context ? `Context: ${context}` : undefined,
        retryable: true
      };
    } else if (typeof err === 'string') {
      errorInfo = {
        title: 'Error',
        message: err,
        details: context,
        retryable: true
      };
    } else {
      errorInfo = {
        title: 'Unknown Error',
        message: 'An unexpected error occurred',
        details: context,
        retryable: true
      };
    }
    
    setError(errorInfo);
  }, []);

  return {
    error,
    showError,
    hideError,
    handleError
  };
}
