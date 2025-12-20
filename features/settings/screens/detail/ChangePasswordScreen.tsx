import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import Button from '../../../common/components/ui/Button';
import { authService } from '../../../core/auth/services/authService';

type Props = {
  onBack: () => void;
  onSuccess?: () => void;
};

export default function ChangePasswordScreen({ onBack, onSuccess }: Props) {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedCurrent) {
      setError(t('CurrentPasswordRequired'));
      return;
    }

    if (!trimmedNew) {
      setError(t('NewPasswordRequired'));
      return;
    }

    if (trimmedNew.length < 8) {
      setError(t('NewPasswordMustBeAtLeast8Characters'));
      return;
    }

    if (
      !/[A-Z]/.test(trimmedNew) ||
      !/[a-z]/.test(trimmedNew) ||
      !/[0-9]/.test(trimmedNew) ||
      !/[!@#$%^&*()_\-+=\[{\]};:'"\\|,.<>/?]/.test(trimmedNew)
    ) {
      setError(t('PasswordMustIncludeUppercaseLowercaseNumberAndSpecialCharacter'));
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setError(t('NewPasswordAndConfirmationMustMatch'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await authService.changePassword(
        {
          currentPassword: trimmedCurrent,
          newPassword: trimmedNew,
          confirmPassword: trimmedConfirm,
        }
      );

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onBack();
        }, 1500);
      } else {
        setError(response.message || t('UnableToChangePassword'));
      }
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err &&
        'message' in err &&
        typeof (err as any).message === 'string'
          ? (err as any).message
          : t('UnableToChangePassword');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            borderBottomWidth: 0.5,
            borderColor: colors.divider,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity 
            onPress={onBack}
            style={{ marginLeft: -spacing.xs }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
              color: colors.text.primary,
              marginLeft: spacing.md,
            }}
          >
            {t('ChangePassword')}
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: spacing.xl, paddingBottom: spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
        >
          {success ? (
            <View
              style={{
                padding: spacing.md,
                borderRadius: borderRadius.md,
                backgroundColor: colors.semantic.successLight,
                borderWidth: 0.5,
                borderColor: colors.semantic.success,
                marginHorizontal: spacing.xl,
                marginBottom: spacing.lg,
              }}
            >
              <Text
                style={{
                  color: colors.semantic.successDark,
                  fontWeight: typography.weight.semibold,
                  fontSize: typography.size.xs,
                }}
              >
                {t('PasswordChangedSuccessfully')}
              </Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: spacing.xl }}>
              {/* Current Password */}
              <View style={{
                paddingVertical: spacing.md,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.divider,
              }}>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                  marginBottom: spacing.xs,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  {t('CurrentPassword')}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    value={currentPassword}
                    onChangeText={text => {
                      setCurrentPassword(text);
                      setError(null);
                    }}
                    secureTextEntry={!showCurrentPassword}
                    placeholder={t('EnterCurrentPassword')}
                    placeholderTextColor={colors.text.disabled}
                    style={{
                      flex: 1,
                      fontSize: typography.size.sm,
                      color: colors.text.primary,
                      padding: 0,
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ padding: spacing.xs }}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={16} color={colors.text.tertiary} strokeWidth={1.5} />
                    ) : (
                      <Eye size={16} color={colors.text.tertiary} strokeWidth={1.5} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={{
                paddingVertical: spacing.md,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.divider,
              }}>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                  marginBottom: spacing.xs,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  {t('NewPassword')}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    value={newPassword}
                    onChangeText={text => {
                      setNewPassword(text);
                      setError(null);
                    }}
                    secureTextEntry={!showNewPassword}
                    placeholder={t('EnterNewPassword')}
                    placeholderTextColor={colors.text.disabled}
                    style={{
                      flex: 1,
                      fontSize: typography.size.sm,
                      color: colors.text.primary,
                      padding: 0,
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={{ padding: spacing.xs }}
                  >
                    {showNewPassword ? (
                      <EyeOff size={16} color={colors.text.tertiary} strokeWidth={1.5} />
                    ) : (
                      <Eye size={16} color={colors.text.tertiary} strokeWidth={1.5} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={{
                paddingVertical: spacing.md,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.divider,
              }}>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                  marginBottom: spacing.xs,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  {t('ConfirmNewPassword')}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={text => {
                      setConfirmPassword(text);
                      setError(null);
                    }}
                    secureTextEntry={!showConfirmPassword}
                    placeholder={t('ConfirmNewPassword')}
                    placeholderTextColor={colors.text.disabled}
                    style={{
                      flex: 1,
                      fontSize: typography.size.sm,
                      color: colors.text.primary,
                      padding: 0,
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ padding: spacing.xs }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} color={colors.text.tertiary} strokeWidth={1.5} />
                    ) : (
                      <Eye size={16} color={colors.text.tertiary} strokeWidth={1.5} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {error ? (
                <View style={{ marginTop: spacing.md }}>
                  <Text
                    style={{
                      color: colors.semantic.error,
                      fontSize: typography.size.xs,
                    }}
                  >
                    {error}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>

        {!success && (
          <View
            style={{
              padding: spacing.xl,
              borderTopWidth: 0.5,
              borderColor: colors.divider,
            }}
          >
            <Button
              variant="primary"
              onPress={handleChangePassword}
              loading={submitting}
              disabled={submitting}
            >
              {t('UpdatePassword')}
            </Button>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

