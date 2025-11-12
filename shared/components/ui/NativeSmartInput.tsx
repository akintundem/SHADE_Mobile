import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TextInputProps, 
  Platform,
  Keyboard,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Mail, Phone, MapPin, Calendar, User, Lock, Globe } from 'lucide-react-native';

type NativeSmartInputProps = TextInputProps & {
  label?: string;
  error?: string;
  success?: string;
  inputType?: 'email' | 'password' | 'name' | 'location' | 'event' | 'description' | 'phone' | 'url' | 'date' | 'capacity' | 'category';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: any;
  showValidation?: boolean;
};

export default function NativeSmartInput({
  label,
  error,
  success,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputType = 'default',
  showValidation = true,
  style,
  value,
  onChangeText,
  ...textInputProps
}: NativeSmartInputProps) {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get native keyboard and autocomplete configuration
  const getNativeConfig = () => {
    switch (inputType) {
      case 'email':
        return {
          keyboardType: 'email-address' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
          textContentType: 'emailAddress' as const,
          autoComplete: Platform.OS === 'android' ? 'email' as const : undefined,
          // iOS: Uses native email autocomplete from Keychain
          // Android: Uses system email autocomplete
        };
      case 'password':
        return {
          keyboardType: 'default' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
          secureTextEntry: !showPassword,
          textContentType: 'password' as const,
          autoComplete: Platform.OS === 'android' ? 'password' as const : undefined,
          // iOS: Uses native password autocomplete from Keychain
          // Android: Uses system password autocomplete
        };
      case 'phone':
        return {
          keyboardType: 'phone-pad' as const,
          textContentType: 'telephoneNumber' as const,
          autoComplete: Platform.OS === 'android' ? 'tel' as const : undefined,
          // iOS: Uses native phone number autocomplete
          // Android: Uses system phone autocomplete
        };
      case 'url':
        return {
          keyboardType: 'url' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
          textContentType: 'URL' as const,
          autoComplete: Platform.OS === 'android' ? 'url' as const : undefined,
          // iOS: Uses native URL autocomplete
          // Android: Uses system URL autocomplete
        };
      case 'name':
        return {
          keyboardType: 'default' as const,
          autoCapitalize: 'words' as const,
          textContentType: 'name' as const,
          autoComplete: Platform.OS === 'android' ? 'name' as const : undefined,
          // iOS: Uses native name autocomplete from Contacts
          // Android: Uses system name autocomplete
        };
      case 'location':
        return {
          keyboardType: 'default' as const,
          autoCapitalize: 'words' as const,
          textContentType: 'addressCity' as const,
          autoComplete: Platform.OS === 'android' ? 'street-address' as const : undefined,
          // iOS: Uses native location autocomplete from Maps
          // Android: Uses system location autocomplete
        };
      case 'date':
        return {
          keyboardType: 'default' as const,
          textContentType: 'dateTime' as const,
          autoComplete: Platform.OS === 'android' ? 'date' as const : undefined,
          // iOS: Uses native date autocomplete
          // Android: Uses system date autocomplete
        };
      default:
        return {
          keyboardType: 'default' as const,
          autoCapitalize: 'sentences' as const,
          autoComplete: Platform.OS === 'android' ? 'off' as const : undefined,
        };
    }
  };

  // Get appropriate icon for input type
  const getInputIcon = () => {
    if (leftIcon) return leftIcon;
    
    switch (inputType) {
      case 'email':
        return <Mail size={20} color={colors.text.tertiary} />;
      case 'phone':
        return <Phone size={20} color={colors.text.tertiary} />;
      case 'location':
        return <MapPin size={20} color={colors.text.tertiary} />;
      case 'event':
      case 'date':
        return <Calendar size={20} color={colors.text.tertiary} />;
      case 'name':
        return <User size={20} color={colors.text.tertiary} />;
      case 'password':
        return <Lock size={20} color={colors.text.tertiary} />;
      case 'url':
        return <Globe size={20} color={colors.text.tertiary} />;
      default:
        return null;
    }
  };

  const nativeConfig = getNativeConfig();
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

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
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 52,
          borderRadius: borderRadius.lg,
          borderWidth: 1.5,
          borderColor: hasError 
            ? colors.semantic.error 
            : hasSuccess 
            ? colors.semantic.success 
            : isFocused 
            ? colors.brand.primary 
            : colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.lg,
          ...shadows.sm,
        }}
      >
        {getInputIcon() && (
          <View style={{ marginRight: spacing.sm }}>
            {getInputIcon()}
          </View>
        )}
        
        <TextInput
          {...textInputProps}
          {...nativeConfig}
          value={value}
          onChangeText={onChangeText}
          style={[
            {
              flex: 1,
              fontSize: typography.size.base,
              color: colors.text.primary,
              paddingVertical: 0,
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
        
        {/* Password toggle for password inputs */}
        {inputType === 'password' && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ marginLeft: spacing.sm }}
          >
            {showPassword ? (
              <Lock size={20} color={colors.text.secondary} />
            ) : (
              <Lock size={20} color={colors.text.secondary} />
            )}
          </TouchableOpacity>
        )}
        
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
      
      {/* Error Message */}
      {hasError && (
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

      {/* Success Message */}
      {hasSuccess && (
        <Text
          style={{
            fontSize: typography.size.xs,
            color: colors.semantic.success,
            marginTop: spacing.xs,
          }}
        >
          {success}
        </Text>
      )}
    </View>
  );
}
