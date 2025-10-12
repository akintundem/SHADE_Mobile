import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarRange, LayoutGrid } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = { value: 'events' | 'collections'; onChange: (v: 'events' | 'collections') => void };

export const SegSwitch = ({ value, onChange }: Props) => {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();
  
  return (
    <View style={{ 
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xs,
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm,
    }}>
      <Tab 
        label="Events" 
        Icon={CalendarRange} 
        active={value === 'events'} 
        onPress={() => onChange('events')} 
      />
      <Tab 
        label="Collections" 
        Icon={LayoutGrid} 
        active={value === 'collections'} 
        onPress={() => onChange('collections')} 
      />
    </View>
  );
};

const Tab = ({ label, Icon, active, onPress }: any) => {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      style={{ 
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: active ? brand.primary : 'transparent',
        ...(active && shadows.sm),
      }}
    >
      <Icon 
        size={18} 
        color={active ? '#FFFFFF' : colors.text.tertiary}
        strokeWidth={2}
      />
      <Text style={{ 
        color: active ? '#FFFFFF' : colors.text.secondary,
        fontWeight: active ? typography.weight.semibold : typography.weight.medium,
        fontSize: typography.size.sm,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

