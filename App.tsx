import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from './i18n/I18nProvider';
import { AgentProvider } from './Agent/AgentProvider';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from './Auth/Auth';
import ThemeProvider from './theme/ThemeProvider';
import LoadingState from './components/LoadingState';
import SocialApp from './SocialApp';
import { User } from './types';
import { getToken, getUser as getCachedUser } from './storage/authStorage';
import { UserDTO } from './services/authService';
import { EventProfileRoute } from './Home/screens/EventProfileRoute';
import EventManageScreen from './Home/screens/EventManageScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Attempt to restore session from storage
        const token = await getToken();
        if (token) {
          console.log('🔐 Found stored token, validating...');
          const cached = await getCachedUser<UserDTO>();
          if (cached) {
            // Validate token with backend
            try {
              const { authService } = await import('./services/authService');
              await authService.getCurrentUser();
              console.log('✅ Token is valid');
              // Token is valid, set user
              setUser({ id: cached.userId || 'me', email: cached.email, name: cached.username, provider: 'password' });
            } catch (error: unknown) {
              const err = error as { status?: number; message?: string } | Error;
              const message = 'message' in err && typeof err.message === 'string' ? err.message : 'Unknown error';
              const status = 'status' in err && typeof err.status === 'number' ? err.status : undefined;

              console.log('❌ Token validation failed:', message);
              if (status === 401 || message.includes('Full authentication is required')) {
                console.log('🔐 401 Unauthorized - clearing invalid token');
                const { clearToken, clearUser } = await import('./storage/authStorage');
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
            const { clearToken } = await import('./storage/authStorage');
            await clearToken();
          }
        } else {
          console.log('ℹ️  No stored token found');
        }
      } catch (error: unknown) {
        console.log('❌ Error during token validation:', error);
        // Clear any partial state
        const { clearToken, clearUser } = await import('./storage/authStorage');
        await clearToken();
        await clearUser();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
              <Auth onLogin={handleLogin} />
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
