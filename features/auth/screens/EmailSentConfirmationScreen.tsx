import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import BrandLogo from '../../../common/components/brand/BrandLogo';
import Button from '../../../common/components/ui/Button';

type Props = {
  email: string;
  title: string;
  message: string;
  onBackToSignIn: () => void;
};

export default function EmailSentConfirmationScreen({ email, title, message, onBackToSignIn }: Props) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useI18n();

  const ICON_SIZE = 56;
  const ICON_RADIUS = Math.round(ICON_SIZE * 0.225);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
      }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: spacing['3xl'] }}>
          <BrandLogo
            size={ICON_SIZE}
            borderRadius={ICON_RADIUS}
            style={{
              marginBottom: spacing.md,
            }}
          />
          <Text
            style={{
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              color: colors.text.primary,
              letterSpacing: -0.5,
              marginBottom: spacing['3xl'],
            }}
          >
            Shade
          </Text>
        </View>

        {/* Message */}
        <View style={{ alignItems: 'center', marginBottom: spacing['4xl'], gap: spacing.md }}>
          <Text style={{
            fontSize: typography.size['3xl'],
            fontWeight: typography.weight.bold,
            color: colors.text.primary,
            letterSpacing: -1,
            textAlign: 'center',
            marginBottom: spacing.sm,
          }}>
            {title}
          </Text>
          <Text style={{
            fontSize: typography.size.sm,
            color: colors.text.secondary,
            lineHeight: 20,
            fontWeight: typography.weight.regular,
            letterSpacing: 0.1,
            textAlign: 'center',
            paddingHorizontal: spacing.xl,
          }}>
            {message}
          </Text>
        </View>

        {/* Back to Sign In Button */}
        <View style={{ width: '100%', paddingHorizontal: spacing.xl }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onBackToSignIn}
          >
            {t('SignIn')}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

