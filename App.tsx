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
          const cached = await getCachedUser<UserDTO>();
          if (cached) setUser({ id: cached.userId || 'me', email: cached.email, name: cached.username, provider: 'password' });
        }
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
