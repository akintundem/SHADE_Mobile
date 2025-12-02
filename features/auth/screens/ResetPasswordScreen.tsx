import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { authService } from '../services/authService';
import Input from '../../../common/components/ui/Input';
import Button from '../../../common/components/ui/Button';

type Props = {
  token: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function ResetPasswordScreen({ token, onSuccess, onCancel }: Props) {
  const { colors, typography, spacing, borderRadius, brand } = useTheme();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordRequirements = useMemo(
    () => ({
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
      match: newPassword === confirmPassword && confirmPassword.length > 0,
    }),
    [newPassword, confirmPassword],
  );

  const canSubmit = useMemo(
    () =>
      passwordRequirements.minLength &&
      passwordRequirements.hasUppercase &&
      passwordRequirements.hasLowercase &&
      passwordRequirements.hasNumber &&
      passwordRequirements.hasSpecial &&
      passwordRequirements.match,
    [passwordRequirements],
  );

  const handleResetPassword = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setError(null);
      const response = await authService.resetPassword(token, newPassword, confirmPassword);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
        }, 2500);
      } else {
        setError(response.message || 'Unable to reset password. The link may have expired.');
      }
    } catch (err: any) {
      setError(
        err?.message || 'Unable to reset password. The link may be invalid or expired. Please request a new reset link.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: spacing.lg,
            gap: spacing.xl,
          }}
        >
          {success ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: spacing.xl,
                paddingVertical: spacing['2xl'],
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.semantic.successLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <CheckCircle size={48} color={colors.semantic.success} />
              </View>

              <View style={{ gap: spacing.md, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: typography.size['2xl'],
                    fontWeight: typography.weight.bold,
                    color: colors.text.primary,
                    textAlign: 'center',
                  }}
                >
                  Password Reset Successfully!
                </Text>
                <Text
                  style={{
                    fontSize: typography.size.base,
                    color: colors.text.secondary,
                    textAlign: 'center',
                    maxWidth: 320,
                  }}
                >
                  Your password has been updated. You can now sign in with your new password.
                </Text>
              </View>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => onSuccess?.()}
                style={{ marginTop: spacing.lg }}
              >
                Continue to Sign In
              </Button>
            </View>
          ) : (
            <>
              <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: brand.primaryLight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}
                >
                  <Lock size={32} color={brand.primary} />
                </View>

                <Text
                  style={{
                    fontSize: typography.size['2xl'],
                    fontWeight: typography.weight.bold,
                    color: colors.text.primary,
                    textAlign: 'center',
                  }}
                >
                  Reset Your Password
                </Text>
                <Text
                  style={{
                    fontSize: typography.size.base,
                    color: colors.text.secondary,
                    textAlign: 'center',
                    maxWidth: 320,
                    alignSelf: 'center',
                  }}
                >
                  Please enter a new secure password for your account.
                </Text>
              </View>

              <View style={{ gap: spacing.lg, marginTop: spacing.md }}>
                <Input
                  label="New Password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError(null);
                  }}
                  placeholder="Enter your new password"
                  inputType="password"
                  leftIcon={<Lock size={20} color={colors.text.tertiary} />}
                />

                <Input
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError(null);
                  }}
                  placeholder="Confirm your new password"
                  inputType="password"
                  leftIcon={<Lock size={20} color={colors.text.tertiary} />}
                />

                {/* Password Requirements */}
                {newPassword.length > 0 && (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      padding: spacing.md,
                      borderRadius: borderRadius.lg,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: typography.size.sm,
                        fontWeight: typography.weight.semibold,
                        color: colors.text.secondary,
                        marginBottom: spacing.xs,
                      }}
                    >
                      Your password must include:
                    </Text>

                    <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                      <View style={{ flex: 1, gap: spacing.xs }}>
                        <RequirementItem
                          met={passwordRequirements.minLength}
                          text="8+ characters"
                          colors={colors}
                          typography={typography}
                        />
                        <RequirementItem
                          met={passwordRequirements.hasUppercase}
                          text="Uppercase letter"
                          colors={colors}
                          typography={typography}
                        />
                        <RequirementItem
                          met={passwordRequirements.hasLowercase}
                          text="Lowercase letter"
                          colors={colors}
                          typography={typography}
                        />
                      </View>

                      <View style={{ flex: 1, gap: spacing.xs }}>
                        <RequirementItem
                          met={passwordRequirements.hasNumber}
                          text="Number"
                          colors={colors}
                          typography={typography}
                        />
                        <RequirementItem
                          met={passwordRequirements.hasSpecial}
                          text="Special character"
                          colors={colors}
                          typography={typography}
                        />
                        {confirmPassword.length > 0 && (
                          <RequirementItem
                            met={passwordRequirements.match}
                            text="Passwords match"
                            colors={colors}
                            typography={typography}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {error && (
                  <View
                    style={{
                      backgroundColor: colors.semantic.errorLight,
                      padding: spacing.md,
                      borderRadius: borderRadius.lg,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.semantic.error,
                        fontSize: typography.size.sm,
                        textAlign: 'center',
                      }}
                    >
                      {error}
                    </Text>
                  </View>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleResetPassword}
                  disabled={!canSubmit || submitting}
                  loading={submitting}
                  style={{ marginTop: spacing.md }}
                >
                  Reset Password
                </Button>

                {onCancel && (
                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    onPress={onCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RequirementItem({
  met,
  text,
  colors,
  typography,
}: {
  met: boolean;
  text: string;
  colors: any;
  typography: any;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text
        style={{
          fontSize: typography.size.sm,
          color: met ? colors.semantic.success : colors.text.secondary,
        }}
      >
        {met ? '✓' : '○'} {text}
      </Text>
    </View>
  );
}
