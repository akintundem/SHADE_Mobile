import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Map, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  showEvents: boolean;
  onToggleEvents: () => void;
};

export const MapControls = ({ showEvents, onToggleEvents }: Props) => {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();

  return (
    <View style={{
      position: 'absolute',
      top: spacing.lg,
      right: spacing.lg,
      gap: spacing.sm,
    }}>
      {/* Map type controls removed (Map only) */}

      {/* Events Toggle */}
      <TouchableOpacity
        onPress={onToggleEvents}
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          ...shadows.md,
        }}
      >
        {showEvents ? (
          <Eye size={16} color={brand.primary} strokeWidth={2} />
        ) : (
          <EyeOff size={16} color={colors.text.tertiary} strokeWidth={2} />
        )}
        <Text style={{
          marginLeft: spacing.xs,
          fontSize: typography.size.xs,
          fontWeight: typography.weight.medium,
          color: showEvents ? brand.primary : colors.text.tertiary,
        }}>
          Events
        </Text>
      </TouchableOpacity>
    </View>
  );
};
