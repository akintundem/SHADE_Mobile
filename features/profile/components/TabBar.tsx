import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { Home, Calendar, User } from 'lucide-react-native';

type Tab = 'home' | 'manage' | 'profile';

type Props = {
  active: Tab;
  onChange?: (tab: Tab) => void;
};

export function TabBar({ active, onChange }: Props) {
  const { colors, spacing, brand } = useTheme();
  const insets = useSafeAreaInsets();

  const tabs: { key: Tab; icon: typeof Home }[] = [
    { key: 'home', icon: Home },
    { key: 'manage', icon: Calendar },
    { key: 'profile', icon: User },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.background,
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
              paddingVertical: spacing.sm,
            }}
          >
            <Icon
              size={24}
              color={isActive ? brand.primary : colors.text.tertiary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

