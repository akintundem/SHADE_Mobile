import React from 'react';
import { Text, TouchableOpacity, View, ImageBackground } from 'react-native';
import { Calendar, MapPin, Rss, Ticket } from 'lucide-react-native';
import { EventResponse } from '../../../../core/events/types/event';
import { dateUtils } from '../../../../common/utils/helpers';
import { getImageUrl } from '../../../../config/appConfig';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { STATUS_CONFIG, STATUS_DOT, resolveAttendance } from './statusConfig';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop';

type Props = {
  event: EventResponse;
  onPress: () => void;
  onTicketsPress: () => void;
  onFeedPress: () => void;
};

export function AttendingCard({ event, onPress, onTicketsPress, onFeedPress }: Props) {
  const { colors } = useTheme();
  const uc = event.userContext;
  const attendance = uc ? resolveAttendance(uc, colors.semantic) : null;
  const dotColor = STATUS_DOT[event.eventStatus] ?? '#6b7280';
  const statusCfg = STATUS_CONFIG[event.eventStatus] ?? STATUS_CONFIG.DRAFT;
  const isLive = event.eventStatus === 'IN_PROGRESS';

  const dateLabel = event.startDateTime
    ? dateUtils.formatDate(event.startDateTime, 'EEE, MMM d · h:mm a')
    : null;
  const venueLabel = event.venue?.city ?? event.venue?.address ?? null;
  const imageUri = getImageUrl(event.coverImageUrl) || FALLBACK_IMAGE;

  const showTicketsAction = uc?.hasValidTicket || uc?.ticketStatus === 'ISSUED' || uc?.ticketStatus === 'VALIDATED';
  const showFeedAction = uc?.canViewFeeds;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mb-xl overflow-hidden"
      style={{ borderRadius: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 14 }}
    >
      <ImageBackground source={{ uri: imageUri }} resizeMode="cover" style={{ height: 280 }}>
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.10)' }} />
        <View className="absolute bottom-0 left-0 right-0" style={{ height: 200 }}>
          <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.22)' }} />
          <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.32)', top: '30%' }} />
          <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.28)', top: '60%' }} />
        </View>

        {/* Top row */}
        <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-lg pt-lg">
          {attendance && (
            <View
              className="flex-row items-center gap-xs px-md py-[6px]"
              style={{ borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: attendance.color, shadowColor: attendance.color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 5 }} />
              <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.6, color: '#fff' }}>
                {attendance.label}
              </Text>
            </View>
          )}
          <View
            className="flex-row items-center gap-xs px-md py-[6px]"
            style={{ borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginLeft: 'auto' }}
          >
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dotColor, shadowColor: dotColor, shadowOffset: { width: 0, height: 0 }, shadowOpacity: isLive ? 1 : 0, shadowRadius: 6 }} />
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: isLive ? '#fff' : dotColor }}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        {/* Bottom */}
        <View className="absolute bottom-0 left-0 right-0 px-lg pb-lg">
          <Text
            numberOfLines={2}
            style={{ fontSize: 24, fontWeight: '800', letterSpacing: -0.6, color: '#fff', lineHeight: 28, marginBottom: 10, textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}
          >
            {event.name}
          </Text>

          <View className="flex-row flex-wrap gap-sm mb-md">
            {dateLabel && (
              <View className="flex-row items-center gap-xs px-sm py-[5px]" style={{ borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.25)' }}>
                <Calendar size={12} color="rgba(255,255,255,0.85)" strokeWidth={2} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{dateLabel}</Text>
              </View>
            )}
            {venueLabel && (
              <View className="flex-row items-center gap-xs px-sm py-[5px]" style={{ borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.25)' }}>
                <MapPin size={12} color="rgba(255,255,255,0.85)" strokeWidth={2} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }} numberOfLines={1}>{venueLabel}</Text>
              </View>
            )}
          </View>

          {(showTicketsAction || showFeedAction) && (
            <View className="flex-row gap-sm">
              {showTicketsAction && (
                <TouchableOpacity
                  onPress={onTicketsPress}
                  activeOpacity={0.75}
                  className="flex-1 flex-row items-center justify-center gap-xs py-md"
                  style={{ borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.95)' }}
                >
                  <Ticket size={14} color="#000" strokeWidth={2.5} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#000', letterSpacing: -0.2 }}>My Tickets</Text>
                </TouchableOpacity>
              )}
              {showFeedAction && (
                <TouchableOpacity
                  onPress={onFeedPress}
                  activeOpacity={0.75}
                  className="flex-1 flex-row items-center justify-center gap-xs py-md"
                  style={{ borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  <Rss size={14} color="#fff" strokeWidth={2.5} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: -0.2 }}>Event Feed</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}
