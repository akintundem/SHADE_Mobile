import { useCallback, useEffect, useRef, useState } from 'react';
import { collaborationService } from '../../../core/collaboration/services/collaboration';
import { CollaboratorInviteResponse } from '../../../core/collaboration/types/collaboration';
import { ErrorHandler } from '../../../common/utils/errorHandler';

export function useCollaboratorInvites() {
  const [invites, setInvites] = useState<CollaboratorInviteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false);

  const fetchInvites = useCallback(async (force = false) => {
    if (loadingRef.current && !force) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const data = await collaborationService.listMyInvites();
      setInvites(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      ErrorHandler.handle(err, 'listCollaboratorInvites');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const acceptInvite = useCallback(async (inviteId: string) => {
    try {
      await collaborationService.acceptInvite(inviteId);
      await fetchInvites(true);
    } catch (err) {
      ErrorHandler.handle(err, 'acceptCollaboratorInvite');
      throw err;
    }
  }, [fetchInvites]);

  const declineInvite = useCallback(async (inviteId: string) => {
    try {
      await collaborationService.declineInvite(inviteId);
      await fetchInvites(true);
    } catch (err) {
      ErrorHandler.handle(err, 'declineCollaboratorInvite');
      throw err;
    }
  }, [fetchInvites]);

  return {
    invites,
    loading,
    error,
    refresh: () => fetchInvites(true),
    acceptInvite,
    declineInvite,
  };
}
