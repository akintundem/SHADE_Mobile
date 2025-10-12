import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { Home, Compass, MapPinned, User } from 'lucide-react-native';

type Props = { active: 'home' | 'discover' | 'map' | 'profile'; onChange?: (tab: Props['active']) => void };

const Item = ({ active, onPress, Icon }: { active: boolean; onPress?: () => void; Icon: any }) => {
  const { colors, brand } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
    >
      <Icon size={24} color={active ? brand.primary : colors.text.tertiary} strokeWidth={active ? 2.4 : 2} />
    </TouchableOpacity>
  );
};

export const TabBar = ({ active, onChange }: Props) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  useI18n(); // keep i18n wired for future labels if needed

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
        flexDirection: 'row',
        height: 48 + Math.max(insets.bottom, 0),
        paddingBottom: Math.max(insets.bottom, 0),
      }}
    >
      <Item active={active === 'home'} onPress={() => onChange?.('home')} Icon={Home} />
      <Item active={active === 'discover'} onPress={() => onChange?.('discover')} Icon={Compass} />
      <Item active={active === 'map'} onPress={() => onChange?.('map')} Icon={MapPinned} />
      <Item active={active === 'profile'} onPress={() => onChange?.('profile')} Icon={User} />
    </View>
  );
};

