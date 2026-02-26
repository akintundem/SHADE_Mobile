import { useCallback, useMemo, useState } from 'react';
import type { SettingsView } from '../types';

const DEFAULT_VIEW: SettingsView = 'main';

export type UseSettingsFlowReturn = {
  view: SettingsView;
  canGoBack: boolean;
  goTo: (view: SettingsView) => void;
  goBack: () => void;
  reset: () => void;
};

export function useSettingsFlow(initialView: SettingsView = DEFAULT_VIEW): UseSettingsFlowReturn {
  const [stack, setStack] = useState<SettingsView[]>([initialView]);

  const view = stack[stack.length - 1] ?? initialView;

  const goTo = useCallback((next: SettingsView) => {
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
