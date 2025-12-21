import React from 'react';
import { View, Text } from 'react-native';
import { ImageOff } from 'lucide-react-native';

export const EmptyFeed = () => (
  <View style={{ alignItems: 'center', paddingVertical: 28, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FFFFFF' }}>
    <ImageOff size={20} color="#9CA3AF" />
    <Text style={{ marginTop: 8, color: '#6B7280' }}>No posts yet</Text>
  </View>
);

