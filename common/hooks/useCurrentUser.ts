import { useAsync } from './useAsync';
import { authService } from '../../core/auth/authService';
import { SecureUserResponse } from '../../core/auth/types/auth';

export function useCurrentUser() {
  const [state, actions] = useAsync<SecureUserResponse>(
    () => authService.getCurrentUser(),
    {
      immediate: true,
      onError: () => {
        // Failed to fetch current user
      },
    }
  );

  return {
    user: state.data,
    loading: state.loading,
    error: state.error,
    isEmailVerified: state.data?.emailVerified ?? false,
    refetch: actions.execute,
  };
}


