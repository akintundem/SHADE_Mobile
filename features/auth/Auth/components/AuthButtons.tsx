import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Apple, Mail, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { useI18n } from '../../../../shared/i18n/I18nProvider';

type Props = {
  onApplePress?: () => void;
  onGooglePress?: () => void;
  onSpotifyPress?: () => void;
};

export const AuthButtons = ({ onApplePress, onSpotifyPress }: Props) => {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();
  const { t } = useI18n();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={{ gap: spacing.md }}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          backgroundColor: colors.social.apple,
          height: 48,
          borderRadius: borderRadius.full,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          ...shadows.sm,
          borderWidth: 0.5,
          borderColor: '#FFFFFF' ,
        }}
        onPress={onApplePress}
      >
        <Apple size={18} color="#FFFFFF" fill="#FFFFFF" />
        <Text style={{
          color: '#FFFFFF',
          fontSize: typography.size.base,
          fontWeight: typography.weight.semibold,
        }}>
          {t('ContinueWithApple')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        activeOpacity={0.8} 
        style={{
          backgroundColor: colors.social.spotify,
          height: 48,
          borderRadius: borderRadius.full,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          ...shadows.sm,
        }}
        onPress={onSpotifyPress}
      >
        <Mail size={18} color="#FFFFFF" />
        <Text style={{
          color: '#FFFFFF',
          fontSize: typography.size.base,
          fontWeight: typography.weight.semibold,
        }}>
          {t('ContinueWithSpotify')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
