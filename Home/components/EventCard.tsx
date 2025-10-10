import React from 'react';
import { Image, Text, View } from 'react-native';
import { CalendarClock, MapPin, MessageCircle, Heart, MessageSquareText, Music } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

export type EventItem = {
  id: string;
  title: string;
  description?: string;
  startAt?: string; // ISO string or formatted
  venue?: string;
  city?: string;
  state?: string;
  imageUrl?: string;
  stats?: { posts?: number; comments?: number; likes?: number };
  tag?: string; // e.g., Festival
  hashtags?: string[]; // e.g., ["music", "festival"]
  cosigners?: string[]; // initials e.g., ["C1","C2"]
  cosignedCount?: number; // total people who cosigned
};

type Props = { item: EventItem };

export const EventCard = ({ item }: Props) => {
  const { colors } = useTheme();
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
      {item.imageUrl ? (
        <View>
          <Image source={{ uri: item.imageUrl }} style={{ height: 240, width: '100%' }} />
          {item.tag ? (
            <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(17,24,39,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Music size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{item.tag}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>{item.title}</Text>
        {item.description ? (
          <Text style={{ marginTop: 6, color: colors.textSecondary }}>{item.description}</Text>
        ) : null}

        {item.startAt ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
            <CalendarClock size={16} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary }}>{item.startAt}</Text>
          </View>
        ) : null}

        {(item.venue || item.city) ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
            <MapPin size={16} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary }}>
              {item.venue}
              {item.city ? `  •  ${item.city}${item.state ? `, ${item.state}` : ''}` : ''}
            </Text>
          </View>
        ) : null}

        {/* divider */}
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />

        {item.stats ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MessageSquareText size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary }}>{item.stats.posts ?? 0} posts</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MessageCircle size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary }}>{item.stats.comments ?? 0}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Heart size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary }}>{item.stats.likes ?? 0}</Text>
            </View>
          </View>
        ) : null}

        {/* Co-signed row */}
        {(item.cosigners && item.cosigners.length > 0) || item.cosignedCount ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '600', color: colors.textPrimary }}>
              {item.cosigners?.slice(0, 3).join(' ')}
              {item.cosigners && item.cosigners.length > 3 ? ` +${item.cosigners.length - 3}` : ''}
            </Text>
            {item.cosignedCount ? (
              <Text style={{ color: colors.textSecondary, marginTop: 2 }}>Co-signed by {item.cosignedCount} people</Text>
            ) : null}
          </View>
        ) : null}

        {/* Tags */}
        {item.hashtags && item.hashtags.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {item.hashtags.map(tag => (
              <View key={tag} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.surface }}>
                <Text style={{ color: colors.textPrimary, fontSize: 12 }}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
};
