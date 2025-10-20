import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Star, MapPin, Users } from 'lucide-react-native';

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    location: string;
    capacity: string;
    price: string;
    rating: number;
    reviewCount: number;
    image: string;
  };
  onPress: () => void;
}

export default function VenueCard({ venue, onPress }: VenueCardProps) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
      }}
    >
      <Image
        source={{ uri: venue.image }}
        style={{
          width: '100%',
          height: 200,
          borderTopLeftRadius: borderRadius.lg,
          borderTopRightRadius: borderRadius.lg,
        }}
        resizeMode="cover"
      />
      <View style={{
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        backgroundColor: colors.text.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Star size={12} color="#FFD700" fill="#FFD700" />
        <Text style={{
          color: colors.surfaceElevated,
          fontSize: typography.size.sm,
          fontWeight: typography.weight.semibold,
          marginLeft: spacing.xs,
        }}>
          {venue.rating}
        </Text>
      </View>
      <View style={{ padding: spacing.lg }}>
        <Text style={{
          color: colors.text.primary,
          fontSize: typography.size.lg,
          fontWeight: typography.weight.bold,
          marginBottom: spacing.sm,
        }}>
          {venue.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
          <MapPin size={14} color={colors.text.secondary} />
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            marginLeft: spacing.xs,
          }}>
            {venue.location}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          <Users size={14} color={colors.text.secondary} />
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            marginLeft: spacing.xs,
          }}>
            {venue.capacity}
          </Text>
        </View>
        <Text style={{
          color: colors.text.primary,
          fontSize: typography.size.base,
          fontWeight: typography.weight.semibold,
        }}>
          {venue.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
