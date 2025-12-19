import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';
import { useTheme } from '../../../common/theme/ThemeProvider';
import KeyboardOptimizedInput from '../../../common/components/ui/KeyboardOptimizedInput';
import Button from '../../../common/components/ui/Button';
import { useI18n } from '../../../common/i18n/I18nProvider';
import NotificationModal, { NotificationInfo } from '../../../common/components/common/NotificationModal';

type Props = {
  onSignedUp?: () => void;
  onSwitchToSignIn?: () => void;
};

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirement checkers
const passwordChecks = {
  length: (pwd: string) => pwd.length >= 8 && pwd.length <= 128,
  hasLowercase: (pwd: string) => /[a-z]/.test(pwd),
  hasUppercase: (pwd: string) => /[A-Z]/.test(pwd),
  hasDigit: (pwd: string) => /\d/.test(pwd),
  hasSpecialChar: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
};

export const SignUpForm = ({ onSignedUp, onSwitchToSignIn }: Props) => {
  const { colors, brand, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationInfo | null>(null);

  // Email validation
  const isValidEmail = useMemo(() => {
    const trimmedEmail = email.trim();
    return trimmedEmail.length > 0 && emailRegex.test(trimmedEmail);
  }, [email]);

  // Password validation - check individual requirements
  const passwordRequirements = useMemo(() => {
    return {
      length: passwordChecks.length(password),
      hasLowercase: passwordChecks.hasLowercase(password),
      hasUppercase: passwordChecks.hasUppercase(password),
      hasDigit: passwordChecks.hasDigit(password),
      hasSpecialChar: passwordChecks.hasSpecialChar(password),
    };
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordRequirements).every(Boolean);
  }, [passwordRequirements]);

  const passwordsMatch = useMemo(() => {
    if (password.length === 0 || confirm.length === 0) {
      return true; // Don't show error until both fields have content
    }
    return password === confirm;
  }, [password, confirm]);

  // Button should be disabled if email OR password is invalid
  // For password match: only require match if confirm field has content
  const canCreate = useMemo(
    () => {
      const trimmedEmail = email.trim();
      const confirmHasContent = confirm.length > 0;
      const passwordsMatchWhenNeeded = !confirmHasContent || passwordsMatch;
      
      return (
        isValidEmail &&
        isPasswordValid &&
        passwordsMatchWhenNeeded &&
        acceptTerms
      );
    },
    [isValidEmail, isPasswordValid, passwordsMatch, acceptTerms, confirm],
  );

  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.lg }}>
        <View>
          <KeyboardOptimizedInput
            label={t('Email')}
            value={email}
            onChangeText={text => {
              setEmail(text);
              setError(null);
            }}
            placeholder="you@example.com"
            inputType="email"
            enableNativeAutocomplete={true}
            containerStyle={{ marginBottom: 0 }}
          />
          {email.length > 0 && !isValidEmail && (
            <Text style={{
              fontSize: typography.size.xs,
              color: colors.semantic.error,
              marginTop: spacing.xs,
              fontWeight: typography.weight.regular,
            }}>
              {t('PleaseEnterValidEmail')}
            </Text>
          )}
        </View>

        <View>
          <KeyboardOptimizedInput
            label={t('Password')}
            value={password}
            onChangeText={text => {
              setPassword(text);
              setError(null);
            }}
            placeholder={t('EnterYourPassword')}
            inputType="password"
            enableNativeAutocomplete={true}
            containerStyle={{ marginBottom: 0 }}
          />
          {password.length > 0 && (
            <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
              <RequirementItem
                met={passwordRequirements.length}
                text={t('PasswordRequirementLength')}
                colors={colors}
                typography={typography}
                spacing={spacing}
              />
              <RequirementItem
                met={passwordRequirements.hasLowercase}
                text={t('PasswordRequirementLowercase')}
                colors={colors}
                typography={typography}
                spacing={spacing}
              />
              <RequirementItem
                met={passwordRequirements.hasUppercase}
                text={t('PasswordRequirementUppercase')}
                colors={colors}
                typography={typography}
                spacing={spacing}
              />
              <RequirementItem
                met={passwordRequirements.hasDigit}
                text={t('PasswordRequirementDigit')}
                colors={colors}
                typography={typography}
                spacing={spacing}
              />
              <RequirementItem
                met={passwordRequirements.hasSpecialChar}
                text={t('PasswordRequirementSpecialChar')}
                colors={colors}
                typography={typography}
                spacing={spacing}
              />
            </View>
          )}
        </View>

        <View>
          <KeyboardOptimizedInput
            label={t('ConfirmPassword')}
            value={confirm}
            onChangeText={text => {
              setConfirm(text);
              setError(null);
            }}
            placeholder={t('ConfirmYourPassword')}
            inputType="password"
            enableNativeAutocomplete={true}
            containerStyle={{ marginBottom: 0 }}
          />
          {confirm.length > 0 && !passwordsMatch && (
            <Text style={{
              fontSize: typography.size.xs,
              color: colors.semantic.error,
              marginTop: spacing.xs,
              fontWeight: typography.weight.regular,
            }}>
              {t('PasswordsDoNotMatch')}
            </Text>
          )}
          {confirm.length > 0 && passwordsMatch && (
            <Text style={{
              fontSize: typography.size.xs,
              color: colors.semantic.success,
              marginTop: spacing.xs,
              fontWeight: typography.weight.medium,
            }}>
              {t('PasswordsMatch')}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setAcceptTerms(!acceptTerms)}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.sm,
          marginTop: spacing.xs,
        }}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: acceptTerms ? brand.primary : colors.border,
            backgroundColor: acceptTerms ? brand.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          {acceptTerms && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                backgroundColor: colors.text.inverse,
              }}
            />
          )}
        </View>
        <Text
          style={{
            flex: 1,
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            lineHeight: 20,
            fontWeight: typography.weight.regular,
            letterSpacing: 0.1,
          }}
        >
          {t('IAgreeTo')}{' '}
          <Text
            style={{
              color: brand.primary,
              fontWeight: typography.weight.medium,
            }}
          >
            {t('TermsOfService')}
          </Text>
          {' '}{t('And')}{' '}
          <Text
            style={{
              color: brand.primary,
              fontWeight: typography.weight.medium,
            }}
          >
            {t('PrivacyPolicy')}
          </Text>
        </Text>
      </TouchableOpacity>

      {error && (
        <View style={{ marginTop: spacing.sm }}>
          <Text
            style={{
              color: colors.semantic.error,
              fontSize: typography.size.sm,
              textAlign: 'center',
              fontWeight: typography.weight.regular,
            }}
          >
            {error}
          </Text>
        </View>
      )}

      <View style={{ marginTop: spacing.lg }}>
        <Button
          onPress={async () => {
            if (!canCreate) {
              return;
            }

            try {
              setSubmitting(true);
              setError(null);
              setNotification(null);
              
              const registerRequest: RegisterRequest = {
                email: email.trim(),
                password,
                confirmPassword: confirm,
              };
              
              await authService.registerNew(registerRequest);
              
              // Registration successful - trigger success callback
              onSignedUp?.();
            } catch (e: any) {
              const errorMessage = e?.message || t('RegistrationFailed');
              let errorTitle = t('RegistrationFailed');
              let errorCode: string | undefined;
              
              // Check for network errors
              const lowerMessage = errorMessage.toLowerCase();
              if (lowerMessage.includes('unable to reach') || lowerMessage.includes('network')) {
                errorTitle = t('ConnectionError');
                errorCode = 'NETWORK_ERROR';
              } else if (lowerMessage.includes('already registered') || lowerMessage.includes('email_already_registered')) {
                errorTitle = t('EmailAlreadyRegistered');
                errorCode = 'EMAIL_ALREADY_REGISTERED';
              } else if (lowerMessage.includes('rate_limit_exceeded')) {
                errorTitle = t('TooManyAttempts');
                errorCode = 'RATE_LIMIT_EXCEEDED';
              } else if (lowerMessage.includes('validation') || lowerMessage.includes('validation_error')) {
                errorTitle = t('ValidationError');
                errorCode = 'VALIDATION_ERROR';
              }
              
              setNotification({
                type: 'error',
                title: errorTitle,
                message: errorMessage,
                code: errorCode,
                retryable: errorCode !== 'EMAIL_ALREADY_REGISTERED',
              });
              setError(errorMessage);
            } finally {
              setSubmitting(false);
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

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: spacing.xl,
          gap: spacing.xs,
        }}
      >
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.regular,
          }}
        >
          {t('AlreadyHaveAccount')}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignIn} activeOpacity={0.7}>
          <Text
            style={{
              color: brand.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
              letterSpacing: 0.1,
            }}
          >
            {t('SignIn')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Component for displaying password requirement items
const RequirementItem = ({ 
  met, 
  text, 
  colors, 
  typography,
  spacing: spacingValue
}: { 
  met: boolean; 
  text: string; 
  colors: any; 
  typography: any;
  spacing: any;
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacingValue.sm }}>
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: met ? colors.semantic.success : colors.border,
        }}
      />
      <Text style={{
        fontSize: typography.size.xs,
        color: met ? colors.text.secondary : colors.text.tertiary,
        fontWeight: met ? typography.weight.medium : typography.weight.regular,
        letterSpacing: 0.1,
      }}>
        {text}
      </Text>
    </View>
  );
};
