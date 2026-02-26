import { useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../../../navigation/types';

export type EventDashboardRouteParams = {
  eventId?: string;
  [key: string]: any;
};

export function useEventDashboardRoute<T extends EventDashboardRouteParams = EventDashboardRouteParams>() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const params = useMemo(() => (route.params || {}) as T, [route.params]);

  const eventId = useMemo(() => {
    const raw = params?.eventId;
    if (typeof raw !== 'string') {
      return null;
    }
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, [params]);

  return {
    eventId,
    params,
    navigation,
  };
}

