import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { AppleIcon } from './icons/AppleIcon';
import { SpotifyIcon } from './icons/SpotifyIcon';

type Props = {
  onApplePress?: () => void;
  onGooglePress?: () => void;
  onSpotifyPress?: () => void;
};

export const AuthButtons = ({ onApplePress, onSpotifyPress }: Props) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  
  const buttonSize = 64;
  const iconSize = 28;
  
  return (
    <View style={{ 
      flexDirection: 'row', 
      gap: spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: borderRadius.full,
          backgroundColor: colors.social.apple,
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.lg,
        }}
        onPress={onApplePress}
      >
        <AppleIcon size={iconSize} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity 
        activeOpacity={0.7} 
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: borderRadius.full,
          backgroundColor: colors.social.spotify,
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.lg,
        }}
        onPress={onSpotifyPress}
      >
        <SpotifyIcon size={iconSize} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};
