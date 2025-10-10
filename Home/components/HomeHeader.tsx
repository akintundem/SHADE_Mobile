import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { User } from '../../types';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  user: User;
  onOpenMenu?: () => void; // no longer used; left area shows brand
  onCreatePost?: () => void;
};

export const HomeHeader = ({ user, onOpenMenu, onCreatePost }: Props) => {
  const name = user.name || user.email;
  const { colors } = useTheme();
  return (
    <View style={{ backgroundColor: colors.surface }}>
      <View
        style={{
          height: 48,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ paddingHorizontal: 2 }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '800', fontSize: 18 }}>Shade</Text>
        </View>
        <TouchableOpacity onPress={onCreatePost} hitSlop={10}>
          <Plus size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }}>
          Welcome back, {name}
        </Text>
        <Text style={{ marginTop: 6, color: colors.textSecondary, textAlign: 'center' }}>
          Discover amazing events happening around you
        </Text>
      </View>
    </View>
  );
};
