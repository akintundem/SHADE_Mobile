import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, Store, MapPin, Phone, Mail, Globe, Star, Filter, Sparkles, Award } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { Vendor } from '../../../../shared/types/vendors';

type Props = {
  eventId: string;
  onBack: () => void;
};

export default function VendorsScreen({ eventId, onBack }: Props) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample vendors data
  const vendors: Vendor[] = useMemo(() => [
    {
      vendorId: '1',
      name: 'Grand Ballroom Inc.',
      description: 'Premium event venue with state-of-the-art facilities',
      category: 'Venue',
      location: {
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      contactInfo: {
        email: 'contact@grandballroom.com',
        phone: '+1-555-0100',
        website: 'https://grandballroom.com',
        socialMedia: {
          facebook: 'grandballroom',
          instagram: '@grandballroom'
        }
      },
      rating: 4.8,
      priceRange: '$$$',
      availability: ['2024-05-15', '2024-05-16', '2024-05-17'],
      services: ['Venue Rental', 'Catering', 'Audio/Visual'],
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      vendorId: '2',
      name: 'Elite Catering',
      description: 'Fine dining catering services for all occasions',
      category: 'Catering',
      location: {
        address: '456 Park Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'USA'
      },
      contactInfo: {
        email: 'info@elitecatering.com',
        phone: '+1-555-0200',
        website: 'https://elitecatering.com'
      },
      rating: 4.9,
      priceRange: '$$$$',
      availability: ['2024-05-10', '2024-05-15', '2024-05-20'],
      services: ['Full Catering', 'Bar Service', 'Setup/Cleanup'],
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      vendorId: '3',
      name: 'Digital Ads Co.',
      description: 'Social media marketing and advertising services',
      category: 'Marketing',
      location: {
        address: '789 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        country: 'USA'
      },
      contactInfo: {
        email: 'hello@digitalads.com',
        phone: '+1-555-0300',
        website: 'https://digitalads.com'
      },
      rating: 4.7,
      priceRange: '$$',
      availability: [],
      services: ['Social Media', 'Print Ads', 'Content Creation'],
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-12T00:00:00Z'
    },
    {
      vendorId: '4',
      name: 'Audio Rentals',
      description: 'Professional audio and visual equipment rental',
      category: 'Equipment',
      location: {
        address: '321 5th Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10004',
        country: 'USA'
      },
      contactInfo: {
        email: 'rentals@audiosystems.com',
        phone: '+1-555-0400'
      },
      rating: 4.6,
      priceRange: '$$',
      availability: ['2024-05-15', '2024-05-16'],
      services: ['Sound Systems', 'Lighting', 'Projection'],
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-08T00:00:00Z'
    }
  ], []);

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vendors, searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Simplified Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.md
      }}>
        <TouchableOpacity onPress={onBack}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{
          fontSize: typography.size.xl,
          fontWeight: typography.weight.semibold,
          color: colors.text.primary
        }}>
          Vendors
        </Text>
      </View>

      {/* Simple Search */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          paddingHorizontal: spacing.md,
          gap: spacing.sm,
          height: 44
        }}>
          <Search size={20} color={colors.text.tertiary} />
          <TextInput
            placeholder="Search vendors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              color: colors.text.primary,
              fontSize: typography.size.base
            }}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>
      </View>

      {/* Vendors List */}
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {filteredVendors.map(vendor => (
          <VendorCard key={vendor.vendorId} vendor={vendor} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        gap: spacing.md
      }}
      activeOpacity={0.7}
    >
      {/* Vendor Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: typography.size.lg,
            fontWeight: typography.weight.semibold,
            color: colors.text.primary,
            marginBottom: spacing.xs
          }}>
            {vendor.name}
          </Text>
          <Text style={{
            fontSize: typography.size.sm,
            color: colors.text.secondary,
            backgroundColor: colors.background,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.sm,
            alignSelf: 'flex-start'
          }}>
            {vendor.category}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Star size={16} fill="#FFD700" color="#FFD700" />
          <Text style={{
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium,
            color: colors.text.secondary
          }}>
            {vendor.rating}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <MapPin size={16} color={colors.text.tertiary} />
        <Text style={{
          fontSize: typography.size.sm,
          color: colors.text.secondary
        }}>
          {vendor.location.city}, {vendor.location.state}
        </Text>
      </View>

      {/* Contact (simplified) */}
      {vendor.contactInfo.phone && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Phone size={16} color={colors.text.tertiary} />
          <Text style={{
            fontSize: typography.size.sm,
            color: colors.text.secondary
          }}>
            {vendor.contactInfo.phone}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
