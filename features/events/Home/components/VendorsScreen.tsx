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
  const { colors, spacing, typography, borderRadius, brand, shadows } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

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

  const categories = ['all', ...Array.from(new Set(vendors.map(v => v.category)))];

  const filteredVendors = useMemo(() => {
    let filtered = vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterCategory !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === filterCategory);
    }

    return filtered;
  }, [vendors, searchQuery, filterCategory]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      {/* Premium Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...shadows.md
      }}>
        <TouchableOpacity 
          onPress={onBack} 
          style={{ 
            width: 44,
            height: 44,
            borderRadius: borderRadius.full,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.sm
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.text.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            color: colors.text.primary,
            fontWeight: typography.weight.bold,
            fontSize: typography.size['2xl'],
            letterSpacing: -1,
            marginLeft: -44
          }}>
            Vendors
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderRadius: borderRadius.full,
            backgroundColor: brand.primary,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.lg
          }}
          activeOpacity={0.8}
        >
          <Plus size={24} color={colors.text.inverse} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Enhanced Search and Filters */}
      <View style={{ padding: spacing.xl, gap: spacing.lg, backgroundColor: colors.background }}>
        {/* Premium Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          borderWidth: 1.5,
          borderColor: colors.border,
          paddingHorizontal: spacing.lg,
          height: 56,
          ...shadows.sm
        }}>
          <Search size={20} color={colors.text.tertiary} strokeWidth={2.5} />
          <TextInput
            placeholder="Search vendors by name, category, or description..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: spacing.md,
              color: colors.text.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium
            }}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        {/* Enhanced Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setFilterCategory(category)}
              style={{
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                backgroundColor: filterCategory === category ? brand.primary : colors.surface,
                borderRadius: borderRadius.full,
                borderWidth: filterCategory === category ? 0 : 1.5,
                borderColor: colors.border,
                ...(filterCategory === category ? shadows.lg : shadows.sm),
                minWidth: 100,
                alignItems: 'center'
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: filterCategory === category ? colors.text.inverse : colors.text.primary,
                fontWeight: typography.weight.bold,
                fontSize: typography.size.sm,
                letterSpacing: 0.5
              }}>
                {category === 'all' ? 'All Categories' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vendors List */}
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {filteredVendors.map(vendor => (
          <VendorCard key={vendor.vendorId} vendor={vendor} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  const { colors, typography, spacing, borderRadius, shadows, brand } = useTheme();

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: borderRadius['2xl'],
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: spacing.xl,
      gap: spacing.lg,
      ...shadows.lg,
      overflow: 'hidden'
    }}>
      {/* Gradient Accent */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: brand.primary
      }} />

      {/* Header with Icon */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: spacing.xs }}>
        <View style={{ flex: 1, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: borderRadius.xl,
              backgroundColor: brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              ...shadows.md
            }}>
              <Store size={28} color={colors.text.inverse} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.text.primary,
                fontSize: typography.size.xl,
                fontWeight: typography.weight.bold,
                letterSpacing: -0.5,
                marginBottom: spacing.xs
              }}>
                {vendor.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Star size={16} fill={colors.semantic.warning} color={colors.semantic.warning} strokeWidth={2.5} />
                  <Text style={{
                    color: colors.text.secondary,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.bold
                  }}>
                    {vendor.rating}
                  </Text>
                </View>
                <Text style={{ color: colors.text.tertiary, fontSize: typography.size.sm }}>•</Text>
                <View style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  backgroundColor: colors.background,
                  borderRadius: borderRadius.full
                }}>
                  <Text style={{ 
                    color: colors.text.secondary, 
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.bold
                  }}>
                    {vendor.priceRange}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={{
        color: colors.text.secondary,
        fontSize: typography.size.base,
        lineHeight: 22,
        fontWeight: typography.weight.medium
      }}>
        {vendor.description}
      </Text>

      {/* Category Badge */}
      <View style={{
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: brand.primary,
        borderRadius: borderRadius.full,
        ...shadows.sm
      }}>
        <Text style={{
          color: colors.text.inverse,
          fontSize: typography.size.sm,
          fontWeight: typography.weight.bold,
          letterSpacing: 0.5
        }}>
          {vendor.category}
        </Text>
      </View>

      {/* Location */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border
      }}>
        <View style={{
          width: 36,
          height: 36,
          borderRadius: borderRadius.md,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <MapPin size={18} color={colors.text.secondary} strokeWidth={2.5} />
        </View>
        <Text style={{ 
          color: colors.text.secondary, 
          fontSize: typography.size.sm,
          fontWeight: typography.weight.medium
        }}>
          {vendor.location.city}, {vendor.location.state}
        </Text>
      </View>

      {/* Contact Info Grid */}
      <View style={{
        padding: spacing.lg,
        backgroundColor: colors.background,
        borderRadius: borderRadius.xl,
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.border
      }}>
        {vendor.contactInfo.phone && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Phone size={18} color={colors.text.secondary} strokeWidth={2.5} />
            </View>
            <Text style={{ 
              color: colors.text.secondary, 
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium
            }}>
              {vendor.contactInfo.phone}
            </Text>
          </View>
        )}
        {vendor.contactInfo.email && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={18} color={colors.text.secondary} strokeWidth={2.5} />
            </View>
            <Text style={{ 
              color: colors.text.secondary, 
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium
            }}>
              {vendor.contactInfo.email}
            </Text>
          </View>
        )}
        {vendor.contactInfo.website && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={18} color={colors.text.secondary} strokeWidth={2.5} />
            </View>
            <Text style={{ 
              color: brand.primary, 
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              {vendor.contactInfo.website}
            </Text>
          </View>
        )}
      </View>

      {/* Services */}
      {vendor.services.length > 0 && (
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Award size={16} color={colors.text.secondary} strokeWidth={2.5} />
            <Text style={{
              color: colors.text.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.bold,
              letterSpacing: -0.3
            }}>
              Services Offered
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {vendor.services.map((service, index) => (
              <View
                key={index}
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  backgroundColor: colors.background,
                  borderRadius: borderRadius.full,
                  borderWidth: 1,
                  borderColor: colors.border,
                  ...shadows.sm
                }}
              >
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold
                }}>
                  {service}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
