import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera, Images } from 'lucide-react-native';
import { User } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

type Props = {
  user: User;
  onOpenMenu?: () => void;
  onOpenCamera?: () => void;
  onOpenGallery?: () => void;
};

export const HomeHeader = ({ onOpenCamera, onOpenGallery }: Props) => {
  const { colors, typography, spacing, brand, borderRadius, shadows } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <View
        style={{
          height: 46,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: spacing.xl,
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size['2xl'],
              letterSpacing: -0.5,
              textAlign: 'left',
            }}
          >
            Shade
          </Text>
        </View>
        
        {/* Camera and Gallery buttons - commented out for production */}
        {/* <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {onOpenGallery && (
            <TouchableOpacity
              onPress={onOpenGallery}
              style={{
                width: 40,
                height: 40,
                borderRadius: borderRadius.full,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                ...shadows.sm,
              }}
              activeOpacity={0.8}
            >
              <Images size={20} color={colors.text.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          
          {onOpenCamera && (
            <TouchableOpacity
              onPress={onOpenCamera}
              style={{
                width: 40,
                height: 40,
                borderRadius: borderRadius.full,
                backgroundColor: brand.secondary,
                alignItems: 'center',
                justifyContent: 'center',
                ...shadows.sm,
              }}
              activeOpacity={0.8}
            >
              <Camera size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View> */}
      </View>
    </View>
  );
};
