import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import Button from '../../../common/components/ui/Button';
import KeyboardOptimizedInput from '../../../common/components/ui/KeyboardOptimizedInput';
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
        trimmedCurrent,
        trimmedNew,
        trimmedConfirm
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
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              color: colors.text.primary,
              letterSpacing: -0.5,
              marginLeft: spacing.md,
            }}
          >
            {t('ChangePassword')}
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {success ? (
            <View
              style={{
                padding: spacing.lg,
                borderRadius: borderRadius.md,
                backgroundColor: colors.semantic.successLight,
                borderWidth: 0.5,
                borderColor: colors.semantic.success,
                marginBottom: spacing.lg,
              }}
            >
              <Text
                style={{
                  color: colors.semantic.successDark,
                  fontWeight: typography.weight.semibold,
                  fontSize: typography.size.sm,
                }}
              >
                {t('PasswordChangedSuccessfully')}
              </Text>
            </View>
          ) : (
            <>
              <KeyboardOptimizedInput
                label={t('CurrentPassword')}
                value={currentPassword}
                onChangeText={text => {
                  setCurrentPassword(text);
                  setError(null);
                }}
                inputType="password"
                enableNativeAutocomplete
              />
              <View style={{ height: spacing.md }} />
              <KeyboardOptimizedInput
                label={t('NewPassword')}
                value={newPassword}
                onChangeText={text => {
                  setNewPassword(text);
                  setError(null);
                }}
                inputType="password"
                enableNativeAutocomplete
              />
              <View style={{ height: spacing.md }} />
              <KeyboardOptimizedInput
                label={t('ConfirmNewPassword')}
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  setError(null);
                }}
                inputType="password"
                enableNativeAutocomplete
              />
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
            </>
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

