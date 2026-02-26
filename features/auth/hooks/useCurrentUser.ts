import { useAsync } from '../../../common/hooks/useAsync';
import { authService } from '../../../core/auth/services/authService';
import { SecureUserResponse } from '../../../core/auth/types/auth';

export function useCurrentUser() {
  const [state, actions] = useAsync<SecureUserResponse>(
    async () => {
      const session = await authService.getAuthSession();
      return session.user;
    },
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
