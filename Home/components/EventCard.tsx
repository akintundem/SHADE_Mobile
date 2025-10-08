import React, { useEffect, useState } from 'react';
import { Image, Text, View, TouchableOpacity } from 'react-native';
import { CalendarClock, MapPin, MessageCircle, Heart, MessageSquareText, Music, Star } from 'lucide-react-native';
import { mediaInteractionService } from '../../services/mediaInteractionService';
import { getUser } from '../../storage/authStorage';
import type { UserDTO } from '../../services/authService';

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
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [faved, setFaved] = useState(false);
  const [likeId, setLikeId] = useState<number | null>(null);
  const [favId, setFavId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getUser<UserDTO>();
      if (u?.userId) setUserId(u.userId);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (userId) {
        try {
          await mediaInteractionService.viewMedia(userId, item.id);
        } catch {}
      }
    })();
  }, [userId, item.id]);

  const toggleLike = async () => {
    if (!userId) return;
    try {
      if (liked && likeId) {
        await mediaInteractionService.deleteInteraction(likeId);
        setLiked(false);
        setLikeId(null);
      } else {
        const res = await mediaInteractionService.likeMedia(userId, item.id);
        if (res?.interactionId != null) setLikeId(res.interactionId);
        setLiked(true);
      }
    } catch {}
  };

  const toggleFav = async () => {
    if (!userId) return;
    try {
      if (faved && favId) {
        await mediaInteractionService.deleteInteraction(favId);
        setFaved(false);
        setFavId(null);
      } else {
        const res = await mediaInteractionService.favoriteMedia(userId, item.id);
        if (res?.interactionId != null) setFavId(res.interactionId);
        setFaved(true);
      }
    } catch {}
  };

  return (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
      {item.imageUrl ? (
        <View>
          <Image source={{ uri: item.imageUrl }} style={{ height: 240, width: '100%' }} />
          {item.tag ? (
            <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#111827', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Music size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{item.tag}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>{item.title}</Text>
        {item.description ? (
          <Text style={{ marginTop: 6, color: '#6B7280' }}>{item.description}</Text>
        ) : null}

        {item.startAt ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
            <CalendarClock size={16} color="#111827" />
            <Text style={{ color: '#111827' }}>{item.startAt}</Text>
          </View>
        ) : null}

        {(item.venue || item.city) ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
            <MapPin size={16} color="#111827" />
            <Text style={{ color: '#111827' }}>
              {item.venue}
              {item.city ? `  •  ${item.city}${item.state ? `, ${item.state}` : ''}` : ''}
            </Text>
          </View>
        ) : null}

        {/* divider */}
        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 }} />

        {item.stats ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MessageSquareText size={16} color="#6B7280" />
              <Text style={{ color: '#6B7280' }}>{item.stats.posts ?? 0} posts</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MessageCircle size={16} color="#6B7280" />
              <Text style={{ color: '#6B7280' }}>{item.stats.comments ?? 0}</Text>
            </View>
            <TouchableOpacity onPress={toggleLike} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Heart size={16} color={liked ? '#ef4444' : '#6B7280'} />
              <Text style={{ color: '#6B7280' }}>{item.stats.likes ?? 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFav} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Star size={16} color={faved ? '#F59E0B' : '#6B7280'} />
              <Text style={{ color: '#6B7280' }}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Co-signed row */}
        {(item.cosigners && item.cosigners.length > 0) || item.cosignedCount ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '600', color: '#111827' }}>
              {item.cosigners?.slice(0, 3).join(' ')}
              {item.cosigners && item.cosigners.length > 3 ? ` +${item.cosigners.length - 3}` : ''}
            </Text>
            {item.cosignedCount ? (
              <Text style={{ color: '#6B7280', marginTop: 2 }}>Co-signed by {item.cosignedCount} people</Text>
            ) : null}
          </View>
        ) : null}

        {/* Tags */}
        {item.hashtags && item.hashtags.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {item.hashtags.map(tag => (
              <View key={tag} style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#FFFFFF' }}>
                <Text style={{ color: '#111827', fontSize: 12 }}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
};
