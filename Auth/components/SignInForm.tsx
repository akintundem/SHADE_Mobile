import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { User, LoginRequest } from '../../types';
import { authService } from '../../services/authService';
import { setUser } from '../../storage/authStorage';
import { useTheme } from '../../theme/ThemeProvider';
import Input from '../../components/ui/Input';
import KeyboardOptimizedInput from '../../components/ui/KeyboardOptimizedInput';
import Button from '../../components/ui/Button';
import { useI18n } from '../../i18n/I18nProvider';

type Props = {
  onLogin?: (user: User) => void;
  onSwitchToSignUp?: () => void;
};

export const SignInForm = ({ onLogin, onSwitchToSignUp }: Props) => {
  const { colors, brand, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const canSignIn = useMemo(() => !!email && !!password, [email, password]);

  const openForgotPassword = () => {
    setForgotEmail(email.trim());
    setForgotMessage(null);
    setForgotSuccess(false);
    setForgotVisible(true);
  };

  const closeForgotPassword = () => {
    setForgotVisible(false);
    setForgotSubmitting(false);
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = forgotEmail.trim();
    if (!trimmedEmail) {
      setForgotMessage(
        'Please enter the email address associated with your account',
      );
      setForgotSuccess(false);
      return;
    }

    try {
      setForgotSubmitting(true);
      setForgotMessage(null);
      const response = await authService.forgotPassword(
        trimmedEmail.toLowerCase(),
      );
      setForgotMessage(
        response.message ||
          'If the account exists, a reset link will be emailed shortly',
      );
      setForgotSuccess(response.success);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err &&
        'message' in err &&
        typeof (err as any).message === 'string'
          ? (err as any).message
          : 'Unable to send reset instructions';
      setForgotMessage(message);
      setForgotSuccess(false);
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <View style={{ gap: spacing.md }}>
      <Input
        label="Email Address"
        value={email}
        onChangeText={text => {
          setEmail(text);
          setError(null);
        }}
        placeholder={t('EmailAddress')}
        inputType="email"
        enableNativeAutocomplete={true}
        leftIcon={<Mail size={20} color={colors.text.tertiary} />}
        error={error && error.includes('email') ? error : undefined}
      />

      <Input
        label="Password"
        value={password}
        onChangeText={text => {
          setPassword(text);
          setError(null);
        }}
        placeholder={t('Password')}
        inputType="password"
        enableNativeAutocomplete={true}
        leftIcon={<Lock size={20} color={colors.text.tertiary} />}
        rightIcon={
          showPassword ? (
            <EyeOff size={20} color={colors.text.tertiary} />
          ) : (
            <Eye size={20} color={colors.text.tertiary} />
          )
        }
        onRightIconPress={() => setShowPassword(v => !v)}
        error={error && !error.includes('email') ? error : undefined}
      />

      <TouchableOpacity
        onPress={openForgotPassword}
        style={{ alignSelf: 'flex-end' }}
      >
        <Text
          style={{
            color: brand.primary,
            fontWeight: typography.weight.semibold,
            fontSize: typography.size.sm,
          }}
        >
          Forgot password?
        </Text>
      </TouchableOpacity>

      {error && !error.includes('email') && !error.includes('password') ? (
        <Text
          style={{
            color: colors.semantic.error,
            textAlign: 'center',
            fontSize: typography.size.sm,
          }}
        >
          {error}
        </Text>
      ) : null}

      <Button
        onPress={async () => {
          try {
            setSubmitting(true);
            setError(null);
            const loginRequest: LoginRequest = {
              email,
              password,
              rememberMe: false,
              deviceId: 'mobile-app',
              clientId: 'capsule-app',
            };
            const authResponse = await authService.loginNew(loginRequest);
            await setUser(authResponse.user);
            const mapped: User = {
              id: authResponse.user.id ?? authResponse.user.email,
              email: authResponse.user.email,
              name: authResponse.user.name,
              provider: 'password',
            };
            onLogin?.(mapped);
          } catch (e: any) {
            setError(e?.message || t('SignIn'));
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={!canSignIn || submitting}
        loading={submitting}
        variant="primary"
        size="lg"
        fullWidth
        style={{ marginTop: spacing.sm, backgroundColor: brand.primary }}
      >
        {t('SignIn')}
      </Button>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: spacing.md,
          gap: spacing.xs,
        }}
      >
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.base,
          }}
        >
          {t('DontHaveAccount')}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignUp}>
          <Text
            style={{
              color: brand.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.semibold,
            }}
          >
            {t('SignUp')}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={forgotVisible}
        animationType="fade"
        transparent
        onRequestClose={closeForgotPassword}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'center',
            padding: spacing['2xl'],
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View
              style={{
                backgroundColor: brand.primary,
                borderRadius: borderRadius['2xl'],
                padding: spacing['2xl'],
                gap: spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.semibold,
                  color: colors.text.inverse,
                }}
              >
                Reset your password
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                }}
              >
                Enter your email address and we’ll send a reset link if the
                account exists.
              </Text>
              <KeyboardOptimizedInput
                label="Email Address"
                value={forgotEmail}
                onChangeText={text => {
                  setForgotEmail(text);
                  setForgotMessage(null);
                }}
                inputType="email"
                enableNativeAutocomplete
              />
              {forgotMessage ? (
                <Text
                  style={{
                    color: forgotSuccess
                      ? colors.semantic.successDark
                      : colors.semantic.error,
                    fontSize: typography.size.sm,
                  }}
                >
                  {forgotMessage}
                </Text>
              ) : null}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: spacing.md,
                }}
              >
                <Button
                  variant="ghost"
                  onPress={closeForgotPassword}
                  disabled={forgotSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={handleForgotPassword}
                  loading={forgotSubmitting}
                  disabled={forgotSubmitting}
                >
                  Send Reset Email
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};
