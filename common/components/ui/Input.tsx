import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps, Platform, ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle & { inputContainer?: ViewStyle };
  inputType?: 'email' | 'password' | 'name' | 'location' | 'event' | 'description' | 'phone' | 'url' | 'date' | 'capacity' | 'category';
  enableNativeAutocomplete?: boolean;
};

const Input = forwardRef<TextInput, Props>(({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputType = 'default',
  enableNativeAutocomplete = true,
  style,
  ...textInputProps
}, ref) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPasswordState, setShowPasswordState] = useState(false);

  // Get native keyboard and autocomplete configuration
  const getNativeConfig = () => {
    const baseConfig = {
      returnKeyType: 'next' as const,
      blurOnSubmit: false,
      enablesReturnKeyAutomatically: true,
    };

    if (!enableNativeAutocomplete) {
      return baseConfig;
    }

    switch (inputType) {
      case 'email':
        return {
          ...baseConfig,
          keyboardType: 'email-address' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
          textContentType: 'emailAddress' as const,
          autoComplete: Platform.OS === 'android' ? 'email' as const : undefined,
        };
      case 'password':
        return {
          ...baseConfig,
          keyboardType: 'default' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
          textContentType: 'newPassword' as const, // iOS: Enables strong password suggestions for sign-up
          autoComplete: Platform.OS === 'ios' ? 'password' as const : (Platform.OS === 'android' ? 'password-new' as const : undefined), // iOS: Triggers AutoFill, Android: Password suggestions
          passwordRules: Platform.OS === 'ios' ? 'required: upper; required: lower; required: digit; required: [-]; minlength: 8; maxlength: 128;' : undefined, // iOS: Password requirements for strong password generation
        };
      case 'phone':
        return {
          ...baseConfig,
          keyboardType: 'phone-pad' as const,
          textContentType: 'telephoneNumber' as const,
          autoComplete: Platform.OS === 'android' ? 'tel' as const : undefined,
        };
      case 'url':
        return {
          ...baseConfig,
          keyboardType: 'url' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
          textContentType: 'URL' as const,
          autoComplete: Platform.OS === 'android' ? 'url' as const : undefined,
        };
      case 'name':
        return {
          ...baseConfig,
          keyboardType: 'default' as const,
          autoCapitalize: 'words' as const,
          textContentType: 'name' as const,
          autoComplete: Platform.OS === 'android' ? 'name' as const : undefined,
        };
      case 'location':
        return {
          ...baseConfig,
          keyboardType: 'default' as const,
          autoCapitalize: 'words' as const,
          textContentType: 'addressCity' as const,
          autoComplete: Platform.OS === 'android' ? 'street-address' as const : undefined,
        };
      case 'date':
        return {
          ...baseConfig,
          keyboardType: 'default' as const,
          textContentType: 'dateTime' as const,
          autoComplete: Platform.OS === 'android' ? 'date' as const : undefined,
        };
      case 'description':
        return {
          ...baseConfig,
          keyboardType: 'default' as const,
          autoCapitalize: 'sentences' as const,
          textContentType: 'none' as const,
          multiline: true,
          numberOfLines: 3,
          textAlignVertical: 'top' as const,
        };
      default:
        return {
          ...baseConfig,
          keyboardType: 'default' as const,
          autoCapitalize: 'sentences' as const,
          autoComplete: Platform.OS === 'android' ? 'off' as const : undefined,
        };
    }
  };

  const nativeConfig = getNativeConfig();

  const isMultiline = textInputProps.multiline || inputType === 'description';
  const alignClass = isMultiline ? 'items-start' : 'items-center';

  // Input container classes
  const getInputContainerClasses = () => {
    const baseClasses = `flex-row ${alignClass} min-h-[52px] rounded-2xl px-xl`;
    const paddingClass = isMultiline ? 'py-md' : 'py-0';
    const borderClass = isFocused ? 'border-2' : 'border';
    
    let borderColorClass = '';
    if (error) {
      borderColorClass = 'border-semantic-error';
    } else if (isFocused) {
      borderColorClass = 'border-brand-primary';
    } else {
      borderColorClass = 'border-light-border dark:border-dark-border';
    }
    
    const bgClass = isFocused 
      ? 'bg-light-background dark:bg-dark-background' 
      : 'bg-light-surface dark:bg-dark-surface';
    
    return `${baseClasses} ${paddingClass} ${borderClass} ${borderColorClass} ${bgClass}`;
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary mb-sm tracking-[0.1px]">
          {label}
        </Text>
      )}
      
      <View className={getInputContainerClasses()} style={containerStyle?.inputContainer}>
        {leftIcon && (
          <View className={`mr-md ${isMultiline ? 'mt-sm' : ''} ${isFocused ? 'opacity-100' : 'opacity-60'}`}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          {...nativeConfig}
          {...textInputProps}
          secureTextEntry={inputType === 'password' ? !showPasswordState : false}
          className={`flex-1 text-sm text-txt-primary dark:text-txt-dark-primary py-sm font-normal ${isMultiline ? 'min-h-[48px]' : 'min-h-[52px]'}`}
          style={[
            {
              textAlignVertical: isMultiline ? 'top' : 'center',
            },
            style,
          ]}
          placeholderTextColor={colors.text.tertiary}
          keyboardAppearance={isDark ? 'dark' : 'light'}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />
        
        {inputType === 'password' && !rightIcon ? (
          <TouchableOpacity
            onPress={() => setShowPasswordState(!showPasswordState)}
            className="ml-md p-md"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
          >
            {showPasswordState ? (
              <EyeOff size={20} color={colors.text.tertiary} />
            ) : (
              <Eye size={20} color={colors.text.tertiary} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            className="ml-md p-xs"
            activeOpacity={0.6}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
      
      {error && (
        <Text className="text-xs text-semantic-error mt-sm font-medium">
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;
