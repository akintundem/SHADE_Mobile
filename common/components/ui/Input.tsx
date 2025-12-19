import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps, Platform } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: any;
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
  const { colors, typography, spacing, borderRadius, shadows, isDark } = useTheme();
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

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            fontSize: typography.size.xs,
            fontWeight: typography.weight.semibold,
            color: colors.text.primary,
            marginBottom: spacing.sm,
            letterSpacing: 0.1,
          }}
        >
          {label}
        </Text>
      )}
      
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: (textInputProps.multiline || inputType === 'description') ? 'flex-start' : 'center',
            minHeight: (textInputProps.multiline || inputType === 'description') ? 52 : 52,
            borderRadius: borderRadius.xl,
            borderWidth: isFocused ? 2 : 1,
            borderColor: error 
              ? colors.semantic.error 
              : isFocused 
                ? colors.brand.primary 
                : colors.border,
            backgroundColor: isFocused ? colors.background : colors.surface,
            paddingHorizontal: spacing.xl,
            paddingVertical: (textInputProps.multiline || inputType === 'description') ? spacing.md : 0,
            transition: 'all 0.2s ease',
          },
          containerStyle?.inputContainer,
        ]}
      >
        {leftIcon && (
          <View style={{ 
            marginRight: spacing.md, 
            marginTop: (textInputProps.multiline || inputType === 'description') ? spacing.sm : 0,
            opacity: isFocused ? 1 : 0.6,
          }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          {...nativeConfig}
          {...textInputProps}
          secureTextEntry={inputType === 'password' ? !showPasswordState : false}
          style={[
            {
              flex: 1,
              fontSize: typography.size.sm,
              color: colors.text.primary,
              paddingVertical: spacing.sm,
              minHeight: (textInputProps.multiline || inputType === 'description') ? 48 : 52,
              textAlignVertical: (textInputProps.multiline || inputType === 'description') ? 'top' : 'center',
              fontWeight: typography.weight.regular,
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
            style={{ 
              marginLeft: spacing.md,
              padding: spacing.xs,
            }}
            activeOpacity={0.6}
          >
            {showPasswordState ? (
              <EyeOff size={18} color={colors.text.tertiary} />
            ) : (
              <Eye size={18} color={colors.text.tertiary} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={{ 
              marginLeft: spacing.md,
              padding: spacing.xs,
            }}
            activeOpacity={0.6}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
      
      {error && (
        <Text
          style={{
            fontSize: typography.size.xs,
            color: colors.semantic.error,
            marginTop: spacing.sm,
            fontWeight: typography.weight.medium,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;
