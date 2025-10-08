import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Auth from './Auth/Auth';
import ThemeProvider from './theme/ThemeProvider';
import LoadingState from './components/LoadingState';
import SocialApp from './SocialApp';
import { User } from './types';
import { getToken, getUser as getCachedUser, setUser as setCachedUser } from './storage/authStorage';
import { UserDTO } from './services/authService';
import { userService } from './services/userService';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Attempt to restore session from storage
        const token = await getToken();
        if (token) {
          try {
            const me = await userService.getCurrentUser();
            await setCachedUser(me);
            setUser({ id: me.userId || 'me', email: me.email, name: me.username, provider: 'password' });
          } catch {
            const cached = await getCachedUser<UserDTO>();
            if (cached) setUser({ id: cached.userId || 'me', email: cached.email, name: cached.username, provider: 'password' });
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => setUser(null);
  const handleUpdateUser = (u: User) => setUser(u);

  return (
    <SafeAreaProvider>
      {isLoading ? (
        <ThemeProvider>
          <LoadingState message="Welcome to SoundVerse..." />
        </ThemeProvider>
      ) : !user ? (
        <ThemeProvider>
          <Auth onLogin={handleLogin} />
        </ThemeProvider>
      ) : (
        <ThemeProvider>
          <SocialApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
        </ThemeProvider>
      )}
    </SafeAreaProvider>
  );
}
export default App;
