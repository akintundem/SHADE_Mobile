import './global.css';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nProvider } from './common/i18n/I18nProvider';
import { NavigationContainer } from '@react-navigation/native';
import Auth from './features/auth/screens/AuthScreen';
import ThemeProvider from './common/theme/ThemeProvider';
import MainApp from './main/MainApp';
import OnboardingScreen from './features/auth/screens/OnboardingScreen';
import { ThemePreference } from './core/auth/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './core/push/services/NotificationService';
import { LoadingOverlay } from './common/components/LoadingStates';
import GlobalNotificationHost from './common/components/common/GlobalNotificationHost';
import { AuthProvider, useAuth } from './features/auth/context';
import { QueryClientProvider } from '@tanstack/react-query';
import { RootErrorBoundary, ErrorBoundary } from './common/components/ErrorBoundary';
import { linking } from './navigation/linking';
import { queryClient } from './common/queryClient';

function AppContent() {
  const {
    user,
    isLoading,
    onboardingRequired,
    userThemePreference,
    userLanguagePreference,
    login,
    logout,
    completeOnboarding,
  } = useAuth();

  const [initialThemePreference, setInitialThemePreference] = useState<ThemePreference | null>(null);
  const [themeInitialized, setThemeInitialized] = useState(false);

  // Initialize theme preference from AsyncStorage immediately to prevent flash
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('pref:theme');
        if (saved === 'dark') {
          setInitialThemePreference(ThemePreference.DARK);
        } else if (saved === 'light') {
          setInitialThemePreference(ThemePreference.LIGHT);
        } else if (saved === 'system') {
          setInitialThemePreference(ThemePreference.SYSTEM);
        }
        // null → leave initialThemePreference as null so backend preference can seed
      } catch {
        // leave as null — ThemeProvider will fall back to backend or system
      } finally {
        setThemeInitialized(true);
      }
    })();
  }, []);

  if (!themeInitialized) {
    return <LoadingOverlay visible />;
  }

  return (
    <I18nProvider userLanguagePreference={userLanguagePreference}>
      <ThemeProvider
        userThemePreference={userThemePreference}
        initialThemePreference={initialThemePreference}
      >
        <GlobalNotificationHost />
        {isLoading ? (
          <LoadingOverlay visible />
        ) : (
          <NavigationContainer linking={linking}>
            {!user ? (
              <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <ErrorBoundary>
                  <Auth onLogin={login} />
                </ErrorBoundary>
              </SafeAreaView>
            ) : onboardingRequired ? (
              <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <ErrorBoundary>
                  <OnboardingScreen user={user} onComplete={completeOnboarding} />
                </ErrorBoundary>
              </SafeAreaView>
            ) : (
              <ErrorBoundary>
                <MainApp user={user} onLogout={logout} />
              </ErrorBoundary>
            )}
          </NavigationContainer>
        )}
      </ThemeProvider>
    </I18nProvider>
  );
}

function App() {
  useEffect(() => {
    NotificationService.setupNotifeeChannel();
    // Starts the foreground message listener; the service manages its own unsubscribe
    // internally via NotificationService.foregroundUnsubscribe.
    NotificationService.onMessageListener();
  }, []);

  return (
    <RootErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </RootErrorBoundary>
  );
}

export default App;
