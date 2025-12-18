import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { ScrollView, View, Text, RefreshControl, TouchableOpacity, ImageBackground, Animated, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, CalendarClock, Hash, Users, UsersRound, Wallet, Store, CalendarCheck, Share2, ChevronRight, MessageSquare, Calendar, Stars } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { Event, EventData, isFullEventResponse, isFeedResponse } from '../../types/events';
import { eventService } from '../../services/eventService';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import BudgetScreen from '../components/BudgetScreen';
import GuestListScreen from '../components/GuestListScreen';
import VendorsScreen from '../components/VendorsScreen';
import RSVPScreen from '../components/RSVPScreen';
import { EventFeedsScreen } from './EventFeedsScreen';
import { shareEvent } from '../../../../common/utils/shareUtils';
import CollaborationScreen from '../components/CollaborationScreen';
import EnhancedChatScreen from '../../../agent/components/chat/EnhancedChatScreen';
import EventLocationHeader from '../components/EventLocationHeader';

type Params = { eventId?: string; title?: string; imageUrl?: string };

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop';

export const EventProfileRoute = () => {
  const { colors, spacing, typography, borderRadius, shadows, brand } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params || {}) as Params;
  const { t } = useI18n();

  const [event, setEvent] = useState<Event | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<'budget' | 'vendors' | 'guests' | 'rsvp' | 'feeds' | 'collaboration' | null>(null);
  const [isFeedScope, setIsFeedScope] = useState(false);
  const [feedEventName, setFeedEventName] = useState<string>('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const carouselTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleShare = useCallback(async () => {
    if (!event) return;
    
    try {
      const shareLink = event.eventWebsiteUrl || undefined;
      await shareEvent(event, 'native', shareLink);
    } catch (error) {
      ErrorHandler.handle(error, 'shareEvent');
    }
  }, [event]);

  const eventId = params.eventId;
  
  // Get venue coordinates for map preview
  const venueCoordinates = useMemo(() => {
    // Check if event has venue data (from EventResponseWithScope)
    if (eventData && isFullEventResponse(eventData) && eventData.venue) {
      const venue = eventData.venue;
      const latitude = venue?.latitude;
      const longitude = venue?.longitude;
      
      if (latitude && longitude && typeof latitude === 'number' && typeof longitude === 'number') {
        return { latitude, longitude };
      }
    }
    return null;
  }, [eventData]);

  // Format venue address for display
  const formattedVenueAddress = useMemo(() => {
    if (eventData && isFullEventResponse(eventData) && eventData.venue) {
      const venue = eventData.venue;
      const parts = [];
      
      if (venue.address) parts.push(venue.address);
      if (venue.city) parts.push(venue.city);
      if (venue.state) parts.push(venue.state);
      if (venue.country) parts.push(venue.country);
      
      return parts.length > 0 ? parts.join(', ') : null;
    }
    return null;
  }, [eventData]);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    // Only auto-rotate if we have both image and map
    const hasImage = !!(event?.coverImageUrl ?? params.imageUrl ?? FALLBACK_IMAGE);
    const hasMap = !!venueCoordinates;
    
    if (hasImage && hasMap) {
      carouselTimerRef.current = setInterval(() => {
        setCarouselIndex(prev => (prev === 0 ? 1 : 0));
      }, 5000);
    }

    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, [event?.coverImageUrl, params.imageUrl, venueCoordinates]);

  // Animate carousel transition
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: carouselIndex,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [carouselIndex, slideAnim]);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setError('No event selected');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsFeedScope(false); // Reset when fetching new event
      setCarouselIndex(0); // Reset carousel to first slide
      const data = await eventService.getEvent(eventId);
      setEventData(data);
      
      // Check scope and set flag
      if (isFeedResponse(data)) {
        setIsFeedScope(true);
        setFeedEventName(data.eventName);
      } else {
        setIsFeedScope(false);
        setFeedEventName('');
      }
      
      // Extract Event from EventData (which can be EventResponseWithScope or EventFeedResponse)
      if (isFullEventResponse(data)) {
        // EventResponseWithScope extends EventResponse, so it IS the Event
        setEvent(data);
      } else {
        // For EventFeedResponse, we need to convert it to Event format
        // Since EventFeedResponse doesn't have all Event fields, we'll create a minimal Event
        setEvent({
          id: data.eventId,
          name: data.eventName,
          description: data.description || null,
          eventType: 'OTHER' as any, // EventFeedResponse doesn't include eventType
          eventStatus: 'DRAFT' as any, // EventFeedResponse doesn't include eventStatus
          startDateTime: data.startDateTime || null,
          endDateTime: data.endDateTime || null,
          registrationDeadline: null,
          capacity: null,
          currentAttendeeCount: null,
          isPublic: null,
          requiresApproval: null,
          coverImageUrl: data.coverImageUrl || null,
          eventWebsiteUrl: data.eventWebsiteUrl || null,
          hashtag: data.hashtag || null,
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
        (err as { message?: string })?.message || 'We could not load this event right now.';
      setError(message);
      ErrorHandler.handle(err, 'getEvent');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const onRefresh = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    await fetchEvent();
    setRefreshing(false);
  }, [eventId, fetchEvent]);

  const formattedStart = event?.startDateTime
    ? dateUtils.formatDate(event.startDateTime, DATE_FORMATS.DISPLAY_DATETIME)
    : undefined;
  const formattedEnd = event?.endDateTime
    ? dateUtils.formatDate(event.endDateTime, DATE_FORMATS.DISPLAY_DATETIME)
    : undefined;
  const formattedRegistration = event?.registrationDeadline
    ? dateUtils.formatDate(event.registrationDeadline, DATE_FORMATS.DISPLAY_DATETIME)
    : undefined;

  const bottomGutter = Math.max(spacing.lg, Math.min(insets.bottom, spacing.xl));

  if (!eventId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('EventNotFound')}
            subtitle={t('WeCouldNotDetermineEvent')}
            action={{ label: t('GoBack'), onPress: () => navigation.goBack() }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state
  if (isLoading) {
    return <LoadingOverlay visible={true} message={t('LoadingEvent')} />;
  }

  // If event is FEED scope (GUEST), show feeds screen ONLY - no dashboard access
  if (!isLoading && isFeedScope) {
    return (
      <EventFeedsScreen
        eventId={eventId}
        eventName={feedEventName || t('Event')}
        coverImageUrl={event?.coverImageUrl ?? params.imageUrl ?? FALLBACK_IMAGE}
        onBack={() => navigation.goBack()}
      />
    );
  }

  // If error and no event data, show error state
  const showEmpty = error && !event;

  // Render active screen if one is selected
  if (activeScreen === 'budget' && eventId) {
    return <BudgetScreen eventId={eventId} onBack={() => setActiveScreen(null)} />;
  }
  if (activeScreen === 'vendors' && eventId) {
    return <VendorsScreen eventId={eventId} onBack={() => setActiveScreen(null)} />;
  }
  if (activeScreen === 'guests' && eventId) {
    return <GuestListScreen eventId={eventId} onBack={() => setActiveScreen(null)} />;
  }
  if (activeScreen === 'rsvp' && eventId) {
    return <RSVPScreen eventId={eventId} onBack={() => setActiveScreen(null)} />;
  }
  if (activeScreen === 'feeds' && eventId) {
    return (
      <EventFeedsScreen
        eventId={eventId}
        eventName={event?.name ?? params.title ?? t('Event')}
        coverImageUrl={event?.coverImageUrl ?? params.imageUrl ?? FALLBACK_IMAGE}
        onBack={() => setActiveScreen(null)}
      />
    );
  }
  if (activeScreen === 'collaboration' && eventId) {
    return <CollaborationScreen eventId={eventId} onBack={() => setActiveScreen(null)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface, position: 'relative' }} edges={['top']}>

      {showEmpty ? (
        <View style={{ flex: 1, paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('UnableToLoadEvent')}
            subtitle={error || t('SomethingWentWrong')}
            action={{ label: t('TryAgain'), onPress: fetchEvent }}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomGutter }}
          style={{ backgroundColor: colors.surface }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.text.primary}
              colors={[colors.text.primary]}
            />
          }
        >
          <View>
            {/* Header with Carousel (Image + Map) */}
            <View style={{ position: 'relative', height: 280, overflow: 'hidden', backgroundColor: colors.background }}>
              {venueCoordinates ? (
                <Animated.View
                  style={{
                    flexDirection: 'row',
                    width: '200%',
                    height: '100%',
                    transform: [{
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -Dimensions.get('window').width],
                      }),
                    }],
                  }}
                >
                  {/* Event Image Slide */}
                  <View style={{ width: Dimensions.get('window').width, height: '100%' }}>
                    <ImageBackground
                      source={{ uri: event?.coverImageUrl ?? params.imageUrl ?? FALLBACK_IMAGE }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    >
                      {/* Gradient-like overlay for text readability */}
                      <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 160,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                      }} />
                    </ImageBackground>
                  </View>

                  {/* Map Slide */}
                  <View style={{ width: Dimensions.get('window').width, height: '100%' }}>
                    <EventLocationHeader
                      latitude={venueCoordinates.latitude}
                      longitude={venueCoordinates.longitude}
                    />
                    {/* Dark overlay for text readability */}
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 160,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    }} />
                  </View>
                </Animated.View>
              ) : (
                <ImageBackground
                  source={{ uri: event?.coverImageUrl ?? params.imageUrl ?? FALLBACK_IMAGE }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                >
                  {/* Gradient-like overlay for text readability */}
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 160,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  }} />
                </ImageBackground>
              )}

              {/* Back button and Share button */}
              <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                <TouchableOpacity 
                  onPress={() => navigation.goBack()} 
                  style={{ 
                    position: 'absolute',
                    top: spacing.lg,
                    left: spacing.lg,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={20} color={colors.text.primary} />
                </TouchableOpacity>
                
                {/* Share Button */}
                <TouchableOpacity
                  onPress={handleShare}
                  activeOpacity={0.7}
                  style={{
                    position: 'absolute',
                    top: spacing.lg,
                    right: spacing.lg,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Share2 size={18} color={colors.text.primary} />
                </TouchableOpacity>
              </SafeAreaView>

              {/* Event Name and Address */}
              <View style={{
                position: 'absolute',
                bottom: spacing.xl,
                left: spacing.xl,
                right: spacing.xl,
              }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontFamily: typography.family.bold,
                    fontWeight: typography.weight.bold,
                    fontSize: typography.size['4xl'],
                    letterSpacing: -0.5,
                  }}
                  numberOfLines={2}
                >
                  {event?.name ?? params.title ?? t('EventName')}
                </Text>
                
                {formattedVenueAddress && (
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: typography.size.base,
                      fontFamily: typography.family.medium,
                      fontWeight: typography.weight.medium,
                      marginTop: spacing.xs,
                    }}
                    numberOfLines={1}
                  >
                    {formattedVenueAddress}
                  </Text>
                )}
              </View>

              {/* Carousel Indicators */}
              {venueCoordinates && (
                <View style={{
                  position: 'absolute',
                  top: spacing.lg + 44, // Below back button
                  right: spacing.lg,
                  flexDirection: 'row',
                  gap: 6,
                }}>
                  <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: carouselIndex === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  }} />
                  <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: carouselIndex === 1 ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  }} />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>

              {/* Schedule Section */}
              <View style={{ marginTop: spacing.md }}>
                <Text style={{
                  color: colors.text.primary,
                  fontSize: typography.size.lg,
                  fontFamily: typography.family.bold,
                  fontWeight: typography.weight.bold,
                  marginBottom: spacing.md,
                }}>
                  Schedule
                </Text>
                <View style={{
                  backgroundColor: colors.cardElevated,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  minHeight: 100,
                }}>
                  {(formattedStart || formattedEnd || formattedRegistration) ? (
                    <View style={{ gap: spacing.md }}>
                      {formattedStart && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarClock size={16} color={colors.text.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.medium, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              Starts
                            </Text>
                            <Text style={{ color: colors.text.primary, fontSize: typography.size.base, marginTop: 1, fontWeight: typography.weight.medium }}>
                              {formattedStart}
                            </Text>
                          </View>
                        </View>
                      )}
                      {formattedEnd && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarClock size={16} color={colors.text.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.medium, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              Ends
                            </Text>
                            <Text style={{ color: colors.text.primary, fontSize: typography.size.base, marginTop: 1, fontWeight: typography.weight.medium }}>
                              {formattedEnd}
                            </Text>
                          </View>
                        </View>
                      )}
                      {formattedRegistration && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarClock size={16} color={colors.text.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.medium, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              Registration Deadline
                            </Text>
                            <Text style={{ color: colors.text.primary, fontSize: typography.size.base, marginTop: 1, fontWeight: typography.weight.medium }}>
                              {formattedRegistration}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={{ color: colors.text.tertiary, fontSize: typography.size.base, textAlign: 'center', marginTop: spacing.md }}>
                      No schedule information available
                    </Text>
                  )}
                </View>
              </View>

              {/* Manage Section */}
              <View style={{ marginTop: spacing.xl }}>
                <Text style={{
                  color: colors.text.primary,
                  fontSize: typography.size.lg,
                  fontFamily: typography.family.bold,
                  fontWeight: typography.weight.bold,
                  marginBottom: spacing.md,
                }}>
                  Manage
                </Text>
                
                <View style={{ gap: spacing.md }}>
                  {/* Event Details */}
                  <TouchableOpacity
                    onPress={() => eventId && navigation.navigate('EventAdmin', { eventId })}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.cardElevated,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Hash size={20} color={colors.text.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        Event Details
                      </Text>
                      <Text style={{
                        color: colors.text.tertiary,
                        fontSize: typography.size.sm,
                        marginTop: 1
                      }}>
                        Edit information
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.text.tertiary} />
                  </TouchableOpacity>

                  {/* Guest List */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('guests')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.cardElevated,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <UsersRound size={20} color={colors.text.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        Guest List
                      </Text>
                      <Text style={{
                        color: colors.text.tertiary,
                        fontSize: typography.size.sm,
                        marginTop: 1
                      }}>
                        Manage attendees
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.text.tertiary} />
                  </TouchableOpacity>

                  {/* Budget */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('budget')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.cardElevated,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Wallet size={20} color={colors.text.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        Budget
                      </Text>
                      <Text style={{
                        color: colors.text.tertiary,
                        fontSize: typography.size.sm,
                        marginTop: 1
                      }}>
                        Track expenses and budget
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.text.tertiary} />
                  </TouchableOpacity>

                  {/* Vendors */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('vendors')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.cardElevated,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Store size={20} color={colors.text.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        {t('Vendors')}
                      </Text>
                      <Text style={{
                        color: colors.text.tertiary,
                        fontSize: typography.size.sm,
                        marginTop: 1
                      }}>
                        Manage vendors and suppliers
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.text.tertiary} />
                  </TouchableOpacity>

                  {/* Timeline */}
                  <TouchableOpacity
                    onPress={() => {
                      const eventDate = formattedStart || (event?.startDateTime 
                        ? dateUtils.formatDate(event.startDateTime, DATE_FORMATS.DISPLAY_DATETIME)
                        : t('DateTBD'));
                      const eventLocation = event?.venueId || t('LocationTBD');
                      navigation.navigate('EventManage', {
                        id: eventId || '',
                        title: event?.name ?? params.title ?? 'Event',
                        date: eventDate,
                        location: eventLocation,
                        imageUrl: event?.coverImageUrl ?? params.imageUrl ?? '',
                        initialView: 'timeline',
                      });
                    }}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.cardElevated,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar size={20} color={colors.text.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        Timeline
                      </Text>
                      <Text style={{
                        color: colors.text.tertiary,
                        fontSize: typography.size.sm,
                        marginTop: 1
                      }}>
                        View timeline and manage tasks
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.text.tertiary} />
                  </TouchableOpacity>

                  {/* Collaboration */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('collaboration')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.cardElevated,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={20} color={colors.text.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        Collaboration
                      </Text>
                      <Text style={{
                        color: colors.text.tertiary,
                        fontSize: typography.size.sm,
                        marginTop: 1
                      }}>
                        Manage collaborators and team
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.text.tertiary} />
                  </TouchableOpacity>

                  {/* RSVP */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('rsvp')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.cardElevated,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CalendarCheck size={20} color={colors.text.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        {t('RSVP')}
                      </Text>
                      <Text style={{
                        color: colors.text.tertiary,
                        fontSize: typography.size.sm,
                        marginTop: 1
                      }}>
                        Track responses and attendance
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.text.tertiary} />
                  </TouchableOpacity>

                  {/* Feeds */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('feeds')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.cardElevated,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MessageSquare size={20} color={colors.text.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        Feeds
                      </Text>
                      <Text style={{
                        color: colors.text.tertiary,
                        fontSize: typography.size.sm,
                        marginTop: 1
                      }}>
                        View posts, photos, and videos
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {!isFeedScope && !activeScreen && !!eventId && (
        <>
          {isAgentOpen && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <EnhancedChatScreen eventId={eventId} onClose={() => setIsAgentOpen(false)} />
            </View>
          )}
          {!isAgentOpen && (
            <View
              style={{
                position: 'absolute',
                right: spacing.lg,
                bottom: Math.max(insets.bottom, spacing.xl),
                alignItems: 'flex-end',
              }}
            >
              <TouchableOpacity
                onPress={() => setIsAgentOpen(true)}
                activeOpacity={0.9}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.text.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Stars size={28} color={colors.background} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <LoadingOverlay visible={isLoading && !refreshing} message={t('LoadingEvent')} transparent />
    </SafeAreaView>
  );
};
