import { useAsync } from './useAsync';
import { authService } from '../../features/auth/services/authService';
import { UserResponse } from '../../features/auth/types/auth';

export function useCurrentUser() {
  const [state, actions] = useAsync<UserResponse>(
    () => authService.getCurrentUser(),
    {
      immediate: true,
      onError: (error) => {
        console.error('Failed to fetch current user:', error);
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


