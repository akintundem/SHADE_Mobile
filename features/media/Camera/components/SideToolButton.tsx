import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function SideToolButton({ label, active, icon, onPress }: { label: string; active?: boolean; icon: React.ReactNode; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,0,0,0.35)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: active ? '#FACC15' : 'rgba(255,255,255,0.25)' }}
    >
      {icon}
      <Text style={{ color: '#fff', fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
}


