import { useCallback, useState } from 'react';
import { userFollowService } from '../../../core/social/services/userFollow';
import type { FollowStatusResponse } from '../../../core/social/types/userFollow';

type UseFollowActionsOptions = {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
};

type UseFollowActionsReturn = {
  isFollowing: boolean;
  isLoading: boolean;
  error: Error | null;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  toggleFollow: () => Promise<void>;
  refreshStatus: () => Promise<FollowStatusResponse | null>;
};

export function useFollowActions({
  userId,
  initialIsFollowing = false,
  onFollowChange,
}: UseFollowActionsOptions): UseFollowActionsReturn {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const follow = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    // Optimistic update
    const previousState = isFollowing;
    setIsFollowing(true);

    try {
      await userFollowService.followUser(userId);
      onFollowChange?.(true);
    } catch (err) {
      // Revert on error
      setIsFollowing(previousState);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isFollowing, isLoading, onFollowChange, userId]);

  const unfollow = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    // Optimistic update
    const previousState = isFollowing;
    setIsFollowing(false);

    try {
      await userFollowService.unfollowUser(userId);
      onFollowChange?.(false);
    } catch (err) {
      // Revert on error
      setIsFollowing(previousState);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isFollowing, isLoading, onFollowChange, userId]);

  const toggleFollow = useCallback(async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  }, [follow, isFollowing, unfollow]);

  const refreshStatus = useCallback(async (): Promise<FollowStatusResponse | null> => {
    try {
      const status = await userFollowService.getFollowStatus(userId);
      setIsFollowing(status.isFollowing ?? false);
      return status;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    }
  }, [userId]);

  return {
    isFollowing,
    isLoading,
    error,
    follow,
    unfollow,
    toggleFollow,
    refreshStatus,
  };
}
