import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInputProps, 
  Keyboard,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react-native';

type Suggestion = {
  id: string;
  text: string;
  type?: 'email' | 'name' | 'location' | 'event' | 'category';
  icon?: string;
};

type Props = TextInputProps & {
  label?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: any;
  suggestions?: Suggestion[];
  onSuggestionSelect?: (suggestion: Suggestion) => void;
  showSuggestions?: boolean;
  inputType?: 'email' | 'password' | 'name' | 'location' | 'event' | 'description' | 'phone' | 'url';
  autoSuggest?: boolean;
  validationRules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
  showValidation?: boolean;
  animated?: boolean;
};

export default function EnhancedInput({
  label,
  error,
  success,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = true,
  inputType = 'default',
  autoSuggest = true,
  validationRules,
  showValidation = true,
  animated = true,
  style,
  value,
  onChangeText,
  ...textInputProps
}: Props) {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  // Auto-suggestions based on input type
  const getAutoSuggestions = (inputValue: string, type: string): Suggestion[] => {
    if (!inputValue || inputValue.length < 2) return [];

    const commonSuggestions: Record<string, Suggestion[]> = {
      email: [
        { id: 'gmail', text: 'gmail.com', type: 'email' },
        { id: 'yahoo', text: 'yahoo.com', type: 'email' },
        { id: 'outlook', text: 'outlook.com', type: 'email' },
        { id: 'icloud', text: 'icloud.com', type: 'email' },
      ],
      location: [
        { id: 'nyc', text: 'New York, NY', type: 'location' },
        { id: 'la', text: 'Los Angeles, CA', type: 'location' },
        { id: 'chicago', text: 'Chicago, IL', type: 'location' },
        { id: 'miami', text: 'Miami, FL', type: 'location' },
        { id: 'seattle', text: 'Seattle, WA', type: 'location' },
      ],
      event: [
        { id: 'conference', text: 'Tech Conference', type: 'event' },
        { id: 'workshop', text: 'Workshop', type: 'event' },
        { id: 'meetup', text: 'Meetup', type: 'event' },
        { id: 'seminar', text: 'Seminar', type: 'event' },
        { id: 'networking', text: 'Networking Event', type: 'event' },
      ],
      category: [
        { id: 'tech', text: 'Technology', type: 'category' },
        { id: 'business', text: 'Business', type: 'category' },
        { id: 'education', text: 'Education', type: 'category' },
        { id: 'health', text: 'Health & Wellness', type: 'category' },
        { id: 'entertainment', text: 'Entertainment', type: 'category' },
      ]
    };

    const typeSuggestions = commonSuggestions[type] || [];
    return typeSuggestions.filter(suggestion => 
      suggestion.text.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  // Validation function
  const validateInput = (inputValue: string): string | null => {
    if (!validationRules) return null;

    if (validationRules.required && !inputValue.trim()) {
      return 'This field is required';
    }

    if (validationRules.minLength && inputValue.length < validationRules.minLength) {
      return `Minimum ${validationRules.minLength} characters required`;
    }

    if (validationRules.maxLength && inputValue.length > validationRules.maxLength) {
      return `Maximum ${validationRules.maxLength} characters allowed`;
    }

    if (validationRules.pattern && !validationRules.pattern.test(inputValue)) {
      return 'Invalid format';
    }

    if (validationRules.custom) {
      return validationRules.custom(inputValue);
    }

    return null;
  };

  // Handle text change with validation and suggestions
  const handleTextChange = (text: string) => {
    onChangeText?.(text);
    
    if (showValidation && validationRules) {
      setIsValidating(true);
      const validationResult = validateInput(text);
      setValidationError(validationResult);
      setIsValidating(false);
    }

    if (autoSuggest && showSuggestions) {
      const autoSuggestions = getAutoSuggestions(text, inputType);
      const combinedSuggestions = [...autoSuggestions, ...suggestions];
      const filtered = combinedSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(text.toLowerCase()) &&
        suggestion.text.toLowerCase() !== text.toLowerCase()
      );
      setFilteredSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    onChangeText?.(suggestion.text);
    setFilteredSuggestions([]);
    onSuggestionSelect?.(suggestion);
    inputRef.current?.blur();
  };

  // Animation effects
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: isFocused ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: isFocused ? 0 : -10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, animated, fadeAnim, slideAnim]);

  // Keyboard type and auto-complete based on input type
  const getKeyboardConfig = () => {
    switch (inputType) {
      case 'email':
        return {
          keyboardType: 'email-address' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
          textContentType: 'emailAddress' as const,
        };
      case 'password':
        return {
          keyboardType: 'default' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
          secureTextEntry: !showPassword,
          textContentType: 'password' as const,
        };
      case 'phone':
        return {
          keyboardType: 'phone-pad' as const,
          textContentType: 'telephoneNumber' as const,
        };
      case 'url':
        return {
          keyboardType: 'url' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
          textContentType: 'URL' as const,
        };
      case 'name':
        return {
          keyboardType: 'default' as const,
          autoCapitalize: 'words' as const,
          textContentType: 'name' as const,
        };
      default:
        return {
          keyboardType: 'default' as const,
          autoCapitalize: 'sentences' as const,
        };
    }
  };

  const keyboardConfig = getKeyboardConfig();
  const hasError = !!error || !!validationError;
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
        {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}
        
        <TextInput
          ref={inputRef}
          {...textInputProps}
          {...keyboardConfig}
          value={value}
          onChangeText={handleTextChange}
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
            setFilteredSuggestions([]);
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
              <EyeOff size={20} color={colors.text.secondary} />
            ) : (
              <Eye size={20} color={colors.text.secondary} />
            )}
          </TouchableOpacity>
        )}
        
        {/* Validation status icon */}
        {showValidation && value && (
          <View style={{ marginLeft: spacing.sm }}>
            {isValidating ? (
              <Text style={{ color: colors.text.secondary }}>...</Text>
            ) : hasError ? (
              <AlertCircle size={16} color={colors.semantic.error} />
            ) : (
              <Check size={16} color={colors.semantic.success} />
            )}
          </View>
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

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && isFocused && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            maxHeight: 200,
            zIndex: 1000,
            ...shadows.lg,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSuggestionSelect(item)}
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{
                  color: colors.text.primary,
                  fontSize: typography.size.sm,
                }}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}
      
      {/* Error Message */}
      {hasError && (
        <Text
          style={{
            fontSize: typography.size.xs,
            color: colors.semantic.error,
            marginTop: spacing.xs,
          }}
        >
          {error || validationError}
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
