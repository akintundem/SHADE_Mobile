import { useState, useCallback, useMemo } from 'react';
import { authService } from '../../../core/auth/services/authService';
import { AuthError, AuthErrorCode } from '../../../core/auth/errors/AuthError';
import { mapToUser } from '../../../core/auth/utils/authUtils';
import { User, LoginRequest, SecureAuthResponse } from '../../../core/auth/types/auth';
import { SignInErrorCode } from '../types';
import { clearTokenCache } from '../../../common/services/httpClient';

export interface UseSignInState {
  loading: boolean;
  error: SignInErrorCode | null;
}

export interface UseSignInActions {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{
    user: User;
    onboardingRequired: boolean;
  } | null>;
  clearError: () => void;
  reset: () => void;
}

export interface UseSignInReturn extends UseSignInState {
  actions: UseSignInActions;
}

/** Map structured error codes to UI-layer sign-in codes. */
function toSignInError(error: unknown): SignInErrorCode {
  const code = AuthError.codeOf(error);
  switch (code) {
    case AuthErrorCode.INVALID_CREDENTIALS:
      return 'PASSWORD_INCORRECT';
    case AuthErrorCode.EMAIL_NOT_VERIFIED:
      return 'EMAIL_NOT_VERIFIED';
    default:
      return 'SIGN_IN_FAILED';
  }
}

export function useSignIn(): UseSignInReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SignInErrorCode | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  const signIn = useCallback(async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<{ user: User; onboardingRequired: boolean } | null> => {
    try {
      setLoading(true);
      setError(null);

      // Clear stale token cache and any existing session before sign-in
      clearTokenCache();
      try { await authService.logout(); } catch { /* ignore */ }

      const loginRequest: LoginRequest = { email, password, rememberMe };
      const response: SecureAuthResponse = await authService.signIn(loginRequest);

      return {
        user: mapToUser(response.user),
        onboardingRequired: response.onboardingRequired,
      };
    } catch (e: unknown) {
      setError(toSignInError(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const actions = useMemo<UseSignInActions>(
    () => ({ signIn, clearError, reset }),
    [signIn, clearError, reset],
  );

  return { loading, error, actions };
}
