import React from 'react';
import { ImageBackground, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { CalendarDays, MapPin, Music } from 'lucide-react-native';

export type RecentItem = {
  id: string;
  tag?: string; // Festival, Concert, etc
  title: string;
  date: string;
  location: string;
  description?: string;
  imageUrl: string;
  status?: 'upcoming' | 'live' | 'archived';
};

type Props = { item: RecentItem; variant?: 'light' | 'dark' };

export const RecentCard = ({ item }: Props) => {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
      <ImageBackground source={{ uri: item.imageUrl }} style={{ height: 140 }}>
        {/* overlay */}
        <View style={{ position: 'absolute', inset: 0 as any, backgroundColor: 'rgba(0,0,0,0.22)' }} />

        <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(17,24,39,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Music size={12} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{item.tag || 'Event'}</Text>
        </View>

        {item.status === 'upcoming' ? (
          <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textPrimary, fontSize: 12 }}>Upcoming</Text>
          </View>
        ) : null}
      </ImageBackground>

      <View style={{ padding: 12 }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 16 }}>{item.title}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CalendarDays size={14} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary }}>{item.date}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary }}>{item.location}</Text>
          </View>
        </View>

        {item.description ? (
          <Text style={{ color: colors.textSecondary, marginTop: 8 }}>{item.description}</Text>
        ) : null}
      </View>
    </View>
  );
};
