import { useState, useCallback, useEffect, useRef } from 'react';
import {
  EventFeedResponse,
  FeedPost,
  EventFeedRequest,
} from '../../core/events/types/event';
import { eventService } from '../../core/events/services/event';
import { ErrorHandler } from '../utils/errorHandler';

type FeedPostType = 'VIDEO' | 'IMAGE' | 'TEXT';
type FeedFilter = FeedPostType | 'ALL';

type EventFeedMeta = Pick<
  EventFeedResponse,
  | 'eventId'
  | 'eventName'
  | 'description'
  | 'coverImageUrl'
  | 'startDateTime'
  | 'endDateTime'
  | 'hashtag'
  | 'eventWebsiteUrl'
>;

export interface UseEventFeedReturn {
  posts: FeedPost[];
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalPosts: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loadFeed: (page: number, postType?: FeedFilter) => Promise<void>;
  filterByType: (postType: FeedFilter) => Promise<void>;
  feedInfo: EventFeedMeta | null;
  activeFilter: FeedFilter;
}

/**
 * Hook for managing event feed with pagination
 * Supports infinite scroll and filtering by post type
 */
export const useEventFeed = (
  eventId: string,
  initialPage: number = 0,
): UseEventFeedReturn => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [feedInfo, setFeedInfo] = useState<EventFeedMeta | null>(null);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('ALL');
  const hasInitialLoad = useRef(false);
  const loadingRef = useRef(false);
  const lastPostType = useRef<FeedFilter>('ALL');
  const requestIdRef = useRef(0);

  const loadFeed = useCallback(
    async (
      page: number,
      postType?: FeedFilter,
      append: boolean = false,
    ) => {
      if (!eventId) {
        return;
      }

      if (loadingRef.current && append) {
        return;
      }

      loadingRef.current = true;

      try {
        setLoading(true);
        setError(null);

        const nextPostType = postType ?? lastPostType.current;
        lastPostType.current = nextPostType;
        setActiveFilter(nextPostType);

        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        const params: EventFeedRequest = {
          page,
          size: 20,
        };

        if (nextPostType && nextPostType !== 'ALL') {
          params.postType = nextPostType;
        }

        const feedData: EventFeedResponse = await eventService.getEventFeed(
          eventId,
          params,
        );

        if (requestIdRef.current !== requestId) {
          return;
        }

        if (page === 0 || !append) {
          // First page or refresh - replace posts
          setPosts(feedData.posts);
        } else {
          // Subsequent pages - append posts (avoid duplicates)
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newPosts = feedData.posts.filter(
              p => !existingIds.has(p.id),
            );
            return newPosts.length > 0 ? [...prev, ...newPosts] : prev;
          });
        }

        setCurrentPage(feedData.currentPage);
        setHasNext(feedData.hasNext);
        setHasPrevious(feedData.hasPrevious);
        setTotalPosts(feedData.totalPosts);
        setTotalPages(feedData.totalPages);
        setFeedInfo({
          eventId: feedData.eventId,
          eventName: feedData.eventName,
          description: feedData.description,
          coverImageUrl: feedData.coverImageUrl,
          startDateTime: feedData.startDateTime,
          endDateTime: feedData.endDateTime,
          hashtag: feedData.hashtag,
          eventWebsiteUrl: feedData.eventWebsiteUrl,
        });
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        ErrorHandler.handle(err, 'useEventFeed');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [eventId],
  );

  // Initial load on mount
  useEffect(() => {
    if (!hasInitialLoad.current && eventId) {
      hasInitialLoad.current = true;
      loadFeed(initialPage);
    }
  }, [eventId, initialPage, loadFeed]);

  const loadMore = useCallback(async () => {
    if (hasNext && !loading && currentPage !== undefined) {
      await loadFeed(currentPage + 1, lastPostType.current, true);
    }
  }, [hasNext, loading, currentPage, loadFeed]);

  const refresh = useCallback(async () => {
    hasInitialLoad.current = false;
    setPosts([]);
    setCurrentPage(initialPage);
    await loadFeed(initialPage, lastPostType.current);
  }, [initialPage, loadFeed]);

  const filterByType = useCallback(async (postType: FeedFilter) => {
    hasInitialLoad.current = false;
    setPosts([]);
    setCurrentPage(0);
    lastPostType.current = postType;
    await loadFeed(0, postType);
  }, [loadFeed]);

  return {
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
  };
};



