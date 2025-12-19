import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { EventStatus } from '../../../../core/events/types';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop';

export type EventItem = {
  id: string;
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  venue?: string;
  city?: string;
  state?: string;
  imageUrl?: string;
  stats?: { posts?: number; comments?: number; likes?: number };
  tag?: string;
  hashtags?: string[];
  cosigners?: string[];
  cosignedCount?: number;
  status?: EventStatus;
  isPublic?: boolean | null;
  isLive?: boolean;
  isPast?: boolean;
};

type Props = {
  item: EventItem;
  width?: number;
};

export const EventCard = ({ item, width }: Props) => {
  const { typography, spacing, borderRadius, colors } = useTheme();
  const navigation = useNavigation<any>();
  const { width: screenWidth } = Dimensions.get('window');
  const cardWidth = width ?? screenWidth - spacing.xl * 2;
  const cardHeight = cardWidth * 1.1; // Taller card for the overlay design

  const locationLabel = useMemo(() => {
    if (item.city || item.state) {
      const parts = [item.city, item.state].filter(Boolean);
      return parts.join(', ');
    }
    return item.venue ?? 'Remote';
  }, [item.city, item.state, item.venue]);

  const timeLabel = useMemo(() => {
    if (!item.startAt) return 'Date TBD';
    const now = new Date();
    const startDate = new Date(item.startAt);
    const diffTime = startDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Starts today';
    if (diffDays === 1) return 'Starts in 1 day';
    if (diffDays > 0 && diffDays < 7) return `Starts in ${diffDays} days`;
    
    return dateUtils.formatDate(item.startAt, DATE_FORMATS.DISPLAY_DATE_SHORT);
  }, [item.startAt]);

  const participantCount = item.cosignedCount ?? item.cosigners?.length ?? 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('EventProfile', {
          eventId: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          description: item.description,
          status: item.status,
        })
      }
      style={{
        width: cardWidth,
        height: cardHeight,
        borderRadius: 32, // More rounded as per image
        overflow: 'hidden',
        marginBottom: spacing.xl,
      }}
    >
      <ImageBackground
        source={{ uri: item.imageUrl ?? FALLBACK_IMAGE }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        {/* Dark overlay to ensure text readability */}
        <View style={{ 
          ...View.style, 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.4)' 
        }} />

        <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'space-between' }}>
          {/* Top Section */}
          <View style={{ gap: spacing.md }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 32,
                fontWeight: typography.weight.bold,
                letterSpacing: -0.5,
                lineHeight: 38,
              }}
              numberOfLines={3}
            >
              {item.title}
            </Text>

            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <MapPin size={20} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: typography.weight.medium }}>
                  {locationLabel}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Clock size={20} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: typography.weight.medium }}>
                  {timeLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Section */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 22, 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)'
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: typography.weight.bold }}>YOU</Text>
            </View>
            <Text style={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: 16, 
              fontWeight: typography.weight.medium 
            }}>
              {participantCount > 0 ? `${participantCount} people attending` : 'Be the first to join'}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};
