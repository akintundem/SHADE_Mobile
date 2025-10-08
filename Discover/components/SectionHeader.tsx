import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, Clock, Plus } from 'lucide-react-native';

type Props = {
  icon: 'trending' | 'clock';
  title: string;
  badge?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  theme?: 'light' | 'dark';
};

export const SectionHeader = ({ icon, title, badge, ctaLabel, onPressCta, theme = 'light' }: Props) => {
  const Icon = icon === 'trending' ? TrendingUp : Clock;
  const dark = theme === 'dark';
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon size={18} color={dark ? '#E5E7EB' : '#111827'} />
          <Text style={{ color: dark ? '#E5E7EB' : '#111827', fontWeight: '700', fontSize: 16 }}>{title}</Text>
          {badge ? (
            <View style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: dark ? '#1F2937' : '#F3F4F6' }}>
              <Text style={{ color: dark ? '#E5E7EB' : '#111827', fontSize: 12 }}>{badge}</Text>
            </View>
          ) : null}
        </View>

        {ctaLabel ? (
          <TouchableOpacity
            onPress={onPressCta}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: dark ? '#FFFFFF' : '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: dark ? '#1F2937' : '#E5E7EB' }}
          >
            <Plus size={14} color="#111827" />
            <Text style={{ color: '#111827', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>{ctaLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};
