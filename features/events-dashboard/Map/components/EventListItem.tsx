import React from 'react';
import { View, Text } from 'react-native';
import { CalendarDays, MapPin } from 'lucide-react-native';

type Props = {
  color: string;
  title: string;
  location: string;
  dates: string;
  typeLabel: string;
  people?: string;
};

export const EventListItem = ({ color, title, location, dates, typeLabel, people }: Props) => (
  <View style={{ borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ color: '#111827', fontWeight: '600' }}>{title}</Text>
    </View>

    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <MapPin size={14} color="#111827" />
        <Text style={{ color: '#111827' }}>{location}</Text>
      </View>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <CalendarDays size={14} color="#111827" />
        <Text style={{ color: '#111827' }}>{dates}</Text>
      </View>
      {people ? <Text style={{ color: '#6B7280' }}>{people}</Text> : null}
    </View>

    <View style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 10 }}>
      <Text style={{ color: '#111827', fontSize: 12 }}>{typeLabel}</Text>
    </View>
  </View>
);

