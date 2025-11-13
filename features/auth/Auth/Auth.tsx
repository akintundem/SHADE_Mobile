import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { User } from '../../../shared/types';
import KeyboardAwareContainer from '../../../shared/components/ui/KeyboardAwareContainer';
import {
  Header,
  Footer,
  OrDivider,
  AuthButtons,
  SignInForm,
  SignUpForm,
  CompleteProfile,
} from './components';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import { AUTH_MODES, AuthMode, DEV_USER } from './constants';

type Props = {
  onLogin?: (user: User) => void;
  initialScreen?: 'signIn' | 'signUp' | 'resetPassword' | 'verifyEmail';
  resetToken?: string;
  verifyToken?: string;
};

export default function Auth({ onLogin, initialScreen = AUTH_MODES.SIGN_IN, resetToken, verifyToken }: Props) {
  const { colors, spacing } = useTheme();
  const [mode, setMode] = useState<AuthMode>(initialScreen as AuthMode);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // Handle reset password flow
  if (mode === AUTH_MODES.RESET_PASSWORD && resetToken) {
    return (
      <ResetPasswordScreen
        token={resetToken}
        onSuccess={() => setMode(AUTH_MODES.SIGN_IN)}
        onCancel={() => setMode(AUTH_MODES.SIGN_IN)}
      />
    );
  }

  // Handle email verification flow
  if (mode === AUTH_MODES.VERIFY_EMAIL) {
    return (
      <EmailVerificationScreen
        verifyToken={verifyToken}
        onSuccess={() => setMode(AUTH_MODES.SIGN_IN)}
        onCancel={() => setMode(AUTH_MODES.SIGN_IN)}
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
          paddingBottom: mode === AUTH_MODES.SIGN_UP ? spacing.lg : spacing['3xl'],
          minHeight: '100%',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={spacing.lg}
      >
        <Header />
        {mode === AUTH_MODES.SIGN_IN ? (
          <SignInForm 
            onLogin={onLogin} 
            onSwitchToSignUp={() => setMode(AUTH_MODES.SIGN_UP)} 
          />
        ) : mode === AUTH_MODES.SIGN_UP ? (
          <SignUpForm
            onSignedUp={({ email, requiresProfile, user }) => {
              setPendingEmail(email);
              if (requiresProfile) {
                setMode(AUTH_MODES.COMPLETE_PROFILE);
              } else {
                onLogin?.({
                  id: user.userId,
                  email: user.email,
                  name: user.username,
                  provider: 'password',
                });
              }
            }}
            onSwitchToSignIn={() => setMode(AUTH_MODES.SIGN_IN)}
          />
        ) : (
          <CompleteProfile 
            email={pendingEmail || ''} 
            onBack={() => setMode(AUTH_MODES.SIGN_UP)} 
          />
        )}
        <OrDivider />
        <AuthButtons
          onSpotifyPress={() => onLogin?.(DEV_USER)}
        />
        <Footer isSignUp={mode === AUTH_MODES.SIGN_UP} />
      </KeyboardAwareContainer>
    </SafeAreaView>
  );
}
