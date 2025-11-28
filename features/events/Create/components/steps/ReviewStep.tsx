import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Sparkles, Upload, Calendar, MapPin, Users, DollarSign, Tag, Clock, Edit3 } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { EventType } from '../../../../../shared/types';
import { formatDisplayDateTime } from '../../utils/dateFormatting';

type Props = {
  title: string;
  description: string;
  selectedEventType: EventType | null;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venue: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  isPublic: boolean;
  free: boolean;
  price: string;
  capacity: string;
  onEditStep: (step: number) => void;
  onImageSelected?: (imageUri: string) => void;
};

export function ReviewStep({
  title,
  description,
  selectedEventType,
  startDate,
  startTime,
  endDate,
  endTime,
  venue,
  isPublic,
  free,
  price,
  capacity,
  onEditStep,
  onImageSelected,
}: Props) {
  const { colors, typography, spacing, borderRadius, brand, shadows, isDark } = useTheme();

  const handleUploadImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 2000,
      });

      if (result.didCancel || result.errorMessage) {
        return;
      }

      const uri = result.assets?.[0]?.uri;
      if (uri && onImageSelected) {
        onImageSelected(uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const staticMapUrl = useMemo(() => {
    if (venue?.latitude && venue?.longitude) {
      const zoom = 13;
      return `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=300&center=lonlat:${venue.longitude},${venue.latitude}&zoom=${zoom}&marker=lonlat:${venue.longitude},${venue.latitude};type:material;color:%23F59E0B;size:medium&apiKey=demo`;
    }
    return null;
  }, [venue?.latitude, venue?.longitude]);

  const getCategoryDisplay = () => {
    const categoryMap: Record<EventType, string> = {
      [EventType.CONFERENCE]: 'Conference',
      [EventType.WORKSHOP]: 'Workshop',
      [EventType.SEMINAR]: 'Seminar',
      [EventType.MEETING]: 'Meeting',
      [EventType.PARTY]: 'Party',
      [EventType.WEDDING]: 'Wedding',
      [EventType.BIRTHDAY]: 'Birthday',
      [EventType.CORPORATE_EVENT]: 'Corporate Event',
      [EventType.TRADE_SHOW]: 'Exhibition',
      [EventType.CONCERT]: 'Concert',
      [EventType.FESTIVAL]: 'Festival',
      [EventType.SPORTS_EVENT]: 'Sports Event',
      [EventType.CHARITY_EVENT]: 'Charity Event',
      [EventType.NETWORKING]: 'Networking',
      [EventType.TRAINING]: 'Training',
      [EventType.RETREAT]: 'Retreat',
      [EventType.OTHER]: 'Other',
    };
    return selectedEventType ? categoryMap[selectedEventType] || selectedEventType : 'Not set';
  };

  const formatLocation = () => {
    if (!venue?.address) return 'Location not set';
    const parts = [];
    if (venue.address) parts.push(venue.address);
    if (venue.city) parts.push(venue.city);
    if (venue.state) parts.push(venue.state);
    return parts.join(', ');
  };

  const formattedStart = useMemo(
    () => formatDisplayDateTime(startDate, startTime),
    [startDate, startTime],
  );

  const formattedEnd = useMemo(
    () => formatDisplayDateTime(endDate, endTime),
    [endDate, endTime],
  );

  // Pure black and white for cards
  const cardBackgroundColor = isDark ? '#000000' : '#FFFFFF';
  const posterBackgroundColor = isDark ? '#000000' : '#1F2937';

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 120,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: typography.weight.bold,
            fontSize: typography.size['2xl'],
            marginBottom: spacing.xs,
          }}
        >
          Event Poster
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
          }}
        >
          AI-generated based on your details
        </Text>
      </View>

      {/* Poster Preview Card */}
      <View
        style={{
          backgroundColor: cardBackgroundColor,
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          borderColor: isDark ? '#1F1F1F' : '#E5E7EB',
          overflow: 'hidden',
          marginBottom: spacing.lg,
          ...shadows.lg,
        }}
      >
        {/* Poster Image/Placeholder */}
        <View
          style={{
            height: 420,
            backgroundColor: posterBackgroundColor,
            position: 'relative',
            justifyContent: 'flex-end',
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing['2xl'],
          }}
        >
          {/* Top right badge - clean and simple */}
          <View
            style={{
              position: 'absolute',
              top: spacing.lg,
              right: spacing.lg,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: borderRadius.full,
            }}
          >
            <Text
              style={{
                color: '#1F2937',
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold,
              }}
            >
              Event
            </Text>
          </View>

          {/* Event Name - direct on image, no background */}
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 48,
              fontWeight: '700',
              textAlign: 'left',
              letterSpacing: -0.5,
              lineHeight: 52,
            }}
            numberOfLines={3}
          >
            {title || 'Event Name'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            padding: spacing.md,
            backgroundColor: cardBackgroundColor,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: isDark ? '#1F1F1F' : '#E5E7EB',
              backgroundColor: cardBackgroundColor,
            }}
          >
            <Sparkles size={18} color={colors.text.primary} />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
              }}
            >
              Regenerate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUploadImage}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: isDark ? '#1F1F1F' : '#E5E7EB',
              backgroundColor: cardBackgroundColor,
            }}
          >
            <Upload size={18} color={colors.text.primary} />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
              }}
            >
              Upload Own
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Event Summary Header */}
      <View style={{ marginBottom: spacing.lg, marginTop: spacing.md }}>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Event Summary
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={{ gap: spacing.md }}>
        {/* Basic Info Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onEditStep(0)}
          style={{
            backgroundColor: cardBackgroundColor,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: isDark ? '#1F1F1F' : '#E5E7EB',
            padding: spacing.lg,
            ...shadows.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: borderRadius.lg,
                  backgroundColor: brand.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Tag size={16} color={brand.primary} />
              </View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.bold,
                }}
              >
                Basic Info
              </Text>
            </View>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: borderRadius.full,
                backgroundColor: colors.border + '40',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Edit3 size={14} color={colors.text.secondary} />
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <View>
              <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, marginBottom: 2 }}>
                Event Name
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                {title || 'Not set'}
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, marginBottom: 2 }}>
                Description
              </Text>
              <Text
                style={{ color: colors.text.primary, fontSize: typography.size.sm, lineHeight: 18 }}
                numberOfLines={2}
              >
                {description || 'Not set'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Category Card */}
        {selectedEventType && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onEditStep(1)}
            style={{
              backgroundColor: cardBackgroundColor,
              borderRadius: borderRadius.xl,
              borderWidth: 1,
              borderColor: isDark ? '#1F1F1F' : '#E5E7EB',
              padding: spacing.lg,
              ...shadows.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: borderRadius.lg,
                    backgroundColor: brand.secondary + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Tag size={16} color={brand.secondary} />
                </View>
                <View>
                  <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>
                    Category
                  </Text>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.sm,
                      fontWeight: typography.weight.semibold,
                    }}
                  >
                    {getCategoryDisplay()}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.border + '40',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Edit3 size={14} color={colors.text.secondary} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Date & Time Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onEditStep(2)}
          style={{
            backgroundColor: cardBackgroundColor,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: isDark ? '#1F1F1F' : '#E5E7EB',
            padding: spacing.lg,
            ...shadows.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: borderRadius.lg,
                  backgroundColor: brand.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={16} color={brand.primary} />
              </View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.bold,
                }}
              >
                Date & Time
              </Text>
            </View>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: borderRadius.full,
                backgroundColor: colors.border + '40',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Edit3 size={14} color={colors.text.secondary} />
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Clock size={14} color={colors.text.tertiary} />
              <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>
                Start
              </Text>
            </View>
            <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
              {formattedStart || 'Not set'}
            </Text>

            {formattedEnd && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
                  <Clock size={14} color={colors.text.tertiary} />
                  <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>
                    End
                  </Text>
                </View>
                <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                  {formattedEnd}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Location Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onEditStep(3)}
          style={{
            backgroundColor: cardBackgroundColor,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: isDark ? '#1F1F1F' : '#E5E7EB',
            overflow: 'hidden',
            ...shadows.sm,
          }}
        >
          {staticMapUrl && (
            <View style={{ height: 160, overflow: 'hidden' }}>
              <Image
                source={{ uri: staticMapUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
          )}

          <View style={{ padding: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: borderRadius.lg,
                    backgroundColor: brand.secondary + '15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin size={16} color={brand.secondary} />
                </View>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.bold,
                  }}
                >
                  Location
                </Text>
              </View>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.border + '40',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Edit3 size={14} color={colors.text.secondary} />
              </View>
            </View>

            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.sm,
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {formatLocation()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Access & Pricing Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onEditStep(4)}
          style={{
            backgroundColor: cardBackgroundColor,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: isDark ? '#1F1F1F' : '#E5E7EB',
            padding: spacing.lg,
            ...shadows.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: borderRadius.lg,
                  backgroundColor: brand.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={16} color={brand.primary} />
              </View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.bold,
                }}
              >
                Access & Pricing
              </Text>
            </View>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: borderRadius.full,
                backgroundColor: colors.border + '40',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Edit3 size={14} color={colors.text.secondary} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, marginBottom: 2 }}>
                Visibility
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                {isPublic ? 'Public' : 'Private'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, marginBottom: 2 }}>
                Price
              </Text>
              <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                {free ? 'Free' : `$${price}`}
              </Text>
            </View>
            {capacity && (
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, marginBottom: 2 }}>
                  Capacity
                </Text>
                <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                  {capacity}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
