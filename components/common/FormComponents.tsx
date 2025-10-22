import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

// Section Component
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, typography, spacing } = useTheme();
  
  return (
    <View>
      <Text style={{ 
        color: colors.text.primary,
        fontSize: typography.size.lg,
        fontWeight: '700',
        marginBottom: spacing.md
      }}>
        {title}
      </Text>
      <View style={{ gap: spacing.md }}>
        {children}
      </View>
    </View>
  );
}

// Field Label Component
export function FieldLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  const { colors, spacing } = useTheme();
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
      {icon}
      <Text style={{ 
        color: colors.text.primary,
        fontWeight: '600',
        fontSize: 14
      }}>
        {label}
      </Text>
    </View>
  );
}

// Input Component
interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  style?: any;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  [key: string]: any;
}

export function Input({ 
  placeholder, 
  style, 
  value, 
  onChangeText, 
  error,
  onBlur,
  ...props 
}: InputProps) {
  const { colors, borderRadius, spacing } = useTheme();
  const hasError = !!error;
  
  return (
    <View>
      <View
        style={[
          {
            borderWidth: 1,
            borderColor: hasError ? colors.semantic.error : colors.border,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            height: props.multiline ? undefined : 48,
            minHeight: props.multiline ? 80 : 48,
            justifyContent: props.multiline ? 'flex-start' : 'center',
            backgroundColor: colors.surface,
          },
          style,
        ]}
      >
        <TextInput 
          placeholder={placeholder} 
          placeholderTextColor={colors.text.tertiary} 
          style={{ 
            color: colors.text.primary,
            fontSize: 16,
            paddingTop: props.multiline ? spacing.md : 0,
            textAlignVertical: props.multiline ? 'top' : 'center'
          }} 
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          {...props}
        />
      </View>
      {hasError && (
        <Text style={{ 
          color: colors.semantic.error, 
          fontSize: 12, 
          marginTop: spacing.xs,
          marginLeft: spacing.xs 
        }}>
          {error}
        </Text>
      )}
    </View>
  );
}

// Select Input Component
interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function SelectInput({ value, onValueChange, options, placeholder = 'Select an option' }: SelectInputProps) {
  const { colors, borderRadius, spacing } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: borderRadius.lg,
          paddingHorizontal: spacing.md,
          height: 48,
          justifyContent: 'center',
          backgroundColor: colors.surface,
        }}
      >
        <Text style={{ color: colors.text.primary }}>
          {selectedOption?.label || placeholder}
        </Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.surface,
          marginTop: spacing.xs,
          overflow: 'hidden',
          maxHeight: 200
        }}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                backgroundColor: value === option.value ? colors.brand.primary : 'transparent'
              }}
            >
              <Text style={{ 
                color: value === option.value ? colors.text.inverse : colors.text.primary
              }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// Toggle Row Component
interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: React.ReactNode;
  description?: string;
}

export function ToggleRow({ 
  label, 
  value, 
  onValueChange, 
  icon, 
  description 
}: ToggleRowProps) {
  const { colors, spacing, borderRadius } = useTheme();
  
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
        {icon}
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: colors.text.primary,
            fontWeight: '600',
            fontSize: 16
          }}>
            {label}
          </Text>
          {description && (
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: 14,
              marginTop: 2
            }}>
              {description}
            </Text>
          )}
        </View>
      </View>
      
      <View style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: value ? colors.brand.primary : colors.border,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {value && (
          <Text style={{ color: colors.text.inverse, fontSize: 12, fontWeight: 'bold' }}>
            ✓
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ 
        color: color,
        fontSize: typography.size.xl,
        fontWeight: '700'
      }}>
        {value}
      </Text>
      <Text style={{ 
        color: colors.text.secondary,
        fontSize: typography.size.sm,
        fontWeight: '600'
      }}>
        {label}
      </Text>
    </View>
  );
}
