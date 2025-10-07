import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera } from 'lucide-react-native';

type Props = { onPress?: () => void };

export const SharePostCard = ({ onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#CBD5E1',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        paddingVertical: 20,
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            height: 48,
            width: 48,
            borderRadius: 24,
            backgroundColor: '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <Camera size={20} color="#111827" />
        </View>
        <Text style={{ fontWeight: '600', color: '#111827' }}>Share a Post</Text>
        <Text style={{ color: '#6B7280', marginTop: 6, textAlign: 'center' }}>
          Connect a moment to music or an event and share it
        </Text>
      </View>
    </TouchableOpacity>
  );
};

