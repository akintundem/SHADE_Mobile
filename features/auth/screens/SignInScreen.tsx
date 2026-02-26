import React, { useState } from 'react';
import { User } from '../../../core/auth/types/auth';
import AuthScreenLayout from '../components/AuthScreenLayout';
import { SignInForm } from '../components';
import ForgotPasswordScreen from './ForgotPasswordScreen';

type Props = {
  onLogin?: (user: User, onboardingRequired: boolean) => void;
  onSwitchToSignUp?: () => void;
};

export default function SignInScreen({ onLogin, onSwitchToSignUp }: Props) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (showForgotPassword) {
    return (
      <ForgotPasswordScreen
        onBack={() => setShowForgotPassword(false)}
        onSuccess={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <AuthScreenLayout>
      <SignInForm
        onLogin={onLogin}
        onSwitchToSignUp={onSwitchToSignUp}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    </AuthScreenLayout>
  );
}
