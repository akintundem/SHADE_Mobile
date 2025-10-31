import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Header } from './components/Header';
import { AuthButtons } from './components/AuthButtons';
import { OrDivider } from './components/OrDivider';
import { SignInForm } from './components/SignInForm';
import { SignUpForm } from './components/SignUpForm';
import { CompleteProfile } from './components/CompleteProfile';
import { Footer } from './components/Footer';
import { User } from '../types';
import KeyboardAwareContainer from '../components/ui/KeyboardAwareContainer';

type Props = { onLogin?: (user: User) => void };

export default function Auth({ onLogin }: Props) {
  const { colors, spacing } = useTheme();
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'completeProfile'>('signIn');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareContainer
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingTop: spacing['4xl'],
          paddingBottom: spacing['3xl'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={spacing.lg}
      >
        <Header />
        <AuthButtons
          onSpotifyPress={() =>
            onLogin?.({
              id: 'spotify-dev',
              email: 'dev+spotify@auree.app',
              name: 'Auree Tester',
              provider: 'spotify',
            })
          }
        />
        <OrDivider />
        {mode === 'signIn' ? (
          <SignInForm onLogin={onLogin} onSwitchToSignUp={() => setMode('signUp')} />
        ) : mode === 'signUp' ? (
          <SignUpForm
            onSignedUp={({ email, requiresProfile, user }) => {
              setPendingEmail(email);
              if (requiresProfile) setMode('completeProfile');
              else onLogin?.({ id: user.userId, email: user.email, name: user.username, provider: 'password' });
            }}
            onSwitchToSignIn={() => setMode('signIn')}
          />
        ) : (
          <CompleteProfile email={pendingEmail || ''} onBack={() => setMode('signUp')} />
        )}
        <Footer />
      </KeyboardAwareContainer>
    </SafeAreaView>
  );
}
