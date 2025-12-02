import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { useTheme } from '../../../../../common/theme/ThemeProvider';
import { Venue } from '../types';

type Props = {
  venue: Venue | null;
  locationSearchQuery: string;
  onVenueChange: (venue: Venue | null) => void;
  onLocationSearchChange: (query: string) => void;
};

type LocationSuggestion = {
  id: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
  displayName: string;
  components: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
};

export function LocationStep({
  venue,
  locationSearchQuery,
  onLocationSearchChange,
  onVenueChange,
}: Props) {
  const { colors, spacing, typography, borderRadius, isDark } = useTheme();
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const handleSuggestionSelect = useCallback(
    (suggestion: LocationSuggestion) => {
      onVenueChange({
        address: suggestion.displayName,
        city: suggestion.components.city,
        state: suggestion.components.state,
        country: suggestion.components.country,
        zipCode: suggestion.components.zipCode,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      });
      onLocationSearchChange(suggestion.displayName);
      setSuggestions([]);
      setShowSuggestions(false);
    },
    [onVenueChange, onLocationSearchChange],
  );

  const previewText = useMemo(() => {
    if (venue?.address) {
      const primary = venue.address;
      const rest = [venue.city, venue.state, venue.country].filter(Boolean).join(', ');
      return {
        primary,
        secondary: rest,
      };
    }

    if (locationSearchQuery) {
      return {
        primary: 'Keep typing to refine your search.',
        secondary: 'Select an address from the dropdown list when it appears.',
      };
    }

    return {
      primary: 'Search and select a location to preview',
      secondary: 'Start typing an address or place to begin.',
    };
  }, [locationSearchQuery, venue]);

  useEffect(() => {
    if (!locationSearchQuery || locationSearchQuery.trim().length < 2) {
      searchDebounceRef.current && clearTimeout(searchDebounceRef.current);
      searchAbortRef.current?.abort();
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(true);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        searchAbortRef.current?.abort();
        const controller = new AbortController();
        searchAbortRef.current = controller;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(
            locationSearchQuery,
          )}`,
          {
            signal: controller.signal,
            headers: {
              'User-Agent': 'capsule-app/1.0',
              Accept: 'application/json',
            },
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch location suggestions');
        }

        const results: any[] = await response.json();
        const mapped: LocationSuggestion[] = results.map((item, index) => {
          const address = item.address || {};
          const displayName: string = item.display_name || locationSearchQuery;
          const [title, ...rest] = displayName.split(',');

          return {
            id: item.place_id?.toString() ?? `${item.lat}-${item.lon}-${index}`,
            title: title?.trim() || displayName,
            subtitle: rest.join(', ').trim(),
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            displayName,
            components: {
              city:
                address.city ||
                address.town ||
                address.village ||
                address.municipality ||
                address.county,
              state: address.state || address.region,
              country: address.country,
              zipCode: address.postcode,
            },
          };
        });

        setSuggestions(mapped);
      } catch (error) {
        // Location search error
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [locationSearchQuery]);

  useEffect(() => () => searchAbortRef.current?.abort(), []);

  const handleClear = () => {
    onLocationSearchChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    onVenueChange(null);
  };

  const cardBackground = isDark ? '#0F1012' : '#FFFFFF';
  const borderColor = isDark ? '#1F1F1F' : '#E5E7EB';
  const previewBackground = isDark ? '#111214' : '#F6F7FB';

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowSuggestions(false);
        Keyboard.dismiss();
      }}
      accessible={false}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl,
          paddingBottom: spacing['3xl'],
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.xl }}>
          <View style={{ gap: spacing.xs }}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size['2xl'],
                fontWeight: typography.weight.bold,
              }}
            >
              Event Location
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.size.sm,
              }}
            >
              Search for an address or place to set your event location.
            </Text>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
              }}
            >
              Location
            </Text>
            <View style={{ position: 'relative', zIndex: showSuggestions ? 10 : 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: cardBackground,
                  borderRadius: borderRadius['2xl'],
                  borderWidth: 1,
                  borderColor: borderColor,
                  paddingHorizontal: spacing.lg,
                  height: 56,
                }}
              >
                <MapPin size={18} color={colors.text.tertiary} style={{ marginRight: spacing.sm }} />
                <TextInput
                  placeholder="Search for a location"
                  placeholderTextColor={colors.text.tertiary}
                  value={locationSearchQuery}
                  onChangeText={(text) => {
                    onLocationSearchChange(text);
                    if (!text) {
                      setShowSuggestions(false);
                      setSuggestions([]);
                      onVenueChange(null);
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  style={{
                    flex: 1,
                    fontSize: typography.size.base,
                    color: colors.text.primary,
                  }}
                />
                {isSearching ? (
                  <ActivityIndicator size="small" color={colors.text.secondary} />
                ) : locationSearchQuery ? (
                  <TouchableOpacity onPress={handleClear} hitSlop={8}>
                    <X size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {showSuggestions && (isSearching || suggestions.length > 0) && (
                <View
                  style={{
                    marginTop: spacing.xs,
                    backgroundColor: cardBackground,
                    borderRadius: borderRadius['3xl'],
                    borderWidth: 1,
                    borderColor: borderColor,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOpacity: isDark ? 0.3 : 0.12,
                    shadowOffset: { width: 0, height: 8 },
                    shadowRadius: 20,
                    elevation: 8,
                  }}
                >
                  {isSearching && suggestions.length === 0 ? (
                    <View
                      style={{
                        padding: spacing.lg,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.sm,
                      }}
                    >
                      <ActivityIndicator size="small" color={colors.text.secondary} />
                      <Text style={{ color: colors.text.secondary }}>Searching...</Text>
                    </View>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={suggestion.id}
                        activeOpacity={0.9}
                        onPress={() => handleSuggestionSelect(suggestion)}
                        style={{
                          paddingHorizontal: spacing.lg,
                          paddingVertical: spacing.md,
                          borderBottomWidth: index === suggestions.length - 1 ? 0 : 1,
                          borderColor: borderColor,
                          flexDirection: 'row',
                          gap: spacing.md,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: borderRadius.full,
                            backgroundColor: isDark ? '#1A1A1C' : '#F4F5F7',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <MapPin size={18} color={colors.text.secondary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: colors.text.primary,
                              fontSize: typography.size.sm,
                              fontWeight: typography.weight.semibold,
                            }}
                          >
                            {suggestion.title}
                          </Text>
                          {suggestion.subtitle ? (
                            <Text
                              style={{
                                color: colors.text.secondary,
                                fontSize: typography.size.xs,
                                marginTop: 2,
                              }}
                            >
                              {suggestion.subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
              }}
            >
              Location Preview
            </Text>
            <View
              style={{
                minHeight: 220,
                borderRadius: borderRadius['3xl'],
                borderWidth: 1,
                borderColor: borderColor,
                backgroundColor: previewBackground,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing['2xl'],
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: borderRadius.full,
                  borderWidth: 1,
                  borderColor: borderColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                  backgroundColor: isDark ? '#111214' : '#FFFFFF',
                }}
              >
                <MapPin size={28} color={colors.text.tertiary} />
              </View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.semibold,
                  textAlign: 'center',
                }}
              >
                {previewText.primary}
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  textAlign: 'center',
                  marginTop: spacing.xs,
                }}
              >
                {previewText.secondary}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
