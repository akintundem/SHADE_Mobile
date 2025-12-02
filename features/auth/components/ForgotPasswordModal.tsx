import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Lock } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { authService } from '../../features/auth/services/authService';
import KeyboardOptimizedInput from '../../../common/components/ui/KeyboardOptimizedInput';
import Button from '../../../common/components/ui/Button';

type Props = {
  visible: boolean;
  initialEmail?: string;
  onClose: () => void;
};

export const ForgotPasswordModal = ({ visible, initialEmail = '', onClose }: Props) => {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();
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
        setMessage(response.message || 'Password reset email sent! Please check your inbox.');
        setSuccess(true);
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

  const handleClose = () => {
    setEmail(initialEmail);
    setMessage(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: 'center',
          padding: spacing['2xl'],
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={{
              backgroundColor: colors.surfaceElevated,
              borderRadius: borderRadius['2xl'],
              padding: spacing['3xl'],
              ...shadows.xl,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Icon Header */}
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: borderRadius.full,
                  backgroundColor: brand.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.lg,
                }}
              >
                <Lock size={32} color={brand.primary} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontSize: typography.size['2xl'],
                  fontWeight: typography.weight.bold,
                  color: colors.text.primary,
                  marginBottom: spacing.xs,
                  textAlign: 'center',
                }}
              >
                Reset your password
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.base,
                  textAlign: 'center',
                  lineHeight: 20,
                  paddingHorizontal: spacing.md,
                }}
              >
                Enter your email address and we'll send a reset link if the account exists.
              </Text>
            </View>

            {/* Input Section */}
            <View style={{ marginBottom: spacing.lg }}>
              <KeyboardOptimizedInput
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setMessage(null);
                }}
                inputType="email"
                enableNativeAutocomplete
              />
            </View>

            {/* Message Section */}
            {message ? (
              <View
                style={{
                  backgroundColor: success
                    ? colors.semantic.successLight
                    : colors.semantic.errorLight,
                  padding: spacing.md,
                  borderRadius: borderRadius.lg,
                  marginBottom: spacing.lg,
                }}
              >
                <Text
                  style={{
                    color: success
                      ? colors.semantic.successDark
                      : colors.semantic.error,
                    fontSize: typography.size.sm,
                    textAlign: 'center',
                    lineHeight: 18,
                  }}
                >
                  {message}
                </Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: spacing.md,
                marginTop: spacing.md,
              }}
            >
              <Button
                variant="outline"
                onPress={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting}
              >
                Send Reset Email
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

