import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from './common/i18n/I18nProvider';
import { NavigationContainer } from '@react-navigation/native';
import Auth from './features/auth/screens/AuthScreen';
import ThemeProvider from './common/theme/ThemeProvider';
import LoadingState from './common/components/LoadingState';
import MainApp from './features/main/screens/MainApp';
import OnboardingScreen from './features/auth/screens/OnboardingScreen';
import { User, ThemePreference } from './core/auth/types/auth';
import { getToken, getUser as getCachedUser } from './common/storage/authStorage';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [userThemePreference, setUserThemePreference] = useState<ThemePreference | null>(null);
  const [userLanguagePreference, setUserLanguagePreference] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Attempt to restore session from storage
        const token = await getToken();
        if (token) {
          const cached = await getCachedUser<{ userId?: string; email?: string; username?: string; profilePictureUrl?: string; profileComplete?: boolean }>();
          if (cached) {
            // Validate token on app startup
            try {
              const { authService } = await import('./core/auth/services/authService');
              const validationResult = await authService.validateToken({ token });

              if (validationResult.valid && validationResult.user) {
                // Token is valid, set user from validation response
                const validatedUser = validationResult.user;
                setUser({
                  id: validatedUser.id || cached.userId || 'me',
                  email: validatedUser.email || cached.email || '',
                  name: validatedUser.name || cached.username,
                  provider: 'password'
                });
                // Check if profile is complete from cache
                setOnboardingRequired(cached.profileComplete === false);
                
                // Fetch user settings to get theme and language preferences
                try {
                  const currentUser = await authService.getCurrentUser();
                  if (currentUser.settings?.themePreference) {
                    setUserThemePreference(currentUser.settings.themePreference);
                  }
                  if (currentUser.settings?.preferredLanguage) {
                    setUserLanguagePreference(currentUser.settings.preferredLanguage);
                  }
                } catch (err) {
                  // If fetching user fails, continue without preferences
                  console.warn('Failed to fetch user settings:', err);
                }
              } else {
                // Token validation returned invalid
                const { clearAllAuth } = await import('./common/storage/authStorage');
                await clearAllAuth();
              }
            } catch (error: unknown) {
              const err = error as { status?: number; message?: string } | Error;
              const status = 'status' in err && typeof err.status === 'number' ? err.status : undefined;
              const hasResponse = error && typeof error === 'object' && 'response' in error;
              if ((status === 401 && hasResponse) || (status === 403 && hasResponse)) {
                const { clearAllAuth } = await import('./common/storage/authStorage');
                await clearAllAuth();
              }
            }
          } else {
            const { clearToken } = await import('./common/storage/authStorage');
            await clearToken();
          }
        }
      } catch (error: unknown) {
        const { clearAllAuth } = await import('./common/storage/authStorage');
        await clearAllAuth();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleLogin = async (u: User, requiresOnboarding: boolean) => {
    setUser(u);
    setOnboardingRequired(requiresOnboarding);
    
    // Fetch user settings to get theme and language preferences
    if (!requiresOnboarding) {
      try {
        const { authService } = await import('./core/auth/services/authService');
        const currentUser = await authService.getCurrentUser();
        if (currentUser.settings?.themePreference) {
          setUserThemePreference(currentUser.settings.themePreference);
        }
        if (currentUser.settings?.preferredLanguage) {
          setUserLanguagePreference(currentUser.settings.preferredLanguage);
        }
      } catch (err) {
        // If fetching user fails, continue without preferences
        console.warn('Failed to fetch user settings:', err);
      }
    }
  };

  const handleOnboardingComplete = async (u: User) => {
    setUser(u);
    setOnboardingRequired(false);
    
    // Fetch user settings to get theme and language preferences after onboarding
    try {
      const { authService } = await import('./core/auth/services/authService');
      const currentUser = await authService.getCurrentUser();
      if (currentUser.settings?.themePreference) {
        setUserThemePreference(currentUser.settings.themePreference);
      }
      if (currentUser.settings?.preferredLanguage) {
        setUserLanguagePreference(currentUser.settings.preferredLanguage);
      }
    } catch (err) {
      // If fetching user fails, continue without preferences
      console.warn('Failed to fetch user settings:', err);
    }
  };
  const handleLogout = async () => {
    try {
      // Call logout service to invalidate session on server and clear local data
      const { authService } = await import('./core/auth/services/authService');
      await authService.logout();
    } catch (error) {
      // If logout service fails, still clear local auth data
      const { clearAllAuth } = await import('./common/storage/authStorage');
      await clearAllAuth();
    }
    // Always clear user state to return to auth screen
    setUser(null);
    setUserThemePreference(null);
    setUserLanguagePreference(null);
  };

  return (
    <SafeAreaProvider>
      <I18nProvider userLanguagePreference={userLanguagePreference}>
        <ThemeProvider userThemePreference={userThemePreference}>
          <NavigationContainer>
              {isLoading ? (
                <LoadingState />
              ) : !user ? (
                <Auth
                  onLogin={handleLogin}
                />
              ) : onboardingRequired ? (
                <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />
              ) : (
                <MainApp user={user} onLogout={handleLogout} />
              )}
            </NavigationContainer>
          </ThemeProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
export default App;
