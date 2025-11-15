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
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Settings,
} from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { Event, EventResponse, EventStatus, EventData, isFullEventResponse } from '../../../../shared/types';
import { eventService } from '../../../../shared/services/eventService';
import { ErrorHandler } from '../../../../shared/utils/errorHandler';
import { dateUtils } from '../../../../shared/utils/helpers';
import { DATE_FORMATS } from '../../../../shared/utils/constants';
import { LoadingOverlay } from '../../../../shared/components/LoadingStates';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEventDetails = useCallback(async () => {
    try {
      setError(null);
      const eventData = await eventService.getEvent(eventId);
      // Extract Event from EventData (which can be EventResponseWithScope or EventFeedResponse)
      if (isFullEventResponse(eventData)) {
        // EventResponseWithScope extends EventResponse, so it IS the Event
        setEvent(eventData);
      } else {
        // For EventFeedResponse, we need to convert it to Event format
        // Since EventFeedResponse doesn't have all Event fields, we'll create a minimal Event
        setEvent({
          id: eventData.eventId,
          name: eventData.eventName,
          description: eventData.description || null,
          eventType: 'OTHER' as any, // EventFeedResponse doesn't include eventType
          eventStatus: 'DRAFT' as any, // EventFeedResponse doesn't include eventStatus
          startDateTime: eventData.startDateTime || null,
          endDateTime: null,
          registrationDeadline: null,
          capacity: null,
          currentAttendeeCount: null,
          isPublic: null,
          requiresApproval: null,
          qrCodeEnabled: null,
          qrCode: null,
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

  const handleViewAnalytics = () => {
    Alert.alert('Analytics', 'Analytics dashboard coming soon!');
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
            await eventService.cancelEvent(
              event.id,
              'Event cancelled by organizer',
            );
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

  if (error || !event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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

  const availableSpots =
    event.capacity && event.currentAttendeeCount
      ? event.capacity - event.currentAttendeeCount
      : null;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: event.coverImageUrl || FALLBACK_IMAGE }}
            style={{ width: '100%', height: 280 }}
            resizeMode="cover"
          />
          {/* Gradient overlay for better readability */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: spacing.lg,
              left: spacing.lg,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 22,
              padding: spacing.sm,
            }}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Status Badge */}
          <View
            style={{
              position: 'absolute',
              top: spacing.lg,
              right: spacing.lg,
              backgroundColor: getStatusColor(event.eventStatus),
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.full,
              ...shadows.md,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {getStatusLabel(event.eventStatus)}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: spacing.xl, gap: spacing.xl }}>
          {/* Title */}
          <View>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size['2xl'],
                fontWeight: typography.weight.bold,
              }}
            >
              {event.name}
            </Text>
            {event.hashtag && (
              <Text
                style={{
                  color: brand.primary,
                  fontSize: typography.size.base,
                  marginTop: spacing.xs,
                }}
              >
                #{event.hashtag}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{ gap: spacing.md }}>
            <TouchableOpacity
              onPress={handleEdit}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                backgroundColor: brand.primary,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.xl,
                ...shadows.sm,
              }}
            >
              <Edit size={20} color="#FFFFFF" />
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: typography.weight.semibold,
                  fontSize: typography.size.base,
                }}
              >
                Edit Event
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity
                onPress={handleShare}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.md,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                }}
              >
                <Share2 size={18} color={colors.text.primary} />
                <Text style={{ 
                  color: colors.text.primary, 
                  fontWeight: typography.weight.medium,
                  fontSize: typography.size.sm,
                }}>
                  Share
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleViewAnalytics}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.md,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                }}
              >
                <BarChart3 size={18} color={colors.text.primary} />
                <Text style={{ 
                  color: colors.text.primary, 
                  fontWeight: typography.weight.medium,
                  fontSize: typography.size.sm,
                }}>
                  Stats
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => event?.id && navigation.navigate('EventAdmin', { eventId: event.id })}
              style={{
                marginTop: spacing.sm,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.lg,
                borderWidth: 1.5,
                borderColor: colors.text.primary,
                backgroundColor: colors.background,
              }}
            >
              <Settings size={18} color={colors.text.primary} />
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: typography.weight.semibold,
                  fontSize: typography.size.sm,
                  textTransform: 'uppercase',
                }}
              >
                Manage Event
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {event.description && (
            <View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.semibold,
                  marginBottom: spacing.sm,
                }}
              >
                About
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.base,
                  lineHeight: 22,
                }}
              >
                {event.description}
              </Text>
            </View>
          )}

          {/* Event Details */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
              gap: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.sm,
            }}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.semibold,
              }}
            >
              Event Details
            </Text>

            {/* Date & Time */}
            {event.startDateTime && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                }}
              >
                <Calendar size={20} color={brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.xs,
                    }}
                  >
                    Date & Time
                  </Text>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.base,
                      marginTop: 2,
                    }}
                  >
                    {dateUtils.formatDate(
                      event.startDateTime,
                      DATE_FORMATS.DISPLAY_DATETIME,
                    )}
                  </Text>
                  {event.endDateTime && (
                    <Text
                      style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.sm,
                        marginTop: 2,
                      }}
                    >
                      Until{' '}
                      {dateUtils.formatDate(
                        event.endDateTime,
                        DATE_FORMATS.DISPLAY_DATETIME,
                      )}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Location */}
            {event.eventWebsiteUrl && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                }}
              >
                <MapPin size={20} color={brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.xs,
                    }}
                  >
                    Location
                  </Text>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.base,
                      marginTop: 2,
                    }}
                  >
                    {event.eventWebsiteUrl}
                  </Text>
                </View>
              </View>
            )}

            {/* Capacity */}
            {event.capacity && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                }}
              >
                <Users size={20} color={brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.xs,
                    }}
                  >
                    Capacity
                  </Text>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.base,
                      marginTop: 2,
                    }}
                  >
                    {event.currentAttendeeCount || 0} / {event.capacity}{' '}
                    attendees
                  </Text>
                  {availableSpots !== null && availableSpots > 0 && (
                    <Text
                      style={{
                        color: colors.text.tertiary,
                        fontSize: typography.size.sm,
                        marginTop: 2,
                      }}
                    >
                      {availableSpots} spots available
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Registration Deadline */}
            {event.registrationDeadline && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                }}
              >
                <Clock size={20} color={brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.xs,
                    }}
                  >
                    Registration Deadline
                  </Text>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.base,
                      marginTop: 2,
                    }}
                  >
                    {dateUtils.formatDate(
                      event.registrationDeadline,
                      DATE_FORMATS.DISPLAY_DATETIME,
                    )}
                  </Text>
                </View>
              </View>
            )}

            {/* Visibility */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.size.xs,
                  }}
                >
                  Visibility
                </Text>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.size.base,
                    marginTop: 2,
                  }}
                >
                  {event.isPublic ? 'Public Event' : 'Private Event'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.size.xs,
                  }}
                >
                  Registration
                </Text>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.size.base,
                    marginTop: 2,
                  }}
                >
                  {event.requiresApproval
                    ? 'Requires Approval'
                    : 'Open Registration'}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Actions */}
          {event.eventStatus !== EventStatus.COMPLETED &&
            event.eventStatus !== EventStatus.CANCELLED && (
              <View style={{ gap: spacing.md }}>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.size.lg,
                    fontWeight: typography.weight.semibold,
                  }}
                >
                  Event Actions
                </Text>

                {(event.eventStatus === EventStatus.DRAFT ||
                  event.eventStatus === EventStatus.PLANNING) && (
                  <TouchableOpacity
                    onPress={handlePublish}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.sm,
                      backgroundColor: '#10B981',
                      paddingVertical: spacing.lg,
                      paddingHorizontal: spacing.xl,
                      borderRadius: borderRadius.xl,
                      ...shadows.sm,
                    }}
                  >
                    <PlayCircle size={22} color="#FFFFFF" />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontWeight: typography.weight.bold,
                        fontSize: typography.size.lg,
                      }}
                    >
                      Publish Event
                    </Text>
                  </TouchableOpacity>
                )}

                {event.eventStatus === EventStatus.PUBLISHED && (
                  <TouchableOpacity
                    onPress={handleComplete}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.sm,
                      backgroundColor: colors.surface,
                      borderWidth: 1.5,
                      borderColor: colors.border,
                      paddingVertical: spacing.lg,
                      paddingHorizontal: spacing.xl,
                      borderRadius: borderRadius.xl,
                    }}
                  >
                    <CheckCircle2 size={22} color={colors.text.primary} />
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: typography.weight.semibold,
                        fontSize: typography.size.lg,
                      }}
                    >
                      Mark as Complete
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleCancel}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    borderWidth: 1.5,
                    borderColor: '#EF4444',
                    paddingVertical: spacing.lg,
                    paddingHorizontal: spacing.xl,
                    borderRadius: borderRadius.xl,
                  }}
                >
                  <XCircle size={22} color="#EF4444" />
                  <Text
                    style={{
                      color: '#EF4444',
                      fontWeight: typography.weight.semibold,
                      fontSize: typography.size.lg,
                    }}
                  >
                    Cancel Event
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* Additional Info */}
          {(event.targetAudience || event.objectives) && (
            <View style={{ gap: spacing.md }}>
              {event.targetAudience && (
                <View>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.lg,
                      fontWeight: typography.weight.semibold,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Target Audience
                  </Text>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.base,
                    }}
                  >
                    {event.targetAudience}
                  </Text>
                </View>
              )}

              {event.objectives && (
                <View>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.lg,
                      fontWeight: typography.weight.semibold,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Objectives
                  </Text>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.base,
                    }}
                  >
                    {event.objectives}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
