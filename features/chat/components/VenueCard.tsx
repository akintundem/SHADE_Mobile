import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';
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
          height: 160,
          borderTopLeftRadius: borderRadius.lg,
          borderTopRightRadius: borderRadius.lg,
        }}
        resizeMode="cover"
        defaultSource={{ uri: 'https://images.unsplash.com/photo-1519167758481-83f142b8d0c1?w=400&h=300&fit=crop' }}
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
        <Star size={12} color={colors.brand.secondary} fill={colors.brand.secondary} />
        <Text style={{
          color: colors.surfaceElevated,
          fontSize: typography.size.sm,
          fontWeight: typography.weight.semibold,
          marginLeft: spacing.xs,
        }}>
          {venue.rating}
        </Text>
      </View>
      <View style={{ padding: spacing.md }}>
        <Text style={{
          color: colors.text.primary,
          fontSize: typography.size.lg,
          fontWeight: typography.weight.bold,
          marginBottom: spacing.xs,
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
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
