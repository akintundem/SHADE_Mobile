import React, { useCallback, useMemo } from 'react';
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
import { useCreateEvent } from '../../context';
import { useLocationSearch } from '../../hooks';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import EventLocationHeader from '../../../event-dashboard/dashboard/components/EventLocationHeader';

export function LocationStep() {
  const { form, actions, validation } = useCreateEvent();
  const { colors } = useTheme();
  const iconTertiary = colors.text.tertiary;
  const iconSecondary = colors.text.secondary;

  const {
    suggestions,
    isSearching,
    showSuggestions,
    setShowSuggestions,
    clearSuggestions,
    canSearch,
  } = useLocationSearch(form.locationSearchQuery);

  const handleSuggestionSelect = useCallback(
    (suggestion: typeof suggestions[number]) => {
      actions.setVenue({
        address: suggestion.title || suggestion.displayName,
        city: suggestion.components.city,
        state: suggestion.components.state,
        country: suggestion.components.country,
        zipCode: suggestion.components.zipCode,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      });
      actions.setLocationSearchQuery(suggestion.displayName);
      validation.setFieldTouched('location');
      validation.validateField('location', suggestion.displayName);
      clearSuggestions();
    },
    [actions, clearSuggestions, validation],
  );

  const venueLabelParts = useMemo(() => {
    if (!form.venue) return null;
    const parts = [form.venue.address, form.venue.city, form.venue.state, form.venue.country]
      .filter(Boolean);
    return parts.length > 0 ? parts : null;
  }, [form.venue]);

  const venueCoordinates = useMemo(() => {
    const latitude = form.venue?.latitude;
    const longitude = form.venue?.longitude;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return { latitude, longitude };
    }
    return null;
  }, [form.venue?.latitude, form.venue?.longitude]);

  const previewText = useMemo(() => {
    if (venueLabelParts) {
      const [primary, ...rest] = venueLabelParts;
      return {
        primary,
        secondary: rest.length > 0 ? rest.join(', ') : '',
      };
    }

    if (form.locationSearchQuery) {
      return {
        primary: 'Keep typing to refine your search.',
        secondary: 'Select an address from the dropdown list when it appears.',
      };
    }

    return {
      primary: 'Search and select a location to preview',
      secondary: 'Start typing an address or place to begin.',
    };
  }, [form.locationSearchQuery, venueLabelParts]);

  const locationError = validation.getFieldError('location');

  const handleClear = () => {
    actions.setLocationSearchQuery('');
    actions.setVenue(null);
    clearSuggestions();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowSuggestions(false);
        Keyboard.dismiss();
      }}
      accessible={false}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="px-lg pt-xl pb-[120px] gap-xl">
          <View className="gap-xs">
            <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary">
              Event Location
            </Text>
            <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary">
              Search for an address or place to set your event location.
            </Text>
          </View>

          <View className="gap-sm">
            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
              Location
            </Text>
            <View className={`relative ${showSuggestions ? 'z-10' : 'z-0'}`}>
              <View
                className={`bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl overflow-hidden ${
                  showSuggestions && (isSearching || suggestions.length > 0) ? 'rounded-b-none' : ''
                }`}
              >
                <View className="flex-row items-center px-lg h-14">
                  <MapPin size={18} color={iconTertiary} />
                  <TextInput
                    placeholder="Search for a location"
                    placeholderTextColor={iconTertiary}
                    value={form.locationSearchQuery}
                    onChangeText={(text) => {
                      actions.setLocationSearchQuery(text);
                      if (!text) {
                        actions.setVenue(null);
                        clearSuggestions();
                        return;
                      }
                      if (form.venue?.address && form.venue.address !== text) {
                        actions.setVenue(null);
                      }
                    }}
                    onBlur={() => {
                      validation.setFieldTouched('location');
                      validation.validateField('location', form.venue?.address || '');
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0 || isSearching) {
                        setShowSuggestions(true);
                      }
                    }}
                    className="flex-1 text-base text-txt-primary dark:text-txt-dark-primary ml-sm"
                  />
                  {isSearching ? (
                    <ActivityIndicator size="small" color={iconSecondary} />
                  ) : form.locationSearchQuery ? (
                    <TouchableOpacity onPress={handleClear} hitSlop={8}>
                      <X size={18} color={iconSecondary} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {showSuggestions && (isSearching || suggestions.length > 0) && (
                  <View className="border-t border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface pb-1">
                    {isSearching && suggestions.length === 0 ? (
                      <View className="px-lg py-md flex-row items-center gap-sm">
                        <ActivityIndicator size="small" color={iconSecondary} />
                        <Text className="text-txt-secondary dark:text-txt-dark-secondary text-sm">
                          Searching...
                        </Text>
                      </View>
                    ) : (
                      suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={suggestion.id}
                          activeOpacity={0.7}
                          onPress={() => handleSuggestionSelect(suggestion)}
                          className="px-lg py-3 flex-row items-center gap-3"
                        >
                          <MapPin size={16} color={iconSecondary} />
                          <View className="flex-1 min-w-0">
                            <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary" numberOfLines={1}>
                              {suggestion.title}
                            </Text>
                            {suggestion.subtitle ? (
                              <Text className="text-xs text-txt-secondary dark:text-txt-dark-secondary mt-0.5" numberOfLines={2}>
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
            {!canSearch && form.locationSearchQuery.length > 0 ? (
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                Enter at least 2 characters to search.
              </Text>
            ) : null}
            {locationError ? (
              <Text className="text-xs text-semantic-error">
                {locationError}
              </Text>
            ) : null}
          </View>

          <View className="gap-sm">
            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
              Location Preview
            </Text>
            <View className="min-h-[220px] rounded-3xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card overflow-hidden">
              {venueCoordinates ? (
                <View className="h-[150px]">
                  <EventLocationHeader
                    latitude={venueCoordinates.latitude}
                    longitude={venueCoordinates.longitude}
                  />
                </View>
              ) : (
                <View className="h-[150px] items-center justify-center bg-light-background dark:bg-dark-background">
                  <View className="w-14 h-14 rounded-full border border-light-border dark:border-dark-border items-center justify-center bg-light-card dark:bg-dark-card">
                    <MapPin size={28} color={iconTertiary} />
                  </View>
                </View>
              )}
              <View className="px-xl py-lg items-center">
                <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary text-center">
                  {previewText.primary}
                </Text>
                {previewText.secondary ? (
                  <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary text-center mt-xs">
                    {previewText.secondary}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
