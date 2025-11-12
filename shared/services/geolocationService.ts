/**
 * Geolocation service with fallback to React Native's built-in geolocation
 */

import { Platform, PermissionsAndroid } from 'react-native';

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
        console.warn('Permission request error:', err);
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

    // Try react-native-geolocation-service first
    try {
      const GeolocationService = require('react-native-geolocation-service');
      GeolocationService.getCurrentPosition(success, error, defaultOptions);
      return;
    } catch (e) {
      console.log('react-native-geolocation-service not available, using built-in geolocation');
    }

    // Fallback to React Native's built-in geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error, defaultOptions);
    } else {
      error(new Error('Geolocation is not supported by this browser.'));
    }
  }

  static watchPosition(
    success: (position: Position) => void,
    error: (error: any) => void,
    options: GeolocationOptions = {}
  ): number | null {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
      ...options,
    };

    // Try react-native-geolocation-service first
    try {
      const GeolocationService = require('react-native-geolocation-service');
      return GeolocationService.watchPosition(success, error, defaultOptions);
    } catch (e) {
      console.log('react-native-geolocation-service not available, using built-in geolocation');
    }

    // Fallback to React Native's built-in geolocation
    if (navigator.geolocation) {
      return navigator.geolocation.watchPosition(success, error, defaultOptions);
    } else {
      error(new Error('Geolocation is not supported by this browser.'));
      return null;
    }
  }

  static clearWatch(watchId: number): void {
    // Try react-native-geolocation-service first
    try {
      const GeolocationService = require('react-native-geolocation-service');
      GeolocationService.clearWatch(watchId);
      return;
    } catch (e) {
      console.log('react-native-geolocation-service not available, using built-in geolocation');
    }

    // Fallback to React Native's built-in geolocation
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}
