import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CACHE_CONFIG } from '../../../common/utils/constants';
import { authService } from '../../../core/auth/services/authService';
import { attendeeService } from '../../../core/attendee/services/attendee';
import { eventService } from '../../../core/events/services/event';
import type { EventResponse } from '../../../core/events/types';
import type { FeedPostResponse, PostListResponse } from '../../../core/feeds/types/feeds';
import { userFollowService } from '../../../core/social/services/userFollow';
import type { ProfileSection, ProfileStats } from '../types';
import { fetchWithCache, getCachedValue } from '../../../common/utils/cache';

const DEFAULT_PAGE_SIZE = 20;

type SectionResult<T> = {
  items: T[];
  total: number;
};

type UseProfileDataOptions = {
  userId?: string | null;
  section: ProfileSection;
  pageSize?: number;
  enabled?: boolean;
};

type UseProfileDataReturn = {
  events: EventResponse[];
  invitedEvents: EventResponse[];
  posts: FeedPostResponse[];
  totals: {
    events: number;
    invited: number;
    posts: number;
  };
  stats: ProfileStats;
  loading: boolean;
  refreshing: boolean;
  statsLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadSection: (next: ProfileSection, options?: { force?: boolean; showLoading?: boolean }) => Promise<void>;
};

const buildSectionCacheKey = (userId: string, section: ProfileSection, pageSize: number) => {
  return `profile:${userId}:${section}:${pageSize}`;
};

const buildStatsCacheKey = (userId: string) => {
  return `profile:${userId}:stats`;
};

const defaultStats: ProfileStats = {
  followers: 0,
  following: 0,
  events: 0,
  posts: 0,
};

export function useProfileData({
  userId,
  section,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true,
}: UseProfileDataOptions): UseProfileDataReturn {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [invitedEvents, setInvitedEvents] = useState<EventResponse[]>([]);
  const [posts, setPosts] = useState<FeedPostResponse[]>([]);
  const [totals, setTotals] = useState({ events: 0, invited: 0, posts: 0 });
  const [stats, setStats] = useState<ProfileStats>(defaultStats);
  const [loadingSection, setLoadingSection] = useState<ProfileSection | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const requestIdRef = useRef({ events: 0, invited: 0, posts: 0, stats: 0 });

  useEffect(() => {
    if (!userId || !enabled) {
      setEvents([]);
      setInvitedEvents([]);
      setPosts([]);
      setTotals({ events: 0, invited: 0, posts: 0 });
      setStats(defaultStats);
      setLoadingSection(null);
      setRefreshing(false);
      setStatsLoading(false);
      setError(null);
    }
  }, [enabled, userId]);

  const loadStats = useCallback(
    async (force = false) => {
      if (!userId || !enabled) return;

      const requestId = ++requestIdRef.current.stats;
      const cacheKey = buildStatsCacheKey(userId);
      const cached = getCachedValue<ProfileStats>(cacheKey);

      if (!cached) {
        setStatsLoading(true);
      }

      try {
        const result = await fetchWithCache(
          cacheKey,
          async () => {
            const response = await userFollowService.getFollowStats(userId);
            return {
              followers: response.followersCount ?? 0,
              following: response.followingCount ?? 0,
              events: 0,
              posts: 0,
            } satisfies ProfileStats;
          },
          CACHE_CONFIG.USER_CACHE_DURATION,
          { force }
        );

        if (requestIdRef.current.stats !== requestId) return;
        setStats(prev => ({ ...prev, followers: result.followers, following: result.following }));
      } catch (err) {
        if (requestIdRef.current.stats === requestId) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (requestIdRef.current.stats === requestId) {
          setStatsLoading(false);
        }
      }
    },
    [enabled, userId]
  );

  const fetchEvents = useCallback(
    async (): Promise<SectionResult<EventResponse>> => {
      if (!userId) return { items: [], total: 0 };
      const response = await eventService.listMyEvents({ page: 0, size: pageSize });
      const items = response.content ?? [];
      return { items, total: response.totalElements ?? items.length };
    },
    [pageSize, userId]
  );

  const fetchInvitedEvents = useCallback(
    async (): Promise<SectionResult<EventResponse>> => {
      if (!userId) return { items: [], total: 0 };
      const response = await attendeeService.getInvitedEvents({ page: 0, size: pageSize });
      const items = response.content ?? [];
      return { items, total: response.totalElements ?? items.length };
    },
    [pageSize, userId]
  );

  const fetchPosts = useCallback(
    async (): Promise<SectionResult<FeedPostResponse>> => {
      if (!userId) return { items: [], total: 0 };
      const response: PostListResponse = await authService.getMyPosts(0, pageSize);
      const items = response.posts ?? [];
      return { items, total: response.totalPosts ?? items.length };
    },
    [pageSize, userId]
  );

  const loadSection = useCallback(
    async (nextSection: ProfileSection, options?: { force?: boolean; showLoading?: boolean }) => {
      if (!userId || !enabled) return;

      const force = Boolean(options?.force);
      const requestId = ++requestIdRef.current[nextSection];
      const cacheKey = buildSectionCacheKey(userId, nextSection, pageSize);
      const cached = getCachedValue<SectionResult<unknown>>(cacheKey);

      if (!cached && options?.showLoading !== false && !refreshing) {
        setLoadingSection(nextSection);
      }

      setError(null);

      try {
        let result: SectionResult<EventResponse | FeedPostResponse>;
        if (nextSection === 'events') {
          result = await fetchWithCache(cacheKey, fetchEvents, CACHE_CONFIG.EVENTS_CACHE_DURATION, { force });
          if (requestIdRef.current.events !== requestId) return;
          const typed = result as SectionResult<EventResponse>;
          setEvents(typed.items);
          setTotals(prev => ({ ...prev, events: typed.total }));
          setStats(prev => ({ ...prev, events: typed.total }));
        } else if (nextSection === 'invited') {
          result = await fetchWithCache(cacheKey, fetchInvitedEvents, CACHE_CONFIG.EVENTS_CACHE_DURATION, { force });
          if (requestIdRef.current.invited !== requestId) return;
          const typed = result as SectionResult<EventResponse>;
          setInvitedEvents(typed.items);
          setTotals(prev => ({ ...prev, invited: typed.total }));
        } else {
          result = await fetchWithCache(cacheKey, fetchPosts, CACHE_CONFIG.DEFAULT_DURATION, { force });
          if (requestIdRef.current.posts !== requestId) return;
          const typed = result as SectionResult<FeedPostResponse>;
          setPosts(typed.items);
          setTotals(prev => ({ ...prev, posts: typed.total }));
          setStats(prev => ({ ...prev, posts: typed.total }));
        }
      } catch (err) {
        if (requestIdRef.current[nextSection] === requestId) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (requestIdRef.current[nextSection] === requestId) {
          setLoadingSection(prev => (prev === nextSection ? null : prev));
        }
      }
    },
    [enabled, fetchEvents, fetchInvitedEvents, fetchPosts, pageSize, refreshing, userId]
  );

  const refresh = useCallback(async () => {
    if (!userId || !enabled) return;
    setRefreshing(true);
    await Promise.all([loadStats(true), loadSection(section, { force: true, showLoading: false })]);
    setRefreshing(false);
  }, [enabled, loadSection, loadStats, section, userId]);

  useEffect(() => {
    if (!userId || !enabled) return;
    loadStats(false);
  }, [enabled, loadStats, userId]);

  useEffect(() => {
    if (!userId || !enabled) return;
    loadSection(section);
  }, [enabled, loadSection, section, userId]);

  return useMemo(
    () => ({
      events,
      invitedEvents,
      posts,
      totals,
      stats,
      loading: loadingSection === section && !refreshing,
      refreshing,
      statsLoading,
      error,
      refresh,
      loadSection,
    }),
    [
      events,
      invitedEvents,
      posts,
      totals,
      stats,
      loadingSection,
      section,
      refreshing,
      statsLoading,
      error,
      refresh,
      loadSection,
    ]
  );
}
