import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Example component showing how to use push notifications
 *
 * You can use this as a reference or add it to your settings screen
 */
export const NotificationExample: React.FC = () => {
  const {
    fcmToken,
    permissionStatus,
    requestPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
  } = useNotifications();

  useEffect(() => {
    if (fcmToken) {
      console.log('📱 Your FCM Token (use this for testing):', fcmToken);
    }
  }, [fcmToken]);

  const handleRequestPermission = async () => {
    const status = await requestPermission();
    console.log('Permission status:', status);
    alert(`Permission ${status === 1 ? 'granted' : 'denied'}`);
  };

  const handleSubscribeEvents = async () => {
    await subscribeToTopic('events');
    alert('Subscribed to events topic');
  };

  const handleUnsubscribeEvents = async () => {
    await unsubscribeFromTopic('events');
    alert('Unsubscribed from events topic');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Push Notifications</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FCM Token:</Text>
        <Text style={styles.token} selectable>
          {fcmToken || 'Loading...'}
        </Text>
        <Text style={styles.hint}>
          Copy this token to test notifications from Firebase Console
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permission Status:</Text>
        <Text style={styles.status}>
          {permissionStatus === 1
            ? '✅ Authorized'
            : permissionStatus === 0
            ? '❌ Denied'
            : permissionStatus === 2
            ? '⚠️ Provisional'
            : '❓ Not Determined'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions:</Text>

        <Button
          title="Request Permission"
          onPress={handleRequestPermission}
        />

        <View style={styles.spacer} />

        <Button
          title="Subscribe to Events Topic"
          onPress={handleSubscribeEvents}
        />

        <View style={styles.spacer} />

        <Button
          title="Unsubscribe from Events Topic"
          onPress={handleUnsubscribeEvents}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing Instructions:</Text>
        <Text style={styles.instructions}>
          1. Copy your FCM token above{'\n'}
          2. Go to Firebase Console → Cloud Messaging{'\n'}
          3. Click "Send your first message"{'\n'}
          4. Enter title and body{'\n'}
          5. Click "Send test message"{'\n'}
          6. Paste your FCM token{'\n'}
          7. Click "Test"{'\n'}
          {'\n'}
          You should receive a notification!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  token: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  status: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  spacer: {
    height: 12,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
  },
});
