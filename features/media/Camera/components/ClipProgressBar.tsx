import React from 'react';
import { View } from 'react-native';

type Clip = { id: string; duration: number; type: 'photo' | 'video' };

export default function ClipProgressBar({ clips, totalDuration }: { clips: Clip[]; totalDuration: number }) {
  if (clips.length === 0) {
    return <View style={{ height: 6, width: '74%', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' }} />;
  }
  const total = totalDuration > 0 ? totalDuration : clips.length;
  return (
    <View style={{ height: 6, width: '74%', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', overflow: 'hidden' }}>
      {clips.map(clip => {
        const base = clip.duration || 1;
        const pct = Math.max(0.05, base / total);
        return <View key={clip.id} style={{ flex: pct, backgroundColor: clip.type === 'video' ? '#F87171' : '#4ADE80' }} />;
      })}
    </View>
  );
}


