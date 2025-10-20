import React from 'react';
import { Animated, Dimensions } from 'react-native';

// Dynamic import to handle cases where gesture handler might not be available
let PanGestureHandler: any = null;
let State: any = null;
try {
  const gestureHandler = require('react-native-gesture-handler');
  PanGestureHandler = gestureHandler.PanGestureHandler;
  State = gestureHandler.State;
} catch (error) {
  console.warn('Gesture handler not available:', error);
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SwipeGestureConfig {
  direction: 'left' | 'right' | 'up' | 'down';
  threshold?: number;
  velocity?: number;
  onSwipe: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export class GestureHandler {
  static createSwipeGesture(config: SwipeGestureConfig) {
    const {
      direction,
      threshold = 50,
      velocity = 0.3,
      onSwipe,
      onSwipeStart,
      onSwipeEnd,
    } = config;

    const translateX = new Animated.Value(0);
    const translateY = new Animated.Value(0);
    const opacity = new Animated.Value(1);

    const onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: translateX,
            translationY: translateY,
          },
        },
      ],
      { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
      if (event.nativeEvent.state === State.BEGAN) {
        onSwipeStart?.();
      }

      if (event.nativeEvent.state === State.END) {
        const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;
        
        let shouldSwipe = false;
        
        switch (direction) {
          case 'left':
            shouldSwipe = translationX < -threshold || velocityX < -velocity;
            break;
          case 'right':
            shouldSwipe = translationX > threshold || velocityX > velocity;
            break;
          case 'up':
            shouldSwipe = translationY < -threshold || velocityY < -velocity;
            break;
          case 'down':
            shouldSwipe = translationY > threshold || velocityY > velocity;
            break;
        }

        if (shouldSwipe) {
          // Animate out
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: direction === 'left' ? -SCREEN_WIDTH : direction === 'right' ? SCREEN_WIDTH : 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: direction === 'up' ? -SCREEN_HEIGHT : direction === 'down' ? SCREEN_HEIGHT : 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onSwipe();
            onSwipeEnd?.();
          });
        } else {
          // Animate back to original position
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    };

    return {
      translateX,
      translateY,
      opacity,
      onGestureEvent,
      onHandlerStateChange,
    };
  }

  static createPullToRefresh(
    onRefresh: () => Promise<void>,
    refreshing: boolean
  ) {
    const translateY = new Animated.Value(0);
    const scale = new Animated.Value(1);

    const onScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: translateY } } }],
      { useNativeDriver: true }
    );

    const onScrollBeginDrag = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const onScrollEndDrag = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return {
      translateY,
      scale,
      onScroll,
      onScrollBeginDrag,
      onScrollEndDrag,
    };
  }

  static createSwipeToDismiss(
    onDismiss: () => void,
    direction: 'left' | 'right' = 'right'
  ) {
    const translateX = new Animated.Value(0);
    const opacity = new Animated.Value(1);

    const onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX } }],
      { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        const { translationX: tx, velocityX } = event.nativeEvent;
        const threshold = SCREEN_WIDTH * 0.3;
        const velocity = 0.5;

        const shouldDismiss = 
          (direction === 'right' && (tx > threshold || velocityX > velocity)) ||
          (direction === 'left' && (tx < -threshold || velocityX < -velocity));

        if (shouldDismiss) {
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(onDismiss);
        } else {
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    };

    return {
      translateX,
      opacity,
      onGestureEvent,
      onHandlerStateChange,
    };
  }
}

// HOC for adding swipe-to-dismiss functionality
export const withSwipeToDismiss = <P extends object>(
  Component: React.ComponentType<P>,
  direction: 'left' | 'right' = 'right'
) => {
  return React.forwardRef<any, P & { onDismiss: () => void }>((props, ref) => {
    const { onDismiss, ...restProps } = props;
    const gesture = GestureHandler.createSwipeToDismiss(onDismiss, direction);

    return (
      <PanGestureHandler
        onGestureEvent={gesture.onGestureEvent}
        onHandlerStateChange={gesture.onHandlerStateChange}
      >
        <Animated.View
          ref={ref}
          style={{
            transform: [{ translateX: gesture.translateX }],
            opacity: gesture.opacity,
          }}
        >
          <Component {...(restProps as P)} />
        </Animated.View>
      </PanGestureHandler>
    );
  });
};
