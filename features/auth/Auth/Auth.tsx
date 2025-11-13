import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { Header } from './components/Header';
import { AuthButtons } from './components/AuthButtons';
import { OrDivider } from './components/OrDivider';
import { SignInForm } from './components/SignInForm';
import { SignUpForm } from './components/SignUpForm';
import { CompleteProfile } from './components/CompleteProfile';
import { Footer } from './components/Footer';
import { User } from '../../../shared/types';
import KeyboardAwareContainer from '../../../shared/components/ui/KeyboardAwareContainer';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';

type Props = {
  onLogin?: (user: User) => void;
  initialScreen?: 'signIn' | 'signUp' | 'resetPassword' | 'verifyEmail';
  resetToken?: string;
  verifyToken?: string;
};

export default function Auth({ onLogin, initialScreen = 'signIn', resetToken, verifyToken }: Props) {
  const { colors, spacing } = useTheme();
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'completeProfile' | 'resetPassword' | 'verifyEmail'>(initialScreen);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // Handle reset password flow
  if (mode === 'resetPassword' && resetToken) {
    return (
      <ResetPasswordScreen
        token={resetToken}
        onSuccess={() => setMode('signIn')}
        onCancel={() => setMode('signIn')}
      />
    );
  }

  // Handle email verification flow
  if (mode === 'verifyEmail') {
    return (
      <EmailVerificationScreen
        verifyToken={verifyToken}
        onSuccess={() => setMode('signIn')}
        onCancel={() => setMode('signIn')}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareContainer
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingTop: spacing['4xl'],
          paddingBottom: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={spacing.lg}
      >
        <Header />
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
        <OrDivider />
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
      </KeyboardAwareContainer>
      <Footer />
    </SafeAreaView>
  );
}
