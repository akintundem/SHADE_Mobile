import { useCallback, useMemo } from 'react';
import { ticketService } from '../../../../core/tickets/services/ticket';
import type {
  PaginatedTicketResponse,
  TicketResponse,
  TicketTypeResponse,
} from '../../../../core/tickets/types/ticket';
import { CACHE_CONFIG } from '../../../../common/utils/constants';
import { useCachedResource } from '../../hooks';

type TicketsData = {
  tickets: TicketResponse[];
  ticketTypes: TicketTypeResponse[];
  totalTickets: number;
};

export function useTicketsData(eventId: string | null) {
  const key = eventId ? `tickets:${eventId}` : null;

  const fetcher = useCallback(async (): Promise<TicketsData> => {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    const [ticketsData, ticketTypesData] = await Promise.all([
      ticketService.getTicketsByEvent(eventId, { size: 100 }),
      ticketService.getTicketTypes(eventId),
    ]);

    const ticketsResponse = ticketsData as PaginatedTicketResponse;

    return {
      tickets: ticketsResponse?.content ?? [],
      totalTickets: ticketsResponse?.totalElements ?? 0,
      ticketTypes: ticketTypesData ?? [],
    };
  }, [eventId]);

  const { data, loading, error, refresh, setData } = useCachedResource<TicketsData>({
    key,
    fetcher,
    ttlMs: CACHE_CONFIG.EVENTS_CACHE_DURATION,
    enabled: Boolean(eventId),
    initialData: { tickets: [], ticketTypes: [], totalTickets: 0 },
  });

  const memo = useMemo(
    () => ({
      tickets: data?.tickets ?? [],
      ticketTypes: data?.ticketTypes ?? [],
      totalTickets: data?.totalTickets ?? 0,
      loading,
      error,
      refresh,
      setData,
    }),
    [data, loading, error, refresh, setData]
  );

  return memo;
}
