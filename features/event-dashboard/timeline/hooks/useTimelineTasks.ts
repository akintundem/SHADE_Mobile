import { useCallback, useMemo } from 'react';
import { timelineService } from '../../../../core/timeline/services/timeline';
import type { TaskDetailResponse } from '../../../../core/timeline/types/timeline';
import { CACHE_CONFIG } from '../../../../common/utils/constants';
import { useCachedResource } from '../../hooks';

const sortTasks = (items: TaskDetailResponse[]) => {
  return [...items].sort((a, b) => {
    if (a.taskOrder !== null && b.taskOrder !== null) {
      return (a.taskOrder || 0) - (b.taskOrder || 0);
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });
};

export function useTimelineTasks(eventId: string | null) {
  const key = eventId ? `timeline:${eventId}` : null;

  const fetcher = useCallback(async () => {
    if (!eventId) {
      throw new Error('Event ID is required');
    }
    const data = await timelineService.getAllTasks(eventId);
    const publishedTasks = data.filter(task => !task.isDraft);
    return sortTasks(publishedTasks);
  }, [eventId]);

  const { data, loading, error, refresh, setData } = useCachedResource<TaskDetailResponse[]>({
    key,
    fetcher,
    ttlMs: CACHE_CONFIG.EVENTS_CACHE_DURATION,
    enabled: Boolean(eventId),
    initialData: [],
  });

  const setTasks = useCallback(
    (nextTasks: TaskDetailResponse[]) => {
      setData(sortTasks(nextTasks));
    },
    [setData]
  );

  const memo = useMemo(
    () => ({
      tasks: data ?? [],
      loading,
      error,
      refresh,
      setTasks,
    }),
    [data, loading, error, refresh, setTasks]
  );

  return memo;
}
