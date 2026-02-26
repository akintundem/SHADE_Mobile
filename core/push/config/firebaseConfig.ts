/**
 * Firebase Cloud Messaging Configuration
 * 
 * Firebase config is provided by native files (google-services.json / GoogleService-Info.plist).
 * Optional extras can be injected via environment variables if needed.
 * 
 * For React Native Firebase, you need:
 * 1. Android: google-services.json (in android/app/)
 * 2. iOS: GoogleService-Info.plist (in ios/capsule/)
 * 
 * These files are automatically read by the native Firebase SDK.
 * 
 * Additional configuration can be provided via environment variables if needed.
 */

export interface FirebaseConfig {
  // Firebase Project ID (from Firebase Console)
  projectId?: string;
  // Firebase API Key (from google-services.json or GoogleService-Info.plist)
  apiKey?: string;
  // Firebase Messaging Sender ID (from Firebase Console)
  messagingSenderId?: string;
  // Firebase App ID (from google-services.json or GoogleService-Info.plist)
  appId?: string;
  // Server Key for sending notifications from backend (optional)
  serverKey?: string;
}

/**
 * Note: For React Native Firebase, the native files (google-services.json and GoogleService-Info.plist)
 * are the primary source of configuration. This config is for additional settings or validation.
 */
export function getFirebaseConfig(): FirebaseConfig {
  // Native files provide the authoritative configuration; returning empty keeps things explicit
  return {};
}

/**
 * Validate that required Firebase configuration is present
 * Note: For React Native Firebase, the native files (google-services.json and GoogleService-Info.plist)
 * are the primary source of configuration. This validation is for additional config if needed.
 */
export function validateFirebaseConfig(): boolean {
  const config = getFirebaseConfig();
  
  // For React Native Firebase, the native SDK handles most configuration
  // We only validate if additional config is needed
  if (__DEV__) {
    console.log('Firebase Config:', {
      projectId: config.projectId || 'Using native config',
      hasApiKey: !!config.apiKey,
      hasServerKey: !!config.serverKey,
    });
  }

  return true; // Native files handle the main configuration
}
