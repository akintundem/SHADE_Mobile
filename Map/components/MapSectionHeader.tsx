import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Map, Filter } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = { onPressFilters?: () => void };

export const MapSectionHeader = ({ onPressFilters }: Props) => {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Map size={18} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>Event Map</Text>
        </View>
        <TouchableOpacity onPress={onPressFilters} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Filter size={16} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Filters</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
        Discover events through photos and live moments happening around you
      </Text>
    </View>
  );
};

