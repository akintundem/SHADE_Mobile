import { useState, useCallback, useMemo } from 'react';
import { authService } from '../../../core/auth/services/authService';

export interface UseLogoutState {
  loading: boolean;
  error: string | null;
}

export interface UseLogoutActions {
  logout: () => Promise<boolean>;
  reset: () => void;
}

export interface UseLogoutReturn extends UseLogoutState {
  actions: UseLogoutActions;
}

export function useLogout(): UseLogoutReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await authService.logout();
      return true;
    } catch (e: any) {
      setError(e?.message || 'LOGOUT_FAILED');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const actions = useMemo<UseLogoutActions>(() => ({
    logout,
    reset,
  }), [logout, reset]);

  return {
    loading,
    error,
    actions,
  };
}
