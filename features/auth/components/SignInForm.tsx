import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { User, LoginRequest } from '../../../core/auth/types/auth';
import { authService } from '../../../core/auth/services/authService';
import { setUser } from '../../../common/storage/authStorage';
import { useTheme } from '../../../common/theme/ThemeProvider';
import Input from '../../../common/components/ui/Input';
import Button from '../../../common/components/ui/Button';
import { useI18n } from '../../../common/i18n/I18nProvider';

type Props = {
  onLogin?: (user: User, onboardingRequired: boolean) => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
};

export const SignInForm = ({ onLogin, onSwitchToSignUp, onForgotPassword }: Props) => {
  const { colors, brand, typography, spacing } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSignIn = useMemo(() => !!email && !!password, [email, password]);

  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.lg }}>
        <Input
          label={t('Email')}
          value={email}
          onChangeText={text => {
            setEmail(text);
            setError(null);
          }}
          placeholder={t('EmailAddress')}
          inputType="email"
          enableNativeAutocomplete={true}
          leftIcon={<Mail size={20} color={colors.text.tertiary} />}
          error={error && error.toLowerCase().includes('email') ? error : undefined}
          containerStyle={{ marginBottom: 0 }}
        />

        <View>
          <Input
            label={t('Password')}
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
            error={error && !error.toLowerCase().includes('email') ? error : undefined}
            containerStyle={{ marginBottom: 0 }}
          />
          <TouchableOpacity
            onPress={() => onForgotPassword?.()}
            style={{ marginTop: spacing.sm, alignSelf: 'flex-end' }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: brand.primary,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.medium,
                letterSpacing: 0.1,
              }}
            >
              {t('ForgotPassword')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }}>
        <TouchableOpacity
          onPress={() => setRememberMe(!rememberMe)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: rememberMe ? brand.primary : colors.border,
              backgroundColor: rememberMe ? brand.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {rememberMe && (
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
            color: colors.text.secondary,
            fontSize: typography.size.xs,
            fontWeight: typography.weight.regular,
            letterSpacing: 0.1,
          }}
        >
          {t('RememberMe')}
          </Text>
        </TouchableOpacity>
      </View>

      {error && !error.toLowerCase().includes('email') && !error.toLowerCase().includes('password') ? (
        <View style={{ marginTop: spacing.sm }}>
          <Text
            style={{
              color: colors.semantic.error,
              textAlign: 'center',
              fontSize: typography.size.xs,
              fontWeight: typography.weight.regular,
            }}
          >
            {error}
          </Text>
        </View>
      ) : null}

      <View style={{ marginTop: spacing.lg }}>
        <Button
          onPress={async () => {
            try {
              setSubmitting(true);
              setError(null);
              const loginRequest: LoginRequest = {
                email,
                password,
                rememberMe,
              };
              const authResponse = await authService.loginNew(loginRequest);
              await setUser(authResponse.user);
              
              const mapped: User = {
                id: authResponse.user.id ?? authResponse.user.email,
                email: authResponse.user.email,
                name: authResponse.user.name,
                provider: 'password',
              };
              
              onLogin?.(mapped, authResponse.onboardingRequired);
            } catch (e: any) {
              const errorMessage = e?.message || '';
              // Check if error is related to password/authentication failure
              const isPasswordError = 
                errorMessage.toLowerCase().includes('password') ||
                errorMessage.toLowerCase().includes('incorrect') ||
                errorMessage.toLowerCase().includes('invalid credentials') ||
                errorMessage.toLowerCase().includes('authentication failed') ||
                (e?.status === 401 && !errorMessage.toLowerCase().includes('email'));
              
              if (isPasswordError) {
                setError(t('PasswordIncorrect'));
              } else {
                setError(errorMessage || t('SignIn'));
              }
            } finally {
              setSubmitting(false);
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

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
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
          {t('DontHaveAccount')}
        </Text>
        <TouchableOpacity onPress={onSwitchToSignUp} activeOpacity={0.7}>
          <Text
            style={{
              color: brand.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
              letterSpacing: 0.1,
            }}
          >
            {t('SignUp')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
