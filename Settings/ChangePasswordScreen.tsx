import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { authService } from '../services/authService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ChangePasswordScreen({ onClose, onSuccess }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
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
      !!currentPassword &&
      passwordRequirements.minLength &&
      passwordRequirements.hasUppercase &&
      passwordRequirements.hasLowercase &&
      passwordRequirements.hasNumber &&
      passwordRequirements.hasSpecial &&
      passwordRequirements.match,
    [currentPassword, passwordRequirements],
  );

  const handleChangePassword = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setError(null);
      const response = await authService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
        'mobile-app',
        'capsule-app'
      );

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to change password. Please check your current password.');
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
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onPress={onClose}
            leftIcon={<X size={20} color={colors.text.primary} />}
          >
            Cancel
          </Button>
          <Text
            style={{
              fontSize: typography.size.lg,
              fontWeight: typography.weight.semibold,
              color: colors.text.primary,
            }}
          >
            Change Password
          </Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: spacing.lg,
            gap: spacing.lg,
          }}
        >
          {success ? (
            <View
              style={{
                backgroundColor: colors.semantic.successLight,
                padding: spacing.xl,
                borderRadius: borderRadius.lg,
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: typography.size.xl,
                  fontWeight: typography.weight.bold,
                  color: colors.semantic.successDark,
                  textAlign: 'center',
                }}
              >
                Password Changed Successfully!
              </Text>
              <Text
                style={{
                  fontSize: typography.size.base,
                  color: colors.semantic.successDark,
                  textAlign: 'center',
                }}
              >
                Your password has been updated. You can now use your new password to sign in.
              </Text>
            </View>
          ) : (
            <>
              <Text
                style={{
                  fontSize: typography.size.base,
                  color: colors.text.secondary,
                  marginBottom: spacing.md,
                }}
              >
                Enter your current password and choose a new secure password.
              </Text>

              <Input
                label="Current Password"
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setError(null);
                }}
                placeholder="Enter your current password"
                inputType="password"
                leftIcon={<Lock size={20} color={colors.text.tertiary} />}
                error={error && error.toLowerCase().includes('current') ? error : undefined}
              />

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

              {error && !error.toLowerCase().includes('current') && (
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
                onPress={handleChangePassword}
                disabled={!canSubmit || submitting}
                loading={submitting}
                style={{ marginTop: spacing.lg }}
              >
                Change Password
              </Button>
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
