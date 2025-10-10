import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';

export default function SettingsScreen({ onClose }: { onClose: () => void }) {
  const { isDark, setDark } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#FFFFFF' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <TouchableOpacity onPress={onClose}>
          <X color={isDark ? '#F9FAFB' : '#111827'} size={22} />
        </TouchableOpacity>
        <Text style={{ color: isDark ? '#F9FAFB' : '#111827', fontWeight: '700' }}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <Text style={{ color: isDark ? '#E5E7EB' : '#111827', fontWeight: '700', marginBottom: 8 }}>Appearance</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => setDark(false)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: !isDark ? '#111827' : '#E5E7EB' }}>
            <Text style={{ color: !isDark ? '#FFFFFF' : '#111827', fontWeight: '600' }}>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDark(true)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: isDark ? '#111827' : '#E5E7EB' }}>
            <Text style={{ color: isDark ? '#FFFFFF' : '#111827', fontWeight: '600' }}>Dark</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}


