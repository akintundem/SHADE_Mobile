import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions, StyleSheet } from 'react-native';
import { MapPin, Clock, Users, Calendar, Radio } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { EventStatus } from '../../types';

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
  const { typography, spacing, borderRadius, isDark, colors, brand } = useTheme();
  const navigation = useNavigation<any>();
  const { width: screenWidth } = Dimensions.get('window');
  const cardWidth = width ?? screenWidth - spacing.lg * 2;
  const cardHeight = Math.max(340, cardWidth * 0.95);

  // Dynamic colors that work in both themes
  const cardBackground = isDark ? colors.card : colors.surface;
  const overlayColor = item.imageUrl ? 'rgba(0,0,0,0.4)' : 'transparent';
  
  // Text colors that adapt to theme and image presence
  const primaryText = item.imageUrl ? '#FFFFFF' : colors.text.primary;
  const mutedText = item.imageUrl ? 'rgba(255,255,255,0.9)' : colors.text.secondary;
  const subtleText = item.imageUrl ? 'rgba(255,255,255,0.75)' : colors.text.tertiary;
  
  // Adaptive avatar styling
  const avatarBorder = item.imageUrl ? 'rgba(255,255,255,0.3)' : colors.border;
  const avatarBackground = item.imageUrl ? 'rgba(255,255,255,0.15)' : colors.background;
  const avatarSize = 38;

  // Soft, theme-aware border
  const borderColor = isDark ? colors.borderElevated : colors.border;

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
    <View style={{ flex: 1, padding: spacing.lg }}>
      {/* Title */}
      <Text
        style={{
          color: primaryText,
          fontSize: typography.size['3xl'],
          fontWeight: typography.weight.bold,
          lineHeight: typography.size['3xl'] * 1.2,
          marginBottom: spacing.xs,
        }}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      {/* Description */}
      {item.description && (
        <Text
          style={{
            color: subtleText,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium,
            lineHeight: typography.size.sm * 1.5,
            marginBottom: spacing.md,
          }}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}

      {/* Info rows with pills */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm, marginBottom: spacing.md }}>
        {dayLabel && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: item.imageUrl ? 'rgba(255, 255, 255, 0.15)' : colors.surface,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: item.imageUrl ? 0 : 1,
            borderColor: colors.border,
          }}>
            <Calendar size={14} color={primaryText} strokeWidth={2.5} />
            <Text style={{
              color: primaryText,
              fontSize: 12,
              fontWeight: '600',
            }}>{dayLabel}</Text>
          </View>
        )}

        {locationLabel && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: item.imageUrl ? 'rgba(255, 255, 255, 0.15)' : colors.surface,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: item.imageUrl ? 0 : 1,
            borderColor: colors.border,
          }}>
            <MapPin size={14} color={primaryText} strokeWidth={2.5} />
            <Text style={{
              color: primaryText,
              fontSize: 12,
              fontWeight: '600',
            }} numberOfLines={1}>
              {locationLabel}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom section with participants */}
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              {participantInitials.length > 0 ? (
                participantInitials.map((initials, index) => (
                  <View
                    key={`${initials}-${index}`}
                    style={{
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: avatarSize / 2,
                      backgroundColor: avatarBackground,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: index === 0 ? 0 : -spacing.sm,
                      borderWidth: item.imageUrl ? 2 : 1,
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
                    backgroundColor: avatarBackground,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: item.imageUrl ? 2 : 1,
                    borderColor: avatarBorder,
                  }}
                >
                  <Users size={16} color={primaryText} strokeWidth={2} />
                </View>
              )}

              {extraParticipants > 0 && (
                <View
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                    backgroundColor: avatarBackground,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: -spacing.sm,
                    borderWidth: item.imageUrl ? 2 : 1,
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
              )}
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

          {/* Status badges - subtle */}
          {(item.isPast || (item.isPublic !== null && !item.isPublic)) && (
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              {item.isPast && (
                <View style={{
                  backgroundColor: item.imageUrl ? 'rgba(255, 255, 255, 0.12)' : colors.surface,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  borderWidth: item.imageUrl ? 0 : 1,
                  borderColor: colors.border,
                }}>
                  <Text style={{
                    color: item.imageUrl ? 'rgba(255, 255, 255, 0.75)' : colors.text.tertiary,
                    fontSize: 10,
                    fontWeight: '600',
                  }}>Past</Text>
                </View>
              )}
              {item.isPublic !== null && !item.isPublic && (
                <View style={{
                  backgroundColor: item.imageUrl ? 'rgba(255, 255, 255, 0.12)' : colors.surface,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  borderWidth: item.imageUrl ? 0 : 1,
                  borderColor: colors.border,
                }}>
                  <Text style={{
                    color: item.imageUrl ? 'rgba(255, 255, 255, 0.75)' : colors.text.tertiary,
                    fontSize: 10,
                    fontWeight: '600',
                  }}>Private</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.92}
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
        backgroundColor: cardBackground,
        borderWidth: 1,
        borderColor: borderColor,
        ...(isDark ? {} : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }),
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
            }}
          >
            {content}
          </View>
        </ImageBackground>
      ) : (
        <View style={{ flex: 1 }}>
          {content}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Note: Dynamic styles are now handled inline within the component
