import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Auth from './Auth/Auth';
import ThemeProvider from './theme/ThemeProvider';
import LoadingState from './components/LoadingState';
import SocialApp from './SocialApp';
import { User } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate an auth/session check
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
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
