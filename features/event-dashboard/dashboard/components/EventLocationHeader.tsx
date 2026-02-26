import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type EventLocationHeaderProps = {
  latitude?: number;
  longitude?: number;
};

export default function EventLocationHeader({ latitude, longitude }: EventLocationHeaderProps) {
  const { colors, isDark } = useTheme();

  // Minimalist grayscale map style inspired by Wealthsimple
  const minimalistMapStyle = useMemo(
    () => [
      {
        featureType: 'all',
        elementType: 'geometry',
        stylers: [{ color: colors.surface }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: colors.borderLight }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: colors.background }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: colors.text.tertiary }],
      },
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ],
    [colors.background, colors.borderLight, colors.surface, colors.text.tertiary],
  );

  const styles = useMemo(() => {
    const shadowColor = isDark ? colors.background : colors.text.primary;
    return StyleSheet.create({
      container: {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: colors.surface,
      },
      map: {
        ...StyleSheet.absoluteFillObject,
      },
      fallbackHeader: {
        height: '100%',
        width: '100%',
        backgroundColor: colors.surface,
      },
      markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      markerOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.brand.primary,
        borderWidth: 3,
        borderColor: colors.background,
        shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      },
      markerInner: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.background,
      },
    });
  }, [colors.background, colors.brand.primary, colors.surface, colors.text.primary, isDark]);

  // Fallback to clean gray header if no valid coordinates
  if (!latitude || !longitude || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return <View style={styles.fallbackHeader} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        customMapStyle={minimalistMapStyle}
        pointerEvents="none"
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.markerContainer}>
            <View style={styles.markerOuter} />
            <View style={styles.markerInner} />
          </View>
        </Marker>
      </MapView>
    </View>
  );
}
