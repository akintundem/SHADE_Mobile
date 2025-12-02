import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { authService } from '../services/authService';
import Button from '../../../common/components/ui/Button';
import Input from '../../../common/components/ui/Input';

type Props = {
  // For verifying with token (from email link)
  verifyToken?: string;
  // For resending verification email
  initialEmail?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function EmailVerificationScreen({
  verifyToken,
  initialEmail = '',
  onSuccess,
  onCancel,
}: Props) {
  const { colors, typography, spacing, borderRadius, brand } = useTheme();

  // Verification states
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Resend states
  const [email, setEmail] = useState(initialEmail);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Auto-verify if token is provided
  useEffect(() => {
    if (verifyToken) {
      handleVerifyEmail(verifyToken);
    }
  }, [verifyToken]);

  const handleVerifyEmail = async (token: string) => {
    try {
      setVerifying(true);
      setVerificationError(null);
      const response = await authService.verifyEmail(token);

      if (response.success) {
        setVerificationSuccess(true);
        setTimeout(() => {
          onSuccess?.();
        }, 2500);
      } else {
        setVerificationError(
          response.message || 'Unable to verify email. The link may have expired.'
        );
      }
    } catch (err: any) {
      setVerificationError(
        err?.message ||
          'Unable to verify email. The verification link may be invalid or expired.'
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setResendError('Please enter your email address');
      return;
    }

    try {
      setResending(true);
      setResendError(null);
      setResendSuccess(false);
      const response = await authService.resendEmailVerification(trimmedEmail.toLowerCase());

      if (response.success) {
        setResendSuccess(true);
      } else {
        setResendError(response.message || 'Unable to send verification email');
      }
    } catch (err: any) {
      setResendError(err?.message || 'Unable to send verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Show verification result if verifying with token
  if (verifyToken) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
            gap: spacing.xl,
          }}
        >
          {verifying ? (
            <>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: brand.primaryLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 32 }}>⏳</Text>
              </View>
              <Text
                style={{
                  fontSize: typography.size.xl,
                  fontWeight: typography.weight.semibold,
                  color: colors.text.primary,
                  textAlign: 'center',
                }}
              >
                Verifying your email...
              </Text>
            </>
          ) : verificationSuccess ? (
            <>
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
                  Email Verified Successfully!
                </Text>
                <Text
                  style={{
                    fontSize: typography.size.base,
                    color: colors.text.secondary,
                    textAlign: 'center',
                    maxWidth: 320,
                  }}
                >
                  Your email has been verified. You can now access all features.
                </Text>
              </View>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => onSuccess?.()}
                style={{ marginTop: spacing.lg }}
              >
                Continue
              </Button>
            </>
          ) : verificationError ? (
            <>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.semantic.errorLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <AlertCircle size={48} color={colors.semantic.error} />
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
                  Verification Failed
                </Text>
                <Text
                  style={{
                    fontSize: typography.size.base,
                    color: colors.text.secondary,
                    textAlign: 'center',
                    maxWidth: 320,
                  }}
                >
                  {verificationError}
                </Text>
              </View>

              <View style={{ width: '100%', gap: spacing.md }}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={() => {
                    setVerificationError(null);
                    onCancel?.();
                  }}
                >
                  Request New Link
                </Button>
                {onCancel && (
                  <Button variant="ghost" size="lg" fullWidth onPress={onCancel}>
                    Go Back
                  </Button>
                )}
              </View>
            </>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  // Show resend verification form
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.xl,
        }}
      >
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
            <Mail size={32} color={brand.primary} />
          </View>

          <Text
            style={{
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              color: colors.text.primary,
              textAlign: 'center',
            }}
          >
            Verify Your Email
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
            Enter your email address and we'll send you a verification link.
          </Text>
        </View>

        <View style={{ gap: spacing.lg, marginTop: spacing.md }}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setResendError(null);
              setResendSuccess(false);
            }}
            placeholder="Enter your email address"
            inputType="email"
            enableNativeAutocomplete
            leftIcon={<Mail size={20} color={colors.text.tertiary} />}
          />

          {resendSuccess && (
            <View
              style={{
                backgroundColor: colors.semantic.successLight,
                padding: spacing.md,
                borderRadius: borderRadius.lg,
              }}
            >
              <Text
                style={{
                  color: colors.semantic.successDark,
                  fontSize: typography.size.sm,
                  textAlign: 'center',
                }}
              >
                Verification email sent! Please check your inbox and spam folder.
              </Text>
            </View>
          )}

          {resendError && (
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
                {resendError}
              </Text>
            </View>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleResendVerification}
            disabled={!email.trim() || resending}
            loading={resending}
            style={{ marginTop: spacing.md }}
          >
            Send Verification Email
          </Button>

          {onCancel && (
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onPress={onCancel}
              disabled={resending}
            >
              Cancel
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
