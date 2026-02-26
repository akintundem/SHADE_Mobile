import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { User, SecureUserResponse, ThemePreference } from '../../../core/auth/types/auth';
import { authService } from '../../../core/auth/services/authService';
import { mapToUser, isBackendUserMissing } from '../../../core/auth/utils/authUtils';
import {
  getToken,
  getUser as getCachedUser,
  clearAllAuth,
} from '../../../common/storage/authStorage';
import NotificationService from '../../../core/push/services/NotificationService';
import { clearTokenCache } from '../../../common/services/httpClient';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export type AuthContextState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingRequired: boolean;
  userThemePreference: ThemePreference | null;
  userLanguagePreference: string | null;
};

export type AuthContextActions = {
  login: (user: User, onboardingRequired: boolean) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (user: User) => Promise<void>;
  refreshUser: () => Promise<void>;
};

export type AuthContextValue = AuthContextState & AuthContextActions;

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type UserPreferences = {
  theme: ThemePreference | null;
  language: string | null;
};

/**
 * Resolve the backend session and return the mapped `User`, onboarding flag,
 * and user preference overrides. If the backend user doesn't exist yet
 * (pre-onboarding), falls back to the provided `fallbackUser`.
 */
async function syncSessionState(
  fallbackUser: User,
): Promise<{
  user: User;
  onboardingRequired: boolean;
  preferences: UserPreferences;
}> {
  try {
    const session = await authService.getAuthSession();
    const resolved = mapToUser(session.user, fallbackUser.provider);
    return {
      user: resolved,
      onboardingRequired: session.onboardingRequired,
      preferences: extractPreferences(session.user),
    };
  } catch (error: unknown) {
    if (isBackendUserMissing(error)) {
      return {
        user: fallbackUser,
        onboardingRequired: true,
        preferences: { theme: null, language: null },
      };
    }
    throw error;
  }
}

function extractPreferences(user: SecureUserResponse): UserPreferences {
  return {
    theme: user.settings?.themePreference ?? null,
    language: user.settings?.preferredLanguage ?? null,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

type AuthProviderProps = { children: ReactNode };

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [userThemePreference, setUserThemePreference] = useState<ThemePreference | null>(null);
  const [userLanguagePreference, setUserLanguagePreference] = useState<string | null>(null);

  /** Apply resolved session state to React state in one shot. */
  const applySession = useCallback(
    (result: Awaited<ReturnType<typeof syncSessionState>>) => {
      setUser(result.user);
      setOnboardingRequired(result.onboardingRequired);
      setUserThemePreference(result.preferences.theme);
      setUserLanguagePreference(result.preferences.language);
    },
    [],
  );

  // Register / clear device for push notifications when user changes
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!user?.id) {
          await NotificationService.clearDeviceRegistration();
          return;
        }
        await NotificationService.registerDeviceForPush(user.id);
      } catch (error) {
        if (!cancelled) {
          if (__DEV__) console.warn('Failed to register device for push notifications:', error);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  // Initialize auth state on mount
  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const token = await getToken();
        if (!token) {
          if (active) {
            setUser(null);
            setOnboardingRequired(false);
          }
          return;
        }

        const cached = await getCachedUser<
          SecureUserResponse | { userId?: string; email?: string; username?: string; name?: string }
        >();
        if (!cached) {
          const { clearToken } = await import('../../../common/storage/authStorage');
          await clearToken();
          if (active) {
            setUser(null);
            setOnboardingRequired(false);
          }
          return;
        }

        // Build a temporary User from cache while we validate
        const cachedUser: User = {
          id: (cached as any).id || (cached as any).userId || 'me',
          email: (cached as any).email || '',
          name: (cached as any).name || (cached as any).username,
          provider: 'password',
        };

        if (active) {
          setUser(cachedUser);
          setOnboardingRequired(true);
        }

        // Validate token against Auth0
        const accessToken = await getToken();
        if (!accessToken) {
          await clearAllAuth();
          if (active) { setUser(null); setOnboardingRequired(false); }
          return;
        }

        const validation = await authService.validateToken({ token: accessToken });
        if (!validation.valid || !validation.user) {
          await clearAllAuth();
          if (active) { setUser(null); setOnboardingRequired(false); }
          return;
        }

        // Sync full session state from the backend
        if (active) {
          const validatedUser = mapToUser(validation.user, 'password');
          const result = await syncSessionState(validatedUser);
          if (active) applySession(result);
        }
      } catch (error: unknown) {
        const status =
          (error as any)?.response?.status ?? (error as any)?.status;
        if (status === 401 || status === 403) {
          await clearAllAuth();
        }
        if (active) { setUser(null); setOnboardingRequired(false); }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    initialize();
    return () => { active = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------

  const login = useCallback(async (u: User, requiresOnboarding: boolean) => {
    clearTokenCache();
    setIsLoading(true);
    setUser(u);
    setOnboardingRequired(requiresOnboarding);

    try {
      const result = await syncSessionState(u);
      applySession(result);
    } catch {
      setOnboardingRequired(requiresOnboarding);
    } finally {
      setIsLoading(false);
    }
  }, [applySession]);

  const logout = useCallback(async () => {
    clearTokenCache();
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      await clearAllAuth();
    }
    await NotificationService.clearDeviceRegistration();
    setUser(null);
    setOnboardingRequired(false);
    setUserThemePreference(null);
    setUserLanguagePreference(null);
    setIsLoading(false);
  }, []);

  const completeOnboarding = useCallback(async (u: User) => {
    setIsLoading(true);
    setUser(u);

    try {
      const result = await syncSessionState(u);
      applySession(result);
    } catch {
      // Keep current onboarding state — don't assume true on failure
    } finally {
      setIsLoading(false);
    }
  }, [applySession]);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const result = await syncSessionState(user);
      applySession(result);
    } catch {
      // keep current state
    }
  }, [user, applySession]);

  // ------------------------------------------------------------------
  // Memoised value
  // ------------------------------------------------------------------

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      onboardingRequired,
      userThemePreference,
      userLanguagePreference,
      login,
      logout,
      completeOnboarding,
      refreshUser,
    }),
    [
      user,
      isLoading,
      onboardingRequired,
      userThemePreference,
      userLanguagePreference,
      login,
      logout,
      completeOnboarding,
      refreshUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
