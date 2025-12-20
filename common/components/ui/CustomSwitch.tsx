import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export default function CustomSwitch({ value, onValueChange, disabled = false }: Props) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      tension: 300,
      friction: 25,
    }).start();
  }, [value, translateX]);

  const TRACK_WIDTH = 40;
  const TRACK_HEIGHT = 22;
  const THUMB_SIZE = 18;
  const THUMB_MARGIN = 2;

  const thumbTranslateX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_MARGIN, TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN],
  });

  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: value ? colors.text.primary : colors.border,
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Animated.View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: colors.background,
            transform: [{ translateX: thumbTranslateX }],
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

