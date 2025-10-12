import React from 'react';
import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';

export const DiscoverHeaderHero = () => {
  const { colors, brand, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();
  
  return (
    <View style={{ 
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    }}>
      <View style={{ 
        alignSelf: 'center',
        backgroundColor: `${brand.primary}15`,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
      }}>
        <Sparkles size={14} color={brand.primary} />
        <Text style={{ 
          color: brand.primary,
          fontWeight: typography.weight.semibold,
          fontSize: typography.size.sm,
        }}>
          {t('EventPlatformTag')}
        </Text>
      </View>
      
      <Text style={{ 
        color: colors.text.primary,
        fontWeight: typography.weight.bold,
        fontSize: typography.size['3xl'],
        textAlign: 'center',
        marginTop: spacing.lg,
        letterSpacing: -0.5,
      }}>
        {t('DiscoverTitle')}
      </Text>
      
      <Text style={{ 
        color: colors.text.secondary,
        marginTop: spacing.md,
        textAlign: 'center',
        fontSize: typography.size.base,
        lineHeight: 24,
        paddingHorizontal: spacing.md,
      }}>
        {t('DiscoverSubtitle')}
      </Text>
    </View>
  );
};
