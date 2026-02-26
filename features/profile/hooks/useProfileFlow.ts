import { useCallback, useMemo, useState } from 'react';
import type { ProfileView } from '../types';

const DEFAULT_VIEW: ProfileView = 'profile';

export type UseProfileFlowOptions = {
  initialView?: ProfileView;
};

export type UseProfileFlowReturn = {
  view: ProfileView;
  canGoBack: boolean;
  goTo: (view: ProfileView) => void;
  goBack: () => void;
  reset: () => void;
};

export function useProfileFlow(options: UseProfileFlowOptions = {}): UseProfileFlowReturn {
  const initialView = options.initialView ?? DEFAULT_VIEW;
  const [stack, setStack] = useState<ProfileView[]>([initialView]);

  const view = stack[stack.length - 1] ?? initialView;

  const goTo = useCallback((next: ProfileView) => {
    setStack(prev => {
      const current = prev[prev.length - 1];
      if (current === next) {
        return prev;
      }
      return [...prev, next];
    });
  }, []);

  const goBack = useCallback(() => {
    setStack(prev => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.slice(0, -1);
    });
  }, []);

  const reset = useCallback(() => {
    setStack([initialView]);
  }, [initialView]);

  return useMemo(
    () => ({
      view,
      canGoBack: stack.length > 1,
      goTo,
      goBack,
      reset,
    }),
    [goBack, goTo, reset, stack.length, view]
  );
}
