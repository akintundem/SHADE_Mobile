import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Apple, Mail, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';

type Props = { 
  onApplePress?: () => void;
  onGooglePress?: () => void;
  onSpotifyPress?: () => void;
};

export const AuthButtons = ({ onApplePress, onSpotifyPress }: Props) => {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();
  const { t } = useI18n();
  
  return (
    <View style={{ gap: spacing.md }}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={{
          backgroundColor: colors.social.apple,
          height: 56,
          borderRadius: borderRadius.full,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          ...shadows.md,
        }}
        onPress={onApplePress}
      >
        <Apple size={20} color="#FFFFFF" fill="#FFFFFF" />
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
          height: 56,
          borderRadius: borderRadius.full,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          shadowColor: colors.social.spotify,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 4,
        }}
        onPress={onSpotifyPress}
      >
        <Mail size={20} color="#FFFFFF" />
        <Text style={{
          color: '#FFFFFF',
          fontSize: typography.size.base,
          fontWeight: typography.weight.semibold,
        }}>
          {t('ContinueWithSpotify')}
        </Text>
      </TouchableOpacity>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
        gap: spacing.xs,
      }}>
        <Sparkles size={16} color={colors.text.tertiary} />
        <Text style={{
          color: colors.text.tertiary,
          fontSize: typography.size.sm,
        }}>
          {t('QuickSecureAuth')}
        </Text>
      </View>
    </View>
  );
};
