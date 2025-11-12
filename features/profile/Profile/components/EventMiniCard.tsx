import React from 'react';
import { ImageBackground, View, Text } from 'react-native';

type Props = {
  title: string;
  date: string;
  location: string;
  tagLeft?: string; // e.g., upcoming/completed
  tagRight?: string; // e.g., Creator
  imageUrl: string;
};

export const EventMiniCard = ({ title, date, location, tagLeft, tagRight, imageUrl }: Props) => (
  <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
    <ImageBackground source={{ uri: imageUrl }} style={{ height: 160 }}>
      <View style={{ position: 'absolute', inset: 0 as any, backgroundColor: 'rgba(0,0,0,0.18)' }} />
      {tagLeft ? (
        <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: '#111827', fontSize: 12 }}>{tagLeft}</Text>
        </View>
      ) : null}
      {tagRight ? (
        <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#111827', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{tagRight}</Text>
        </View>
      ) : null}
    </ImageBackground>
    <View style={{ padding: 12 }}>
      <Text style={{ color: '#111827', fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: '#6B7280', marginTop: 4 }}>{date}</Text>
      <Text style={{ color: '#6B7280', marginTop: 2 }}>{location}</Text>
    </View>
  </View>
);

