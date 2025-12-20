import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  subtitle?: string;
  end?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
};

export function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  end,
  onPress,
  danger,
}: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: colors.divider,
        backgroundColor: colors.background,
      }}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          flex: 1,
        }}
      >
        <View style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon
            size={16}
            color={danger ? colors.semantic.error : colors.text.primary}
            strokeWidth={1.5}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: danger ? colors.semantic.error : colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.sm,
              letterSpacing: -0.1,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                color: colors.text.tertiary,
                marginTop: 2,
                fontSize: typography.size.xs,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {end ?? <ChevronRight size={16} color={colors.text.tertiary} strokeWidth={1.5} />}
    </TouchableOpacity>
  );
}

