import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../common/theme/ThemeProvider';
import { Home, CalendarCheck, User, Search } from 'lucide-react-native';

type Tab = 'home' | 'search' | 'manage' | 'profile';

type Props = {
  active: Tab;
  onChange?: (tab: Tab) => void;
};

export function TabBar({ active, onChange }: Props) {
  const { colors, brand } = useTheme();
  const insets = useSafeAreaInsets();

  const tabs: { key: Tab; icon: typeof Home }[] = [
    { key: 'home', icon: Home },
    { key: 'search', icon: Search },
    { key: 'manage', icon: CalendarCheck },
    { key: 'profile', icon: User },
  ];

  return (
    <View
      className="flex-row bg-light-background dark:bg-dark-background border-light-border dark:border-dark-border border-t border-t-[0.5px] pt-sm"
      style={{ paddingBottom: insets.bottom }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange?.(tab.key)}
            activeOpacity={0.7}
            className="flex-1 items-center justify-center"
          >
            <Icon
              size={18}
              color={isActive ? brand.primary : colors.text.tertiary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
