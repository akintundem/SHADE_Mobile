import React, { useMemo } from 'react';
import { Dimensions, PanResponder, View } from 'react-native';

type Props = {
  onDismiss: () => void;
  direction?: 'left' | 'right';
  edgeOnly?: boolean;
  threshold?: number;
  edgeWidth?: number;
};

export default function SwipeToDismiss({
  onDismiss,
  direction = 'left',
  edgeOnly = true,
  threshold = 80,
  edgeWidth = 18,
}: Props) {
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: evt => {
          if (!edgeOnly) return true;
          const { pageX } = evt.nativeEvent as any;
          const screenWidth = Dimensions.get('window').width;
          if (direction === 'left') return pageX >= screenWidth - edgeWidth;
          return pageX <= edgeWidth;
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          const { dx, dy } = gestureState;
          const horizontal = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6;
          if (!horizontal) return false;
          return direction === 'left' ? dx < -6 : dx > 6;
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx } = gestureState;
          if (direction === 'left') {
            if (dx < -threshold) onDismiss();
          } else if (dx > threshold) {
            onDismiss();
          }
        },
      }),
    [direction, edgeOnly, threshold, edgeWidth, onDismiss],
  );

  const baseStyle = { position: 'absolute' as const, top: 0, bottom: 0, zIndex: 60 };
  const width = edgeOnly ? edgeWidth : Dimensions.get('window').width;
  const dynamicStyle = direction === 'left' ? { right: 0, width } : { left: 0, width };
  const style = { ...baseStyle, ...dynamicStyle };

  return (
    <View {...pan.panHandlers} pointerEvents="box-only" style={style} />
  );
}
