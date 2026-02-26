import { useCallback, useEffect, useState } from 'react';
import { authService } from '../../../core/auth/services/authService';
import { userFollowService } from '../../../core/social/services/userFollow';
import type { PublicUserResponse } from '../../../core/auth/types/auth';
import type { FollowStatusResponse, FollowStatsResponse } from '../../../core/social/types/userFollow';
import type { FeedPostResponse } from '../../../core/feeds/types/feeds';

type PublicProfileData = {
  user: PublicUserResponse | null;
  stats: FollowStatsResponse | null;
  followStatus: FollowStatusResponse | null;
  posts: FeedPostResponse[];
  totalPosts: number;
};

type UsePublicProfileOptions = {
  userId: string;
  enabled?: boolean;
};

type UsePublicProfileReturn = {
  data: PublicProfileData;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  hasMorePosts: boolean;
  loadingMorePosts: boolean;
};

const DEFAULT_PAGE_SIZE = 20;

export function usePublicProfile({
  userId,
  enabled = true,
}: UsePublicProfileOptions): UsePublicProfileReturn {
  const [data, setData] = useState<PublicProfileData>({
    user: null,
    stats: null,
    followStatus: null,
    posts: [],
    totalPosts: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [postsPage, setPostsPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);

  const fetchProfileData = useCallback(
    async (_isRefresh: boolean = false) => {
      if (!enabled || !userId) return;

      try {
        // Fetch user, stats, follow status, and posts in parallel
        const [userResponse, statsResponse, followStatusResponse, postsResponse] = await Promise.all([
          authService.getUser(userId),
          userFollowService.getFollowStats(userId),
          userFollowService.getFollowStatus(userId),
          authService.getUserPosts(userId, 0, DEFAULT_PAGE_SIZE),
        ]);

        setData({
          user: userResponse,
          stats: statsResponse,
          followStatus: followStatusResponse,
          posts: postsResponse.posts ?? [],
          totalPosts: postsResponse.totalPosts ?? 0,
        });

        setPostsPage(0);
        setHasMorePosts((postsResponse.posts?.length ?? 0) < (postsResponse.totalPosts ?? 0));
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      }
    },
    [enabled, userId]
  );

  const loadInitial = useCallback(async () => {
    if (!enabled || !userId) return;
    setLoading(true);
    await fetchProfileData(false);
    setLoading(false);
  }, [enabled, fetchProfileData, userId]);

  const refresh = useCallback(async () => {
    if (!enabled || !userId) return;
    setRefreshing(true);
    await fetchProfileData(true);
    setRefreshing(false);
  }, [enabled, fetchProfileData, userId]);

  const loadMorePosts = useCallback(async () => {
    if (!enabled || !userId || loadingMorePosts || !hasMorePosts) return;

    setLoadingMorePosts(true);
    try {
      const nextPage = postsPage + 1;
      const response = await authService.getUserPosts(userId, nextPage, DEFAULT_PAGE_SIZE);
      const newPosts = response.posts ?? [];

      setData(prev => ({
        ...prev,
        posts: [...prev.posts, ...newPosts],
      }));

      setPostsPage(nextPage);
      setHasMorePosts(
        (data.posts.length + newPosts.length) < (response.totalPosts ?? 0)
      );
    } catch (err) {
      // Silently fail for load more
    } finally {
      setLoadingMorePosts(false);
    }
  }, [data.posts.length, enabled, hasMorePosts, loadingMorePosts, postsPage, userId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
    loadMorePosts,
    hasMorePosts,
    loadingMorePosts,
  };
}
