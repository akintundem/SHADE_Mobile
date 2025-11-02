import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Image, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, CalendarClock, MapPin, Globe, Hash, ShieldCheck, Users, UsersRound, BarChart3, Wallet, Store, Gift, ClipboardCheck, CalendarCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../components/LoadingStates';
import { Event, EventStatus } from '../../types';
import { eventService } from '../../services/eventService';
import { dateUtils, stringUtils } from '../../utils/helpers';
import { DATE_FORMATS } from '../../utils/constants';
import { ErrorHandler } from '../../utils/errorHandler';
import BudgetScreen from '../components/BudgetScreen';
import GuestListScreen from '../components/GuestListScreen';
import VendorsScreen from '../components/VendorsScreen';
import RSVPScreen from '../components/RSVPScreen';

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
  const [activeScreen, setActiveScreen] = useState<'details' | 'budget' | 'vendors' | 'guests' | 'rsvp' | null>(null);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', color: colors.text.primary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold }}>
          Event details
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {showEmpty ? (
        <EmptyState
          title="Unable to load event"
          subtitle={error || 'Something went wrong while loading this event.'}
          action={{ label: 'Try again', onPress: fetchEvent }}
        />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={brand.primary}
              colors={[brand.primary]}
            />
          }
        >
          <View style={{ paddingBottom: spacing['4xl'] }}>
            {event?.coverImageUrl ?? params.imageUrl ? (
              <Image
                source={{ uri: event?.coverImageUrl ?? params.imageUrl! }}
                style={{ width: '100%', height: 220 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  height: 220,
                  width: '100%',
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.text.tertiary, fontSize: typography.size.sm }}>
                  No cover image
                </Text>
              </View>
            )}

            <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
                {statusLabel ? <Pill label={statusLabel} color={statusColor} /> : null}
                {event?.isPublic !== null && event?.isPublic !== undefined ? (
                  <Pill label={event.isPublic ? 'Public event' : 'Private event'} />
                ) : null}
                {event?.requiresApproval ? <Pill label="Requires approval" /> : null}
              </View>

              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: typography.weight.bold,
                  fontSize: typography.size['2xl'],
                  marginTop: spacing.md,
                }}
              >
                {event?.name ?? params.title ?? 'Event'}
              </Text>

              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  lineHeight: 22,
                  marginTop: spacing.sm,
                }}
              >
                {event?.description ?? params.description ?? 'No description provided yet.'}
              </Text>

              <Section title="Schedule">
                <InfoRow icon={CalendarClock} label="Start" value={formattedStart} />
                <InfoRow icon={CalendarClock} label="End" value={formattedEnd} />
                <InfoRow icon={CalendarClock} label="Registration deadline" value={formattedRegistration} />
              </Section>

              <Section title="Details">
                <InfoRow icon={MapPin} label="Theme" value={event?.theme} />
                <InfoRow icon={Users} label="Target audience" value={event?.targetAudience} />
                <InfoRow icon={ShieldCheck} label="Capacity" value={capacityText} />
                <InfoRow icon={Globe} label="Website" value={event?.eventWebsiteUrl} />
                <InfoRow icon={Hash} label="Hashtag" value={event?.hashtag} />
              </Section>

              {/* Managed Section */}
              <Section title="Managed">
                <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                  {/* Details */}
                  <TouchableOpacity
                    onPress={() => {}}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: spacing.md
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.brand.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Hash size={20} color={brand.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        Details
                      </Text>
                      <Text style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.xs,
                        marginTop: 2
                      }}>
                        View event information
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Budget */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('budget')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: spacing.md
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.brand.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Wallet size={20} color={brand.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        {t('Budget')}
                      </Text>
                      <Text style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.xs,
                        marginTop: 2
                      }}>
                        Track expenses and budget
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Vendors */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('vendors')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: spacing.md
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.brand.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Store size={20} color={brand.primary} />
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
                        color: colors.text.secondary,
                        fontSize: typography.size.xs,
                        marginTop: 2
                      }}>
                        Manage vendors and suppliers
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Guest List */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('guests')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: spacing.md
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.brand.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <UsersRound size={20} color={brand.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        {t('GuestList')}
                      </Text>
                      <Text style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.xs,
                        marginTop: 2
                      }}>
                        Manage attendees and invitations
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Wishlist */}
                  <TouchableOpacity
                    onPress={() => {}}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: spacing.md
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.brand.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Gift size={20} color={brand.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        {t('Wishlist')}
                      </Text>
                      <Text style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.xs,
                        marginTop: 2
                      }}>
                        Create and manage wishlist
                      </Text>
                    </View>
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
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: spacing.md
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.brand.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ClipboardCheck size={20} color={brand.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.semibold
                      }}>
                        {t('Tasks')}
                      </Text>
                      <Text style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.xs,
                        marginTop: 2
                      }}>
                        View timeline and manage tasks
                      </Text>
                    </View>
                    <BarChart3 size={18} color={colors.text.tertiary} />
                  </TouchableOpacity>

                  {/* RSVP */}
                  <TouchableOpacity
                    onPress={() => setActiveScreen('rsvp')}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: spacing.md
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.brand.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CalendarCheck size={20} color={brand.primary} />
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
                        color: colors.text.secondary,
                        fontSize: typography.size.xs,
                        marginTop: 2
                      }}>
                        Track responses and attendance
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

              </Section>
            </View>
          </View>
        </ScrollView>
      )}

      <LoadingOverlay visible={isLoading && !refreshing} message="Loading event..." transparent />
    </SafeAreaView>
  );
};
