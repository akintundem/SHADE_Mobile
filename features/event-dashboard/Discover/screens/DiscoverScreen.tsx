import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl, Alert, Share } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ManageEventCard } from '../components/ManageEventCard';
import { TopBar } from '../components/TopBar';
import { TabBar } from '../../Home/components/TabBar';
import { User } from '../../../../core/auth/types/auth';
import { EventResponse, EventStatus } from '../../../../core/events/types/event';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { eventService } from '../../../../core/events/services/event';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { EmptyState, LoadingOverlay } from '../../../../common/components/LoadingStates';

type ManageItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  description?: string;
  status?: EventStatus | null;
  capacity?: { current: number; total: number };
  analytics?: { views: number; registrations: number };
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1529158062015-cad636e69505?q=80&w=1400&auto=format&fit=crop';

type Props = {
  user: User;
  onTabChange?: (tab: 'home' | 'discover' | 'profile') => void;
  onCreateEvent?: () => void;
};

const convertEvent = (evt: EventResponse): ManageItem => ({
  id: evt.id,
  title: evt.name,
  date: evt.startDateTime
    ? dateUtils.formatDate(evt.startDateTime, DATE_FORMATS.DISPLAY_DATETIME)
    : 'TBD',
  location:
    evt.eventWebsiteUrl ??
    (evt.isPublic ? 'Public event' : 'Private event'),
  imageUrl: evt.coverImageUrl ?? FALLBACK_IMAGE,
  description: evt.description ?? undefined,
  status: evt.eventStatus,
  capacity:
    evt.currentAttendeeCount !== null &&
    evt.currentAttendeeCount !== undefined &&
    evt.capacity !== null &&
    evt.capacity !== undefined
      ? {
          current: evt.currentAttendeeCount,
          total: evt.capacity,
        }
      : undefined,
});

export default function DiscoverScreen({ user, onTabChange, onCreateEvent }: Props) {
  const { colors, spacing, typography, brand } = useTheme();
  const { t } = useI18n();
  const [ownedEvents, setOwnedEvents] = useState<ManageItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<ManageItem[]>([]);
  const [pastEvents, setPastEvents] = useState<ManageItem[]>([]);
  const [eventsSummary, setEventsSummary] = useState<{
    totalEvents: number;
    ownedEvents: number;
    upcomingEvents: number;
    pastEvents: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = useCallback((eventId: string, eventTitle: string) => {
    Alert.alert(
      'Invite to Event',
      `Share "${eventTitle}" with friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: async () => {
            try {
              await Share.share({
                message: `Join me at ${eventTitle}! Check it out on our app.`,
                title: `Invitation to ${eventTitle}`,
              });
            } catch (err) {
              ErrorHandler.handle(err, 'shareEventInvite');
            }
          },
        },
      ]
    );
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      const [mineAllPage, upcomingPage, pastPage] = await Promise.all([
        eventService.listMyEvents({ size: 100 }),
        eventService.listMyEvents({ timeframe: 'UPCOMING', size: 100 }),
        eventService.listMyEvents({ timeframe: 'PAST', size: 100 }),
      ]);

      const mineAll = mineAllPage.content || [];
      const upcoming = upcomingPage.content || [];
      const past = pastPage.content || [];

      setEventsSummary({
        totalEvents: mineAll.length,
        ownedEvents: mineAll.length,
        upcomingEvents: upcoming.length,
        pastEvents: past.length,
      });
      setOwnedEvents(mineAll.map(convertEvent));
      setUpcomingEvents(upcoming.map(convertEvent));
      setPastEvents(past.map(convertEvent));
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Unable to load your events right now.';
      setError(message);
      ErrorHandler.handle(err, 'loadMyEvents');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const draftEvents = useMemo(
    () => ownedEvents.filter(evt => evt.status === EventStatus.DRAFT || evt.status === EventStatus.PLANNING),
    [ownedEvents]
  );

  const activeEvents = useMemo(
    () => ownedEvents.filter(evt =>
      evt.status === EventStatus.PUBLISHED ||
      evt.status === EventStatus.REGISTRATION_OPEN ||
      evt.status === EventStatus.IN_PROGRESS
    ),
    [ownedEvents]
  );

  const renderDashboardSummary = () => {
    if (!eventsSummary) return null;

    return (
      <View style={{
        backgroundColor: colors.surface,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        borderRadius: spacing.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Text style={{
          fontSize: typography.size.lg,
          fontWeight: typography.weight.semibold,
          color: colors.text.primary,
          marginBottom: spacing.md,
        }}>
          Your Events Dashboard
        </Text>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: spacing.md,
        }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              color: brand.primary,
            }}>
              {eventsSummary.totalEvents}
            </Text>
            <Text style={{
              fontSize: typography.size.sm,
              color: colors.text.secondary,
              textAlign: 'center',
            }}>
              Total Events
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              color: '#059669', // Green
            }}>
              {activeEvents.length}
            </Text>
            <Text style={{
              fontSize: typography.size.sm,
              color: colors.text.secondary,
              textAlign: 'center',
            }}>
              Active
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              color: '#DC2626', // Red
            }}>
              {draftEvents.length}
            </Text>
            <Text style={{
              fontSize: typography.size.sm,
              color: colors.text.secondary,
              textAlign: 'center',
            }}>
              Drafts
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              color: colors.text.tertiary,
            }}>
              {eventsSummary.pastEvents}
            </Text>
            <Text style={{
              fontSize: typography.size.sm,
              color: colors.text.secondary,
              textAlign: 'center',
            }}>
              Past
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TopBar onCreate={onCreateEvent} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.primary}
            colors={[brand.primary]}
          />
        }
      >
        {/* Manage events only */}
        <View style={{ marginTop: spacing.xl }}>
          {error ? (
            <View style={{ paddingHorizontal: spacing.xl }}>
              <EmptyState
                title="Your events are unavailable"
                subtitle={error}
                icon={<Calendar size={48} color={colors.text.tertiary} />}
              />
            </View>
          ) : (
            <>
              {/* Dashboard Summary */}
              {renderDashboardSummary()}

              {/* No Events State */}
              {upcomingEvents.length === 0 && ownedEvents.length === 0 && !loading ? (
                <View style={{ paddingHorizontal: spacing.xl, alignItems: 'center', gap: spacing.sm, paddingVertical: spacing['2xl'] }}>
                  <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
                    {t('NoEventsYet')}
                  </Text>
                  <Text style={{ color: colors.text.secondary }}>{t('StartByCreatingEvent')}</Text>
                  <View style={{ height: spacing.lg }} />
                  {onCreateEvent ? (
                    <TouchableOpacity
                      onPress={onCreateEvent}
                      activeOpacity={0.9}
                      style={{
                        backgroundColor: brand.primary,
                        paddingHorizontal: spacing.xl,
                        paddingVertical: spacing.md,
                        borderRadius: spacing.lg,
                      }}
                    >
                      <Text style={{ color: colors.background, fontWeight: typography.weight.semibold }}>
                        {t('CreateEvent')}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : (
                <View style={{ paddingHorizontal: spacing.xl, gap: spacing.xl }}>
                  {/* Active Events Section */}
                  {activeEvents.length > 0 && (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{
                          color: colors.text.primary,
                          fontWeight: typography.weight.semibold,
                          fontSize: typography.size.lg,
                        }}>
                          Active Events ({activeEvents.length})
                        </Text>
                        <View style={{
                          backgroundColor: '#059669',
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs,
                          borderRadius: spacing.sm,
                        }}>
                          <Text style={{
                            color: 'white',
                            fontSize: typography.size.xs,
                            fontWeight: typography.weight.semibold,
                          }}>
                            LIVE
                          </Text>
                        </View>
                      </View>

                      {activeEvents.slice(0, 3).map((item, idx) => (
                        <ManageEventCard
                          key={item.id}
                          eventId={item.id}
                          title={item.title}
                          date={item.date}
                          location={item.location}
                          imageUrl={item.imageUrl}
                          status={item.status || undefined}
                          capacity={item.capacity}
                          analytics={item.analytics}
                          progress={60 + idx * 10}
                          collaborators={idx * 3 + 5}
                          onInvite={() => handleInvite(item.id, item.title)}
                          onRefresh={loadEvents}
                        />
                      ))}
                    </>
                  )}

                  {/* Upcoming Events Section */}
                  {upcomingEvents.length > 0 && (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{
                          color: colors.text.primary,
                          fontWeight: typography.weight.semibold,
                          fontSize: typography.size.lg,
                        }}>
                          Upcoming Events ({upcomingEvents.length})
                        </Text>
                      </View>

                      {upcomingEvents.slice(0, 3).map((item, idx) => (
                        <ManageEventCard
                          key={item.id}
                          eventId={item.id}
                          title={item.title}
                          date={item.date}
                          location={item.location}
                          imageUrl={item.imageUrl}
                          status={item.status || undefined}
                          capacity={item.capacity}
                          analytics={item.analytics}
                          progress={25 + idx * 15}
                          collaborators={idx * 3}
                          onInvite={() => handleInvite(item.id, item.title)}
                          onRefresh={loadEvents}
                        />
                      ))}
                    </>
                  )}

                  {/* Draft Events Section */}
                  {draftEvents.length > 0 && (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{
                          color: colors.text.secondary,
                          fontWeight: typography.weight.semibold,
                          fontSize: typography.size.lg,
                        }}>
                          Drafts ({draftEvents.length})
                        </Text>
                        <View style={{
                          backgroundColor: colors.text.tertiary,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs,
                          borderRadius: spacing.sm,
                        }}>
                          <Text style={{
                            color: colors.background,
                            fontSize: typography.size.xs,
                            fontWeight: typography.weight.semibold,
                          }}>
                            DRAFT
                          </Text>
                        </View>
                      </View>

                      {draftEvents.slice(0, 2).map(item => (
                        <ManageEventCard
                          key={item.id}
                          eventId={item.id}
                          title={item.title}
                          date={item.date}
                          location={item.location}
                          imageUrl={item.imageUrl}
                          status={item.status || undefined}
                          capacity={item.capacity}
                          analytics={item.analytics}
                          progress={10}
                          collaborators={0}
                          onInvite={() => handleInvite(item.id, item.title)}
                          onRefresh={loadEvents}
                        />
                      ))}
                    </>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <TabBar active="discover" onChange={onTabChange} />
      <LoadingOverlay visible={loading && !refreshing} message="Loading your events..." transparent />
    </SafeAreaView>
  );
}
