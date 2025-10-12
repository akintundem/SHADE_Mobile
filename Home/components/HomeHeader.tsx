import React from 'react';
import { View, Text } from 'react-native';
import { User } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';

type Props = {
  user: User;
  onOpenMenu?: () => void;
};

export const HomeHeader = ({ user }: Props) => {
  const { colors, typography, spacing } = useTheme();
  const { t } = useI18n();
  const name = user.name || user.email;
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <View
        style={{
          height: 56,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{
          color: colors.text.primary,
          fontWeight: typography.weight.bold,
          fontSize: typography.size.xl,
          letterSpacing: -0.5,
        }}>
          Shade
        </Text>
      </View>

      <View style={{ 
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
      }}>
        <Text style={{
          fontSize: typography.size['2xl'],
          fontWeight: typography.weight.bold,
          color: colors.text.primary,
          textAlign: 'center',
        }}>
          {t('WelcomeBack', { name })}
        </Text>
        <Text style={{ 
          marginTop: spacing.xs,
          color: colors.text.secondary,
          textAlign: 'center',
          fontSize: typography.size.base,
        }}>
          {t('HomeTagline')}
        </Text>
      </View>
    </View>
  );
};
