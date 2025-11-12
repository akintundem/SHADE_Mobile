import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { useI18n } from '../../../../shared/i18n/I18nProvider';
import BrandLogo from '../../../../shared/components/brand/BrandLogo';

export const Header = () => {
  const { colors, typography, spacing, shadows } = useTheme();
  const { t } = useI18n();
  const ICON_SIZE = 64;
  const ICON_RADIUS = Math.round(ICON_SIZE * 0.225);
  
  return (
    <View style={{ alignItems: 'center', marginBottom: spacing['3xl'] }}>
      <BrandLogo
        size={ICON_SIZE}
        borderRadius={ICON_RADIUS}
        style={{
          marginBottom: spacing.xl,
          ...shadows.brand,
        }}
      />
      <Text style={{
        fontSize: typography.size['4xl'],
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
        letterSpacing: -0.5,
      }}>
        Shade
      </Text>
      <Text style={{
        fontSize: typography.size.lg,
        color: colors.text.secondary,
        textAlign: 'center',
      }}>
        {t('HeaderTagline')}
      </Text>
    </View>
  );
};
