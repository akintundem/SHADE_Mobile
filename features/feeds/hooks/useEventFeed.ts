import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { eventService } from '../../../core/events/services/event';
import type { EventFeedRequest, EventFeedResponse, FeedPost } from '../../../core/events/types/event';
import { CACHE_CONFIG } from '../../../common/utils/constants';
import type { EventFeedMeta, FeedFilter } from '../types';
import { fetchWithCache, setCachedValue } from '../../../common/utils/cache';
import { mergePostsById } from '../utils/feed';

const DEFAULT_PAGE_SIZE = 20;

const buildCacheKey = (eventId: string, filter: FeedFilter, page: number, size: number) => {
  return `feed:${eventId}:${filter}:${page}:${size}`;
};

const normalizeFilter = (filter?: FeedFilter) => filter ?? 'ALL';

const extractMeta = (response: EventFeedResponse, fallbackEventId: string): EventFeedMeta => ({
  eventId: response.eventId || fallbackEventId,
  eventName: response.eventName ?? null,
  description: response.description ?? null,
  coverImageUrl: response.coverImageUrl ?? null,
  startDateTime: response.startDateTime ?? null,
  endDateTime: response.endDateTime ?? null,
  hashtag: response.hashtag ?? null,
  eventWebsiteUrl: response.eventWebsiteUrl ?? null,
  accessType: response.accessType ?? null,
  userContext: response.userContext ?? null,
  feedsPublicAfterEvent: response.feedsPublicAfterEvent ?? null,
});

export type UseEventFeedOptions = {
  initialPage?: number;
  pageSize?: number;
  enabled?: boolean;
  ttlMs?: number;
  initialFilter?: FeedFilter;
};

export type UseEventFeedReturn = {
  posts: FeedPost[];
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalPosts: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  refresh: (force?: boolean) => Promise<void>;
  loadFeed: (page: number, postType?: FeedFilter, append?: boolean, force?: boolean) => Promise<void>;
  filterByType: (postType: FeedFilter) => Promise<void>;
  feedInfo: EventFeedMeta | null;
  activeFilter: FeedFilter;
};

export const useEventFeed = (eventId: string, options: UseEventFeedOptions = {}): UseEventFeedReturn => {
  const {
    initialPage = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    enabled = true,
    ttlMs = CACHE_CONFIG.EVENTS_CACHE_DURATION,
    initialFilter = 'ALL',
  } = options;

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [feedInfo, setFeedInfo] = useState<EventFeedMeta | null>(null);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>(initialFilter);

  const activeFilterRef = useRef<FeedFilter>(initialFilter);
  const requestIdRef = useRef(0);

  const loadFeed = useCallback(
    async (page: number, postType?: FeedFilter, append = false, force = false) => {
      if (!eventId || !enabled) {
        return;
      }

      const nextFilter = normalizeFilter(postType ?? activeFilterRef.current);
      activeFilterRef.current = nextFilter;
      setActiveFilter(nextFilter);

      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const filterParam = nextFilter === 'ALL' ? undefined : nextFilter;
        const request: EventFeedRequest = {
          page,
          size: pageSize,
          postType: filterParam ?? undefined,
        };
        const cacheKey = buildCacheKey(eventId, nextFilter, page, pageSize);

        const response = await fetchWithCache(
          cacheKey,
          () => eventService.getEventFeed(eventId, request),
          ttlMs,
          { force }
        );

        if (requestIdRef.current !== requestId) {
          return;
        }

        const nextPosts = response.posts ?? [];
        let mergedPosts = nextPosts;
        setPosts(prev => {
          mergedPosts = append ? mergePostsById(prev, nextPosts) : nextPosts;
          return mergedPosts;
        });
        setCurrentPage(response.currentPage ?? page);

        const nextTotalPosts = response.totalPosts ?? mergedPosts.length;
        const nextTotalPages = response.totalPages ?? Math.max(1, Math.ceil(nextTotalPosts / pageSize));
        setTotalPosts(nextTotalPosts);
        setTotalPages(nextTotalPages);

        const hasNextValue = response.hasNext ?? page + 1 < nextTotalPages;
        const hasPreviousValue = response.hasPrevious ?? page > 0;
        setHasNext(Boolean(hasNextValue));
        setHasPrevious(Boolean(hasPreviousValue));

        const meta = extractMeta(response, eventId);
        setFeedInfo(prev => ({ ...(prev ?? meta), ...meta }));
      } catch (err) {
        if (requestIdRef.current === requestId) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [enabled, eventId, pageSize, ttlMs]
  );

  const loadMore = useCallback(async () => {
    if (!hasNext || loading) return;
    await loadFeed(currentPage + 1, activeFilterRef.current, true);
  }, [currentPage, hasNext, loadFeed, loading]);

  const refresh = useCallback(
    async (force?: boolean) => {
      setPosts([]);
      setCurrentPage(initialPage);
      await loadFeed(initialPage, activeFilterRef.current, false, Boolean(force));
    },
    [initialPage, loadFeed]
  );

  const filterByType = useCallback(
    async (postType: FeedFilter) => {
      activeFilterRef.current = postType;
      setPosts([]);
      setCurrentPage(0);
      await loadFeed(0, postType, false, true);
    },
    [loadFeed]
  );

  useEffect(() => {
    if (!eventId || !enabled) {
      setPosts([]);
      setFeedInfo(null);
      setLoading(false);
      return;
    }

    activeFilterRef.current = initialFilter;
    setActiveFilter(initialFilter);
    setPosts([]);
    setCurrentPage(initialPage);
    setHasNext(false);
    setHasPrevious(false);
    setTotalPosts(0);
    setTotalPages(1);

    loadFeed(initialPage, initialFilter);
  }, [enabled, eventId, initialFilter, initialPage, loadFeed]);

  useEffect(() => {
    if (!eventId) return;
    const cacheKey = buildCacheKey(eventId, activeFilterRef.current, 0, pageSize);
    if (posts.length > 0) {
      setCachedValue(cacheKey, {
        eventId,
        posts,
        currentPage,
        totalPosts,
        totalPages,
        hasNext,
        hasPrevious,
        eventName: feedInfo?.eventName ?? null,
        description: feedInfo?.description ?? null,
        coverImageUrl: feedInfo?.coverImageUrl ?? null,
        startDateTime: feedInfo?.startDateTime ?? null,
        endDateTime: feedInfo?.endDateTime ?? null,
        hashtag: feedInfo?.hashtag ?? null,
        eventWebsiteUrl: feedInfo?.eventWebsiteUrl ?? null,
        accessType: feedInfo?.accessType ?? null,
        userContext: feedInfo?.userContext ?? null,
        feedsPublicAfterEvent: feedInfo?.feedsPublicAfterEvent ?? null,
      } as EventFeedResponse, ttlMs);
    }
  }, [eventId, feedInfo, hasNext, hasPrevious, posts, currentPage, totalPages, totalPosts, pageSize, ttlMs]);

  return useMemo(
    () => ({
      posts,
      currentPage,
      hasNext,
      hasPrevious,
      totalPosts,
      totalPages,
      loading,
      error,
      loadMore,
      refresh,
      loadFeed,
      filterByType,
      feedInfo,
      activeFilter,
    }),
    [
      posts,
      currentPage,
      hasNext,
      hasPrevious,
      totalPosts,
      totalPages,
      loading,
      error,
      loadMore,
      refresh,
      loadFeed,
      filterByType,
      feedInfo,
      activeFilter,
    ]
  );
};
