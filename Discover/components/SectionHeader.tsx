import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, Clock, Plus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  icon: 'trending' | 'clock';
  title: string;
  badge?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  theme?: 'light' | 'dark';
};

export const SectionHeader = ({ icon, title, badge, ctaLabel, onPressCta }: Props) => {
  const Icon = icon === 'trending' ? TrendingUp : Clock;
  const { colors } = useTheme();
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon size={18} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 16 }}>{title}</Text>
          {badge ? (
            <View style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.card }}>
              <Text style={{ color: colors.textPrimary, fontSize: 12 }}>{badge}</Text>
            </View>
          ) : null}
        </View>

        {ctaLabel ? (
          <TouchableOpacity
            onPress={onPressCta}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border }}
          >
            <Plus size={14} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary, marginLeft: 6, fontWeight: '600', fontSize: 12 }}>{ctaLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};
