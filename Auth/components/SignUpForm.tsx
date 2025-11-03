import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RegisterRequest } from '../../types';
import { authService } from '../../services/authService';
import { useTheme } from '../../theme/ThemeProvider';
import KeyboardOptimizedInput from '../../components/ui/KeyboardOptimizedInput';
import Button from '../../components/ui/Button';
import { useI18n } from '../../i18n/I18nProvider';

type Props = {
  onSignedUp?: (payload: {
    email: string;
    requiresProfile: boolean;
    user: import('../../services/authService').UserDTO;
  }) => void;
  onSwitchToSignIn?: () => void;
};

export const SignUpForm = ({ onSignedUp, onSwitchToSignIn }: Props) => {
  const { colors, brand, typography, spacing } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(
    () =>
      !!email &&
      !!name &&
      !!password &&
      password === confirm &&
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    [email, name, password, confirm],
  );

  const passwordRequirements = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password === confirm && confirm.length > 0,
    }),
    [password, confirm],
  );

  return (
    <View style={{ gap: spacing.lg }}>
      <KeyboardOptimizedInput
        label="Full Name"
        value={name}
        onChangeText={text => {
          setName(text);
          setError(null);
        }}
        placeholder="Enter your full name"
        inputType="name"
        enableNativeAutocomplete={true}
      />

      <KeyboardOptimizedInput
        label="Email Address"
        value={email}
        onChangeText={text => {
          setEmail(text);
          setError(null);
        }}
        placeholder="Enter your email address"
        inputType="email"
        enableNativeAutocomplete={true}
      />

      <KeyboardOptimizedInput
        label="Phone Number (Optional)"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter your phone number"
        inputType="phone"
        enableNativeAutocomplete={true}
      />

      <KeyboardOptimizedInput
        label="Date of Birth (Optional)"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        placeholder="Select your date of birth"
        inputType="date"
        enableNativeAutocomplete={true}
      />

      <KeyboardOptimizedInput
        label="Password"
        value={password}
        onChangeText={text => {
          setPassword(text);
          setError(null);
        }}
        placeholder="Create a strong password"
        inputType="password"
        enableNativeAutocomplete={true}
      />

      <KeyboardOptimizedInput
        label="Confirm Password"
        value={confirm}
        onChangeText={text => {
          setConfirm(text);
          setError(null);
        }}
        placeholder="Confirm your password"
        inputType="password"
        enableNativeAutocomplete={true}
      />

      {password.length > 0 && (
        <View
          style={{
            gap: spacing.sm,
            marginTop: -spacing.sm,
            backgroundColor: colors.surface,
            padding: spacing.md,
            borderRadius: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: typography.size.xs,
              fontWeight: typography.weight.semibold,
              color: colors.text.secondary,
              marginBottom: spacing.xs,
            }}
          >
            Your password must include:
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.size.xs,
                    color: passwordRequirements.minLength
                      ? colors.semantic.success
                      : colors.text.secondary,
                  }}
                >
                  {passwordRequirements.minLength ? '✓' : '○'} 8+ characters
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.size.xs,
                    color: passwordRequirements.hasUppercase
                      ? colors.semantic.success
                      : colors.text.secondary,
                  }}
                >
                  {passwordRequirements.hasUppercase ? '✓' : '○'} Uppercase
                  letter
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.size.xs,
                    color: passwordRequirements.hasLowercase
                      ? colors.semantic.success
                      : colors.text.secondary,
                  }}
                >
                  {passwordRequirements.hasLowercase ? '✓' : '○'} Lowercase
                  letter
                </Text>
              </View>
            </View>

            <View style={{ flex: 1, gap: spacing.xs }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.size.xs,
                    color: passwordRequirements.hasNumber
                      ? colors.semantic.success
                      : colors.text.secondary,
                  }}
                >
                  {passwordRequirements.hasNumber ? '✓' : '○'} Number
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.size.xs,
                    color: passwordRequirements.hasSpecial
                      ? colors.semantic.success
                      : colors.text.secondary,
                  }}
                >
                  {passwordRequirements.hasSpecial ? '✓' : '○'} Special
                  character
                </Text>
              </View>
              {confirm.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.size.xs,
                      color: passwordRequirements.match
                        ? colors.semantic.success
                        : colors.text.secondary,
                    }}
                  >
                    {passwordRequirements.match ? '✓' : '○'} Passwords match
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {error && (
        <Text
          style={{
            color: colors.semantic.error,
            fontSize: typography.size.sm,
            marginTop: spacing.sm,
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
              phoneNumber: phoneNumber || undefined,
              dateOfBirth: dateOfBirth || undefined,
              acceptTerms: true,
              acceptPrivacy: true,
              marketingOptIn: false,
              deviceId: 'mobile-app',
              clientId: 'capsule-app',
            };
            const authResponse = await authService.registerNew(registerRequest);
            const { setUser } = await import('../../storage/authStorage');
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
        style={{ marginTop: spacing.sm, backgroundColor: brand.primary }}
      >
        {t('CreateAccount')}
      </Button>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: spacing.lg,
          gap: spacing.sm,
        }}
      >
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
          }}
        >
          Already have an account?
        </Text>
        <TouchableOpacity onPress={onSwitchToSignIn}>
          <Text
            style={{
              color: colors.brand.primary,
              fontSize: typography.size.sm,
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
