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
      {/* Basic Information */}
      <View style={{
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        gap: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Text style={{
          fontSize: typography.size.sm,
          fontWeight: typography.weight.semibold,
          color: colors.text.secondary,
          marginBottom: spacing.xs,
          letterSpacing: 0.3,
        }}>
          Basic Information
        </Text>
        
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
          containerStyle={{ marginBottom: 0 }}
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
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {/* Optional Information */}
      <View style={{
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        gap: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Text style={{
          fontSize: typography.size.sm,
          fontWeight: typography.weight.semibold,
          color: colors.text.secondary,
          marginBottom: spacing.xs,
          letterSpacing: 0.3,
        }}>
          Optional Details
        </Text>
        
        <KeyboardOptimizedInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          inputType="phone"
          enableNativeAutocomplete={true}
          containerStyle={{ marginBottom: 0 }}
        />

        <KeyboardOptimizedInput
          label="Date of Birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="Select your date of birth"
          inputType="date"
          enableNativeAutocomplete={true}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {/* Security */}
      <View style={{
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        gap: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Text style={{
          fontSize: typography.size.sm,
          fontWeight: typography.weight.semibold,
          color: colors.text.secondary,
          marginBottom: spacing.xs,
          letterSpacing: 0.3,
        }}>
          Security
        </Text>
        
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
          containerStyle={{ marginBottom: 0 }}
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
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {password.length > 0 && (
        <View
          style={{
            backgroundColor: colors.background,
            padding: spacing.md,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.divider,
          }}
        >
          <Text
            style={{
              fontSize: typography.size.xs,
              fontWeight: typography.weight.semibold,
              color: colors.text.secondary,
              marginBottom: spacing.sm,
            }}
          >
            Password Requirements
          </Text>

          <View style={{ gap: spacing.xs }}>
            {[
              { key: 'minLength', text: '8+ characters' },
              { key: 'hasUppercase', text: 'Uppercase letter' },
              { key: 'hasLowercase', text: 'Lowercase letter' },
              { key: 'hasNumber', text: 'Number' },
              { key: 'hasSpecial', text: 'Special character' },
            ].map(({ key, text }) => (
              <View
                key={key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: passwordRequirements[key as keyof typeof passwordRequirements]
                      ? colors.semantic.success
                      : colors.surface,
                    borderWidth: 1,
                    borderColor: passwordRequirements[key as keyof typeof passwordRequirements]
                      ? colors.semantic.success
                      : colors.divider,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {passwordRequirements[key as keyof typeof passwordRequirements] && (
                    <Text
                      style={{
                        fontSize: 8,
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      ✓
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: typography.size.xs,
                    color: passwordRequirements[key as keyof typeof passwordRequirements]
                      ? colors.text.primary
                      : colors.text.tertiary,
                  }}
                >
                  {text}
                </Text>
              </View>
            ))}
            
            {confirm.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  marginTop: spacing.xs,
                  paddingTop: spacing.xs,
                  borderTopWidth: 1,
                  borderTopColor: colors.divider,
                }}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: passwordRequirements.match
                      ? colors.semantic.success
                      : colors.surface,
                    borderWidth: 1,
                    borderColor: passwordRequirements.match
                      ? colors.semantic.success
                      : colors.divider,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {passwordRequirements.match && (
                    <Text
                      style={{
                        fontSize: 8,
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      ✓
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: typography.size.xs,
                    color: passwordRequirements.match
                      ? colors.text.primary
                      : colors.text.tertiary,
                    fontWeight: typography.weight.medium,
                  }}
                >
                  Passwords match
                </Text>
              </View>
            )}
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
        style={{ marginTop: spacing.sm, backgroundColor: brand.primary }}
      >
        {t('CreateAccount')}
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
