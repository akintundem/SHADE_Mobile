import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Clipboard,
  View,
} from 'react-native';
import notificationService from '../services/notificationService';

/**
 * Simple floating button to show and copy FCM token
 * Add this to any screen for quick testing:
 *
 * import { FCMTokenButton } from './shared/components/FCMTokenButton';
 * <FCMTokenButton />
 */
export const FCMTokenButton: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const fcmToken = await notificationService.getFCMToken();
      setToken(fcmToken);
    };
    getToken();
  }, []);

  const handlePress = () => {
    if (token) {
      Alert.alert(
        'FCM Token',
        token,
        [
          {
            text: 'Copy',
            onPress: () => {
              Clipboard.setString(token);
              Alert.alert('Copied!', 'Token copied to clipboard');
            },
          },
          { text: 'Cancel' },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert('Loading', 'Token is still loading...');
    }
  };

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <Text style={styles.icon}>🔔</Text>
        <Text style={styles.text}>FCM</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
