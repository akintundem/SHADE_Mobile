import React from 'react';
import { ImageBackground, Text, View } from 'react-native';

type Props = {
  title: string;
  description: string;
  imageUrl: string;
  meta?: string; // e.g., 1958 - 2024   127 events   Auree Archive
};

export const CollectionCard = ({ title, description, imageUrl, meta }: Props) => (
  <View style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#1F2937' }}>
    <ImageBackground source={{ uri: imageUrl }} style={{ height: 200 }}>
      <View style={{ position: 'absolute', inset: 0 as any, backgroundColor: 'rgba(0,0,0,0.35)' }} />
      <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
        <Text style={{ color: '#111827', fontSize: 12, fontWeight: '600' }}>Featured Collection</Text>
      </View>

      <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>{title}</Text>
        <Text style={{ color: '#E5E7EB', marginTop: 6 }}>{description}</Text>
        {meta ? <Text style={{ color: '#E5E7EB', marginTop: 8 }}>{meta}</Text> : null}
      </View>
    </ImageBackground>
  </View>
);

