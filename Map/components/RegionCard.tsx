import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  name: string;
  totalEvents: number;
  activeEvents: number;
};

export const RegionCard = ({ name, totalEvents, activeEvents }: Props) => (
  <View style={{ borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: '#111827', fontWeight: '600' }}>{name}</Text>
      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F3F4F6' }}>
        <Text style={{ color: '#111827', fontSize: 12 }}>{totalEvents} events</Text>
      </View>
    </View>
    <Text style={{ color: '#6B7280', marginTop: 4 }}>{activeEvents} active events</Text>
  </View>
);

