import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Umbrella } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';

type Props = { message?: string };

export default function LoadingState({ message }: Props) {
  const { colors, brand, typography, spacing } = useTheme();
  const { t } = useI18n();
  
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}
    >
      <View style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: brand.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
      }}>
        <Umbrella color="#FFFFFF" size={40} strokeWidth={2} />
      </View>
      
      <ActivityIndicator size="large" color={brand.primary} />
      
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
