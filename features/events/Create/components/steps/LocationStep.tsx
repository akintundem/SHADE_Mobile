import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Navigation, MapPinned, Check, Users, Maximize2 } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GeolocationService } from '../../../../../shared/services/geolocationService';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import KeyboardOptimizedInput from '../../../../../shared/components/ui/KeyboardOptimizedInput';
import { Venue } from '../types';
import devConfig from '../../../../../dev-config.json';

type Props = {
  venue: Venue | null;
  locationSearchQuery: string;
  isGettingLocation: boolean;
  onVenueChange: (venue: Venue | null) => void;
  onLocationSearchChange: (query: string) => void;
  onGettingLocationChange: (isGetting: boolean) => void;
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
  isGettingLocation,
  onVenueChange,
  onLocationSearchChange,
  onGettingLocationChange,
}: Props) {
  const { colors, typography, spacing, borderRadius, brand, shadows, isDark } = useTheme();

  // Pure black and white colors
  const cardBackgroundColor = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#1F1F1F' : '#E5E7EB';
  const elevatedSurfaceColor = cardBackgroundColor;
  const subtleBorderColor = borderColor;

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapImageLoaded, setMapImageLoaded] = useState(false);
  const [mapImageError, setMapImageError] = useState(false);
  const [reverseGeocodedAddress, setReverseGeocodedAddress] = useState<string | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [useInteractiveMap, setUseInteractiveMap] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const mapRef = useRef<MapView>(null);

  const latitude = venue?.latitude ?? null;
  const longitude = venue?.longitude ?? null;
  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';

  const staticMapUrl = useMemo(() => {
    setMapImageLoaded(false);
    setMapImageError(false);
    
    if (!hasCoordinates || latitude === null || longitude === null) {
      console.log('No coordinates available for map preview:', { latitude, longitude, hasCoordinates });
      return null;
    }

    const zoom = 13;
    const width = 600;
    const height = 300;
    
    // Using OpenStreetMap via staticmap.openstreetmap.de (free, no API key)
    // Format: https://staticmap.openstreetmap.de/staticmap.php?center=LAT,LON&zoom=ZOOM&size=WIDTHxHEIGHT&markers=LAT,LON,red
    const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&maptype=mapnik&markers=${latitude},${longitude},orange-pushpin`;
    
    console.log('Generated static map URL');
    console.log('Coordinates:', { latitude, longitude, zoom });
    
    return url;
  }, [hasCoordinates, latitude, longitude]);


  const handleUseCurrentLocation = useCallback(async () => {
    onGettingLocationChange(true);
    try {
      const hasPermission = await GeolocationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is needed to use your current location.');
        onGettingLocationChange(false);
        return;
      }

      // First attempt with high accuracy
      GeolocationService.getCurrentPosition(
        (position) => {
          console.log('Successfully got location:', position.coords);
          const locationText = 'Current Location';
          onVenueChange({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: locationText,
            city: '',
            state: '',
            country: '',
            zipCode: '',
          });
          onLocationSearchChange(locationText);
          reverseGeocode(position.coords.latitude, position.coords.longitude);
          setSuggestions([]);
          setShowSuggestions(false);
          setIsSearching(false);
          onGettingLocationChange(false);
        },
        (error) => {
          console.error('Location error details:', {
            code: error?.code,
            message: error?.message,
            PERMISSION_DENIED: error?.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error?.POSITION_UNAVAILABLE,
            TIMEOUT: error?.TIMEOUT,
          });
          
          // If timeout, try again with lower accuracy for faster response
          if (error?.code === 3) {
            console.log('High accuracy timed out, trying with lower accuracy...');
            GeolocationService.getCurrentPosition(
              (position) => {
                console.log('Got location with lower accuracy:', position.coords);
                const locationText = 'Current Location';
                onVenueChange({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  address: locationText,
                  city: '',
                  state: '',
                  country: '',
                  zipCode: '',
                });
                onLocationSearchChange(locationText);
                reverseGeocode(position.coords.latitude, position.coords.longitude);
                setSuggestions([]);
                setShowSuggestions(false);
                setIsSearching(false);
                onGettingLocationChange(false);
              },
              (retryError) => {
                console.error('Retry location error:', retryError);
                showLocationError(retryError);
                onGettingLocationChange(false);
              },
              {
                enableHighAccuracy: false, // Use network/wifi location
                timeout: 10000,
                maximumAge: 60000, // Accept cached location up to 1 minute old
              }
            );
            return;
          }
          
          showLocationError(error);
          onGettingLocationChange(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased to 30 seconds
          maximumAge: 5000,
        }
      );
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert('Error', 'Failed to request location permission. Error: ' + (error instanceof Error ? error.message : 'Unknown'));
      onGettingLocationChange(false);
    }
  }, [onVenueChange, onGettingLocationChange, onLocationSearchChange]);

  const showLocationError = (error: any) => {
    let errorMessage = 'Failed to get your current location. Please try again or enter manually.';
    if (error?.code === 1) {
      errorMessage = 'Location permission was denied. Please enable location in your device settings.';
    } else if (error?.code === 2) {
      errorMessage = 'Location unavailable. Make sure GPS is enabled on your device.';
    } else if (error?.code === 3) {
      errorMessage = 'Location request timed out. Your GPS signal may be weak. Try entering the address manually.';
    }
    
    Alert.alert('Location Error', errorMessage);
  };

  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'capsule-app/1.0',
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to reverse geocode location');
      }

      const result = await response.json();
      const address = result.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      setReverseGeocodedAddress(address);
      console.log('Reverse geocoded address:', address);
    } catch (error) {
      console.warn('Reverse geocoding error:', error);
      setReverseGeocodedAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  const handleSuggestionSelect = useCallback(
    (suggestion: LocationSuggestion) => {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsSearching(false);
      Keyboard.dismiss();

      const venueData = {
        address: suggestion.displayName,
        city: suggestion.components.city,
        state: suggestion.components.state,
        country: suggestion.components.country,
        zipCode: suggestion.components.zipCode,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      };
      
      console.log('Setting venue with coordinates:', {
        lat: suggestion.latitude,
        lon: suggestion.longitude,
        address: suggestion.displayName,
      });
      
      onVenueChange(venueData);
      onLocationSearchChange(suggestion.displayName);
    },
    [onVenueChange, onLocationSearchChange],
  );

  // Format venue address for display
  const formatVenueAddress = () => {
    if (!venue) return '';
    const parts = [];
    if (venue.address) parts.push(venue.address);
    if (venue.city) parts.push(venue.city);
    if (venue.state) parts.push(venue.state);
    if (venue.country) parts.push(venue.country);
    if (venue.zipCode) parts.push(venue.zipCode);
    return parts.join(', ');
  };

  const handleLocationSelect = useCallback(
    (selectedAddress: string) => {
      const trimmed = selectedAddress.trim();
      if (!trimmed) {
        return;
      }

      setShowSuggestions(false);
      setSuggestions([]);
      setIsSearching(false);
      Keyboard.dismiss();

      onVenueChange({
        address: trimmed,
      });
      onLocationSearchChange(trimmed);
    },
    [onVenueChange, onLocationSearchChange],
  );

  const locationDisplay = formatVenueAddress() || locationSearchQuery || 'Search for a venue to preview it here';
  const hasSelectedLocation = Boolean(locationSearchQuery || venue?.address);

  useEffect(() => {
    if (!locationSearchQuery || locationSearchQuery.trim().length < 3) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      searchAbortControllerRef.current?.abort();
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    setIsSearching(true);
    setShowSuggestions(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        searchAbortControllerRef.current?.abort();
        const controller = new AbortController();
        searchAbortControllerRef.current = controller;

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
        const mappedSuggestions: LocationSuggestion[] = results.map((item, index) => {
          const address = item.address || {};
          const displayName: string = item.display_name || locationSearchQuery;
          const [title, ...rest] = displayName.split(',');
          const subtitle = rest.join(', ').trim();

          return {
            id: item.place_id?.toString() ?? `${item.lat}-${item.lon}-${index}`,
            title: title?.trim() || displayName,
            subtitle: subtitle || undefined,
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

        setSuggestions(mappedSuggestions);
        setShowSuggestions(mappedSuggestions.length > 0);
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          console.warn('Location suggestions error', error);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, [locationSearchQuery]);

  useEffect(() => {
    return () => {
      searchAbortControllerRef.current?.abort();
    };
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 120,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback
        onPress={() => {
          setShowSuggestions(false);
          Keyboard.dismiss();
        }}
      >
        <View>
          <View style={{ marginBottom: spacing.xl }}>
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: typography.weight.bold,
                fontSize: typography.size['2xl'],
                marginBottom: spacing.xs,
              }}
            >
              Location
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.size.sm,
              }}
            >
              Where is your event
            </Text>
          </View>

          <View style={{ gap: spacing.xl }}>
            <View
              style={{
                backgroundColor: cardBackgroundColor,
                borderRadius: borderRadius.xl,
                borderWidth: 1,
                borderColor: borderColor,
                padding: spacing.lg,
                gap: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.sm,
                      fontWeight: typography.weight.semibold,
                    }}
                  >
                    Search or enter address
                  </Text>
                  <Text
                    style={{
                      color: colors.text.tertiary,
                      fontSize: typography.size.xs,
                      marginTop: 2,
                    }}
                  >
                    Find your venue or tap the compass to use your current location.
                  </Text>
                </View>
              </View>

              <KeyboardOptimizedInput
                inputType="location"
                placeholder="123 Market Street, San Francisco"
                value={locationSearchQuery}
                onChangeText={(text) => {
                  onLocationSearchChange(text);
                  if (!text && venue) {
                    onVenueChange(null);
                  }
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 120);
                  if (
                    locationSearchQuery &&
                    (!venue || (!venue.latitude && !venue.longitude))
                  ) {
                    handleLocationSelect(locationSearchQuery);
                  }
                }}
                rightIcon={
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: borderRadius.full,
                      backgroundColor: brand.secondary + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSearching || isGettingLocation ? (
                      <ActivityIndicator size="small" color={brand.secondary} />
                    ) : (
                      <Navigation size={18} color={brand.secondary} />
                    )}
                  </View>
                }
                onRightIconPress={() => {
                  if (!isSearching) {
                    handleUseCurrentLocation();
                  }
                }}
                containerStyle={{ marginTop: 0 }}
              />
            </View>

            {showSuggestions && (isSearching || suggestions.length > 0) && (
              <View
                style={{
                  backgroundColor: cardBackgroundColor,
                  borderRadius: borderRadius.xl,
                  borderWidth: 1,
                  borderColor: borderColor,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  gap: spacing.sm,
                }}
              >
                {isSearching && suggestions.length === 0 ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.sm,
                    }}
                  >
                    <ActivityIndicator size="small" color={brand.secondary} />
                    <Text
                      style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.sm,
                      }}
                    >
                      Searching locations...
                    </Text>
                  </View>
                ) : (
                  suggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.id}
                      activeOpacity={0.85}
                      onPress={() => handleSuggestionSelect(suggestion)}
                      style={{
                        paddingVertical: spacing.md,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.sm,
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: borderRadius.full,
                          backgroundColor: brand.secondary + '20',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MapPinned size={16} color={brand.secondary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: colors.text.primary,
                            fontSize: typography.size.sm,
                            fontWeight: typography.weight.medium,
                          }}
                          numberOfLines={1}
                        >
                          {suggestion.title}
                        </Text>
                        {suggestion.subtitle && (
                          <Text
                            style={{
                              color: colors.text.tertiary,
                              fontSize: typography.size.xs,
                              marginTop: 2,
                            }}
                            numberOfLines={1}
                          >
                            {suggestion.subtitle}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            <View
              style={{
                backgroundColor: cardBackgroundColor,
                borderRadius: borderRadius.xl,
                borderWidth: 1,
                borderColor: borderColor,
                overflow: 'hidden',
              }}
            >
              <View style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                {hasCoordinates && latitude !== null && longitude !== null ? (
                  useInteractiveMap ? (
                    <>
                      <MapView
                        ref={mapRef}
                        style={{ width: '100%', height: '100%' }}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{
                          latitude,
                          longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                        scrollEnabled={true}
                        zoomEnabled={true}
                        pitchEnabled={false}
                        rotateEnabled={false}
                      >
                        <Marker
                          coordinate={{ latitude, longitude }}
                          title={locationSearchQuery === 'Current Location' ? 'Your Location' : locationSearchQuery}
                          pinColor={brand.secondary}
                        />
                      </MapView>
                      <TouchableOpacity
                        onPress={() => setUseInteractiveMap(false)}
                        style={{
                          position: 'absolute',
                          top: spacing.sm,
                          right: spacing.sm,
                          backgroundColor: cardBackgroundColor,
                          borderRadius: borderRadius.lg,
                          padding: spacing.sm,
                          ...shadows.md,
                        }}
                      >
                        <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, fontWeight: typography.weight.medium }}>Static</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {staticMapUrl && !mapImageError ? (
                        <>
                          <Image
                            source={{ uri: staticMapUrl }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                            onLoad={() => setMapImageLoaded(true)}
                            onError={() => {
                              console.warn('Map image failed to load:', staticMapUrl);
                              setMapImageError(true);
                            }}
                          />
                          {!mapImageLoaded && (
                            <View
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: cardBackgroundColor,
                              }}
                            >
                              <ActivityIndicator size="large" color={brand.secondary} />
                              <Text
                                style={{
                                  color: colors.text.secondary,
                                  fontSize: typography.size.xs,
                                  marginTop: spacing.sm,
                                }}
                              >
                                Loading map preview...
                              </Text>
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => setUseInteractiveMap(true)}
                            style={{
                              position: 'absolute',
                              top: spacing.sm,
                              right: spacing.sm,
                              backgroundColor: brand.secondary,
                              borderRadius: borderRadius.lg,
                              padding: spacing.sm,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: spacing.xs,
                              ...shadows.md,
                            }}
                          >
                            <Maximize2 size={14} color="#FFFFFF" />
                            <Text style={{ color: '#FFFFFF', fontSize: typography.size.xs, fontWeight: typography.weight.bold }}>Explore</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: cardBackgroundColor,
                            padding: spacing.lg,
                          }}
                        >
                          <View
                            style={{
                              width: 54,
                              height: 54,
                              borderRadius: borderRadius.full,
                              backgroundColor: brand.secondary + '15',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: spacing.md,
                            }}
                          >
                            <MapPinned size={24} color={brand.secondary} />
                          </View>
                          <Text
                            style={{
                              color: colors.text.primary,
                              fontSize: typography.size.sm,
                              fontWeight: typography.weight.medium,
                            }}
                          >
                            Map preview unavailable
                          </Text>
                          <Text
                            style={{
                              color: colors.text.tertiary,
                              fontSize: typography.size.xs,
                              marginTop: spacing.xs,
                              textAlign: 'center',
                            }}
                          >
                            Loading map...
                          </Text>
                        </View>
                      )}
                    </>
                  )
                ) : (
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: cardBackgroundColor,
                      padding: spacing.lg,
                    }}
                  >
                    <View
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: borderRadius.full,
                        backgroundColor: brand.secondary + '15',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: spacing.md,
                      }}
                    >
                      <MapPinned size={24} color={brand.secondary} />
                    </View>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: typography.size.sm,
                        fontWeight: typography.weight.medium,
                      }}
                    >
                      Map preview unavailable
                    </Text>
                    <Text
                      style={{
                        color: colors.text.tertiary,
                        fontSize: typography.size.xs,
                        marginTop: spacing.xs,
                        textAlign: 'center',
                      }}
                    >
                      {hasSelectedLocation
                        ? 'Add coordinates to show this spot on the map.'
                        : 'Start searching for a venue to preview it on the map.'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Subtle divider */}
              {hasSelectedLocation && (
                <View 
                  style={{ 
                    height: 1, 
                    backgroundColor: borderColor,
                    opacity: 0.5,
                  }} 
                />
              )}

              {hasSelectedLocation ? (
                <View 
                  style={{ 
                    padding: spacing.lg,
                    paddingTop: spacing.md,
                    backgroundColor: cardBackgroundColor,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: borderRadius.xl,
                        backgroundColor: brand.secondary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2,
                        ...shadows.sm,
                      }}
                    >
                      <MapPinned size={22} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                      {locationSearchQuery === 'Current Location' && reverseGeocodedAddress ? (
                        <>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 }}>
                            <View
                              style={{
                                paddingHorizontal: spacing.xs,
                                paddingVertical: 2,
                                borderRadius: borderRadius.sm,
                                backgroundColor: brand.secondary + '20',
                              }}
                            >
                              <Text
                                style={{
                                  color: brand.secondary,
                                  fontSize: typography.size.xs,
                                  fontWeight: typography.weight.bold,
                                }}
                              >
                                CURRENT LOCATION
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={{
                              color: colors.text.primary,
                              fontSize: typography.size.lg,
                              fontWeight: typography.weight.bold,
                              lineHeight: 24,
                              marginBottom: 4,
                            }}
                          >
                            {reverseGeocodedAddress.split(',')[0]}
                          </Text>
                          <Text
                            style={{
                              color: colors.text.secondary,
                              fontSize: typography.size.sm,
                              lineHeight: 19,
                            }}
                            numberOfLines={2}
                          >
                            {reverseGeocodedAddress.split(',').slice(1).join(',').trim()}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text
                            style={{
                              color: colors.text.primary,
                              fontSize: typography.size.lg,
                              fontWeight: typography.weight.bold,
                              lineHeight: 24,
                              marginBottom: 4,
                            }}
                          >
                            {locationDisplay.split(',')[0]}
                          </Text>
                          <Text
                            style={{
                              color: colors.text.secondary,
                              fontSize: typography.size.sm,
                              lineHeight: 19,
                            }}
                            numberOfLines={2}
                          >
                            {locationDisplay.split(',').slice(1).join(',').trim()}
                          </Text>
                        </>
                      )}
                    </View>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: borderRadius.full,
                        backgroundColor: brand.secondary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 8,
                        ...shadows.sm,
                      }}
                    >
                      <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                  </View>
                </View>
              ) : (
                <View 
                  style={{ 
                    padding: spacing.xl,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: cardBackgroundColor,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.full,
                      backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: spacing.sm,
                    }}
                  >
                    <MapPinned size={24} color={colors.text.tertiary} strokeWidth={1.5} />
                  </View>
                  <Text
                    style={{
                      color: colors.text.tertiary,
                      fontSize: typography.size.sm,
                      textAlign: 'center',
                      fontWeight: typography.weight.medium,
                    }}
                  >
                    No location selected
                  </Text>
                </View>
              )}
            </View>

          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

