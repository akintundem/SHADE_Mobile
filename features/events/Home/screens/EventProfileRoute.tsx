import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Image, RefreshControl, TouchableOpacity, Linking, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, CalendarClock, MapPin, Globe, Hash, ShieldCheck, Users, UsersRound, BarChart3, Wallet, Store, Gift, ClipboardCheck, CalendarCheck, Share2, Heart, ChevronUp, ChevronRight, MessageSquare } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { useI18n } from '../../../../shared/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../shared/components/LoadingStates';
import { Event, EventStatus } from '../../../../shared/types';
import { eventService } from '../../../../shared/services/eventService';
import { dateUtils, stringUtils } from '../../../../shared/utils/helpers';
import { DATE_FORMATS } from '../../../../shared/utils/constants';
import { ErrorHandler } from '../../../../shared/utils/errorHandler';
import BudgetScreen from '../components/BudgetScreen';
import GuestListScreen from '../components/GuestListScreen';
import VendorsScreen from '../components/VendorsScreen';
import RSVPScreen from '../components/RSVPScreen';
import { EventFeedsScreen } from './EventFeedsScreen';

type Params = { eventId?: string; title?: string; imageUrl?: string; description?: string; status?: EventStatus };

const STATUS_COLORS: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: '#6B7280',
  [EventStatus.PLANNING]: '#0EA5E9',
  [EventStatus.PUBLISHED]: '#0EA5E9',
  [EventStatus.REGISTRATION_OPEN]: '#34D399',
  [EventStatus.REGISTRATION_CLOSED]: '#F59E0B',
  [EventStatus.IN_PROGRESS]: '#22C55E',
  [EventStatus.COMPLETED]: '#6366F1',
  [EventStatus.CANCELLED]: '#EF4444',
  [EventStatus.POSTPONED]: '#F97316',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ marginTop: spacing['2xl'] }}>
      <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, fontSize: typography.size.lg }}>
        {title}
      </Text>
      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>{children}</View>
    </View>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | undefined | null }) => {
  const { colors, spacing, typography } = useTheme();
  if (!value) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Icon size={18} color={colors.text.secondary} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, fontWeight: typography.weight.medium }}>
          {label}
        </Text>
        <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
};

const Pill = ({ label, color }: { label: string; color?: string }) => {
  const { spacing, typography } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 999,
        backgroundColor: color ?? '#11182710',
      }}
    >
      <Text style={{ color: color ? '#FFFFFF' : '#111827', fontWeight: typography.weight.semibold, fontSize: typography.size.xs }}>
        {label}
      </Text>
    </View>
  );
};

export const EventProfileRoute = () => {
  const { colors, spacing, typography, borderRadius, shadows, brand } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params || {}) as Params;
  const { t } = useI18n();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<'details' | 'budget' | 'vendors' | 'guests' | 'rsvp' | 'feeds' | null>(null);

  const eventId = params.eventId;

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setError('No event selected');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await eventService.getEvent(eventId);
      setEvent(data);
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

  const status = event?.eventStatus ?? params.status;
  const statusLabel = status
    ? stringUtils.capitalize(status.replace(/_/g, ' ').toLowerCase())
    : undefined;
  const statusColor = status ? STATUS_COLORS[status] : undefined;

  const formattedStart = event?.startDateTime
    ? dateUtils.formatDate(event.startDateTime, DATE_FORMATS.DISPLAY_DATETIME)
    : undefined;
  const formattedEnd = event?.endDateTime
    ? dateUtils.formatDate(event.endDateTime, DATE_FORMATS.DISPLAY_DATETIME)
    : undefined;
  const formattedRegistration = event?.registrationDeadline
    ? dateUtils.formatDate(event.registrationDeadline, DATE_FORMATS.DISPLAY_DATETIME)
    : undefined;

  const capacityText = useMemo(() => {
    if (!event) return undefined;
    if (event.capacity === null || event.capacity === undefined) return 'Unlimited';
    const current = event.currentAttendeeCount ?? 0;
    return `${current}/${event.capacity} attendees`;
  }, [event]);

  if (!eventId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
        <EmptyState
          title="Event not found"
          subtitle="We could not determine which event to open."
          action={{ label: 'Go back', onPress: () => navigation.goBack() }}
        />
      </SafeAreaView>
    );
  }

  const showEmpty = !isLoading && error;

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
    return <EventFeedsScreen eventId={eventId} eventName={event?.name ?? params.title ?? 'Event'} onBack={() => setActiveScreen(null)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>

      {showEmpty ? (
        <EmptyState
          title="Unable to load event"
          subtitle={error || 'Something went wrong while loading this event.'}
          action={{ label: 'Try again', onPress: fetchEvent }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#000000"
              colors={['#000000']}
            />
          }
        >
          <View style={{ paddingBottom: spacing['4xl'] }}>
            {/* Header with Image */}
            <View style={{ position: 'relative' }}>
              {event?.coverImageUrl ?? params.imageUrl ? (
                <ImageBackground
                  source={{ uri: event?.coverImageUrl ?? params.imageUrl! }}
                  style={{ width: '100%', height: 320 }}
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
                  
                  {/* Back button */}
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
                      {event?.name ?? params.title ?? 'Event Name'}
                    </Text>
                    
                    {/* Swipe up indicator */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
                      <Text style={{ color: '#FFFFFF', fontSize: typography.size.xs, opacity: 0.8 }}>
                        Swipe up
                      </Text>
                      <ChevronUp size={14} color="#FFFFFF" style={{ opacity: 0.8 }} />
                    </View>
                  </View>
                </ImageBackground>
              ) : (
                <View
                  style={{
                    height: 320,
                    width: '100%',
                    backgroundColor: '#000000',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
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
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </SafeAreaView>
                  
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontWeight: typography.weight.bold,
                      fontSize: typography.size['3xl'],
                      textAlign: 'center',
                      paddingHorizontal: spacing.xl,
                    }}
                  >
                    {event?.name ?? params.title ?? 'Event Name'}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
                    <Text style={{ color: '#FFFFFF', fontSize: typography.size.xs, opacity: 0.8 }}>
                      Swipe up
                    </Text>
                    <ChevronUp size={14} color="#FFFFFF" style={{ opacity: 0.8 }} />
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={{ 
              paddingHorizontal: spacing.xl, 
              paddingTop: spacing.xl,
              flexDirection: 'row',
              gap: spacing.md,
              alignItems: 'center',
            }}>
              {/* Get Tickets Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: '#000000',
                  borderRadius: borderRadius.xl,
                  paddingVertical: spacing.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontWeight: typography.weight.bold,
                  fontSize: typography.size.base,
                }}>
                  Get Tickets
                </Text>
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity
                onPress={() => {}}
                activeOpacity={0.7}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: borderRadius.lg,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#000000',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Share2 size={24} color="#000000" />
              </TouchableOpacity>

              {/* Heart Button */}
              <TouchableOpacity
                onPress={() => {}}
                activeOpacity={0.7}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: borderRadius.lg,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#000000',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xl }}>

              {/* Schedule Section */}
              <View style={{ marginTop: spacing['2xl'] }}>
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

                  {/* Tasks */}
                  <TouchableOpacity
                    onPress={() => {
                      const eventDate = formattedStart || (event?.startDateTime 
                        ? dateUtils.formatDate(event.startDateTime, DATE_FORMATS.DISPLAY_DATETIME)
                        : 'Date TBD');
                      const eventLocation = event?.venueId || 'Location TBD';
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
                      <ClipboardCheck size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#000000',
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.bold
                      }}>
                        {t('Tasks')}
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

      <LoadingOverlay visible={isLoading && !refreshing} message="Loading event..." transparent />
    </SafeAreaView>
  );
};
