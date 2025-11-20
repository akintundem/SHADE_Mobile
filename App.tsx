import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { I18nProvider } from './shared/i18n/I18nProvider';
import { AgentProvider } from './features/agent/providers/AgentProvider';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from './features/auth/screens/AuthScreen';
import ThemeProvider from './shared/theme/ThemeProvider';
import LoadingState from './shared/components/LoadingState';
import SocialApp from './features/social/screens/SocialApp';
import { User } from './shared/types';
import { getToken, getUser as getCachedUser } from './shared/storage/authStorage';
import { EventProfileRoute } from './features/events/home/screens/EventProfileRoute';
import EventManageScreen from './features/events/home/screens/EventManageScreen';
import EventAdminScreen from './features/events/home/screens/EventAdminScreen';
import ManageCapacityScreen from './features/events/home/screens/manage/ManageCapacityScreen';
import ManageVisibilityScreen from './features/events/home/screens/manage/ManageVisibilityScreen';
import ManageAnalyticsScreen from './features/events/home/screens/manage/ManageAnalyticsScreen';
import ManageNotificationsScreen from './features/events/home/screens/manage/ManageNotificationsScreen';
import ManageCollaboratorsScreen from './features/events/home/screens/manage/ManageCollaboratorsScreen';
import ManageLifecycleScreen from './features/events/home/screens/manage/ManageLifecycleScreen';

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
              const { authService } = await import('./shared/services/authService');
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
                const { clearAllAuth } = await import('./shared/storage/authStorage');
                await clearAllAuth();
              }
            } catch (error: unknown) {
              const err = error as { status?: number; message?: string } | Error;
              const status = 'status' in err && typeof err.status === 'number' ? err.status : undefined;
              const hasResponse = error && typeof error === 'object' && 'response' in error;
              if ((status === 401 && hasResponse) || (status === 403 && hasResponse)) {
                const { clearAllAuth } = await import('./shared/storage/authStorage');
                await clearAllAuth();
              }
            }
          } else {
            const { clearToken } = await import('./shared/storage/authStorage');
            await clearToken();
          }
        }
      } catch (error: unknown) {
        const { clearAllAuth } = await import('./shared/storage/authStorage');
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
      console.error('Error parsing deep link:', error);
    }
  };

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => setUser(null);
  const handleUpdateUser = (u: User) => setUser(u);

  const Stack = createNativeStackNavigator();

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AgentProvider>
          <ThemeProvider>
            <NavigationContainer>
              {isLoading ? (
                <LoadingState message="Welcome to Shade..." />
              ) : !user ? (
                <Auth
                  onLogin={handleLogin}
                  initialScreen={authScreen}
                  resetToken={resetToken}
                  verifyToken={verifyToken}
                />
              ) : (
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                  }}
                >
                  <Stack.Screen name="Main">
                    {() => (
                      <SocialApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
                    )}
                  </Stack.Screen>
                  <Stack.Screen
                    name="EventProfile"
                    component={EventProfileRoute}
                    options={{
                      headerShown: false,
                      gestureEnabled: true,
                      fullScreenGestureEnabled: true,
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="EventManage"
                    options={{
                      headerShown: false,
                      gestureEnabled: true,
                      fullScreenGestureEnabled: true,
                      animation: 'slide_from_right',
                    }}
                  >
                    {(props) => (
                      // Render-as-child to avoid strict typing mismatch on route props
                      <EventManageScreen {...(props as any)} />
                    )}
                  </Stack.Screen>
                  <Stack.Screen
                    name="EventAdmin"
                    component={EventAdminScreen}
                    options={{
                      headerShown: false,
                      gestureEnabled: true,
                      fullScreenGestureEnabled: true,
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="EventManageCapacity"
                    component={ManageCapacityScreen}
                    options={{ headerShown: false, animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="EventManageVisibility"
                    component={ManageVisibilityScreen}
                    options={{ headerShown: false, animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="EventManageAnalytics"
                    component={ManageAnalyticsScreen}
                    options={{ headerShown: false, animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="EventManageNotifications"
                    component={ManageNotificationsScreen}
                    options={{ headerShown: false, animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="EventManageCollaborators"
                    component={ManageCollaboratorsScreen}
                    options={{ headerShown: false, animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="EventManageLifecycle"
                    component={ManageLifecycleScreen}
                    options={{ headerShown: false, animation: 'slide_from_right' }}
                  />
                </Stack.Navigator>
              )}
            </NavigationContainer>
          </ThemeProvider>
        </AgentProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
export default App;
