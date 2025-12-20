import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useI18n } from '../../../../common/i18n/I18nProvider';

type Props = { onPress?: () => void };

export const SharePostCard = ({ onPress }: Props) => {
  const { colors, brand, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: brand.primary + '40',
        borderRadius: borderRadius.xl,
        backgroundColor: brand.primary + '08',
        paddingVertical: spacing['2xl'],
        paddingHorizontal: spacing.lg,
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            height: 56,
            width: 56,
            borderRadius: 28,
            backgroundColor: brand.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
          }}
        >
          <Camera size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
        <Text style={{ 
          fontWeight: typography.weight.semibold,
          color: colors.text.primary,
          fontSize: typography.size.lg,
        }}>
          {t('ShareMoment')}
        </Text>
        <Text style={{ 
          color: colors.text.secondary,
          marginTop: spacing.xs,
          textAlign: 'center',
          fontSize: typography.size.sm,
          lineHeight: 20,
        }}>
          {t('ShareMomentSub')}
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          marginTop: spacing.md,
        }}>
          <Sparkles size={14} color={brand.primary} />
          <Text style={{
            color: brand.primary,
            fontSize: typography.size.xs,
            fontWeight: typography.weight.medium,
          }}>
            {t('PremiumSecure')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

