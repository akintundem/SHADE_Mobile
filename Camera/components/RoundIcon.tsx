import React from 'react';
import { TouchableOpacity } from 'react-native';

export default function RoundIcon({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }}>
      {children}
    </TouchableOpacity>
  );
}


