import { useCallback, useMemo } from 'react';
import { collaborationService } from '../../../../core/collaboration/services/collaboration';
import type {
  CollaboratorInviteResponse,
  EventCollaboratorResponse,
} from '../../../../core/collaboration/types/collaboration';
import { CACHE_CONFIG } from '../../../../common/utils/constants';
import { useCachedResource } from '../../hooks';

type CollaborationData = {
  collaborators: EventCollaboratorResponse[];
  invites: CollaboratorInviteResponse[];
};

export function useCollaborationData(eventId: string | null) {
  const key = eventId ? `collaboration:${eventId}` : null;

  const fetcher = useCallback(async (): Promise<CollaborationData> => {
    if (!eventId) {
      throw new Error('Event ID is required');
    }
    const [collaborators, invites] = await Promise.all([
      collaborationService.getCollaborators(eventId),
      collaborationService.listEventInvites(eventId),
    ]);

    return {
      collaborators: collaborators ?? [],
      invites: invites?.content ?? [],
    };
  }, [eventId]);

  const { data, loading, error, refresh, setData } = useCachedResource<CollaborationData>({
    key,
    fetcher,
    ttlMs: CACHE_CONFIG.EVENTS_CACHE_DURATION,
    enabled: Boolean(eventId),
    initialData: { collaborators: [], invites: [] },
  });

  const memo = useMemo(
    () => ({
      collaborators: data?.collaborators ?? [],
      invites: data?.invites ?? [],
      loading,
      error,
      refresh,
      setData,
    }),
    [data, loading, error, refresh, setData]
  );

  return memo;
}
