import React from 'react';
import { ImageBackground, Text, View } from 'react-native';
import { CalendarClock, MapPin, Users, Camera, Music, Archive } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

export type TrendingItem = {
  id: string;
  typeLabel?: string; // e.g., Concert
  archived?: boolean;
  title: string;
  date: string;
  location: string; // formatted line
  description?: string;
  imageUrl: string;
  stats?: { attendees?: number; posts?: number };
  hashtags?: string[];
};

type Props = { item: TrendingItem; variant?: 'light' | 'dark' };

export const TrendingCard = ({ item }: Props) => {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
      <ImageBackground source={{ uri: item.imageUrl }} style={{ height: 200 }}>
        <View style={{ ...StyleSheet.absoluteFillObject } as any} />
        {/* Overlay for text readability */}
        <View style={{ position: 'absolute', inset: 0 as any, backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.28)' }} />

        {/* Top labels */}
        <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
          {item.typeLabel ? (
            <View style={{ backgroundColor: 'rgba(17,24,39,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{item.typeLabel}</Text>
            </View>
          ) : <View />}
          {item.archived ? (
            <View style={{ backgroundColor: 'rgba(17,24,39,0.65)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Archive size={12} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Archived</Text>
            </View>
          ) : null}
        </View>

        {/* Title + meta */}
        <View style={{ flex: 1, justifyContent: 'flex-end', padding: 12, gap: 8 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>{item.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CalendarClock size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF' }}>{item.date}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF' }}>{item.location}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={{ padding: 12, gap: 8, backgroundColor: colors.surface }}>
        {item.description ? (
          <Text style={{ color: colors.textSecondary }}>{item.description}</Text>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center', marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Users size={14} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }}>{item.stats?.attendees?.toLocaleString() ?? 0}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Camera size={14} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }}>{item.stats?.posts ?? 0}</Text>
          </View>
        </View>

        {item.hashtags && item.hashtags.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {item.hashtags.map(tag => (
              <View key={tag} style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 12 }}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
};

// RN's StyleSheet shim for absoluteFill object
import { StyleSheet } from 'react-native';
