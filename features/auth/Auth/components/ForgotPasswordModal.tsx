import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { authService } from '../../../../shared/services/authService';
import KeyboardOptimizedInput from '../../../../shared/components/ui/KeyboardOptimizedInput';
import Button from '../../../../shared/components/ui/Button';

type Props = {
  visible: boolean;
  initialEmail?: string;
  onClose: () => void;
};

export const ForgotPasswordModal = ({ visible, initialEmail = '', onClose }: Props) => {
  const { colors, brand, typography, spacing, borderRadius } = useTheme();
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
              backgroundColor: brand.primary,
              borderRadius: borderRadius['2xl'],
              padding: spacing['2xl'],
              gap: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: typography.size.lg,
                fontWeight: typography.weight.semibold,
                color: colors.text.inverse,
              }}
            >
              Reset your password
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.size.sm,
              }}
            >
              Enter your email address and we'll send a reset link if the account exists.
            </Text>
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
            {message ? (
              <Text
                style={{
                  color: success
                    ? colors.semantic.successDark
                    : colors.semantic.error,
                  fontSize: typography.size.sm,
                }}
              >
                {message}
              </Text>
            ) : null}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: spacing.md,
                marginTop: spacing.sm,
              }}
            >
              <Button
                variant="ghost"
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

