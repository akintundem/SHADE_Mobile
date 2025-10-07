import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Map, Filter } from 'lucide-react-native';

type Props = { onPressFilters?: () => void };

export const MapSectionHeader = ({ onPressFilters }: Props) => (
  <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Map size={18} color="#111827" />
        <Text style={{ color: '#111827', fontSize: 18, fontWeight: '700' }}>Event Map</Text>
      </View>
      <TouchableOpacity onPress={onPressFilters} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Filter size={16} color="#111827" />
        <Text style={{ color: '#111827', fontWeight: '600' }}>Filters</Text>
      </TouchableOpacity>
    </View>
    <Text style={{ color: '#6B7280', marginTop: 6 }}>
      Discover events through photos and live moments happening around you
    </Text>
  </View>
);

