import { useMemo } from 'react';
import type { UserEventContext } from '../../../core/events/types/event';
import type { FeedPermissions } from '../types';

export function useFeedPermissions(context?: UserEventContext | null): FeedPermissions {
  return useMemo(() => {
    // Owners and collaborators can always view; everyone else defaults to true (public feed)
    const canView = context?.canViewFeeds ?? true;
    // Only owners/collaborators (and above) can upload to feeds
    const canUpload = (context?.isOwner || context?.isCollaborator) ?? false;

    return {
      canView,
      canUpload,
      userContext: context ?? null,
    };
  }, [context]);
}
