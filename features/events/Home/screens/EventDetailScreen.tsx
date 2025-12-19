import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Edit,
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Settings,
} from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { Event, EventResponse, EventStatus, EventData, isFullEventResponse, isFeedResponse, EventFeedResponse } from '../../../../core/events/types';
import { eventService } from '../../../../core/events/services';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { LoadingOverlay } from '../../../../common/components/LoadingStates';
import { EventFeedsScreen } from './EventFeedsScreen';

type EventDetailScreenParams = {
  eventId: string;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop';

export default function EventDetailScreen() {
  const { colors, spacing, typography, brand, borderRadius, shadows } =
    useTheme();
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<{ params: EventDetailScreenParams }, 'params'>>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<Event | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEventDetails = useCallback(async () => {
    try {
      setError(null);
      const data = await eventService.getEvent(eventId);
      setEventData(data);
      
      // Extract Event from EventData (which can be EventResponseWithScope or EventFeedResponse)
      if (isFullEventResponse(data)) {
        // EventResponseWithScope extends EventResponse, so it IS the Event
        setEvent(data);
      } else {
        // For EventFeedResponse, we need to convert it to Event format
        setEvent({
          id: data.eventId,
          name: data.eventName,
          description: data.description || null,
          eventType: 'OTHER' as any,
          eventStatus: 'DRAFT' as any,
          startDateTime: data.startDateTime || null,
          endDateTime: null,
          registrationDeadline: null,
          capacity: null,
          currentAttendeeCount: null,
          isPublic: null,
          requiresApproval: null,
          coverImageUrl: null,
          eventWebsiteUrl: null,
          hashtag: null,
          theme: null,
          objectives: null,
          targetAudience: null,
          successMetrics: null,
          brandingGuidelines: null,
          venueRequirements: null,
          technicalRequirements: null,
          accessibilityFeatures: null,
          emergencyPlan: null,
          backupPlan: null,
          postEventTasks: null,
          metadata: null,
          ownerId: '',
          venueId: null,
          createdAt: '',
          updatedAt: '',
        });
      }
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        'Unable to load event details.';
      setError(message);
      ErrorHandler.handle(err, 'loadEventDetails');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEventDetails();
  }, [loadEventDetails]);

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Check out ${event.name}!\n\n${
          event.description || ''
        }\n\nStarting ${
          event.startDateTime
            ? dateUtils.formatDate(
                event.startDateTime,
                DATE_FORMATS.DISPLAY_DATETIME,
              )
            : 'TBD'
        }`,
        title: event.name,
      });
    } catch (err) {
      ErrorHandler.handle(err, 'shareEvent');
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditEvent', { eventId: event?.id });
  };

  const handlePublish = async () => {
    if (!event) return;
    try {
      await eventService.publishEvent(event.id);
      Alert.alert('Success', 'Event published successfully!');
      loadEventDetails();
    } catch (err) {
      ErrorHandler.handle(err, 'publishEvent');
      Alert.alert('Error', 'Failed to publish event. Please try again.');
    }
  };

  const handleCancel = async () => {
    if (!event) return;
    Alert.alert('Cancel Event', 'Are you sure you want to cancel this event?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await eventService.cancelEvent(event.id);
            Alert.alert('Success', 'Event cancelled successfully.');
            loadEventDetails();
          } catch (err) {
            ErrorHandler.handle(err, 'cancelEvent');
            Alert.alert('Error', 'Failed to cancel event. Please try again.');
          }
        },
      },
    ]);
  };

  const handleComplete = async () => {
    if (!event) return;
    Alert.alert('Complete Event', 'Mark this event as completed?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Complete',
        onPress: async () => {
          try {
            await eventService.completeEvent(event.id);
            Alert.alert('Success', 'Event marked as complete!');
            loadEventDetails();
          } catch (err) {
            ErrorHandler.handle(err, 'completeEvent');
            Alert.alert('Error', 'Failed to complete event. Please try again.');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PUBLISHED:
        return '#10B981';
      case EventStatus.COMPLETED:
        return '#6B7280';
      case EventStatus.CANCELLED:
        return '#EF4444';
      case EventStatus.DRAFT:
      case EventStatus.PLANNING:
        return '#F59E0B';
      default:
        return colors.text.tertiary;
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  if (loading) {
    return <LoadingOverlay visible={true} message="Loading event details..." />;
  }

  if (!loading && eventData && isFeedResponse(eventData)) {
    return (
      <EventFeedsScreen
        eventId={eventId}
        eventName={eventData.eventName}
        onBack={() => navigation.goBack()}
      />
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <View style={{ padding: spacing.xl }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginBottom: spacing.lg }}
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold,
            }}
          >
            Event Not Found
          </Text>
          <Text style={{ color: colors.text.secondary, marginTop: spacing.md }}>
            {error || 'This event could not be loaded.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.surface }}
      edges={['top', 'bottom']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: event.coverImageUrl || FALLBACK_IMAGE }}
            style={{ width: '100%', height: 300 }}
            resizeMode="cover"
          />
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            backgroundColor: 'rgba(0,0,0,0.3)',
          }} />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: spacing.lg,
              left: spacing.lg,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 18,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} color={colors.text.primary} />
          </TouchableOpacity>

          <View
            style={{
              position: 'absolute',
              top: spacing.lg,
              right: spacing.lg,
              backgroundColor: getStatusColor(event.eventStatus),
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: borderRadius.full,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: typography.size.xs,
                fontFamily: typography.family.bold,
                fontWeight: typography.weight.bold,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {getStatusLabel(event.eventStatus)}
            </Text>
          </View>
        </View>

        <View style={{ padding: spacing.lg, gap: spacing.xl }}>
          <View>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size['3xl'],
                fontFamily: typography.family.bold,
                fontWeight: typography.weight.bold,
                letterSpacing: -0.5,
              }}
            >
              {event.name}
            </Text>
            {event.hashtag && (
              <Text
                style={{
                  color: colors.text.tertiary,
                  fontSize: typography.size.base,
                  marginTop: 2,
                  fontFamily: typography.family.medium,
                }}
              >
                #{event.hashtag}
              </Text>
            )}
          </View>

          <View style={{ gap: spacing.md }}>
            <TouchableOpacity
              onPress={handleEdit}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                backgroundColor: colors.text.primary,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.lg,
              }}
            >
              <Edit size={20} color={colors.background} />
              <Text
                style={{
                  color: colors.background,
                  fontFamily: typography.family.semibold,
                  fontWeight: typography.weight.semibold,
                  fontSize: typography.size.base,
                }}
              >
                Edit Event
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.md,
                  backgroundColor: colors.cardElevated,
                  borderRadius: borderRadius.lg,
                }}
              >
                <Share2 size={18} color={colors.text.primary} />
                <Text style={{ color: colors.text.primary, fontFamily: typography.family.medium, fontWeight: typography.weight.medium, fontSize: typography.size.sm }}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => event?.id && navigation.navigate('EventAdmin', { eventId: event.id })}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.cardElevated,
                }}
              >
                <Settings size={18} color={colors.text.primary} />
                <Text style={{ color: colors.text.primary, fontFamily: typography.family.medium, fontWeight: typography.weight.medium, fontSize: typography.size.sm }}>Manage</Text>
              </TouchableOpacity>
            </View>
          </View>

          {event.description && (
            <View>
              <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, marginBottom: spacing.xs }}>About</Text>
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.base, lineHeight: 22, fontFamily: typography.family.regular }}>{event.description}</Text>
            </View>
          )}

          <View style={{ backgroundColor: colors.cardElevated, borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.lg }}>
            <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontFamily: typography.family.bold, fontWeight: typography.weight.bold }}>Event Details</Text>
            {event.startDateTime && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} color={colors.text.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, fontFamily: typography.family.medium, textTransform: 'uppercase', letterSpacing: 0.5 }}>Date & Time</Text>
                  <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontFamily: typography.family.medium, fontWeight: typography.weight.medium, marginTop: 1 }}>
                    {dateUtils.formatDate(event.startDateTime, DATE_FORMATS.DISPLAY_DATETIME)}
                  </Text>
                </View>
              </View>
            )}
            {event.eventWebsiteUrl && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} color={colors.text.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, fontFamily: typography.family.medium, textTransform: 'uppercase', letterSpacing: 0.5 }}>Location</Text>
                  <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontFamily: typography.family.medium, fontWeight: typography.weight.medium, marginTop: 1 }}>{event.eventWebsiteUrl}</Text>
                </View>
              </View>
            )}
            {event.capacity && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} color={colors.text.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, fontFamily: typography.family.medium, textTransform: 'uppercase', letterSpacing: 0.5 }}>Capacity</Text>
                  <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontFamily: typography.family.medium, fontWeight: typography.weight.medium, marginTop: 1 }}>{event.currentAttendeeCount || 0} / {event.capacity} attendees</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
