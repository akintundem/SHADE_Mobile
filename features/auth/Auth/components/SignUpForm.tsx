import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RegisterRequest } from '../../../../shared/types';
import { authService } from '../../../../shared/services/authService';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import KeyboardOptimizedInput from '../../../../shared/components/ui/KeyboardOptimizedInput';
import Button from '../../../../shared/components/ui/Button';
import { useI18n } from '../../../../shared/i18n/I18nProvider';

type Props = {
  onSignedUp?: (payload: {
    email: string;
    requiresProfile: boolean;
    user: import('../../services/authService').UserDTO;
  }) => void;
  onSwitchToSignIn?: () => void;
};

export const SignUpForm = ({ onSignedUp, onSwitchToSignIn }: Props) => {
  const { colors, brand, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(
    () =>
      !!email &&
      !!name &&
      !!password &&
      password === confirm &&
      password.length >= 8 &&
      acceptTerms,
    [email, name, password, confirm, acceptTerms],
  );

  return (
    <View style={{ gap: spacing.lg }}>
      <KeyboardOptimizedInput
        label="Full name"
        value={name}
        onChangeText={text => {
          setName(text);
          setError(null);
        }}
        placeholder="John Doe"
        inputType="name"
        enableNativeAutocomplete={true}
        containerStyle={{ marginBottom: 0 }}
      />

      <KeyboardOptimizedInput
        label="Email address"
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

      <KeyboardOptimizedInput
        label="Password"
        value={password}
        onChangeText={text => {
          setPassword(text);
          setError(null);
        }}
        placeholder="Enter your password"
        inputType="password"
        enableNativeAutocomplete={true}
        containerStyle={{ marginBottom: 0 }}
      />

      <KeyboardOptimizedInput
        label="Confirm password"
        value={confirm}
        onChangeText={text => {
          setConfirm(text);
          setError(null);
        }}
        placeholder="Confirm your password"
        inputType="password"
        enableNativeAutocomplete={true}
        containerStyle={{ marginBottom: 0 }}
      />

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
            width: 20,
            height: 20,
            borderRadius: borderRadius.sm,
            borderWidth: 2,
            borderColor: acceptTerms ? brand.primary : colors.border,
            backgroundColor: acceptTerms ? brand.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          {acceptTerms && (
            <Text
              style={{
                color: colors.text.inverse,
                fontSize: 12,
                fontWeight: typography.weight.bold,
              }}
            >
              ✓
            </Text>
          )}
        </View>
        <Text
          style={{
            flex: 1,
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            lineHeight: 20,
          }}
        >
          I agree to the{' '}
          <Text
            style={{
              color: brand.primary,
              fontWeight: typography.weight.medium,
            }}
          >
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text
            style={{
              color: brand.primary,
              fontWeight: typography.weight.medium,
            }}
          >
            Privacy Policy
          </Text>
        </Text>
      </TouchableOpacity>

      {error && (
        <Text
          style={{
            color: colors.semantic.error,
            fontSize: typography.size.sm,
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      )}

      <Button
        onPress={async () => {
          try {
            setSubmitting(true);
            setError(null);
            const registerRequest: RegisterRequest = {
              email,
              name,
              password,
              confirmPassword: confirm,
              acceptTerms: true,
              acceptPrivacy: true,
              marketingOptIn: false,
              deviceId: 'mobile-app',
              clientId: 'capsule-app',
            };
            const authResponse = await authService.registerNew(registerRequest);
            const { setUser } = await import('../../../../shared/storage/authStorage');
            await setUser(authResponse.user);
            onSignedUp?.({
              email,
              requiresProfile: false,
              user: {
                userId: authResponse.user.id ?? authResponse.user.email,
                email: authResponse.user.email,
                username: authResponse.user.name,
                profilePictureUrl:
                  authResponse.user.profileImageUrl ?? undefined,
                profileComplete: true,
              },
            });
          } catch (e: any) {
            setError(e?.message || 'Registration failed');
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={!canCreate || submitting}
        loading={submitting}
        variant="primary"
        size="lg"
        fullWidth
        style={{ marginTop: spacing.md, backgroundColor: brand.primary }}
      >
        Create account
      </Button>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
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
          Already have an account?
        </Text>
        <TouchableOpacity onPress={onSwitchToSignIn}>
          <Text
            style={{
              color: brand.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.semibold,
            }}
          >
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
