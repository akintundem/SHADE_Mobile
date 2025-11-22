import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNotifications } from '../../shared/hooks/useNotifications';
import notificationService from '../../shared/services/notificationService';

export const NotificationSettingsScreen: React.FC = () => {
  const { fcmToken, permissionStatus } = useNotifications();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
    }
  }, [fcmToken]);

  const copyToClipboard = () => {
    if (fcmToken) {
      Clipboard.setString(fcmToken);
      setCopied(true);
      Alert.alert('Copied!', 'FCM Token copied to clipboard');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const status = await notificationService.requestPermission();
      Alert.alert(
        'Permission Status',
        status === 1 ? 'Notifications Enabled ✅' : 'Permission Denied ❌'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to request permission');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionText = () => {
    switch (permissionStatus) {
      case 1:
        return '✅ Enabled';
      case 0:
        return '❌ Denied';
      case 2:
        return '⚠️ Provisional';
      default:
        return '❓ Unknown';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Push Notifications</Text>

      {/* Permission Status */}
      <View style={styles.card}>
        <Text style={styles.label}>Permission Status</Text>
        <Text style={styles.value}>{getPermissionText()}</Text>
        {permissionStatus !== 1 && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestPermission}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enable Notifications</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* FCM Token */}
      <View style={styles.card}>
        <Text style={styles.label}>Your Device Token</Text>
        <Text style={styles.hint}>
          Copy this token to send test notifications
        </Text>

        <View style={styles.tokenContainer}>
          <Text style={styles.token} selectable>
            {fcmToken || 'Loading token...'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, copied && styles.buttonSuccess]}
          onPress={copyToClipboard}
          disabled={!fcmToken}
        >
          <Text style={styles.buttonText}>
            {copied ? '✓ Copied!' : '📋 Copy Token'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.card}>
        <Text style={styles.label}>How to Test</Text>
        <View style={styles.instructions}>
          <Text style={styles.step}>1. Copy your token above</Text>
          <Text style={styles.step}>
            2. Go to Firebase Console → Engage → Messaging
          </Text>
          <Text style={styles.step}>3. Click "Create your first campaign"</Text>
          <Text style={styles.step}>4. Choose "Firebase Notification messages"</Text>
          <Text style={styles.step}>5. Enter title and text</Text>
          <Text style={styles.step}>6. Click "Send test message"</Text>
          <Text style={styles.step}>7. Paste your token</Text>
          <Text style={styles.step}>8. Click "Test"</Text>
        </View>
      </View>

      {/* Alternative: Using REST API */}
      <View style={styles.card}>
        <Text style={styles.label}>Alternative: Use cURL</Text>
        <Text style={styles.hint}>
          If you can't find the UI, use this command in your terminal:
        </Text>
        <View style={styles.codeBlock}>
          <Text style={styles.code} selectable>
            {`curl -X POST https://fcm.googleapis.com/fcm/send \\
-H "Authorization: key=YOUR_SERVER_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "to": "${fcmToken || 'YOUR_FCM_TOKEN'}",
  "notification": {
    "title": "Test",
    "body": "Hello from cURL!"
  }
}'`}
          </Text>
        </View>
        <Text style={styles.hint}>
          Get YOUR_SERVER_KEY from Firebase Console → Project Settings → Cloud
          Messaging → Server Key
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
    color: '#666',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  tokenContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  token: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: '#333',
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonSuccess: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    marginTop: 8,
  },
  step: {
    fontSize: 14,
    lineHeight: 24,
    color: '#555',
    marginBottom: 4,
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  code: {
    fontSize: 11,
    fontFamily: 'Courier',
    color: '#00ff00',
    lineHeight: 16,
  },
});
