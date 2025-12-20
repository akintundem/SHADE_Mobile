import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { ChevronRight } from 'lucide-react-native';

type Props = {
  title: string;
  date: string;
  location: string;
  tagLeft?: string; // e.g., upcoming/completed
  tagRight?: string; // e.g., Creator
  imageUrl: string;
};

export const EventMiniCard = ({ title, date, location, tagLeft, tagRight, imageUrl }: Props) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center',
        gap: spacing.lg,
        paddingVertical: spacing.sm,
      }}
    >
      <View style={{ position: 'relative' }}>
        <Image 
          source={{ uri: imageUrl }} 
          style={{ 
            height: 72, 
            width: 72, 
            borderRadius: borderRadius.md,
            backgroundColor: colors.surface,
          }} 
        />
        {tagRight && (
          <View style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: colors.brand.primary,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}>
            <Text style={{ 
              color: '#FFFFFF', 
              fontSize: 10, 
              fontWeight: typography.weight.bold,
              textTransform: 'uppercase'
            }}>
              {tagRight}
            </Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 }}>
          {tagLeft && (
            <Text style={{ 
              fontSize: 11, 
              color: colors.text.tertiary, 
              fontWeight: typography.weight.bold,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {tagLeft}
            </Text>
          )}
        </View>
        <Text style={{ 
          color: colors.text.primary, 
          fontWeight: typography.weight.semibold, 
          fontSize: typography.size.base,
          letterSpacing: -0.3,
          marginBottom: 3,
        }}>
          {title}
        </Text>
        <Text style={{ 
          color: colors.text.secondary, 
          fontSize: typography.size.sm,
          opacity: 0.8,
        }}>
          {date}
        </Text>
        <Text style={{ 
          color: colors.text.tertiary, 
          fontSize: typography.size.xs,
          marginTop: 2,
        }}>
          {location}
        </Text>
      </View>

      <ChevronRight size={18} color={colors.text.tertiary} strokeWidth={2} />
    </TouchableOpacity>
  );
};

