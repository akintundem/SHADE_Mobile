import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Auth from './Auth/Auth';
import ThemeProvider from './theme/ThemeProvider';
import LoadingState from './components/LoadingState';
import SocialApp from './SocialApp';
import { User } from './types';
import { getToken, getUser as getCachedUser } from './storage/authStorage';
import { UserDTO } from './services/authService';

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

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {isLoading ? (
          <LoadingState message="Welcome to SoundVerse..." />
        ) : !user ? (
          <Auth onLogin={handleLogin} />
        ) : (
          <SocialApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
export default App;
