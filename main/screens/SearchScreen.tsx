import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, TextInput } from 'react-native';
import { Calendar, Search, Users, X } from 'lucide-react-native';
import { EventAccessModals } from '../../common/components/EventAccessModals';
import { useTheme } from '../../common/theme/ThemeProvider';
import { useI18n } from '../../common/i18n/I18nProvider';
import { useEventAccess } from '../hooks/useEventAccess';
import { EmptyState } from '../../common/components/LoadingStates';
import { eventService } from '../../core/events/services/event';
import { convertEventsToItems } from '../../features/event-dashboard/dashboard/utils/eventUtils';
import { EventItem } from '../../features/event-dashboard/dashboard/components/EventCard';
import { ErrorHandler } from '../../common/utils/errorHandler';
import { dateUtils } from '../../common/utils/helpers';
import { DATE_FORMATS } from '../../common/utils/constants';
import { EventStatus } from '../../core/events/types/event';
import { authService } from '../../core/auth/services/authService';
import { PublicUserResponse } from '../../core/auth/types/auth';
import { UserListItem } from '../../features/social/components/UserListItem';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../../navigation/types';

const SEARCH_DEBOUNCE_MS = 300;

type SearchItem =
  | { type: 'event'; item: EventItem }
  | { type: 'people'; item: PublicUserResponse };

const SearchBadge = ({ label }: { label: string }) => (
  <View className="px-sm py-[2px] rounded-full border border-light-border-muted dark:border-dark-border-muted bg-light-surface-soft dark:bg-dark-surface-muted">
    <Text className="text-xs font-semibold uppercase tracking-[0.6px] text-txt-tertiary dark:text-txt-dark-tertiary">
      {label}
    </Text>
  </View>
);

export default function SearchScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<RootStackNavigationProp>();
  const [query, setQuery] = useState('');
  const [eventResults, setEventResults] = useState<EventItem[]>([]);
  const [peopleResults, setPeopleResults] = useState<PublicUserResponse[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);
  const [hasSearchedEvents, setHasSearchedEvents] = useState(false);
  const [hasSearchedPeople, setHasSearchedPeople] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [peoplePage, setPeoplePage] = useState(0);
  const [hasMorePeople, setHasMorePeople] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ events: true, people: true });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef('');

  const hasQuery = query.trim().length >= 2;

  const {
    selectedEvent,
    showTicketModal,
    showRSVPModal,
    showInviteModal,
    isProcessing,
    actionResult,
    handleEventPress,
    handleTicketModalDismiss,
    handleRSVPModalDismiss,
    handleInviteModalDismiss,
    handleTicketAction,
    handleRSVPAction,
    handleInviteAction,
  } = useEventAccess();

  const toggleFilter = useCallback((key: 'events' | 'people') => {
    setFilters(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.events && !next.people) {
        return prev;
      }
      return next;
    });
  }, []);

  const searchAll = useCallback(async (term: string) => {
    if (latestQueryRef.current !== term) return;

    setIsLoadingEvents(true);
    setIsLoadingPeople(true);
    setHasSearchedEvents(true);
    setHasSearchedPeople(true);

    const [eventsResult, peopleResult] = await Promise.allSettled([
      eventService.listEvents({ page: 0, size: 20, isPublic: true, search: term }),
      authService.searchDirectory(term, { page: 0, size: 20 }),
    ]);

    if (latestQueryRef.current !== term) return;

    if (eventsResult.status === 'fulfilled') {
      setEventResults(convertEventsToItems(eventsResult.value.content || []));
    } else {
      ErrorHandler.handle(eventsResult.reason, 'searchEvents');
      setEventResults([]);
    }

    if (peopleResult.status === 'fulfilled') {
      const people = peopleResult.value.content || [];
      setPeopleResults(people);
      setPeoplePage(0);
      setHasMorePeople(people.length >= 20);
    } else {
      ErrorHandler.handle(peopleResult.reason, 'searchPeople');
      setPeopleResults([]);
      setPeoplePage(0);
      setHasMorePeople(false);
    }

    setIsLoadingEvents(false);
    setIsLoadingPeople(false);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    latestQueryRef.current = trimmed;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!trimmed || trimmed.length < 2) {
      setEventResults([]);
      setPeopleResults([]);
      setHasSearchedEvents(false);
      setHasSearchedPeople(false);
      setIsLoadingEvents(false);
      setIsLoadingPeople(false);
      setHasMorePeople(true);
      setPeoplePage(0);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchAll(trimmed);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchAll]);

  const loadMorePeople = useCallback(async () => {
    if (!hasQuery || isLoadingPeople || !hasMorePeople || !filters.people) return;

    const trimmed = query.trim();
    const nextPage = peoplePage + 1;
    setIsLoadingPeople(true);

    try {
      const response = await authService.searchDirectory(trimmed, { page: nextPage, size: 20 });
      if (latestQueryRef.current !== trimmed) return;
      setPeopleResults(prev => [...prev, ...(response.content || [])]);
      setPeoplePage(nextPage);
      setHasMorePeople((response.content?.length || 0) >= 20);
    } catch (error) {
      ErrorHandler.handle(error, 'loadMorePeople');
    } finally {
      if (latestQueryRef.current === trimmed) {
        setIsLoadingPeople(false);
      }
    }
  }, [query, peoplePage, isLoadingPeople, hasMorePeople, hasQuery, filters.people]);

  const refreshResults = useCallback(async () => {
    if (!hasQuery) return;
    setRefreshing(true);
    const trimmed = query.trim();
    try {
      await searchAll(trimmed);
    } finally {
      setRefreshing(false);
    }
  }, [query, hasQuery, searchAll]);

  const formatEventDate = useCallback((dateString?: string) => {
    if (!dateString) return '';
    return dateUtils.formatDate(dateString, DATE_FORMATS.DISPLAY_DATE);
  }, []);

  const formatEventLocation = useCallback(
    (item: EventItem) => {
      if (item.city || item.state) {
        const parts = [item.city, item.state].filter(Boolean);
        if (parts.length > 0) return parts.join(', ');
      }
      if (item.venue) return item.venue;
      return t('LocationTBD');
    },
    [t],
  );

  const getStatusLabel = useCallback(
    (item: EventItem) => {
      const isLive = item.status === EventStatus.IN_PROGRESS || (!!item.isLive && !item.status);
      if (isLive) return t('Live');
      if (!item.status && item.isPast) return t('Past');
      if (!item.status) return undefined;

      const statusLabels: Partial<Record<EventStatus, string>> = {
        [EventStatus.DRAFT]: t('Draft'),
        [EventStatus.PLANNING]: t('Planning'),
        [EventStatus.PUBLISHED]: t('Published'),
        [EventStatus.REGISTRATION_OPEN]: t('RegistrationOpen'),
        [EventStatus.REGISTRATION_CLOSED]: t('RegistrationClosed'),
        [EventStatus.IN_PROGRESS]: t('InProgress'),
        [EventStatus.COMPLETED]: t('Completed'),
        [EventStatus.CANCELLED]: t('Cancelled'),
        [EventStatus.POSTPONED]: t('Postponed'),
      };

      return statusLabels[item.status];
    },
    [t],
  );

  const mergedResults = useMemo<SearchItem[]>(() => {
    const results: SearchItem[] = [];
    if (filters.events) {
      results.push(...eventResults.map(item => ({ type: 'event', item })));
    }
    if (filters.people) {
      results.push(...peopleResults.map(item => ({ type: 'people', item })));
    }
    return results;
  }, [eventResults, peopleResults, filters.events, filters.people]);

  const renderItem = useCallback(
    ({ item, index }: { item: SearchItem; index: number }) => {
      if (item.type === 'event') {
        const eventItem = item.item;
        const statusLabel = getStatusLabel(eventItem);
        const meta = [
          statusLabel,
          formatEventDate(eventItem.startAt),
          formatEventLocation(eventItem),
        ]
          .filter(Boolean)
          .join(' • ');

        return (
          <TouchableOpacity
            onPress={() => handleEventPress(eventItem)}
            activeOpacity={0.8}
            className="flex-row items-center px-lg py-md"
          >
            <View className="h-11 w-11 rounded-lg bg-light-surface-soft dark:bg-dark-surface-muted items-center justify-center">
              <Calendar size={18} color={colors.text.tertiary} strokeWidth={2} />
            </View>
            <View className="flex-1 ml-md">
              <Text
                className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary"
                numberOfLines={1}
              >
                {eventItem.title}
              </Text>
              {meta ? (
                <Text
                  className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]"
                  numberOfLines={1}
                >
                  {meta}
                </Text>
              ) : null}
            </View>
            <View className="ml-md">
              <SearchBadge label={t('Events')} />
            </View>
          </TouchableOpacity>
        );
      }

      const user = item.item as PublicUserResponse;
      const isLast = index === mergedResults.length - 1;
      return (
        <UserListItem
          user={user}
          onPress={() => navigation.navigate('PublicProfile', { userId: user.id })}
          isLast={isLast}
          badgeLabel={t('People')}
        />
      );
    },
    [colors.text.tertiary, formatEventDate, formatEventLocation, getStatusLabel, handleEventPress, mergedResults.length, navigation, t],
  );

  const renderEmptyState = useCallback(() => {
    if (isLoadingEvents || isLoadingPeople) {
      return (
        <View className="px-lg pt-3xl">
          <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary text-center">
            {t('SearchResultsSearching')}
          </Text>
        </View>
      );
    }

    if (!hasQuery) {
      return (
        <View className="px-lg pt-3xl">
          <EmptyState
            icon={<Search size={40} color={colors.text.tertiary} />}
            title={t('SearchEmptyTitle')}
            subtitle={t('SearchEmptySubtitle')}
          />
        </View>
      );
    }

    if (!hasSearchedEvents && !hasSearchedPeople) {
      return null;
    }

    return (
      <View className="px-lg pt-3xl">
        <EmptyState
          icon={<Users size={40} color={colors.text.tertiary} />}
          title={t('SearchNoResultsTitle')}
          subtitle={t('SearchNoResultsSubtitle')}
        />
      </View>
    );
  }, [colors.text.tertiary, hasQuery, isLoadingEvents, isLoadingPeople, t, hasSearchedEvents, hasSearchedPeople]);

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <View className="px-lg pt-xl pb-md">
        <Text className="text-2xl font-semibold tracking-[-0.2px] text-txt-primary dark:text-txt-dark-primary">
          {t('SearchTitle')}
        </Text>
        <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
          {t('SearchSubtitle')}
        </Text>

        <View className="mt-lg">
          <View className="flex-row items-center rounded-xl border border-light-border-muted dark:border-dark-border-muted bg-light-surface-soft dark:bg-dark-surface-muted px-md py-sm">
            <TextInput
              placeholder={t('SearchPlaceholder')}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              placeholderTextColor={colors.text.tertiary}
              className="flex-1 text-sm text-txt-primary dark:text-txt-dark-primary"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} className="ml-sm">
                <X size={16} color={colors.text.tertiary} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setShowFilters(prev => !prev)}
              className={`ml-sm h-8 w-8 rounded-lg items-center justify-center border ${
                showFilters
                  ? 'border-light-border-strong dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface'
                  : 'border-transparent'
              }`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Search size={16} color={colors.text.tertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {showFilters && (
            <View className="flex-row gap-sm mt-md">
              <TouchableOpacity
                onPress={() => toggleFilter('events')}
                className={`px-md py-xs rounded-full border ${
                  filters.events
                    ? 'bg-light-surface dark:bg-dark-surface border-light-border-strong dark:border-dark-border-strong'
                    : 'bg-transparent border-light-border-muted dark:border-dark-border-muted'
                }`}
              >
                <Text className={`text-xs font-semibold ${filters.events ? 'text-txt-primary dark:text-txt-dark-primary' : 'text-txt-tertiary dark:text-txt-dark-tertiary'}`}>
                  {t('Events')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleFilter('people')}
                className={`px-md py-xs rounded-full border ${
                  filters.people
                    ? 'bg-light-surface dark:bg-dark-surface border-light-border-strong dark:border-dark-border-strong'
                    : 'bg-transparent border-light-border-muted dark:border-dark-border-muted'
                }`}
              >
                <Text className={`text-xs font-semibold ${filters.people ? 'text-txt-primary dark:text-txt-dark-primary' : 'text-txt-tertiary dark:text-txt-dark-tertiary'}`}>
                  {t('People')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={mergedResults}
        keyExtractor={item => `${item.type}-${item.item.id}`}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        className="flex-1"
        onEndReached={loadMorePeople}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshResults}
            tintColor={colors.text.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <EventAccessModals
        selectedEvent={selectedEvent}
        showTicketModal={showTicketModal}
        showRSVPModal={showRSVPModal}
        showInviteModal={showInviteModal}
        onTicketAction={handleTicketAction}
        onRSVPAction={handleRSVPAction}
        onInviteAction={handleInviteAction}
        onTicketDismiss={handleTicketModalDismiss}
        onRSVPDismiss={handleRSVPModalDismiss}
        onInviteDismiss={handleInviteModalDismiss}
        isProcessing={isProcessing}
        actionResult={actionResult}
      />
    </View>
  );
}
