/**
 * Geolocation service using @react-native-community/geolocation
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Position {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export class GeolocationService {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Shade needs location access to show events near you',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  }

  static getCurrentPosition(
    success: (position: Position) => void,
    error: (error: any) => void,
    options: GeolocationOptions = {}
  ): void {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
      ...options,
    };

    Geolocation.getCurrentPosition(success, error, defaultOptions);
  }

  static watchPosition(
    success: (position: Position) => void,
    error: (error: any) => void,
    options: GeolocationOptions = {}
  ): number {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
      ...options,
    };

    return Geolocation.watchPosition(success, error, defaultOptions);
  }

  static clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  }
}
