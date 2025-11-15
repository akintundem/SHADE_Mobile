import { useState, useCallback } from 'react';
import { EventFeedResponse, FeedPost, EventFeedRequest } from '../types';
import { eventService } from '../services/eventService';
import { ErrorHandler } from '../utils/errorHandler';

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
  loadFeed: (page: number, postType?: string) => Promise<void>;
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

  const loadFeed = useCallback(
    async (page: number, postType?: string) => {
      if (!eventId) {
        setError(new Error('Event ID is required'));
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params: EventFeedRequest = {
          page,
          size: 20,
        };

        if (postType && postType !== 'ALL') {
          params.postType = postType as any;
        }

        const feedData: EventFeedResponse = await eventService.getEventFeed(
          eventId,
          params,
        );

        if (page === 0) {
          // First page - replace posts
          setPosts(feedData.posts);
        } else {
          // Subsequent pages - append posts (avoid duplicates)
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newPosts = feedData.posts.filter(
              p => !existingIds.has(p.id),
            );
            return [...prev, ...newPosts];
          });
        }

        setCurrentPage(feedData.currentPage);
        setHasNext(feedData.hasNext);
        setHasPrevious(feedData.hasPrevious);
        setTotalPosts(feedData.totalPosts);
        setTotalPages(feedData.totalPages);
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        ErrorHandler.handle(err, 'useEventFeed');
      } finally {
        setLoading(false);
      }
    },
    [eventId],
  );

  const loadMore = useCallback(async () => {
    if (hasNext && !loading) {
      await loadFeed(currentPage + 1);
    }
  }, [hasNext, loading, currentPage, loadFeed]);

  const refresh = useCallback(async () => {
    await loadFeed(0);
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
  };
};

