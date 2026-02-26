import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../../common/components/ui/Input';
import Button from '../../../common/components/ui/Button';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { authService } from '../../../core/auth/services/authService';

type Props = {
  email?: string;
  onBack?: () => void;
  onSuccess?: () => void;
};

export default function ForgotPasswordScreen({ email: initialEmail = '', onBack, onSuccess }: Props) {
  const { t } = useI18n();
  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disabled = submitting || email.trim().length === 0;

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setMessage(t('SendResetLink'));
      onSuccess?.();
    } catch (e: any) {
      setError(t('UnableToSendResetEmail'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      <View className="flex-1 p-2xl gap-2xl">
        <TouchableOpacity onPress={onBack} className="self-start p-xs" activeOpacity={0.7}>
          <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary">
            {t('GoBack')}
          </Text>
        </TouchableOpacity>

        <View className="gap-sm">
          <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary">
            {t('ForgotPassword')}
          </Text>
          <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary leading-5">
            {t('SendResetLink')}
          </Text>
        </View>

        <View className="gap-md">
          <Input
            label={t('Email')}
            value={email}
            onChangeText={text => {
              setEmail(text);
              setError(null);
              setMessage(null);
            }}
            placeholder={t('EmailAddress')}
            inputType="email"
            enableNativeAutocomplete
          />
          {error ? (
            <Text className="text-sm text-semantic-error">{error}</Text>
          ) : null}
          {message ? (
            <Text className="text-sm text-semantic-success">{message}</Text>
          ) : null}
        </View>

        <Button
          onPress={handleSubmit}
          disabled={disabled}
          loading={submitting}
        >
          {t('SendResetLink')}
        </Button>
      </View>
    </SafeAreaView>
  );
}
