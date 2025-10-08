import React from 'react';
import { View, Text } from 'react-native';

export const DiscoverHeaderHero = ({ theme = 'dark' as 'dark' | 'light' }) => {
  const dark = theme === 'dark';
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
      <View style={{ alignSelf: 'center', backgroundColor: dark ? '#1F2937' : '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
        <Text style={{ color: dark ? '#F3F4F6' : '#111827', fontWeight: '600' }}>Event Archive Platform</Text>
      </View>
      <Text style={{ color: dark ? '#F9FAFB' : '#111827', fontWeight: '800', fontSize: 18, textAlign: 'center', marginTop: 10 }}>Discover History</Text>
      <Text style={{ color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
        Explore the world's most significant events, curated collections, and moments that shaped our culture
      </Text>
      <Text style={{ color: '#9CA3AF', marginTop: 12 }}>Search events, collections, locations...</Text>
    </View>
  );
};
