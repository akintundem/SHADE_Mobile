import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import BaseInput from '../ui/Input';

// Section Component
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { typography, spacing } = useTheme();
  
  return (
    <View>
      <Text
        className="font-bold text-txt-primary dark:text-txt-dark-primary"
        style={{
          fontSize: typography.size.lg,
          marginBottom: spacing.md
        }}
      >
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
  const { spacing } = useTheme();
  
  return (
    <View className="flex-row items-center" style={{ gap: spacing.xs, marginBottom: spacing.xs }}>
      {icon}
      <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
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
  inputType,
  ...props 
}: InputProps & { inputType?: 'email' | 'password' | 'name' | 'location' | 'event' | 'description' | 'phone' | 'url' | 'date' | 'capacity' | 'category' }) {
  return (
    <BaseInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      error={error}
      inputType={inputType}
      enableNativeAutocomplete={true}
      style={style}
      {...props}
    />
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
  const { spacing } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        className="h-12 justify-center rounded-lg px-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface"
      >
        <Text className="text-txt-primary dark:text-txt-dark-primary">
          {selectedOption?.label || placeholder}
        </Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View
          className="overflow-hidden max-h-[200px] rounded-lg mt-xs border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface"
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              className={value === option.value ? 'bg-brand-primary' : 'bg-transparent'}
              className="px-md py-sm"
            >
              <Text className={value === option.value ? 'text-txt-inverse' : 'text-txt-primary dark:text-txt-dark-primary'}>
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
  const { spacing } = useTheme();
  
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      className="flex-row items-center justify-between py-sm px-md rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface"
    >
      <View className="flex-row items-center flex-1" style={{ gap: spacing.sm }}>
        {icon}
        <View className="flex-1">
          <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary">
            {label}
          </Text>
          {description && (
            <Text className="text-sm mt-[2px] text-txt-secondary dark:text-txt-dark-secondary">
              {description}
            </Text>
          )}
        </View>
      </View>
      
      <View
        className={`w-6 h-6 rounded-full items-center justify-center ${value ? 'bg-brand-primary' : 'bg-light-border dark:bg-dark-border'}`}
      >
        {value && (
          <Text className="text-xs font-bold text-txt-inverse">
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
  const { typography } = useTheme();

  return (
    <View className="items-center">
      <Text className="font-bold" style={{ color, fontSize: typography.size.xl }}>
        {value}
      </Text>
      <Text className="font-semibold text-txt-secondary dark:text-txt-dark-secondary" style={{ fontSize: typography.size.sm }}>
        {label}
      </Text>
    </View>
  );
}
