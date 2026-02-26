import React, { useState } from 'react';
import AuthScreenLayout from '../components/AuthScreenLayout';
import { SignUpForm } from '../components';
import EmailSentConfirmationScreen from './EmailSentConfirmationScreen';
import { useI18n } from '../../../common/i18n/I18nProvider';

type Props = {
  onSwitchToSignIn?: () => void;
};

export default function SignUpScreen({ onSwitchToSignIn }: Props) {
  const { t } = useI18n();
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (showConfirmation) {
    return (
      <EmailSentConfirmationScreen
        email={registeredEmail}
        title={t('AccountCreated')}
        message={t('AccountCreatedDescription', { email: registeredEmail })}
        onBackToSignIn={() => {
          setShowConfirmation(false);
          onSwitchToSignIn?.();
        }}
      />
    );
  }

  return (
    <AuthScreenLayout scrollEnabled>
      <SignUpForm
        onSignedUp={(email) => {
          setRegisteredEmail(email);
          setShowConfirmation(true);
        }}
        onSwitchToSignIn={onSwitchToSignIn}
      />
    </AuthScreenLayout>
  );
}
