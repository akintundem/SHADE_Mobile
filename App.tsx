import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { I18nProvider } from './common/i18n/I18nProvider';
import { NavigationContainer } from '@react-navigation/native';
import Auth from './features/auth/screens/AuthScreen';
import ThemeProvider from './common/theme/ThemeProvider';
import LoadingState from './common/components/LoadingState';
import WelcomeScreen from './WelcomeScreen';
import { User } from './features/auth/types/auth';
import { getToken, getUser as getCachedUser } from './common/storage/authStorage';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authScreen, setAuthScreen] = useState<'signIn' | 'signUp' | 'resetPassword' | 'verifyEmail'>('signIn');
  const [resetToken, setResetToken] = useState<string | undefined>();
  const [verifyToken, setVerifyToken] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      try {
        // Check for deep link on app start
        const url = await Linking.getInitialURL();
        if (url) {
          handleDeepLink(url);
        }

        // Attempt to restore session from storage
        const token = await getToken();
        if (token) {
          const cached = await getCachedUser<{ userId?: string; email?: string; username?: string; profilePictureUrl?: string; profileComplete?: boolean }>();
          if (cached) {
            // Validate token on app startup
            try {
              const { authService } = await import('./features/auth/services/authService');
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

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    try {
      // Parse URL manually for reset password
      if (url.includes('reset-password')) {
        // Extract token from URL (supports both query param and path param)
        const tokenMatch = url.match(/[?&]token=([^&]+)/) || url.match(/reset-password\/([^/?]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (token) {
          setResetToken(token);
          setAuthScreen('resetPassword');
          setUser(null);
        }
      }

      // Parse URL manually for email verification
      if (url.includes('verify-email')) {
        const tokenMatch = url.match(/[?&]token=([^&]+)/) || url.match(/verify-email\/([^/?]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (token) {
          setVerifyToken(token);
          setAuthScreen('verifyEmail');
          setUser(null);
        }
      }
    } catch (error) {
      // Error parsing deep link
    }
  };

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => setUser(null);
  const handleUpdateUser = (u: User) => setUser(u);

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <ThemeProvider>
          <NavigationContainer>
              {isLoading ? (
                <LoadingState />
              ) : !user ? (
                <Auth
                  onLogin={handleLogin}
                  initialScreen={authScreen}
                  resetToken={resetToken}
                  verifyToken={verifyToken}
                />
              ) : (
                <WelcomeScreen user={user} />
              )}
            </NavigationContainer>
          </ThemeProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
export default App;
