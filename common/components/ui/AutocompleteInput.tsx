import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  FlatList, 
  TouchableOpacity,
  TextInputProps,
  Platform
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type AutocompleteItem = {
  id: string;
  text: string;
  subtitle?: string;
  icon?: string;
};

type AutocompleteInputProps = TextInputProps & {
  label?: string;
  error?: string;
  success?: string;
  data: AutocompleteItem[];
  onItemSelect?: (item: AutocompleteItem) => void;
  renderItem?: (item: AutocompleteItem) => React.ReactNode;
  maxHeight?: number;
  showSuggestions?: boolean;
  minLength?: number;
  containerStyle?: any;
};

export default function AutocompleteInput({
  label,
  error,
  success,
  data,
  onItemSelect,
  renderItem,
  maxHeight = 200,
  showSuggestions = true,
  minLength = 2,
  containerStyle,
  style,
  value,
  onChangeText,
  ...textInputProps
}: AutocompleteInputProps) {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [filteredData, setFilteredData] = useState<AutocompleteItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Filter data based on input value
  useEffect(() => {
    if (value && value.length >= minLength) {
      const filtered = data.filter(item =>
        item.text.toLowerCase().includes(value.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredData(filtered.slice(0, 10)); // Limit to 10 items
      setShowDropdown(filtered.length > 0 && showSuggestions);
    } else {
      setFilteredData([]);
      setShowDropdown(false);
    }
  }, [value, data, minLength, showSuggestions]);

  // Handle item selection
  const handleItemSelect = (item: AutocompleteItem) => {
    onChangeText?.(item.text);
    setShowDropdown(false);
    onItemSelect?.(item);
    inputRef.current?.blur();
  };

  // Default render item
  const defaultRenderItem = ({ item }: { item: AutocompleteItem }) => (
    <TouchableOpacity
      onPress={() => handleItemSelect(item)}
      style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{
        color: colors.text.primary,
        fontSize: typography.size.base,
        fontWeight: typography.weight.medium,
      }}>
        {item.text}
      </Text>
      {item.subtitle && (
        <Text style={{
          color: colors.text.secondary,
          fontSize: typography.size.sm,
          marginTop: spacing.xs,
        }}>
          {item.subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );

  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  return (
    <View style={[{ position: 'relative' }, containerStyle]}>
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
        <TextInput
          ref={inputRef}
          {...textInputProps}
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
            // Delay hiding dropdown to allow item selection
            setTimeout(() => setShowDropdown(false), 150);
            textInputProps.onBlur?.(e);
          }}
        />
      </View>

      {/* Autocomplete Dropdown */}
      {showDropdown && filteredData.length > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            maxHeight,
            zIndex: 1000,
            ...shadows.lg,
          }}
        >
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem || defaultRenderItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
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
