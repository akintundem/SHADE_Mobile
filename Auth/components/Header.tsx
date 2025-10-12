import React from 'react';
import { View, Text } from 'react-native';
import { Umbrella } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';

export const Header = () => {
  const { colors, brand, typography, spacing, shadows } = useTheme();
  const { t } = useI18n();
  
  return (
    <View style={{ alignItems: 'center', marginBottom: spacing['3xl'] }}>
      <View style={{
        height: 80,
        width: 80,
        borderRadius: 40,
        backgroundColor: brand.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
        ...shadows.brand,
      }}>
        <Umbrella color="#FFFFFF" size={40} strokeWidth={2.5} />
      </View>
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

