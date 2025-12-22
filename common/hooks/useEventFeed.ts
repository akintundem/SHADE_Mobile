import { useState, useCallback, useEffect, useRef } from 'react';
import { FeedPost, EventFeedResponse } from '../../core/events/types/event';

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

const SAMPLE_POSTS: FeedPost[] = [
  {
    id: 'feed-1',
    type: 'TEXT',
    content: 'Welcome to the event feed. Share updates, photos, and moments.',
    authorName: 'Capsule Team',
    authorAvatarUrl: 'https://i.pravatar.cc/150?img=12',
    postedAt: new Date().toISOString(),
    likes: 24,
    comments: 6,
  },
  {
    id: 'feed-2',
    type: 'IMAGE',
    content: 'Soundcheck is ready. Doors open soon!',
    mediaUrl:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
    authorName: 'Alex Morgan',
    authorAvatarUrl: 'https://i.pravatar.cc/150?img=32',
    postedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    likes: 52,
    comments: 10,
  },
  {
    id: 'feed-3',
    type: 'VIDEO',
    content: 'Behind the scenes before the kickoff.',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    authorName: 'Riley Chen',
    authorAvatarUrl: 'https://i.pravatar.cc/150?img=47',
    postedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    likes: 77,
    comments: 14,
  },
  {
    id: 'feed-4',
    type: 'IMAGE',
    content: 'Backstage snapshots before the panel begins.',
    mediaUrl:
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1200&auto=format&fit=crop',
    authorName: 'Jordan Lee',
    authorAvatarUrl: 'https://i.pravatar.cc/150?img=56',
    postedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    likes: 33,
    comments: 5,
  },
  {
    id: 'feed-5',
    type: 'TEXT',
    content: 'Doors are open. See you inside!',
    authorName: 'Event Ops',
    authorAvatarUrl: 'https://i.pravatar.cc/150?img=15',
    postedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    likes: 18,
    comments: 2,
  },
];

const filterPosts = (posts: FeedPost[], postType?: FeedFilter) => {
  if (!postType || postType === 'ALL') {
    return posts;
  }
  return posts.filter(post => post.type === postType);
};

/**
 * Hook for managing event feed with pagination
 * Uses local data to keep feed UI independent of API availability.
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
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [feedInfo, setFeedInfo] = useState<EventFeedMeta | null>(null);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('ALL');
  const hasInitialLoad = useRef(false);
  const lastPostType = useRef<FeedFilter>('ALL');

  const loadFeed = useCallback(
    async (
      page: number,
      postType?: FeedFilter,
      append: boolean = false,
    ) => {
      if (!eventId) {
        return;
      }

      setLoading(true);
      setError(null);

      const nextPostType = postType ?? lastPostType.current;
      lastPostType.current = nextPostType;
      setActiveFilter(nextPostType);

      const filtered = filterPosts(SAMPLE_POSTS, nextPostType);
      const pageSize = 20;
      const start = page * pageSize;
      const pageItems = filtered.slice(start, start + pageSize);

      setPosts(prev => (append ? [...prev, ...pageItems] : pageItems));
      setCurrentPage(page);

      const total = filtered.length;
      const pages = Math.max(1, Math.ceil(total / pageSize));
      setTotalPosts(total);
      setTotalPages(pages);
      setHasNext(page + 1 < pages);
      setHasPrevious(page > 0);
      setFeedInfo(null);

      setLoading(false);
    },
    [eventId],
  );

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

  const filterByType = useCallback(
    async (postType: FeedFilter) => {
      hasInitialLoad.current = false;
      setPosts([]);
      setCurrentPage(0);
      lastPostType.current = postType;
      await loadFeed(0, postType);
    },
    [loadFeed],
  );

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
