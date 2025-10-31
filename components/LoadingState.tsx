import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import BrandLogo from './brand/BrandLogo';

type Props = { message?: string };

export default function LoadingState({ message }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useI18n();
  const ICON_SIZE = 56;
  const ICON_RADIUS = Math.round(ICON_SIZE * 0.225);
  
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}
    >
      <BrandLogo
        size={ICON_SIZE}
        borderRadius={ICON_RADIUS}
        style={{ marginBottom: spacing.xl }}
      />
      
      <ActivityIndicator size="large" color={colors.text.primary} />
      
      {message ? (
        <Text style={{ 
          color: colors.text.secondary, 
          marginTop: spacing.lg,
          fontSize: typography.size.base,
          fontWeight: typography.weight.medium,
        }}>
          {message}
        </Text>
      ) : (
        <Text style={{
          color: colors.text.secondary,
          marginTop: spacing.lg,
          fontSize: typography.size.base,
          fontWeight: typography.weight.medium,
        }}>
          {t('WelcomeShade')}
        </Text>
      )}
    </View>
  );
}
