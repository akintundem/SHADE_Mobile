import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
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
} from '../components';
import ResetPasswordScreen from './ResetPasswordScreen';
import EmailVerificationScreen from './EmailVerificationScreen';
import RegistrationSuccessScreen from './RegistrationSuccessScreen';
import { AUTH_MODES, AuthMode, DEV_USER } from '../constants';

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
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  
  // Animation for smooth transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate transitions between modes
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [mode]);

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

  // Handle registration success screen
  if (showRegistrationSuccess && pendingEmail) {
    return (
      <RegistrationSuccessScreen
        email={pendingEmail}
        onContinue={() => {
          setShowRegistrationSuccess(false);
          setMode(AUTH_MODES.SIGN_IN);
        }}
      />
    );
  }

  // Handle email verification flow
  if (mode === AUTH_MODES.VERIFY_EMAIL) {
    return (
      <EmailVerificationScreen
        verifyToken={verifyToken}
        initialEmail={pendingEmail || undefined}
        onSuccess={() => setMode(AUTH_MODES.SIGN_IN)}
        onCancel={() => setMode(AUTH_MODES.SIGN_IN)}
      />
    );
  }

  // Handle complete profile flow - render independently without Header/AuthButtons
  if (mode === AUTH_MODES.COMPLETE_PROFILE) {
    return (
      <CompleteProfile 
        email={pendingEmail || ''} 
        onComplete={async (user) => {
          // Onboarding complete - proceed to app
          const { getUser } = await import('../../../shared/storage/authStorage');
          const cached = await getUser<{ userId?: string; email?: string; username?: string }>();
          if (cached) {
            onLogin?.({
              id: user.id ?? cached.userId ?? user.email,
              email: user.email,
              name: user.name,
              provider: 'password',
            });
          } else {
            onLogin?.({
              id: user.id ?? user.email,
              email: user.email,
              name: user.name,
              provider: 'password',
            });
          }
        }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
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
            onLogin={async (user, onboardingRequired) => {
              // Use onboardingRequired flag from backend response
              if (onboardingRequired) {
                // New user - show onboarding screen
                setMode(AUTH_MODES.COMPLETE_PROFILE);
              } else {
                // Existing user with completed profile - proceed to app
                onLogin?.(user);
              }
            }} 
            onSwitchToSignUp={() => setMode(AUTH_MODES.SIGN_UP)} 
          />
        ) : mode === AUTH_MODES.SIGN_UP ? (
          <SignUpForm
            onSignedUp={({ email, requiresProfile, user }) => {
              setPendingEmail(email);
              // Show success screen first, then redirect to email verification
              setShowRegistrationSuccess(true);
            }}
            onSwitchToSignIn={() => setMode(AUTH_MODES.SIGN_IN)}
          />
        ) : null}
        <OrDivider />
        <AuthButtons
          onSpotifyPress={() => onLogin?.(DEV_USER)}
        />
          <Footer isSignUp={mode === AUTH_MODES.SIGN_UP} />
        </KeyboardAwareContainer>
      </Animated.View>
    </SafeAreaView>
  );
}
