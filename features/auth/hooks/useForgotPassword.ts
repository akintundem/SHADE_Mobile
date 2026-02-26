import { useState, useCallback, useMemo } from 'react';
import { authService } from '../../../core/auth/services/authService';
import { AuthError, AuthErrorCode } from '../../../core/auth/errors/AuthError';
import { ForgotPasswordErrorCode } from '../types';

export interface UseForgotPasswordState {
  loading: boolean;
  error: ForgotPasswordErrorCode | null;
  success: boolean;
}

export interface UseForgotPasswordActions {
  requestPasswordReset: (email: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export interface UseForgotPasswordReturn extends UseForgotPasswordState {
  actions: UseForgotPasswordActions;
}

/** Map structured error codes to UI-layer forgot-password codes. */
function toForgotPasswordError(error: unknown): ForgotPasswordErrorCode {
  const code = AuthError.codeOf(error);
  switch (code) {
    case AuthErrorCode.NETWORK_ERROR:
      return 'NETWORK_ERROR';
    case AuthErrorCode.USER_NOT_FOUND:
      return 'USER_NOT_FOUND';
    case AuthErrorCode.RATE_LIMITED:
      return 'RATE_LIMIT_EXCEEDED';
    default:
      return 'REQUEST_FAILED';
  }
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ForgotPasswordErrorCode | null>(null);
  const [success, setSuccess] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await authService.forgotPassword(email.trim());
      setSuccess(true);
      return true;
    } catch (e: unknown) {
      setError(toForgotPasswordError(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const actions = useMemo<UseForgotPasswordActions>(
    () => ({ requestPasswordReset, clearError, reset }),
    [requestPasswordReset, clearError, reset],
  );

  return { loading, error, success, actions };
}
