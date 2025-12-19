import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { authService } from '../../../core/auth/services/authService';
import KeyboardAwareContainer from '../../../common/components/ui/KeyboardAwareContainer';
import Input from '../../../common/components/ui/Input';
import Button from '../../../common/components/ui/Button';
import EmailSentConfirmationScreen from './EmailSentConfirmationScreen';

type Props = {
  email?: string;
  onBack: () => void;
  onSuccess: () => void;
};

export default function ForgotPasswordScreen({ email: initialEmail = '', onBack, onSuccess }: Props) {
  const { colors, brand, typography, spacing } = useTheme();
  const { t } = useI18n();
  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showSentScreen, setShowSentScreen] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setMessage(t('PleaseEnterEmail'));
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      const response = await authService.forgotPassword(trimmedEmail.toLowerCase());
      
      if (response.success) {
        setShowSentScreen(true);
      } else {
        setMessage(response.message || t('UnableToSendResetEmail'));
      }
    } catch (err: any) {
      const errorMessage = err?.message || t('UnableToSendResetEmail');
      setMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (showSentScreen) {
    return (
      <EmailSentConfirmationScreen
        email={email.trim()}
        title={t('EmailSent')}
        message={t('EmailSentDescription', { email: email.trim() })}
        onBackToSignIn={onSuccess}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareContainer
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingTop: spacing.lg,
          paddingBottom: spacing['4xl'],
          minHeight: '100%',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={spacing.lg}
        scrollEnabled={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={onBack}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing['3xl'],
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={brand.primary} />
        </TouchableOpacity>

        <View style={{ gap: spacing['3xl'] }}>
          <View style={{ gap: spacing.md }}>
            <Text
              style={{
                fontSize: typography.size['3xl'],
                fontWeight: typography.weight.bold,
                color: colors.text.primary,
                letterSpacing: -1,
              }}
            >
              {t('ResetPassword')}
            </Text>
            <Text
              style={{
                fontSize: typography.size.sm,
                color: colors.text.secondary,
                lineHeight: 20,
                fontWeight: typography.weight.regular,
                letterSpacing: 0.1,
              }}
            >
              {t('ResetPasswordDescription')}
            </Text>
          </View>

          <View style={{ gap: spacing.xl }}>
            <Input
              label={t('Email')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setMessage(null);
              }}
              placeholder={t('EnterYourEmailAddress')}
              inputType="email"
              enableNativeAutocomplete={true}
              leftIcon={<Mail size={18} color={colors.text.tertiary} />}
              containerStyle={{ marginBottom: 0 }}
            />

            {message && (
              <View
                style={{
                  backgroundColor: colors.semantic.errorLight,
                  padding: spacing.md,
                  borderRadius: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.semantic.error,
                }}
              >
                <Text
                  style={{
                    color: colors.semantic.error,
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.medium,
                    lineHeight: 18,
                    letterSpacing: 0.1,
                  }}
                >
                  {message}
                </Text>
              </View>
            )}

            <View style={{ marginTop: spacing.sm }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleSubmit}
                loading={submitting}
                disabled={!email.trim() || submitting}
              >
                {t('SendResetLink')}
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAwareContainer>
    </SafeAreaView>
  );
}

