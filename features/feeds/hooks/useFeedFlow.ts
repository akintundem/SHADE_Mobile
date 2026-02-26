import { useCallback, useMemo, useState } from 'react';
import type { FeedOverlay, FeedPermissions, ThreadPost } from '../types';

export type FeedThreadState = {
  title: string;
  posts: ThreadPost[];
} | null;

export type UseFeedFlowReturn = {
  overlay: FeedOverlay | null;
  thread: FeedThreadState;
  openComposer: () => void;
  openThread: (title: string, posts: ThreadPost[]) => void;
  closeOverlay: () => void;
  handleBack: () => void;
};

type UseFeedFlowOptions = {
  onBack: () => void;
  permissions: FeedPermissions;
};

export function useFeedFlow({ onBack, permissions }: UseFeedFlowOptions): UseFeedFlowReturn {
  const [overlay, setOverlay] = useState<FeedOverlay | null>(null);
  const [thread, setThread] = useState<FeedThreadState>(null);

  const closeOverlay = useCallback(() => {
    setOverlay(null);
    setThread(null);
  }, []);

  const openComposer = useCallback(() => {
    if (!permissions.canUpload) return;
    setThread(null);
    setOverlay('COMPOSE');
  }, [permissions.canUpload]);

  const openThread = useCallback((title: string, posts: ThreadPost[]) => {
    setThread({ title, posts });
    setOverlay('THREAD');
  }, []);

  const handleBack = useCallback(() => {
    if (overlay) {
      closeOverlay();
      return;
    }
    onBack();
  }, [closeOverlay, onBack, overlay]);

  return useMemo(
    () => ({
      overlay,
      thread,
      openComposer,
      openThread,
      closeOverlay,
      handleBack,
    }),
    [closeOverlay, handleBack, openComposer, openThread, overlay, thread]
  );
}
