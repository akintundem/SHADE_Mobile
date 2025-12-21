import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { Home, Calendar, User } from 'lucide-react-native';

type Tab = 'home' | 'manage' | 'profile';

type Props = {
  active: Tab;
  onChange?: (tab: Tab) => void;
};

export function TabBar({ active, onChange }: Props) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'manage', label: 'Manage', icon: Calendar },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 0.5,
        borderTopColor: colors.divider,
        paddingBottom: Math.max(insets.bottom, spacing.sm),
        paddingTop: spacing.sm,
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange?.(tab.key)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.xs,
            }}
          >
            <Icon
              size={20}
              color={isActive ? colors.text.primary : colors.text.tertiary}
            />
            <Text
              style={{
                marginTop: spacing.xs / 2,
                fontSize: typography.size.xs,
                fontWeight: isActive ? typography.weight.semibold : typography.weight.medium,
                color: isActive ? colors.text.primary : colors.text.tertiary,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

