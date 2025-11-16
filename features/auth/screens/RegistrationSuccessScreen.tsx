import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Mail } from 'lucide-react-native';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import Button from '../../../shared/components/ui/Button';

type Props = {
  email: string;
  onContinue: () => void;
};

export default function RegistrationSuccessScreen({ email, onContinue }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
          gap: spacing.xl,
        }}
      >
        {/* Success Icon */}
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

        {/* Title */}
        <Text
          style={{
            fontSize: typography.size['2xl'],
            fontWeight: typography.weight.bold,
            color: colors.text.primary,
            textAlign: 'center',
          }}
        >
          Account Created Successfully
        </Text>

        {/* Email Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
          }}
        >
          <Mail size={24} color={colors.text.secondary} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: typography.size.sm,
                color: colors.text.secondary,
                marginBottom: spacing.xs,
              }}
            >
              Verification email sent to
            </Text>
            <Text
              style={{
                fontSize: typography.size.base,
                fontWeight: typography.weight.semibold,
                color: colors.text.primary,
              }}
              numberOfLines={1}
            >
              {email}
            </Text>
          </View>
        </View>

        {/* Message */}
        <Text
          style={{
            fontSize: typography.size.base,
            color: colors.text.secondary,
            textAlign: 'center',
            lineHeight: 24,
            maxWidth: 320,
          }}
        >
          Please check your email and click the verification link to activate your account.
        </Text>

        {/* Button */}
        <View style={{ width: '100%', marginTop: spacing.md }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onContinue}
          >
            Continue to Login
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}


