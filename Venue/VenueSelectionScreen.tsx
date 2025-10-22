import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, TextInput } from 'react-native';
import { ArrowLeft, Search, MapPin, Users, DollarSign, Star, Plus } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { VenueCardDTO } from '../types';

type Props = { 
  onBack: () => void; 
  onSelectVenue?: (venue: VenueCardDTO) => void;
  onAddVenue?: () => void;
};

export default function VenueSelectionScreen({ onBack, onSelectVenue, onAddVenue }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'capacity'>('name');
  
  const { colors, typography, spacing, borderRadius, brand } = useTheme();

  // Sample venues data
  const venues: VenueCardDTO[] = [
    {
      id: '1',
      name: 'Grand Ballroom',
      location: 'Downtown Convention Center',
      guestCapacity: '500',
      priceRange: '$2000-5000',
      rating: 4.8,
      reviewCount: 120,
      imageUrl: 'https://example.com/venue1.jpg',
      description: 'Elegant ballroom perfect for large events',
      amenities: ['Parking', 'Catering', 'AV Equipment', 'WiFi'],
      contactEmail: 'info@grandballroom.com',
      contactPhone: '+1-555-0123',
      website: 'https://grandballroom.com'
    },
    {
      id: '2',
      name: 'Garden Pavilion',
      location: 'Riverside Park',
      guestCapacity: '200',
      priceRange: '$800-2000',
      rating: 4.6,
      reviewCount: 85,
      imageUrl: 'https://example.com/venue2.jpg',
      description: 'Beautiful outdoor venue with garden views',
      amenities: ['Outdoor Space', 'Catering', 'Restrooms', 'Parking'],
      contactEmail: 'events@gardenpavilion.com',
      contactPhone: '+1-555-0456',
      website: 'https://gardenpavilion.com'
    }
  ];

  const filteredVenues = useMemo(() => {
    let filtered = venues.filter(venue => 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedFilters.length > 0) {
      filtered = filtered.filter(venue => 
        selectedFilters.some(filter => 
          venue.amenities.includes(filter)
        )
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.priceRange.localeCompare(b.priceRange);
        case 'rating':
          return b.rating - a.rating;
        case 'capacity':
          return Number(b.guestCapacity) - Number(a.guestCapacity);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [searchQuery, selectedFilters, sortBy]);

  const filterOptions = ['Parking', 'Catering', 'AV Equipment', 'WiFi', 'Outdoor Space', 'Restrooms'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: spacing.lg, 
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <TouchableOpacity onPress={onBack} style={{ padding: spacing.sm }}>
          <ArrowLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ 
          color: colors.text.primary, 
          fontWeight: '700',
          fontSize: typography.size.lg
        }}>
          Select Venue
        </Text>
        <TouchableOpacity 
          onPress={onAddVenue}
          style={{ 
            padding: spacing.sm,
            backgroundColor: brand.primary,
            borderRadius: borderRadius.md
          }}
        >
          <Plus size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing.md,
          height: 48
        }}>
          <Search size={20} color={colors.text.tertiary} />
          <TextInput
            placeholder="Search venues..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: spacing.sm,
              color: colors.text.primary,
              fontSize: 16
            }}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        {/* Sort Options */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[
            { key: 'name', label: 'Name' },
            { key: 'price', label: 'Price' },
            { key: 'rating', label: 'Rating' },
            { key: 'capacity', label: 'Capacity' },
          ].map(option => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setSortBy(option.key as any)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                backgroundColor: sortBy === option.key ? brand.primary : colors.surface,
                borderRadius: borderRadius.full,
                borderWidth: 1,
                borderColor: sortBy === option.key ? brand.primary : colors.border
              }}
            >
              <Text style={{
                color: sortBy === option.key ? colors.text.inverse : colors.text.primary,
                fontWeight: '600',
                fontSize: 14
              }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {filterOptions.map(filter => (
              <TouchableOpacity
                key={filter}
                onPress={() => {
                  setSelectedFilters(prev => 
                    prev.includes(filter) 
                      ? prev.filter(f => f !== filter)
                      : [...prev, filter]
                  );
                }}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  backgroundColor: selectedFilters.includes(filter) ? brand.primary : colors.surface,
                  borderRadius: borderRadius.full,
                  borderWidth: 1,
                  borderColor: selectedFilters.includes(filter) ? brand.primary : colors.border
                }}
              >
                <Text style={{
                  color: selectedFilters.includes(filter) ? colors.text.inverse : colors.text.primary,
                  fontWeight: '600',
                  fontSize: 14
                }}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Venues List */}
      <ScrollView 
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {filteredVenues.map(venue => (
          <VenueCard 
            key={venue.id} 
            venue={venue} 
            onSelect={() => onSelectVenue?.(venue)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function VenueCard({ venue, onSelect }: { venue: VenueCardDTO; onSelect: () => void }) {
  const { colors, typography, spacing, borderRadius, brand } = useTheme();

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: spacing.sm
      }}
    >
      {/* Venue Image */}
      <View style={{ height: 200, backgroundColor: colors.surface }}>
        {venue.imageUrl ? (
          <Image 
            source={{ uri: venue.imageUrl }} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ 
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: colors.surface
          }}>
            <Text style={{ color: colors.text.tertiary }}>No Image</Text>
          </View>
        )}
      </View>

      {/* Venue Info */}
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={{ 
            color: colors.text.primary,
            fontSize: typography.size.lg,
            fontWeight: '700',
            flex: 1
          }}>
            {venue.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Star size={16} color={colors.brand.secondary} fill={colors.brand.secondary} />
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: '600'
            }}>
              {venue.rating}
            </Text>
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: 14
            }}>
              ({venue.reviewCount})
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <MapPin size={16} color={colors.text.secondary} />
          <Text style={{ 
            color: colors.text.secondary,
            flex: 1
          }}>
            {venue.location}
          </Text>
        </View>

        <Text style={{ 
          color: colors.text.tertiary,
          fontSize: 14,
          lineHeight: 20
        }}>
          {venue.description}
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Users size={16} color={colors.text.secondary} />
            <Text style={{ color: colors.text.secondary }}>
              {venue.guestCapacity} guests
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <DollarSign size={16} color={colors.text.secondary} />
            <Text style={{ color: colors.text.secondary }}>
              {venue.priceRange}
            </Text>
          </View>
        </View>

        {/* Amenities */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {venue.amenities.slice(0, 3).map(amenity => (
            <View
              key={amenity}
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                backgroundColor: colors.brand.primaryLight,
                borderRadius: borderRadius.sm
              }}
            >
              <Text style={{ 
                color: colors.brand.primary,
                fontSize: 12,
                fontWeight: '600'
              }}>
                {amenity}
              </Text>
            </View>
          ))}
          {venue.amenities.length > 3 && (
            <View
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.sm,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{ 
                color: colors.text.secondary,
                fontSize: 12,
                fontWeight: '600'
              }}>
                +{venue.amenities.length - 3} more
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
