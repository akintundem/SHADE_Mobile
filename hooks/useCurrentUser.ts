import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { UserResponse } from '../types';

/**
 * Hook to fetch and cache the current user's profile data
 * Includes emailVerified status and other user details
 */
export function useCurrentUser() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    console.log('👤 [useCurrentUser] Fetching current user data...');
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.getCurrentUser();
      console.log('✅ [useCurrentUser] User data fetched:', {
        id: userData.id,
        email: userData.email,
        emailVerified: userData.emailVerified,
        name: userData.name,
      });
      setUser(userData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch user data';
      console.error('❌ [useCurrentUser] Error fetching user:', errorMessage);
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    isEmailVerified: user?.emailVerified ?? false,
  };
}
