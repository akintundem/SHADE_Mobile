import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export const DiscoverHeaderHero = () => {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
      <View style={{ alignSelf: 'center', backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Event Archive Platform</Text>
      </View>
      <Text style={{ color: colors.textPrimary, fontWeight: '800', fontSize: 18, textAlign: 'center', marginTop: 10 }}>Discover History</Text>
      <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
        Explore the world's most significant events, curated collections, and moments that shaped our culture
      </Text>
      <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Search events, collections, locations...</Text>
    </View>
  );
};
