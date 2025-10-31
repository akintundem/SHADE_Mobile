import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps, Platform } from 'react-native';
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
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

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
          textContentType: 'password' as const,
          autoComplete: Platform.OS === 'android' ? 'password' as const : undefined,
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
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium,
            color: colors.text.primary,
            marginBottom: spacing.xs,
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
            borderRadius: borderRadius.lg,
            borderWidth: 1.5,
            borderColor: error ? colors.semantic.error : isFocused ? colors.brand.primary : colors.border,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.lg,
            paddingVertical: (textInputProps.multiline || inputType === 'description') ? spacing.sm : spacing.md,
            ...shadows.sm,
          },
          containerStyle?.inputContainer,
        ]}
      >
        {leftIcon && <View style={{ marginRight: spacing.sm, marginTop: (textInputProps.multiline || inputType === 'description') ? spacing.xs : 0 }}>{leftIcon}</View>}
        
        <TextInput
          ref={ref}
          {...nativeConfig}
          {...textInputProps}
          style={[
            {
              flex: 1,
              fontSize: typography.size.base,
              color: colors.text.primary,
              paddingVertical: 0,
              minHeight: (textInputProps.multiline || inputType === 'description') ? 48 : 44,
              textAlignVertical: (textInputProps.multiline || inputType === 'description') ? 'top' : 'center',
            },
            style,
          ]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={{ marginLeft: spacing.sm }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text
          style={{
            fontSize: typography.size.xs,
            color: colors.semantic.error,
            marginTop: spacing.xs,
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
