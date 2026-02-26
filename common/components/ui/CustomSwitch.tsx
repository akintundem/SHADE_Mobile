import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../../theme/designSystem';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export default function CustomSwitch({ value, onValueChange, disabled = false }: Props) {
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
        className={`w-[40px] h-[22px] rounded-[11px] justify-center ${value ? 'bg-txt-primary dark:bg-txt-dark-primary' : 'bg-light-border dark:bg-dark-border'} ${disabled ? 'opacity-50' : 'opacity-100'}`}
      >
        <Animated.View
          className="w-[18px] h-[18px] rounded-[9px] bg-light-background dark:bg-dark-background"
          style={{
            transform: [{ translateX: thumbTranslateX }],
            shadowColor: Colors.dark.text.inverse,
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
