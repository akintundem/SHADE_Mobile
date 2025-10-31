import React, { useRef, useEffect } from 'react';
import { Image, Text, View, TouchableOpacity, Animated } from 'react-native';
import { CalendarClock, MapPin, MessageCircle, Heart, MessageSquareText, Sparkles, Globe } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { useNavigation } from '@react-navigation/native';
import { EventStatus } from '../../types';
import { dateUtils, stringUtils } from '../../utils/helpers';
import { DATE_FORMATS } from '../../utils/constants';

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

type Props = { item: EventItem };

export const EventCard = ({ item }: Props) => {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<any>();
  const statusLabel = item.status ? stringUtils.capitalize(item.status.replace(/_/g, ' ').toLowerCase()) : item.tag;
  const isLive =
    item.isLive ??
    (item.status ? [EventStatus.IN_PROGRESS, EventStatus.REGISTRATION_OPEN, EventStatus.PUBLISHED].includes(item.status) : false);
  const startLabel = item.startAt
    ? dateUtils.formatDate(item.startAt, DATE_FORMATS.DISPLAY_DATETIME)
    : undefined;

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isLive) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isLive, pulse]);

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
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.md,
      }}
    >
      {item.imageUrl ? (
        <View>
          <Image 
            source={{ uri: item.imageUrl }} 
            style={{ height: 200, width: '100%' }}
            resizeMode="cover"
          />
          {/* Live indicator top-left */}
          {isLive ? (
            <View style={{ position: 'absolute', top: spacing.md, left: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Animated.View style={{ opacity: pulse }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' }} />
              </Animated.View>
              <Text style={{ color: '#FFFFFF', fontSize: typography.size.xs, fontWeight: typography.weight.semibold }}>LIVE</Text>
            </View>
          ) : null}

          {statusLabel ? (
            <View style={{ position: 'absolute', top: spacing.md, right: spacing.md, backgroundColor: brand.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.md, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, ...shadows.lg }}>
              <Sparkles size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: typography.size.xs, fontWeight: typography.weight.semibold }}>
                {statusLabel}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={{ padding: spacing['2xl'], gap: spacing.md }}>
        <Text style={{ fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary }}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, lineHeight: 20 }}>
            {item.description}
          </Text>
        ) : null}
        {startLabel ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <CalendarClock size={18} color={brand.primary} strokeWidth={2} />
            <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
              {startLabel}
            </Text>
          </View>
        ) : null}
        {(item.venue || item.city || item.isPublic !== undefined) ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {item.venue || item.city ? <MapPin size={18} color={brand.primary} strokeWidth={2} /> : <Globe size={18} color={brand.primary} strokeWidth={2} />}
            <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, flex: 1 }}>
              {item.venue}
              {item.city ? `  •  ${item.city}${item.state ? `, ${item.state}` : ''}` : ''}
              {!item.venue && !item.city && item.isPublic !== undefined ? (item.isPublic ? 'Public event' : 'Private event') : ''}
            </Text>
          </View>
        ) : null}
        <View style={{ height: 1, backgroundColor: colors.divider }} />
        {item.stats ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <MessageSquareText size={18} color={colors.text.tertiary} strokeWidth={2} />
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                {item.stats.posts ?? 0}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <MessageCircle size={18} color={colors.text.tertiary} strokeWidth={2} />
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                {item.stats.comments ?? 0}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Heart size={18} color={colors.text.tertiary} strokeWidth={2} />
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                {item.stats.likes ?? 0}
              </Text>
            </View>
          </View>
        ) : null}
        {(item.cosigners && item.cosigners.length > 0) || item.cosignedCount ? (
          <View style={{ marginTop: spacing.md }}>
            <Text style={{ fontWeight: typography.weight.semibold, color: colors.text.primary, fontSize: typography.size.sm }}>
              {item.cosigners?.slice(0, 3).join(' ')}
              {item.cosigners && item.cosigners.length > 3 ? ` +${item.cosigners.length - 3}` : ''}
            </Text>
            {item.cosignedCount ? (
              <Text style={{ color: colors.text.tertiary, marginTop: spacing.xs, fontSize: typography.size.xs }}>
                {t('AttendedBy', { count: String(item.cosignedCount) })}
              </Text>
            ) : null}
          </View>
        ) : null}
        {item.hashtags && item.hashtags.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
            {item.hashtags.map(tag => (
              <View key={tag} style={{ backgroundColor: `${brand.primary}15`, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
                <Text style={{ color: brand.primary, fontSize: typography.size.xs, fontWeight: typography.weight.medium }}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};
