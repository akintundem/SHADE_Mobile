import { useState, useCallback, useMemo } from 'react';
import { authService } from '../../../core/auth/services/authService';
import { AuthError, AuthErrorCode } from '../../../core/auth/errors/AuthError';
import { RegisterRequest } from '../../../core/auth/types/auth';
import { SignUpErrorCode } from '../types';

export interface UseSignUpState {
  loading: boolean;
  error: SignUpErrorCode | null;
}

export interface SignUpResult {
  success: boolean;
  errorCode: SignUpErrorCode | null;
}

export interface UseSignUpActions {
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  clearError: () => void;
  reset: () => void;
}

export interface UseSignUpReturn extends UseSignUpState {
  actions: UseSignUpActions;
}

/** Map structured error codes to UI-layer sign-up codes. */
function toSignUpError(error: unknown): SignUpErrorCode {
  const code = AuthError.codeOf(error);
  switch (code) {
    case AuthErrorCode.NETWORK_ERROR:
      return 'NETWORK_ERROR';
    case AuthErrorCode.USER_ALREADY_EXISTS:
      return 'EMAIL_ALREADY_REGISTERED';
    case AuthErrorCode.RATE_LIMITED:
      return 'RATE_LIMIT_EXCEEDED';
    case AuthErrorCode.VALIDATION_ERROR:
      return 'VALIDATION_ERROR';
    default:
      return 'REGISTRATION_FAILED';
  }
}

export function useSignUp(): UseSignUpReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SignUpErrorCode | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
  ): Promise<SignUpResult> => {
    try {
      setLoading(true);
      setError(null);

      const request: RegisterRequest = { email: email.trim(), password };
      await authService.signUp(request);
      return { success: true, errorCode: null };
    } catch (e: unknown) {
      const errorCode = toSignUpError(e);
      setError(errorCode);
      return { success: false, errorCode };
    } finally {
      setLoading(false);
    }
  }, []);

  const actions = useMemo<UseSignUpActions>(
    () => ({ signUp, clearError, reset }),
    [signUp, clearError, reset],
  );

  return { loading, error, actions };
}
