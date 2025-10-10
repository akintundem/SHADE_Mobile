import React from 'react';
import { View, Text } from 'react-native';
import { CalendarDays, MapPin } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  color: string;
  title: string;
  location: string;
  dates: string;
  typeLabel: string;
  people?: string;
};

export const EventListItem = ({ color, title, location, dates, typeLabel, people }: Props) => {
  const { colors } = useTheme();
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 10, padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{title}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MapPin size={14} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary }}>{location}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <CalendarDays size={14} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary }}>{dates}</Text>
        </View>
        {people ? <Text style={{ color: colors.textSecondary }}>{people}</Text> : null}
      </View>

      <View style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 10 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 12 }}>{typeLabel}</Text>
      </View>
    </View>
  );
};

