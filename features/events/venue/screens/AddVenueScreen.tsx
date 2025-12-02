import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ArrowLeft, MapPin, Users, DollarSign, Camera, Upload } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useFormValidation, FormValidator } from '../../../../common/utils/formValidation';
import { useErrorHandler } from '../../../../common/hooks/useErrorHandler';
import ErrorModal from '../../../../common/components/common/ErrorModal'';
import { Section, FieldLabel, Inpu } from '../../../../common/components/common/FormComponents';

type Props = { 
  onBack: () => void; 
  onSave?: (venue: any) => void;
};

export default function AddVenueScreen({ onBack, onSave }: Props) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [guestCapacity, setGuestCapacity] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { error, handleError, hideError } = useErrorHandler();

  // Form validation
  const venueValidator = new FormValidator()
    .addRule('name', { required: true, message: 'Venue name is required' })
    .addRule('location', { required: true, message: 'Location is required' })
    .addRule('address', { required: true, message: 'Address is required' })
    .addRule('guestCapacity', { required: true, message: 'Guest capacity is required' })
    .addRule('contactEmail', { required: true, message: 'Contact email is required' });

  const { errors, validateField, setFieldTouched, getFieldError, validateForm } = useFormValidation(venueValidator);

  // Memoized form data for validation
  const formData = useMemo(() => ({
    name,
    location,
    address,
    guestCapacity: guestCapacity ? Number(guestCapacity) : undefined,
    contactEmail,
  }), [name, location, address, guestCapacity, contactEmail]);

  // Validation result
  const validationResult = useMemo(() => validateForm(formData), [formData, validateForm]);
  const canSave = validationResult.isValid && !isLoading;

  const handleSave = async () => {
    if (!canSave) return;

    setIsLoading(true);
    try {
      const venueData = {
        name,
        location,
        address,
        guestCapacity: guestCapacity ? Number(guestCapacity) : undefined,
        priceRange,
        description,
        imageUrl,
        amenities,
        contactEmail,
        contactPhone,
        website,
        rating: 0,
        reviewCount: 0
      };

      onSave?.(venueData);
    } catch (err) {
      handleError(err, 'Saving venue');
    } finally {
      setIsLoading(false);
    }
  };

  const availableAmenities = [
    'Parking', 'Catering', 'AV Equipment', 'WiFi', 'Outdoor Space', 
    'Restrooms', 'Bar', 'Dance Floor', 'Stage', 'Lighting', 'Sound System'
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ErrorModal
        visible={!!error}
        error={error}
        onClose={hideError}
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            Add Venue
          </Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={!canSave}
            style={{ 
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: canSave ? brand.primary : colors.text.disabled,
              borderRadius: borderRadius.md
            }}
          >
            <Text style={{ 
              color: canSave ? colors.text.inverse : colors.text.tertiary,
              fontWeight: '600'
            }}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          {/* Venue Image */}
          <Section title="Venue Image">
            <View style={{ alignItems: 'center', gap: spacing.md }}>
              <View style={{
                width: 120,
                height: 120,
                borderRadius: borderRadius.lg,
                backgroundColor: colors.surface,
                borderWidth: 2,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {imageUrl ? (
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={{ width: 120, height: 120 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Camera size={40} color={colors.text.tertiary} />
                )}
              </View>
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                borderColor: colors.border
              }}>
                <Upload size={16} color={colors.text.primary} />
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                  Upload Image
                </Text>
              </TouchableOpacity>
            </View>
          </Section>

          {/* Basic Information */}
          <Section title="Basic Information">
            <FieldLabel icon={<MapPin size={16} color={colors.text.secondary} />} label="Venue Name" />
            <Input 
              placeholder="Enter venue name" 
              value={name} 
              onChangeText={(text) => {
                setName(text);
                validateField('name', text);
              }}
              onBlur={() => setFieldTouched('name')}
              error={getFieldError('name')}
            />

            <FieldLabel icon={<MapPin size={16} color={colors.text.secondary} />} label="Location" />
            <Input 
              placeholder="Enter location name" 
              value={location} 
              onChangeText={(text) => {
                setLocation(text);
                validateField('location', text);
              }}
              onBlur={() => setFieldTouched('location')}
              error={getFieldError('location')}
            />

            <FieldLabel icon={<MapPin size={16} color={colors.text.secondary} />} label="Address" />
            <Input 
              placeholder="Enter full address" 
              value={address} 
              onChangeText={(text) => {
                setAddress(text);
                validateField('address', text);
              }}
              onBlur={() => setFieldTouched('address')}
              error={getFieldError('address')}
            />

            <FieldLabel icon={<Users size={16} color={colors.text.secondary} />} label="Guest Capacity" />
            <Input 
              placeholder="Maximum number of guests" 
              value={guestCapacity} 
              onChangeText={(text) => {
                setGuestCapacity(text);
                validateField('guestCapacity', text);
              }}
              onBlur={() => setFieldTouched('guestCapacity')}
              error={getFieldError('guestCapacity')}
              keyboardType="numeric"
            />

            <FieldLabel icon={<DollarSign size={16} color={colors.text.secondary} />} label="Price Range" />
            <Input 
              placeholder="e.g., $1000-3000" 
              value={priceRange} 
              onChangeText={setPriceRange}
            />
          </Section>

          {/* Description */}
          <Section title="Description">
            <FieldLabel icon={<MapPin size={16} color={colors.text.secondary} />} label="Description" />
            <Input 
              placeholder="Describe the venue, its features, and what makes it special" 
              multiline 
              numberOfLines={4} 
              style={{ height: 100, paddingTop: spacing.md }} 
              value={description} 
              onChangeText={setDescription}
            />
          </Section>

          {/* Amenities */}
          <Section title="Amenities">
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: 14,
              marginBottom: spacing.md
            }}>
              Select amenities available at this venue
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {availableAmenities.map(amenity => (
                <TouchableOpacity
                  key={amenity}
                  onPress={() => {
                    setAmenities(prev => 
                      prev.includes(amenity) 
                        ? prev.filter(a => a !== amenity)
                        : [...prev, amenity]
                    );
                  }}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: amenities.includes(amenity) ? brand.primary : colors.surface,
                    borderRadius: borderRadius.full,
                    borderWidth: 1,
                    borderColor: amenities.includes(amenity) ? brand.primary : colors.border
                  }}
                >
                  <Text style={{
                    color: amenities.includes(amenity) ? colors.text.inverse : colors.text.primary,
                    fontWeight: '600',
                    fontSize: 14
                  }}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          {/* Contact Information */}
          <Section title="Contact Information">
            <FieldLabel icon={<MapPin size={16} color={colors.text.secondary} />} label="Contact Email" />
            <Input 
              placeholder="contact@venue.com" 
              value={contactEmail} 
              onChangeText={(text) => {
                setContactEmail(text);
                validateField('contactEmail', text);
              }}
              onBlur={() => setFieldTouched('contactEmail')}
              error={getFieldError('contactEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FieldLabel icon={<MapPin size={16} color={colors.text.secondary} />} label="Contact Phone" />
            <Input 
              placeholder="+1-555-0123" 
              value={contactPhone} 
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
            />

            <FieldLabel icon={<MapPin size={16} color={colors.text.secondary} />} label="Website" />
            <Input 
              placeholder="https://venue.com" 
              value={website} 
              onChangeText={setWebsite}
              keyboardType="url"
              autoCapitalize="none"
            />
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

