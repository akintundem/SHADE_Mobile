import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = { onPlus?: () => void };

export const TopBar = ({ onPlus }: Props) => {
  const { colors, brand, typography, spacing, shadows } = useTheme();
  
  return (
    <View
      style={{
        height: 56,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{
        color: colors.text.primary,
        fontWeight: typography.weight.bold,
        fontSize: typography.size.xl,
        letterSpacing: -0.5,
      }}>
        Discover
      </Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <TouchableOpacity 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Search size={20} color={colors.text.secondary} strokeWidth={2} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={onPlus}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: brand.primary,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.md,
          }}
        >
          <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
