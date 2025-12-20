import React from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { Home, Calendar, User } from 'lucide-react-native';

type Props = {
  active: 'home' | 'manage' | 'profile';
  onChange?: (tab: Props['active']) => void;
};

type TabItem = {
  id: 'home' | 'manage' | 'profile';
  label: string;
  Icon: any;
};

const tabs: TabItem[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'manage', label: 'Manage', Icon: Calendar },
  { id: 'profile', label: 'Profile', Icon: User },
];

const TabItem = ({
  item,
  active,
  onPress,
}: {
  item: TabItem;
  active: boolean;
  onPress?: () => void;
}) => {
  const { colors, typography, spacing } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(active ? 1 : 0.95)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: active ? 1 : 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [active, scaleAnim]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs / 2,
        paddingHorizontal: spacing.xs,
      }}
      hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
    >
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: scaleAnim }],
        }}
      >
        <View
          style={{
            marginBottom: spacing.xs / 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <item.Icon
            size={20}
            color={active ? colors.text.primary : colors.text.tertiary}
            strokeWidth={active ? 2.5 : 2}
            style={{
              opacity: active ? 1 : 0.6,
            }}
          />
        </View>
        <Text
          style={{
            fontSize: 10,
            fontWeight: active ? typography.weight.semibold : typography.weight.medium,
            color: active ? colors.text.primary : colors.text.tertiary,
            letterSpacing: -0.1,
            marginTop: 1,
            opacity: active ? 1 : 0.7,
          }}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </Animated.View>
      
      {/* Active indicator */}
      {active && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: colors.text.primary,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
          }}
        />
      )}
    </TouchableOpacity>
  );
};

export const TabBar = ({ active, onChange }: Props) => {
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 0.5,
        borderTopColor: colors.borderLight,
        flexDirection: 'row',
        paddingTop: spacing.xs / 2,
        paddingBottom: Math.max(insets.bottom, spacing.xs),
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          item={tab}
          active={active === tab.id}
          onPress={() => onChange?.(tab.id)}
        />
      ))}
    </View>
  );
};
