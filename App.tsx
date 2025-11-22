import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Linking, Alert } from 'react-native';
import { I18nProvider } from './shared/i18n/I18nProvider';
import { AgentProvider } from './features/agent/Agent/AgentProvider';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from './features/auth/Auth/Auth';
import ThemeProvider from './shared/theme/ThemeProvider';
import LoadingState from './shared/components/LoadingState';
import SocialApp from './features/social/SocialApp';
import { User } from './shared/types';
import { getToken, getUser as getCachedUser } from './shared/storage/authStorage';
import { UserDTO } from './shared/services/authService';
import { EventProfileRoute } from './features/events/Home/screens/EventProfileRoute';
import EventManageScreen from './features/events/Home/screens/EventManageScreen';
import notificationService from './shared/services/notificationService';
import fcmTokenSync from './shared/services/fcmTokenSync';
import type { Notification } from './shared/types/notification.types';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authScreen, setAuthScreen] = useState<'signIn' | 'signUp' | 'resetPassword' | 'verifyEmail'>('signIn');
  const [resetToken, setResetToken] = useState<string | undefined>();
  const [verifyToken, setVerifyToken] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      try {
        // Initialize push notifications
        await initializeNotifications();

        // Check for deep link on app start
        const url = await Linking.getInitialURL();
        if (url) {
          handleDeepLink(url);
        }

        // Attempt to restore session from storage
        const token = await getToken();
        if (token) {
          console.log('🔐 Found stored token, validating...');
          const cached = await getCachedUser<UserDTO>();
          if (cached) {
            // Validate token with backend
            try {
              const { authService } = await import('./shared/services/authService');
              await authService.getCurrentUser();
              console.log('✅ Token is valid');
              // Token is valid, set user
              setUser({ id: cached.userId || 'me', email: cached.email, name: cached.username, provider: 'password' });

              // Sync FCM token with backend
              await fcmTokenSync.syncTokenWithBackend(token);
            } catch (error: unknown) {
              const err = error as { status?: number; message?: string } | Error;
              const message = 'message' in err && typeof err.message === 'string' ? err.message : 'Unknown error';
              const status = 'status' in err && typeof err.status === 'number' ? err.status : undefined;

              console.log('❌ Token validation failed:', message);
              if (status === 401 || message.includes('Full authentication is required')) {
                console.log('🔐 401 Unauthorized - clearing invalid token');
                const { clearToken, clearUser } = await import('./shared/storage/authStorage');
                await clearToken();
                await clearUser();
                console.log('✅ Invalid token cleared - please log in again');
              } else {
                console.log('⚠️  Other error during token validation:', message);
              }
            }
          } else {
            // Token exists but no cached user - clear token
            console.log('⚠️  Token exists but no cached user, clearing token');
            const { clearToken } = await import('./shared/storage/authStorage');
            await clearToken();
          }
        } else {
          console.log('ℹ️  No stored token found');
        }
      } catch (error: unknown) {
        console.log('❌ Error during token validation:', error);
        // Clear any partial state
        const { clearToken, clearUser } = await import('./shared/storage/authStorage');
        await clearToken();
        await clearUser();
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

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize({
        onNotificationReceived: (notification: Notification) => {
          console.log('📬 Notification received:', notification);

          // Show an alert when notification is received in foreground
          if (notification.title && notification.body) {
            Alert.alert(
              notification.title,
              notification.body,
              [{ text: 'OK' }]
            );
          }
        },
        onNotificationOpened: (notification: Notification) => {
          console.log('📭 Notification opened:', notification);

          // Handle notification tap - navigate to relevant screen
          // You can use notification.data to determine where to navigate
          // Example:
          // if (notification.data?.eventId) {
          //   navigation.navigate('EventProfile', { eventId: notification.data.eventId });
          // }
        },
        onTokenRefresh: async (token: string) => {
          console.log('🔄 FCM Token refreshed:', token);

          const authToken = await getToken();
          if (authToken) {
            await fcmTokenSync.syncTokenWithBackend(authToken);
          }
        },
      });

      console.log('✅ Notifications initialized successfully');

      // Sync FCM token on init
      const authToken = await getToken();
      if (authToken) {
        await fcmTokenSync.syncTokenWithBackend(authToken);
      }
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
    }
  };

  const handleDeepLink = (url: string) => {
    console.log('🔗 Deep link received:', url);

    try {
      // Parse URL manually for reset password
      if (url.includes('reset-password')) {
        // Extract token from URL (supports both query param and path param)
        const tokenMatch = url.match(/[?&]token=([^&]+)/) || url.match(/reset-password\/([^/?]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (token) {
          console.log('🔑 Reset password token received');
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
          console.log('✉️ Email verification token received');
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
  const handleLogout = async () => {
    await fcmTokenSync.clearToken();
    setUser(null);
  };
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
