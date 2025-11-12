import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { EventStatus } from '../../../../shared/types';

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

type Props = { item: EventItem; width?: number };

export const EventCard = ({ item, width }: Props) => {
  const { typography, spacing, borderRadius, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { width: screenWidth } = Dimensions.get('window');
  const cardWidth = width ?? screenWidth - spacing.lg * 2;
  const cardHeight = Math.max(320, cardWidth * 1.05);

  const overlayColor = item.imageUrl ? 'rgba(0,0,0,0.65)' : '#000000';
  const primaryText = '#FFFFFF';
  const mutedText = 'rgba(255,255,255,0.72)';
  const subtleText = 'rgba(255,255,255,0.55)';
  const avatarBorder = 'rgba(255,255,255,0.35)';
  const avatarSize = 36;

  const locationLabel = useMemo(() => {
    if (item.city || item.state) {
      const parts = [item.city, item.state].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }
    return item.venue ?? undefined;
  }, [item.city, item.state, item.venue]);

  const dayLabel = useMemo(() => {
    if (!item.startAt) return undefined;
    const startDate = new Date(item.startAt);
    if (Number.isNaN(startDate.getTime())) return undefined;
    const now = new Date();
    const diffInMs = now.getTime() - startDate.getTime();
    const dayMs = 1000 * 60 * 60 * 24;
    if (diffInMs >= 0) {
      const elapsedDays = Math.floor(diffInMs / dayMs);
      return `Day ${elapsedDays + 1}`;
    }
    const daysUntil = Math.ceil(Math.abs(diffInMs) / dayMs);
    return daysUntil === 0 ? 'Starts today' : `Starts in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
  }, [item.startAt]);

  const participantInitials = useMemo(() => {
    if (!item.cosigners || item.cosigners.length === 0) return [];
    return item.cosigners
      .slice(0, 3)
      .map(name => {
        const trimmed = name.trim();
        if (!trimmed) return '';
        const parts = trimmed.split(/\s+/);
        const initials = parts
          .slice(0, 2)
          .map(part => part[0]?.toUpperCase() ?? '')
          .join('');
        return initials || trimmed.slice(0, 2).toUpperCase();
      })
      .filter(Boolean);
  }, [item.cosigners]);

  const participantCount = item.cosignedCount ?? item.cosigners?.length ?? 0;
  const extraParticipants = Math.max(participantCount - participantInitials.length, 0);
  const participantSummary = participantCount > 0 ? `${participantCount} traveling together` : 'Be the first to join';

  const content = (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <View style={{ gap: spacing.lg }}>
        <Text
          style={{
            color: primaryText,
            fontSize: typography.size['3xl'],
            fontWeight: typography.weight.bold,
            lineHeight: typography.size['3xl'] * 1.1,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {locationLabel ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <MapPin size={18} color={primaryText} strokeWidth={2} />
            <Text
              style={{
                color: mutedText,
                fontSize: typography.size.base,
                fontWeight: typography.weight.medium,
              }}
            >
              {locationLabel}
            </Text>
          </View>
        ) : null}

        {dayLabel ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Clock size={18} color={primaryText} strokeWidth={2} />
            <Text
              style={{
                color: mutedText,
                fontSize: typography.size.base,
                fontWeight: typography.weight.medium,
              }}
            >
              {dayLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ marginTop: spacing['3xl'] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', marginRight: spacing.md }}>
            {participantInitials.length > 0 ? (
              participantInitials.map((initials, index) => (
                <View
                  key={`${initials}-${index}`}
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: index === 0 ? 0 : -spacing.sm,
                    borderWidth: 2,
                    borderColor: avatarBorder,
                  }}
                >
                  <Text
                    style={{
                      color: primaryText,
                      fontWeight: typography.weight.semibold,
                      fontSize: typography.size.sm,
                    }}
                  >
                    {initials}
                  </Text>
                </View>
              ))
            ) : (
              <View
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: avatarBorder,
                }}
              >
                <Text
                  style={{
                    color: primaryText,
                    fontWeight: typography.weight.semibold,
                    fontSize: typography.size.sm,
                  }}
                >
                  YOU
                </Text>
              </View>
            )}

            {extraParticipants > 0 ? (
              <View
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: participantInitials.length > 0 ? -spacing.sm : 0,
                  borderWidth: 2,
                  borderColor: avatarBorder,
                }}
              >
                <Text
                  style={{
                    color: primaryText,
                    fontWeight: typography.weight.semibold,
                    fontSize: typography.size.sm,
                  }}
                >
                  +{extraParticipants}
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            style={{
              color: subtleText,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
            }}
            numberOfLines={1}
          >
            {participantSummary}
          </Text>
        </View>
      </View>
    </View>
  );

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
        borderRadius: borderRadius['3xl'],
        overflow: 'hidden',
        backgroundColor: '#000000',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: isDark ? 0.45 : 0.2,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      {item.imageUrl ? (
        <ImageBackground
          source={{ uri: item.imageUrl }}
          resizeMode="cover"
          style={{ flex: 1 }}
          imageStyle={{ borderRadius: borderRadius['3xl'] }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: overlayColor,
              padding: spacing['2xl'],
            }}
          >
            {content}
          </View>
        </ImageBackground>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: overlayColor,
            padding: spacing['2xl'],
          }}
        >
          {content}
        </View>
      )}
    </TouchableOpacity>
  );
};
