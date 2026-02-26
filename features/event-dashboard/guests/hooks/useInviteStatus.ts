import { useCallback, useState } from 'react';
import { attendeeService } from '../../../../core/attendee/services/attendee';
import { AttendeeInviteStatus, AttendeeResponse } from '../../../../core/attendee/types/attendee';
import { ErrorHandler } from '../../../../common/utils/errorHandler';

type UseInviteStatusOptions = {
  onSuccess?: (attendee?: AttendeeResponse) => void;
};

type UseInviteStatusReturn = {
  isLoading: boolean;
  error: Error | null;
  acceptInvite: (options: { inviteId?: string; token?: string }) => Promise<AttendeeResponse | undefined>;
  declineInvite: (options: { inviteId?: string; token?: string }) => Promise<void>;
};

/**
 * Hook for handling attendee invite status updates
 * Used for accepting/declining invitations via inviteId or email token
 * Typically used in email/deep link flows
 */
export function useInviteStatus({ onSuccess }: UseInviteStatusOptions = {}): UseInviteStatusReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const acceptInvite = useCallback(
    async (options: { inviteId?: string; token?: string }): Promise<AttendeeResponse | undefined> => {
      if (!options.inviteId && !options.token) {
        throw new Error('Either inviteId or token must be provided');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await attendeeService.updateInviteStatus(options, AttendeeInviteStatus.ACCEPTED);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        ErrorHandler.handle(err, 'acceptInvite');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  const declineInvite = useCallback(
    async (options: { inviteId?: string; token?: string }): Promise<void> => {
      if (!options.inviteId && !options.token) {
        throw new Error('Either inviteId or token must be provided');
      }

      setIsLoading(true);
      setError(null);

      try {
        await attendeeService.updateInviteStatus(options, AttendeeInviteStatus.DECLINED);
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        ErrorHandler.handle(err, 'declineInvite');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  return {
    isLoading,
    error,
    acceptInvite,
    declineInvite,
  };
}
