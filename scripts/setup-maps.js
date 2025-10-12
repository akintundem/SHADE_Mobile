#!/usr/bin/env node

/**
 * Map Setup Script for Shade App
 * This script helps configure the necessary permissions and setup for maps
 */

const fs = require('fs');
const path = require('path');

console.log('🗺️  Setting up maps for Shade app...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// iOS Info.plist setup
const iosInfoPlistPath = 'ios/capsule/Info.plist';
if (fs.existsSync(iosInfoPlistPath)) {
  console.log('📱 Configuring iOS permissions...');
  
  let infoPlist = fs.readFileSync(iosInfoPlistPath, 'utf8');
  
  // Add location permission if not exists
  if (!infoPlist.includes('NSLocationWhenInUseUsageDescription')) {
    const locationPermission = `
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Shade needs location access to show events near you and provide location-based features.</string>
    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>Shade needs location access to show events near you and provide location-based features.</string>`;
    
    // Insert before closing </dict>
    infoPlist = infoPlist.replace('</dict>', `${locationPermission}\n\t</dict>`);
    fs.writeFileSync(iosInfoPlistPath, infoPlist);
    console.log('✅ iOS location permissions added');
  } else {
    console.log('✅ iOS location permissions already configured');
  }
} else {
  console.log('⚠️  iOS Info.plist not found, skipping iOS setup');
}

// Android manifest setup
const androidManifestPath = 'android/app/src/main/AndroidManifest.xml';
if (fs.existsSync(androidManifestPath)) {
  console.log('🤖 Configuring Android permissions...');
  
  let manifest = fs.readFileSync(androidManifestPath, 'utf8');
  
  // Add location permissions if not exists
  if (!manifest.includes('ACCESS_FINE_LOCATION')) {
    const locationPermissions = `
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />`;
    
    // Insert after <manifest> tag
    manifest = manifest.replace('<manifest', `${locationPermissions}\n<manifest`);
    fs.writeFileSync(androidManifestPath, manifest);
    console.log('✅ Android location permissions added');
  } else {
    console.log('✅ Android location permissions already configured');
  }
} else {
  console.log('⚠️  Android manifest not found, skipping Android setup');
}

// Create environment file template
const envTemplate = `# Map Configuration
# Get your API key from: https://console.cloud.google.com/google/maps-apis

# Google Maps API Key (required for maps to work)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# MapLibre Configuration (optional - for open source maps)
MAPLIBRE_STYLE_URL=https://tiles.openfreemap.org/styles/bright
`;

if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', envTemplate);
  console.log('✅ Created .env file template');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🎉 Map setup complete!\n');

console.log('📋 Next steps:');
console.log('1. Get a Google Maps API key from: https://console.cloud.google.com/google/maps-apis');
console.log('2. Add your API key to the .env file');
console.log('3. For iOS: Add the API key to ios/capsule/AppDelegate.mm');
console.log('4. For Android: Add the API key to android/app/src/main/AndroidManifest.xml');
console.log('5. Run: npm install');
console.log('6. Run: npx react-native run-ios or npx react-native run-android\n');

console.log('🔧 Manual configuration needed:');
console.log('- iOS: Add API key to AppDelegate.mm');
console.log('- Android: Add API key to AndroidManifest.xml');
console.log('- Enable Maps SDK for both platforms in Google Cloud Console\n');

console.log('📚 For detailed setup instructions, see: MAP_SETUP_GUIDE.md');
