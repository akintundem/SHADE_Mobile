import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInputProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { MapPin, Calendar, Users, Tag, Mail, Phone, Globe } from 'lucide-react-native';
import EnhancedInput from './EnhancedInput';

type SmartInputProps = TextInputProps & {
  label?: string;
  error?: string;
  success?: string;
  inputType?: 'email' | 'password' | 'name' | 'location' | 'event' | 'description' | 'phone' | 'url' | 'date' | 'capacity' | 'category';
  onSuggestionSelect?: (suggestion: any) => void;
  contextData?: {
    recentEvents?: string[];
    savedLocations?: string[];
    userPreferences?: any;
  };
};

export default function SmartInput({
  inputType = 'default',
  contextData,
  onSuggestionSelect,
  ...props
}: SmartInputProps) {
  const { colors, typography, spacing } = useTheme();
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);

  // Generate smart suggestions based on input type and context
  const generateSmartSuggestions = (inputValue: string, type: string) => {
    if (!inputValue || inputValue.length < 2) return [];

    const suggestions: any[] = [];

    switch (type) {
      case 'email':
        suggestions.push(
          { id: 'gmail', text: 'gmail.com', type: 'email', icon: 'mail' },
          { id: 'yahoo', text: 'yahoo.com', type: 'email', icon: 'mail' },
          { id: 'outlook', text: 'outlook.com', type: 'email', icon: 'mail' },
          { id: 'icloud', text: 'icloud.com', type: 'email', icon: 'mail' },
        );
        break;

      case 'location':
        const locationSuggestions = [
          { id: 'nyc', text: 'New York, NY', type: 'location', icon: 'map' },
          { id: 'la', text: 'Los Angeles, CA', type: 'location', icon: 'map' },
          { id: 'chicago', text: 'Chicago, IL', type: 'location', icon: 'map' },
          { id: 'miami', text: 'Miami, FL', type: 'location', icon: 'map' },
          { id: 'seattle', text: 'Seattle, WA', type: 'location', icon: 'map' },
          { id: 'austin', text: 'Austin, TX', type: 'location', icon: 'map' },
          { id: 'denver', text: 'Denver, CO', type: 'location', icon: 'map' },
        ];
        
        // Add context data if available
        if (contextData?.savedLocations) {
          contextData.savedLocations.forEach((location, index) => {
            suggestions.push({
              id: `saved-${index}`,
              text: location,
              type: 'location',
              icon: 'map',
              isRecent: true,
            });
          });
        }
        
        suggestions.push(...locationSuggestions);
        break;

      case 'event':
        const eventSuggestions = [
          { id: 'conference', text: 'Tech Conference', type: 'event', icon: 'calendar' },
          { id: 'workshop', text: 'Workshop', type: 'event', icon: 'calendar' },
          { id: 'meetup', text: 'Meetup', type: 'event', icon: 'calendar' },
          { id: 'seminar', text: 'Seminar', type: 'event', icon: 'calendar' },
          { id: 'networking', text: 'Networking Event', type: 'event', icon: 'calendar' },
          { id: 'webinar', text: 'Webinar', type: 'event', icon: 'calendar' },
          { id: 'training', text: 'Training Session', type: 'event', icon: 'calendar' },
        ];
        
        // Add recent events if available
        if (contextData?.recentEvents) {
          contextData.recentEvents.forEach((event, index) => {
            suggestions.push({
              id: `recent-${index}`,
              text: event,
              type: 'event',
              icon: 'calendar',
              isRecent: true,
            });
          });
        }
        
        suggestions.push(...eventSuggestions);
        break;

      case 'category':
        suggestions.push(
          { id: 'tech', text: 'Technology', type: 'category', icon: 'tag' },
          { id: 'business', text: 'Business', type: 'category', icon: 'tag' },
          { id: 'education', text: 'Education', type: 'category', icon: 'tag' },
          { id: 'health', text: 'Health & Wellness', type: 'category', icon: 'tag' },
          { id: 'entertainment', text: 'Entertainment', type: 'category', icon: 'tag' },
          { id: 'sports', text: 'Sports', type: 'category', icon: 'tag' },
          { id: 'food', text: 'Food & Drink', type: 'category', icon: 'tag' },
          { id: 'art', text: 'Arts & Culture', type: 'category', icon: 'tag' },
        );
        break;

      case 'capacity':
        const capacitySuggestions = [
          { id: 'small', text: '10-50 people', type: 'capacity', icon: 'users' },
          { id: 'medium', text: '50-100 people', type: 'capacity', icon: 'users' },
          { id: 'large', text: '100-500 people', type: 'capacity', icon: 'users' },
          { id: 'xlarge', text: '500+ people', type: 'capacity', icon: 'users' },
        ];
        suggestions.push(...capacitySuggestions);
        break;

      case 'date':
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        suggestions.push(
          { 
            id: 'today', 
            text: today.toLocaleDateString(), 
            type: 'date', 
            icon: 'calendar',
            value: today.toISOString().split('T')[0]
          },
          { 
            id: 'tomorrow', 
            text: tomorrow.toLocaleDateString(), 
            type: 'date', 
            icon: 'calendar',
            value: tomorrow.toISOString().split('T')[0]
          },
          { 
            id: 'next-week', 
            text: nextWeek.toLocaleDateString(), 
            type: 'date', 
            icon: 'calendar',
            value: nextWeek.toISOString().split('T')[0]
          },
          { 
            id: 'next-month', 
            text: nextMonth.toLocaleDateString(), 
            type: 'date', 
            icon: 'calendar',
            value: nextMonth.toISOString().split('T')[0]
          },
        );
        break;
    }

    // Filter suggestions based on input
    return suggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(inputValue.toLowerCase()) &&
      suggestion.text.toLowerCase() !== inputValue.toLowerCase()
    ).slice(0, 8); // Limit to 8 suggestions
  };

  // Get appropriate icon for input type
  const getInputIcon = () => {
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
      case 'capacity':
        return <Users size={20} color={colors.text.tertiary} />;
      case 'category':
        return <Tag size={20} color={colors.text.tertiary} />;
      case 'url':
        return <Globe size={20} color={colors.text.tertiary} />;
      default:
        return null;
    }
  };

  // Get validation rules based on input type
  const getValidationRules = () => {
    switch (inputType) {
      case 'email':
        return {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          custom: (value: string) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return 'Please enter a valid email address';
            }
            return null;
          }
        };
      case 'phone':
        return {
          pattern: /^[\+]?[1-9][\d]{0,15}$/,
          custom: (value: string) => {
            if (!/^[\+]?[1-9][\d]{0,15}$/.test(value)) {
              return 'Please enter a valid phone number';
            }
            return null;
          }
        };
      case 'url':
        return {
          pattern: /^https?:\/\/.+/,
          custom: (value: string) => {
            if (value && !/^https?:\/\/.+/.test(value)) {
              return 'Please enter a valid URL (starting with http:// or https://)';
            }
            return null;
          }
        };
      case 'capacity':
        return {
          pattern: /^\d+$/,
          custom: (value: string) => {
            const num = parseInt(value);
            if (isNaN(num) || num < 1) {
              return 'Please enter a valid number';
            }
            if (num > 10000) {
              return 'Capacity cannot exceed 10,000';
            }
            return null;
          }
        };
      default:
        return {};
    }
  };

  return (
    <EnhancedInput
      {...props}
      inputType={inputType}
      leftIcon={getInputIcon()}
      suggestions={smartSuggestions}
      onSuggestionSelect={onSuggestionSelect}
      validationRules={getValidationRules()}
      showValidation={true}
      autoSuggest={true}
      showSuggestions={true}
    />
  );
}
