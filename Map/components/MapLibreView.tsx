import React, { useRef, useEffect, useState } from 'react';
import { View, Dimensions, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../../theme/ThemeProvider';
import { Event, isEventLive, getEventTypeColorHex, getParticipantCount } from '../../utils/eventUtils';

const { width, height } = Dimensions.get('window');

type Props = {
  events: Event[];
  userLocation?: { latitude: number; longitude: number };
  onEventSelect?: (event: Event) => void;
  showEvents?: boolean;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
};

export const MapLibreView = ({ 
  events, 
  userLocation, 
  onEventSelect, 
  showEvents = true,
  onGestureStart,
  onGestureEnd
}: Props) => {
  const { colors, brand, spacing, borderRadius } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Custom map style for open-source feel
  const mapStyle = [
    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": colors.surface
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": colors.border
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": colors.card
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": colors.text.secondary
        }
      ]
    }
  ];

  // Generate coordinates for events (in real app, these would come from event data)
  const getEventCoordinates = (event: Event, index: number) => {
    if (event.location.coordinates) {
      return event.location.coordinates;
    }
    
    // Generate demo coordinates around user location or default to NYC
    const baseLat = userLocation?.latitude || 40.7128;
    const baseLng = userLocation?.longitude || -74.006;
    
    return {
      latitude: baseLat + (Math.random() - 0.5) * 0.1,
      longitude: baseLng + (Math.random() - 0.5) * 0.1,
    };
  };

  return (
    <View style={{ 
      height: height * 0.55,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <MapView
        style={{ flex: 1 }}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: userLocation?.latitude || 40.7128,
          longitude: userLocation?.longitude || -74.006,
          latitudeDelta: 0.12,
          longitudeDelta: 0.08,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onMapReady={() => setMapLoaded(true)}
        zoomEnabled={true}
        zoomControlEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        minZoomLevel={3}
        maxZoomLevel={20}
        onTouchStart={onGestureStart}
        onTouchEnd={onGestureEnd}
        onPanDrag={onGestureStart}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 3,
              borderColor: colors.background,
            }}>
              <View style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#FFFFFF',
              }} />
            </View>
          </Marker>
        )}

        {/* Event markers */}
        {showEvents && events.map((event, index) => {
          const coordinates = getEventCoordinates(event, index);
          const participantCount = getParticipantCount(event);
          const isLive = isEventLive(event.startDate, event.endDate);
          const eventColor = getEventTypeColorHex(event.type);

          return (
            <Marker
              key={event.id}
              coordinate={coordinates}
              title={event.title}
              description={event.location.name}
              onPress={() => onEventSelect?.(event)}
            >
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Event image pin */}
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: eventColor,
                  overflow: 'hidden',
                  backgroundColor: colors.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}>
                  <Image
                    source={{ uri: event.image || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400&auto=format&fit=crop' }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>

                {/* Event type badge */}
                <View style={{
                  position: 'absolute',
                  bottom: -10,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  backgroundColor: eventColor,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.background,
                }}>
                  <View style={{
                    width: 22,
                    height: 10,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 3,
                  }} />
                </View>

                {/* Live indicator */}
                {isLive && (
                  <View style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#ef4444',
                    borderWidth: 2,
                    borderColor: colors.background,
                  }} />
                )}

                {/* Participant count */}
                {participantCount > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    backgroundColor: '#3b82f6',
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.background,
                    minWidth: 16,
                    alignItems: 'center',
                  }}>
                    <View style={{
                      width: 10,
                      height: 8,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 2,
                    }} />
                  </View>
                )}
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};
