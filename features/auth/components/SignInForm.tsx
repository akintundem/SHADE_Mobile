import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Lock, Mail } from 'lucide-react-native';
import { User } from '../../../core/auth/types/auth';
import Input from '../../../common/components/ui/Input';
import Button from '../../../common/components/ui/Button';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useSignIn } from '../hooks';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  onLogin?: (user: User, onboardingRequired: boolean) => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
};

export const SignInForm = ({ onLogin, onSwitchToSignUp, onForgotPassword }: Props) => {
  const { t } = useI18n();
  const { colors } = useTheme();
  const iconColor = colors.text.tertiary;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { loading: submitting, error: signInError, actions } = useSignIn();

  const canSignIn = useMemo(() => !!email && !!password, [email, password]);

  const error = useMemo(() => {
    if (!signInError) return null;
    switch (signInError) {
      case 'PASSWORD_INCORRECT':
        return t('PasswordIncorrect');
      case 'EMAIL_NOT_VERIFIED':
        return t('EmailNotVerified');
      case 'SIGN_IN_FAILED':
      default:
        return t('SignInFailed');
    }
  }, [signInError, t]);

  return (
    <View className="gap-xl">
      <View className="gap-lg">
        <Input
          label={t('Email')}
          value={email}
          onChangeText={text => {
            setEmail(text);
            actions.clearError();
          }}
          placeholder={t('EmailAddress')}
          inputType="email"
          enableNativeAutocomplete={true}
          leftIcon={<Mail size={20} color={iconColor} />}
          error={signInError === 'EMAIL_NOT_VERIFIED' ? error || undefined : undefined}
          containerStyle={{ marginBottom: 0 }}
        />

        <View>
          <Input
            label={t('Password')}
            value={password}
            onChangeText={text => {
              setPassword(text);
              actions.clearError();
            }}
            placeholder={t('Password')}
            inputType="password"
            enableNativeAutocomplete={false}
            autoComplete="off"
            textContentType="none"
            leftIcon={<Lock size={20} color={iconColor} />}
            error={signInError === 'PASSWORD_INCORRECT' ? error || undefined : undefined}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        <TouchableOpacity
          onPress={() => onForgotPassword?.()}
          className="self-end"
          activeOpacity={0.7}
        >
          <Text className="text-xs font-medium tracking-wide text-brand-primary dark:text-txt-dark-primary">
            {t('ForgotPassword')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center mt-xs">
        <TouchableOpacity
          onPress={() => setRememberMe(!rememberMe)}
          className="flex-row items-center gap-sm"
          activeOpacity={0.7}
        >
          <View
            className={`w-[18px] h-[18px] rounded items-center justify-center border-[1.5px] ${
              rememberMe
                ? 'border-brand-primary bg-brand-primary'
                : 'border-light-border dark:border-dark-border bg-transparent'
            }`}
          >
            {rememberMe && (
              <View className="w-2 h-2 rounded-sm bg-txt-inverse" />
            )}
          </View>
          <Text className="text-xs font-normal tracking-wide text-txt-secondary dark:text-txt-dark-secondary">
            {t('RememberMe')}
          </Text>
        </TouchableOpacity>
      </View>

      {signInError === 'SIGN_IN_FAILED' && error ? (
        <View className="mt-sm">
          <Text className="text-xs font-normal text-center text-semantic-error">
            {error}
          </Text>
        </View>
      ) : null}

      <View className="mt-lg">
        <Button
          onPress={async () => {
            const result = await actions.signIn(email, password, rememberMe);
            if (result) {
              onLogin?.(result.user, result.onboardingRequired);
            }
          }}
          disabled={!canSignIn || submitting}
          loading={submitting}
          variant="primary"
          size="lg"
          fullWidth
        >
          {t('SignIn')}
        </Button>
      </View>

      <View className="flex-row justify-center mt-xl gap-xs">
        <Text className="text-sm font-normal text-txt-secondary dark:text-txt-dark-secondary">
          {t('DontHaveAccount')}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignUp} activeOpacity={0.7}>
          <Text className="text-sm font-semibold tracking-wide text-brand-primary dark:text-txt-dark-primary">
            {t('SignUp')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
