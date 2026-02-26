import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import Input from '../../../common/components/ui/Input';
import Button from '../../../common/components/ui/Button';
import { useI18n } from '../../../common/i18n/I18nProvider';
import NotificationModal, { NotificationInfo } from '../../../common/components/common/NotificationModal';
import { useSignUp } from '../hooks';
import { isValidEmail, validatePassword, doPasswordsMatch } from '../utils';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  onSignedUp?: (email: string) => void;
  onSwitchToSignIn?: () => void;
};

export const SignUpForm = ({ onSignedUp, onSwitchToSignIn }: Props) => {
  const { t } = useI18n();
  const { colors } = useTheme();
  const iconColor = colors.text.tertiary;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [notification, setNotification] = useState<NotificationInfo | null>(null);

  const { loading: submitting, error: signUpError, actions } = useSignUp();

  const error = useMemo(() => {
    if (!signUpError) return null;
    switch (signUpError) {
      case 'NETWORK_ERROR':
        return t('ConnectionError');
      case 'EMAIL_ALREADY_REGISTERED':
        return t('EmailAlreadyRegistered');
      case 'RATE_LIMIT_EXCEEDED':
        return t('TooManyAttempts');
      case 'VALIDATION_ERROR':
        return t('ValidationError');
      case 'REGISTRATION_FAILED':
      default:
        return t('RegistrationFailedGeneric');
    }
  }, [signUpError, t]);

  const emailValid = useMemo(() => isValidEmail(email), [email]);
  const { isValid: isPasswordValid, requirements: passwordRequirements } = useMemo(
    () => validatePassword(password),
    [password]
  );
  const passwordsMatch = useMemo(() => {
    if (password.length === 0 || confirm.length === 0) return true;
    return doPasswordsMatch(password, confirm);
  }, [password, confirm]);

  const canCreate = useMemo(() => {
    const confirmHasContent = confirm.length > 0;
    const passwordsMatchWhenNeeded = !confirmHasContent || passwordsMatch;
    return emailValid && isPasswordValid && passwordsMatchWhenNeeded && acceptTerms;
  }, [emailValid, isPasswordValid, passwordsMatch, acceptTerms, confirm]);

  const getUnmetRequirement = () => {
    if (!passwordRequirements.length) return t('PasswordRequirementLength');
    if (!passwordRequirements.hasLowercase) return t('PasswordRequirementLowercase');
    if (!passwordRequirements.hasUppercase) return t('PasswordRequirementUppercase');
    if (!passwordRequirements.hasDigit) return t('PasswordRequirementDigit');
    if (!passwordRequirements.hasSpecialChar) return t('PasswordRequirementSpecialChar');
    return null;
  };

  return (
    <View className="gap-xl">
      <View className="gap-lg">
        {/* Email Input */}
        <View>
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
            leftIcon={<Mail size={18} color={iconColor} />}
            containerStyle={{ marginBottom: 0 }}
          />
          {email.length > 0 && !emailValid && (
            <Text className="text-xs font-normal mt-xs text-semantic-error">
              {t('PleaseEnterValidEmail')}
            </Text>
          )}
        </View>

        {/* Password Input */}
        <View>
          <Input
            label={t('Password')}
            value={password}
            onChangeText={text => {
              setPassword(text);
              actions.clearError();
            }}
            placeholder={t('EnterYourPassword')}
            inputType="password"
            enableNativeAutocomplete={false}
            autoComplete="off"
            textContentType="none"
            autoCorrect={false}
            autoCapitalize="none"
            leftIcon={<Lock size={18} color={iconColor} />}
            containerStyle={{ marginBottom: 0 }}
          />
          {password.length > 0 && !isPasswordValid && (
            <View className="mt-md gap-xs">
              <View className="flex-row items-center gap-sm">
                <View className="w-1 h-1 rounded-full bg-light-border dark:bg-dark-border" />
                <Text className="text-xs font-normal tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary">
                  {getUnmetRequirement()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Confirm Password Input */}
        <View>
          <Input
            label={t('ConfirmPassword')}
            value={confirm}
            onChangeText={text => {
              setConfirm(text);
              actions.clearError();
            }}
            placeholder={t('ConfirmYourPassword')}
            inputType="password"
            enableNativeAutocomplete={false}
            autoComplete="off"
            textContentType="none"
            autoCorrect={false}
            autoCapitalize="none"
            leftIcon={<Lock size={18} color={iconColor} />}
            containerStyle={{ marginBottom: 0 }}
          />
          {confirm.length > 0 && !passwordsMatch && (
            <Text className="text-xs font-normal mt-xs text-semantic-error">
              {t('PasswordsDoNotMatch')}
            </Text>
          )}
          {confirm.length > 0 && passwordsMatch && (
            <Text className="text-xs font-medium mt-xs text-semantic-success">
              {t('PasswordsMatch')}
            </Text>
          )}
        </View>
      </View>

      {/* Terms Checkbox */}
      <TouchableOpacity
        onPress={() => setAcceptTerms(!acceptTerms)}
        className="flex-row items-start gap-sm mt-xs"
        activeOpacity={0.7}
      >
        <View
          className={`w-[18px] h-[18px] rounded items-center justify-center mt-0.5 border-[1.5px] ${
            acceptTerms
              ? 'border-brand-primary bg-brand-primary'
              : 'border-light-border dark:border-dark-border bg-transparent'
          }`}
        >
          {acceptTerms && (
            <View className="w-2 h-2 rounded-sm bg-txt-inverse" />
          )}
        </View>
        <Text className="flex-1 text-sm font-normal leading-5 tracking-wide text-txt-secondary dark:text-txt-dark-secondary">
          {t('IAgreeTo')}{' '}
          <Text className="font-medium text-brand-primary dark:text-txt-dark-primary">
            {t('TermsOfService')}
          </Text>
          {' '}{t('And')}{' '}
          <Text className="font-medium text-brand-primary dark:text-txt-dark-primary">
            {t('PrivacyPolicy')}
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <View className="mt-sm">
          <Text className="text-sm font-normal text-center text-semantic-error">
            {error}
          </Text>
        </View>
      )}

      {/* Submit Button */}
      <View className="mt-lg">
        <Button
          onPress={async () => {
            if (!canCreate) return;

            setNotification(null);
            const result = await actions.signUp(email, password);
            if (result.success) {
              onSignedUp?.(email.trim());
            } else if (result.errorCode) {
              setNotification({
                type: 'error',
                title: t('RegistrationFailedGeneric'),
                message: error || t('RegistrationFailedGeneric'),
                code: result.errorCode,
                retryable: result.errorCode !== 'EMAIL_ALREADY_REGISTERED',
              });
            }
          }}
          disabled={!canCreate || submitting}
          loading={submitting}
          variant="primary"
          size="lg"
          fullWidth
        >
          {t('CreateAccount')}
        </Button>
      </View>

      <NotificationModal
        visible={!!notification}
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Switch to Sign In */}
      <View className="flex-row justify-center items-center mt-xl gap-xs">
        <Text className="text-sm font-normal text-txt-secondary dark:text-txt-dark-secondary">
          {t('AlreadyHaveAccount')}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignIn} activeOpacity={0.7}>
          <Text className="text-sm font-semibold tracking-wide text-brand-primary dark:text-txt-dark-primary">
            {t('SignIn')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
