import React, { useMemo } from 'react';
import { PanResponder, View } from 'react-native';

type Props = { enabled?: boolean; onOpen: () => void };

export default function EdgeSwipeToCompose({ enabled = true, onOpen }: Props) {
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt, _gs) => enabled && evt.nativeEvent.pageX <= 20,
        onMoveShouldSetPanResponder: (evt, gs) => enabled && evt.nativeEvent.pageX <= 20 && Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 6,
        onPanResponderMove: (_evt, _gs) => {
          // no-op for now; we could animate a preview here
        },
        onPanResponderRelease: (evt, gs) => {
          if (!enabled) return;
          if (gs.dx > 80) onOpen();
        },
      }),
    [enabled, onOpen],
  );

  if (!enabled) return null as any;

  return (
    <View
      // Edge capture strip on the left side
      {...pan.panHandlers}
      pointerEvents="box-only"
      className="absolute left-0 top-0 bottom-0 w-[18px] z-50"
    />
  );
}
