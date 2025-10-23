import React, { useEffect, useRef } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  View, 
  Keyboard,
  Animated,
  Dimensions
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type KeyboardAwareContainerProps = {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  keyboardVerticalOffset?: number;
  enableOnAndroid?: boolean;
  enableAutomaticScroll?: boolean;
  extraScrollHeight?: number;
  showsVerticalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
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
  onKeyboardShow,
  onKeyboardHide,
}: KeyboardAwareContainerProps) {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const keyboardHeightValue = event.endCoordinates.height;
        Animated.timing(keyboardHeight, {
          toValue: keyboardHeightValue,
          duration: Platform.OS === 'ios' ? 250 : 0,
          useNativeDriver: false,
        }).start();
        
        onKeyboardShow?.();
        
        if (enableAutomaticScroll && scrollViewRef.current) {
          // Scroll to bottom when keyboard appears
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 0,
          useNativeDriver: false,
        }).start();
        
        onKeyboardHide?.();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardHeight, onKeyboardShow, onKeyboardHide, enableAutomaticScroll]);

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        style={[{ flex: 1 }, style]}
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            { flexGrow: 1, paddingBottom: extraScrollHeight },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          automaticallyAdjustKeyboardInsets={true}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Android implementation
  return (
    <View style={[{ flex: 1 }, style]}>
      <Animated.View
        style={{
          flex: 1,
          paddingBottom: keyboardHeight,
        }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            { flexGrow: 1, paddingBottom: extraScrollHeight },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
