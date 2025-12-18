import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type EventLocationHeaderProps = {
  latitude?: number;
  longitude?: number;
};

export default function EventLocationHeader({ latitude, longitude }: EventLocationHeaderProps) {
  // Fallback to dark header if no valid coordinates
  if (!latitude || !longitude || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return <View style={styles.fallbackHeader} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        pointerEvents="none"
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackHeader: {
    height: 250,
    width: '100%',
    backgroundColor: '#1A1A1A',
  },
});

