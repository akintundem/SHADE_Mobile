import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star, MapPin, Users } from 'lucide-react-native';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { VenueCardDTO } from '../../../shared/types';

interface VenueMessageCardProps {
    venue: VenueCardDTO;
    onPress: (venue: VenueCardDTO) => void;
}

export const VenueMessageCard: React.FC<VenueMessageCardProps> = ({ venue, onPress }) => {
    const { colors, spacing, typography, borderRadius, shadows } = useTheme();

    return (
        <TouchableOpacity
            onPress={() => onPress(venue)}
            style={{
                backgroundColor: colors.surfaceElevated,
                borderRadius: borderRadius.lg,
                ...shadows.sm,
            }}
        >
            <Image
                source={{ uri: venue.imageUrl }}
                style={{
                    width: '100%',
                    height: 160,
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
                        {venue.guestCapacity}
                    </Text>
                </View>
                <Text style={{
                    color: colors.text.primary,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.semibold,
                }}>
                    {venue.priceRange}
                </Text>
            </View>
        </TouchableOpacity>
    );
};
