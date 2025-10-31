import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { ManageEventCard } from './components/ManageEventCard';
import { TopBar } from './components/TopBar';
import { TabBar } from '../Home/components/TabBar';
import { User, UserEventRelationshipResponse, EventStatus } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import { eventService } from '../services/eventService';
import { ErrorHandler } from '../utils/errorHandler';
import { dateUtils } from '../utils/helpers';
import { DATE_FORMATS } from '../utils/constants';
import { EmptyState, LoadingOverlay } from '../components/LoadingStates';

type ManageItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  description?: string;
  status?: EventStatus | null;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1529158062015-cad636e69505?q=80&w=1400&auto=format&fit=crop';

type Props = {
  user: User;
  onTabChange?: (tab: 'home' | 'discover' | 'profile') => void;
  onCreateEvent?: () => void;
};

const convertEvent = (evt: UserEventRelationshipResponse): ManageItem => ({
  id: evt.eventId,
  title: evt.eventName,
  date: evt.startDateTime ? dateUtils.formatDate(evt.startDateTime, DATE_FORMATS.DISPLAY_DATETIME) : 'TBD',
  location: evt.eventWebsiteUrl ?? (evt.isPublic ? 'Public event' : 'Private event'),
  imageUrl: evt.coverImageUrl ?? FALLBACK_IMAGE,
  description: evt.eventDescription ?? undefined,
  status: evt.eventStatus,
});

export default function DiscoverScreen({ user, onTabChange, onCreateEvent }: Props) {
  const { colors, spacing, typography, brand } = useTheme();
  const { t } = useI18n();
  const [ownedEvents, setOwnedEvents] = useState<ManageItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<ManageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      const [owned, upcoming] = await Promise.all([
        eventService.getMyOwnedEvents(),
        eventService.getMyUpcomingEvents(),
      ]);
      setOwnedEvents(owned.map(convertEvent));
      setUpcomingEvents(upcoming.map(convertEvent));
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Unable to load your events right now.';
      setError(message);
      ErrorHandler.handle(err, 'loadMyEvents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const draftEvents = useMemo(
    () => ownedEvents.filter(evt => evt.status === EventStatus.DRAFT || evt.status === EventStatus.PLANNING),
    [ownedEvents]
  );

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
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['2xl'], gap: spacing['2xl'] }}>
          {error ? (
            <EmptyState
              title="Your events are unavailable"
              subtitle={error}
              icon={<Calendar size={48} color={colors.text.tertiary} />}
              action={onCreateEvent ? { label: 'Create event', onPress: onCreateEvent } : undefined}
            />
          ) : (
            <>
              {upcomingEvents.length === 0 && !loading ? (
                <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing['2xl'] }}>
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
                      <Text style={{ color: '#FFFFFF', fontWeight: typography.weight.semibold }}>
                        {t('CreateEvent')}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}

              {upcomingEvents.slice(0, 3).map((item, idx) => (
                <ManageEventCard
                  key={item.id}
                  title={item.title}
                  date={item.date}
                  location={item.location}
                  imageUrl={item.imageUrl}
                  progress={25 + idx * 15}
                  collaborators={idx * 3}
                  onOpen={() => {}}
                  onInvite={() => {}}
                />
              ))}

              {draftEvents.length > 0 ? (
                <>
                  <Text style={{ color: colors.text.secondary, fontWeight: typography.weight.semibold, marginTop: spacing.md }}>
                    {t('Drafts')}
                  </Text>
                  {draftEvents.slice(0, 2).map(item => (
                    <ManageEventCard
                      key={item.id}
                      title={`Draft: ${item.title}`}
                      date={item.date}
                      location={item.location}
                      imageUrl={item.imageUrl}
                      progress={10}
                      collaborators={0}
                      onOpen={() => {}}
                      onInvite={() => {}}
                    />
                  ))}
                </>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      <TabBar active="discover" onChange={onTabChange} />
      <LoadingOverlay visible={loading && !refreshing} message="Loading your events..." transparent />
    </SafeAreaView>
  );
}
