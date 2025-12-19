import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type KeyboardAwareContainerProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  enableOnAndroid?: boolean;
  enableAutomaticScroll?: boolean;
  extraScrollHeight?: number;
  showsVerticalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  scrollEnabled?: boolean;
  onKeyboardShow?: () => void;
  onKeyboardHide?: () => void;
};

export default function KeyboardAwareContainer({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 20,
  enableOnAndroid = true,
  enableAutomaticScroll = true,
  extraScrollHeight = 20,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
  scrollEnabled = true,
  onKeyboardShow,
  onKeyboardHide,
}: KeyboardAwareContainerProps) {
  const handleKeyboardShow = () => {
    onKeyboardShow?.();
  };

  const handleKeyboardHide = () => {
    onKeyboardHide?.();
  };

  return (
    <KeyboardAwareScrollView
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[
        { flexGrow: 1, paddingBottom: extraScrollHeight },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      enableOnAndroid={enableOnAndroid}
      enableAutomaticScroll={enableAutomaticScroll}
      extraScrollHeight={extraScrollHeight}
      keyboardVerticalOffset={keyboardVerticalOffset}
      enableResetScrollToCoords={false}
      keyboardOpeningTime={0}
      scrollEnabled={scrollEnabled}
      onKeyboardWillShow={Platform.OS === 'ios' ? handleKeyboardShow : undefined}
      onKeyboardWillHide={Platform.OS === 'ios' ? handleKeyboardHide : undefined}
      onKeyboardDidShow={Platform.OS === 'android' ? handleKeyboardShow : undefined}
      onKeyboardDidHide={Platform.OS === 'android' ? handleKeyboardHide : undefined}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
