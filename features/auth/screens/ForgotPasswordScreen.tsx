import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { authService } from '../services/authService';
import KeyboardAwareContainer from '../../../common/components/ui/KeyboardAwareContainer';
import Input from '../../../common/components/ui/Input';
import Button from '../../../common/components/ui/Button';

type Props = {
  email?: string;
  onBack: () => void;
  onSuccess: () => void;
};

export default function ForgotPasswordScreen({ email: initialEmail = '', onBack, onSuccess }: Props) {
  const { colors, brand, typography, spacing } = useTheme();
  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setMessage('Please enter your email address');
      setSuccess(false);
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      const response = await authService.forgotPassword(trimmedEmail.toLowerCase());
      
      if (response.success) {
        setMessage('If an account exists with this email, we\'ve sent a password reset link.');
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setMessage(response.message || 'Unable to send reset email. Please try again.');
        setSuccess(false);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Unable to send reset email. Please try again.';
      setMessage(errorMessage);
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

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
              Reset password
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
              Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>

          <View style={{ gap: spacing.xl }}>
            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setMessage(null);
              }}
              placeholder="Enter your email address"
              inputType="email"
              enableNativeAutocomplete={true}
              leftIcon={<Mail size={18} color={colors.text.tertiary} />}
              containerStyle={{ marginBottom: 0 }}
            />

            {message && (
              <View
                style={{
                  backgroundColor: success
                    ? colors.semantic.successLight
                    : colors.semantic.errorLight,
                  padding: spacing.md,
                  borderRadius: spacing.md,
                  borderWidth: 1,
                  borderColor: success
                    ? colors.semantic.success
                    : colors.semantic.error,
                }}
              >
                <Text
                  style={{
                    color: success
                      ? colors.semantic.success
                      : colors.semantic.error,
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
                Send reset link
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAwareContainer>
    </SafeAreaView>
  );
}

