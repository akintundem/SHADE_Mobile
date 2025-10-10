import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  name: string;
  totalEvents: number;
  activeEvents: number;
};

export const RegionCard = ({ name, totalEvents, activeEvents }: Props) => {
  const { colors } = useTheme();
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{name}</Text>
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.card }}>
          <Text style={{ color: colors.textPrimary, fontSize: 12 }}>{totalEvents} events</Text>
        </View>
      </View>
      <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{activeEvents} active events</Text>
    </View>
  );
};

