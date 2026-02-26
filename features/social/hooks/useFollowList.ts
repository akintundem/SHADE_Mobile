import { useCallback, useEffect, useState } from 'react';
import { userFollowService } from '../../../core/social/services/userFollow';
import type { UserProfileResponse } from '../../../core/social/types/userFollow';

type ListType = 'followers' | 'following';

type UseFollowListOptions = {
  userId: string;
  type: ListType;
  pageSize?: number;
  enabled?: boolean;
};

type UseFollowListReturn = {
  users: UserProfileResponse[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  totalCount: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
};

const DEFAULT_PAGE_SIZE = 20;

export function useFollowList({
  userId,
  type,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true,
}: UseFollowListOptions): UseFollowListReturn {
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchList = useCallback(
    async (pageNum: number, isRefresh: boolean = false) => {
      if (!enabled || !userId) return;

      try {
        const request = { page: pageNum, size: pageSize };
        const response =
          type === 'followers'
            ? await userFollowService.getFollowers(userId, request)
            : await userFollowService.getFollowing(userId, request);

        const newUsers = response.content ?? [];
        const total = response.totalElements ?? 0;
        const totalPages = response.totalPages ?? 1;

        setTotalCount(total);
        setHasMore(pageNum + 1 < totalPages);

        if (isRefresh || pageNum === 0) {
          setUsers(newUsers);
        } else {
          setUsers(prev => [...prev, ...newUsers]);
        }

        setPage(pageNum);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      }
    },
    [enabled, pageSize, type, userId]
  );

  const loadInitial = useCallback(async () => {
    if (!enabled || !userId) return;
    setLoading(true);
    await fetchList(0, true);
    setLoading(false);
  }, [enabled, fetchList, userId]);

  const refresh = useCallback(async () => {
    if (!enabled || !userId) return;
    setRefreshing(true);
    await fetchList(0, true);
    setRefreshing(false);
  }, [enabled, fetchList, userId]);

  const loadMore = useCallback(async () => {
    if (!enabled || !userId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchList(page + 1, false);
    setLoadingMore(false);
  }, [enabled, fetchList, hasMore, loadingMore, page, userId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    users,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    totalCount,
    refresh,
    loadMore,
  };
}
