import React from 'react';
import { Text, TouchableOpacity, View, ImageBackground } from 'react-native';
import { Calendar, ChevronRight, MapPin, Users } from 'lucide-react-native';
import { EventResponse } from '../../../../core/events/types/event';
import { dateUtils } from '../../../../common/utils/helpers';
import { getImageUrl } from '../../../../config/appConfig';
import { STATUS_CONFIG, STATUS_DOT } from './statusConfig';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop';

type Props = {
  event: EventResponse;
  onPress: () => void;
};

export function HostingCard({ event, onPress }: Props) {
  const statusCfg = STATUS_CONFIG[event.eventStatus] ?? STATUS_CONFIG.DRAFT;
  const dotColor = STATUS_DOT[event.eventStatus] ?? '#6b7280';
  const isLive = event.eventStatus === 'IN_PROGRESS';

  const dateLabel = event.startDateTime
    ? dateUtils.formatDate(event.startDateTime, 'EEE, MMM d · h:mm a')
    : null;
  const venueLabel = event.venue?.city ?? event.venue?.address ?? null;
  const attendeeCount = event.currentAttendeeCount ?? 0;
  const capacity = event.capacity;
  const imageUri = getImageUrl(event.coverImageUrl) || FALLBACK_IMAGE;
  const fillRatio = capacity && capacity > 0 ? Math.min(attendeeCount / capacity, 1) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mb-xl overflow-hidden"
      style={{
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 14,
      }}
    >
      <ImageBackground source={{ uri: imageUri }} resizeMode="cover" style={{ height: 300 }}>
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} />
        <View className="absolute bottom-0 left-0 right-0" style={{ height: 220 }}>
          <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }} />
          <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.30)', top: '30%' }} />
          <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.30)', top: '60%' }} />
        </View>

        {/* Top row */}
        <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-lg pt-lg">
          <View style={{ width: 3, height: 32, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.9)' }} />
          <View
            className="flex-row items-center gap-xs px-md py-[6px]"
            style={{ borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
          >
            <View
              style={{
                width: 7, height: 7, borderRadius: 4,
                backgroundColor: dotColor,
                shadowColor: dotColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isLive ? 1 : 0,
                shadowRadius: 6,
              }}
            />
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: isLive ? '#fff' : dotColor }}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        {/* Bottom content */}
        <View className="absolute bottom-0 left-0 right-0 px-lg pb-lg">
          <Text
            numberOfLines={2}
            style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.8, color: '#fff', lineHeight: 30, marginBottom: 14, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}
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

          {/* Capacity bar */}
          <View
            className="flex-row items-center gap-md p-md"
            style={{ borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <Users size={14} color="rgba(255,255,255,0.7)" strokeWidth={2} />
            <View className="flex-1">
              {fillRatio !== null ? (
                <>
                  <View style={{ height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 4 }}>
                    <View
                      style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2,
                        width: `${Math.round(fillRatio * 100)}%`,
                        backgroundColor: fillRatio >= 0.9 ? '#ef4444' : fillRatio >= 0.6 ? '#f59e0b' : '#22c55e',
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.65)' }}>
                    {attendeeCount} / {capacity} attending
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.65)' }}>
                  {attendeeCount} attending
                </Text>
              )}
            </View>
            <ChevronRight size={16} color="rgba(255,255,255,0.5)" strokeWidth={2.5} />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}
