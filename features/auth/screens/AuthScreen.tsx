import React, { useState } from 'react';
import { User } from '../../../core/auth/types/auth';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';

type Props = {
  onLogin?: (user: User, onboardingRequired: boolean) => void;
  initialScreen?: 'signIn' | 'signUp';
};

export default function Auth({ onLogin, initialScreen = 'signIn' }: Props) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>(initialScreen);

  if (mode === 'signUp') {
    return (
      <SignUpScreen
        onSwitchToSignIn={() => setMode('signIn')}
      />
    );
  }

  return (
    <SignInScreen
      onLogin={onLogin}
      onSwitchToSignUp={() => setMode('signUp')}
    />
  );
}
