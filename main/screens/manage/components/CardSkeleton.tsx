import React from 'react';
import { View } from 'react-native';

export function CardSkeleton({ height = 300 }: { height?: number }) {
  return (
    <View
      className="mb-xl overflow-hidden"
      style={{
        height,
        borderRadius: 28,
        backgroundColor: '#1a1a1a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      <View
        className="absolute top-0 left-0 right-0 flex-row items-center justify-between"
        style={{ paddingHorizontal: 20, paddingTop: 20 }}
      >
        <View style={{ width: 3, height: 30, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <View style={{ width: 68, height: 26, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </View>
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{ paddingHorizontal: 20, paddingBottom: 20, gap: 10 }}
      >
        <View style={{ height: 26, width: '72%', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <View style={{ height: 14, width: '45%', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <View style={{ height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.09)' }} />
      </View>
    </View>
  );
}

export function HostingSkeleton() {
  return <CardSkeleton height={300} />;
}

export function AttendingSkeleton() {
  return <CardSkeleton height={280} />;
}
