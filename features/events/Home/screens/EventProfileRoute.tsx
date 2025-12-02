import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { ScrollView, View, Text, RefreshControl, TouchableOpacity, ImageBackground, Animated, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, CalendarClock, Hash, Users, UsersRound, Wallet, Store, CalendarCheck, Share2, ChevronUp, ChevronRight, MessageSquare, Calendar, Stars } from 'lucide-react-native';
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
  
  // Generate static map URL if venue coordinates exist
  const staticMapUrl = useMemo(() => {
    // Check if event has venue data (from EventResponseWithScope)
    if (eventData && isFullEventResponse(eventData) && eventData.venue) {
      const venue = eventData.venue;
      const latitude = venue?.latitude;
      const longitude = venue?.longitude;
      
      if (latitude && longitude && typeof latitude === 'number' && typeof longitude === 'number') {
        const zoom = 13;
        const width = Math.round(Dimensions.get('window').width);
        const height = 320;
        
        // Using Geoapify's demo API for static maps (same as LocationStep.tsx)
        const url = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=${width}&height=${height}&center=lonlat:${longitude},${latitude}&zoom=${zoom}&marker=lonlat:${longitude},${latitude};type:material;color:%23F59E0B;size:medium&apiKey=demo`;
        
        return url;
      }
    }
    return null;
  }, [eventData]);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    // Only auto-rotate if we have both image and map
    const hasImage = !!(event?.coverImageUrl ?? params.imageUrl ?? FALLBACK_IMAGE);
    const hasMap = !!staticMapUrl;
    
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
  }, [event?.coverImageUrl, params.imageUrl, staticMapUrl]);

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
          qrCodeEnabled: null,
          qrCode: null,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', position: 'relative' }} edges={['top']}>

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#000000"
              colors={['#000000']}
            />
          }
        >
          <View>
            {/* Header with Carousel (Image + Map) */}
            <View style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
              {staticMapUrl ? (
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
                      {/* Dark overlay for text readability */}
                      <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 120,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                      }} />
                    </ImageBackground>
                  </View>

                  {/* Map Slide */}
                  <View style={{ width: Dimensions.get('window').width, height: '100%', backgroundColor: '#1F2937' }}>
                    <ImageBackground
                      source={{ uri: staticMapUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                      onError={() => {
                        // Map image failed to load
                      }}
                      onLoad={() => {
                        // Map image loaded successfully
                      }}
                    >
                      {/* Dark overlay for text readability */}
                      <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 120,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                      }} />
                    </ImageBackground>
                  </View>
                </Animated.View>
              ) : (
                <ImageBackground
                  source={{ uri: event?.coverImageUrl ?? params.imageUrl ?? FALLBACK_IMAGE }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                >
                  {/* Dark overlay for text readability */}
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 120,
                    backgroundColor: 'rgba(0,0,0,0.4)',
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
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                {/* Share Button */}
                <TouchableOpacity
                  onPress={handleShare}
                  activeOpacity={0.7}
                  style={{
                    position: 'absolute',
                    top: spacing.lg,
                    right: spacing.lg,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Share2 size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </SafeAreaView>

              {/* Event Name */}
              <View style={{
                position: 'absolute',
                bottom: spacing.xl,
                left: spacing.xl,
                right: spacing.xl,
              }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontWeight: typography.weight.bold,
                    fontSize: typography.size['3xl'],
                    marginBottom: spacing.xs,
                  }}
                >
                  {event?.name ?? params.title ?? t('EventName')}
                </Text>
                
                {/* Swipe up indicator */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
                  <Text style={{ color: '#FFFFFF', fontSize: typography.size.xs, opacity: 0.8 }}>
                    Swipe up
                  </Text>
                  <ChevronUp size={14} color="#FFFFFF" style={{ opacity: 0.8 }} />
                </View>
              </View>

              {/* Carousel Indicators */}
              {staticMapUrl && (
                <View style={{
                  position: 'absolute',
                  bottom: spacing.md,
                  right: spacing.xl,
                  flexDirection: 'row',
                  gap: spacing.xs,
                }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: carouselIndex === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  }} />
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: carouselIndex === 1 ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  }} />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xl }}>

              {/* Schedule Section */}
              <View style={{ marginTop: spacing.lg }}>
                <Text style={{
                  color: '#000000',
                  fontSize: typography.size['2xl'],
                  fontWeight: typography.weight.bold,
                  marginBottom: spacing.lg,
                }}>
                  Schedule
                </Text>
                <View style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: borderRadius.xl,
                  padding: spacing.xl,
                  borderWidth: 2,
                  borderColor: '#000000',
                  minHeight: 120,
                }}>
                  {(formattedStart || formattedEnd || formattedRegistration) ? (
                    <View style={{ gap: spacing.md }}>
                      {formattedStart && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                          <CalendarClock size={20} color="#000000" />
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#000000', fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                              Start
                            </Text>
                            <Text style={{ color: '#000000', fontSize: typography.size.base, marginTop: 2 }}>
                              {formattedStart}
                            </Text>
                          </View>
                        </View>
                      )}
                      {formattedEnd && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                          <CalendarClock size={20} color="#000000" />
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#000000', fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                              End
                            </Text>
                            <Text style={{ color: '#000000', fontSize: typography.size.base, marginTop: 2 }}>
                              {formattedEnd}
                            </Text>
                          </View>
                        </View>
                      )}
                      {formattedRegistration && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                          <CalendarClock size={20} color="#000000" />
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#000000', fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                              Registration deadline
                            </Text>
                            <Text style={{ color: '#000000', fontSize: typography.size.base, marginTop: 2 }}>
                              {formattedRegistration}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={{ color: '#000000', fontSize: typography.size.base, opacity: 0.5 }}>
                      No schedule information available
                    </Text>
                  )}
                </View>
              </View>

              {/* Manage Section */}
              <View style={{ marginTop: spacing['2xl'] }}>
                <Text style={{
                  color: '#000000',
                  fontSize: typography.size['2xl'],
                  fontWeight: typography.weight.bold,
                  marginBottom: spacing.lg,
                }}>
                  Manage
                </Text>
                
                <View style={{ gap: spacing.sm }}>
                  {/* Event Details */}
                  <TouchableOpacity
                    onPress={() => eventId && navigation.navigate('EventAdmin', { eventId })}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      borderWidth: 2,
                      borderColor: '#000000',
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.md,
                      backgroundColor: '#000000',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Hash size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.bold
                      }}>
                        Event Details
                      </Text>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.sm,
                        marginTop: 2,
                        opacity: 0.6
                      }}>
                        Edit information
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#000000" />
                  </TouchableOpacity>

                  {/* Guest List */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('guests')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      borderWidth: 2,
                      borderColor: '#000000',
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.md,
                      backgroundColor: '#000000',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <UsersRound size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.bold
                      }}>
                        Guest List
                      </Text>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.sm,
                        marginTop: 2,
                        opacity: 0.6
                      }}>
                        Manage attendees
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#000000" />
                  </TouchableOpacity>

                  {/* Budget */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('budget')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      borderWidth: 2,
                      borderColor: '#000000',
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.md,
                      backgroundColor: '#000000',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Wallet size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.bold
                      }}>
                        Budget
                      </Text>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.sm,
                        marginTop: 2,
                        opacity: 0.6
                      }}>
                        Track expenses and budget
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#000000" />
                  </TouchableOpacity>

                  {/* Vendors */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('vendors')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      borderWidth: 2,
                      borderColor: '#000000',
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.md,
                      backgroundColor: '#000000',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Store size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.bold
                      }}>
                        {t('Vendors')}
                      </Text>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.sm,
                        marginTop: 2,
                        opacity: 0.6
                      }}>
                        Manage vendors and suppliers
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#000000" />
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
                      backgroundColor: '#FFFFFF',
                      borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      borderWidth: 2,
                      borderColor: '#000000',
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.md,
                      backgroundColor: '#000000',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.bold
                      }}>
                        Timeline
                      </Text>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.sm,
                        marginTop: 2,
                        opacity: 0.6
                      }}>
                        View timeline and manage tasks
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#000000" />
                  </TouchableOpacity>

                  {/* Collaboration */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('collaboration')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      borderWidth: 2,
                      borderColor: '#000000',
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.md,
                      backgroundColor: '#000000',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.bold
                      }}>
                        Collaboration
                      </Text>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.sm,
                        marginTop: 2,
                        opacity: 0.6
                      }}>
                        Manage collaborators and team
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#000000" />
                  </TouchableOpacity>

                  {/* RSVP */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('rsvp')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      borderWidth: 2,
                      borderColor: '#000000',
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.md,
                      backgroundColor: '#000000',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CalendarCheck size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.bold
                      }}>
                        {t('RSVP')}
                      </Text>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.sm,
                        marginTop: 2,
                        opacity: 0.6
                      }}>
                        Track responses and attendance
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#000000" />
                  </TouchableOpacity>

                  {/* Feeds */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('feeds')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      borderWidth: 2,
                      borderColor: '#000000',
                      gap: spacing.md,
                    }}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.md,
                      backgroundColor: '#000000',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MessageSquare size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.bold
                      }}>
                        Feeds
                      </Text>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.sm,
                        marginTop: 2,
                        opacity: 0.6
                      }}>
                        View posts, photos, and videos
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#000000" />
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
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: brand.secondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.sm,
                }}
              >
                <Stars size={24} color={colors.background} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <LoadingOverlay visible={isLoading && !refreshing} message={t('LoadingEvent')} transparent />
    </SafeAreaView>
  );
};
