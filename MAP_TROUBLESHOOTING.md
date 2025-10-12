# Map Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. "Unable to resolve module react-native-geolocation-service"

**Error:**
```
ERROR Error: Unable to resolve module react-native-geolocation-service
```

**Solution:**
```bash
# Install the missing dependency
npm install react-native-geolocation-service

# Or use the setup script
npm run setup-maps
```

### 2. Maps Not Loading / Blank Map

**Causes:**
- Missing Google Maps API key
- API key not configured properly
- Maps SDK not enabled

**Solution:**
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Enable "Maps SDK for Android" and "Maps SDK for iOS"
3. Add API key to your project:

**iOS (`ios/capsule/AppDelegate.mm`):**
```objc
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"YOUR_API_KEY_HERE"];
  // ... rest of your code
}
```

**Android (`android/app/src/main/AndroidManifest.xml`):**
```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY_HERE"/>
</application>
```

### 3. Location Permission Denied

**Error:**
```
Location error: Permission denied
```

**Solution:**
1. **iOS**: Add to `Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Shade needs location access to show events near you</string>
```

2. **Android**: Permissions are automatically added by the setup script

3. **Manual permission request**: The app will fallback to San Francisco if permission is denied

### 4. Metro Bundler Cache Issues

**Error:**
```
Module resolution errors
```

**Solution:**
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or clear all caches
npm start -- --reset-cache
```

### 5. Build Errors

**Error:**
```
Build failed with errors
```

**Solution:**
```bash
# Clean and rebuild
cd ios && xcodebuild clean && cd ..
cd android && ./gradlew clean && cd ..

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npx react-native run-ios
# or
npx react-native run-android
```

## 🔧 Quick Fixes

### Reset Everything
```bash
# 1. Clean everything
rm -rf node_modules
cd ios && xcodebuild clean && cd ..
cd android && ./gradlew clean && cd ..

# 2. Reinstall
npm install

# 3. Setup maps
npm run setup-maps

# 4. Start fresh
npx react-native start --reset-cache
```

### Test Map Components
```bash
# Check if components compile
npx tsc --noEmit

# Check for linting errors
npm run lint
```

## 📱 Platform-Specific Issues

### iOS Issues

**Simulator Location:**
1. Open iOS Simulator
2. Go to Device > Location > Custom Location
3. Set coordinates (e.g., 37.7749, -122.4194 for San Francisco)

**Build Issues:**
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

### Android Issues

**Emulator Location:**
1. Open Android Emulator
2. Go to Extended Controls (three dots)
3. Go to Location tab
4. Set coordinates

**Build Issues:**
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 🎯 Testing Map Features

### 1. Test Location Detection
- Check if user location marker appears
- Verify fallback to San Francisco works

### 2. Test Event Markers
- Verify event markers appear on map
- Test marker tap interactions
- Check live event indicators

### 3. Test Map Controls
- Test map type switching
- Test event visibility toggle
- Verify controls are responsive

## 📞 Getting Help

### Check Logs
```bash
# iOS logs
npx react-native log-ios

# Android logs
npx react-native log-android
```

### Common Log Messages
- `Location error:` - Permission or GPS issue
- `Map error:` - API key or configuration issue
- `Geolocation service error:` - Service initialization issue

### Debug Mode
Add to your component:
```typescript
console.log('User location:', userLocation);
console.log('Events:', events);
console.log('Map loaded:', mapLoaded);
```

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Permissions configured (`npm run setup-maps`)
- [ ] Google Maps API key obtained
- [ ] API key configured in iOS/Android
- [ ] Maps SDK enabled in Google Cloud Console
- [ ] Metro cache cleared (`--reset-cache`)
- [ ] App rebuilt after changes
- [ ] Location permissions granted
- [ ] Map loads with user location
- [ ] Event markers appear
- [ ] Map controls work

## 🚀 Still Not Working?

1. **Check the setup guide**: `MAP_SETUP_GUIDE.md`
2. **Verify API key**: Test in Google Cloud Console
3. **Check permissions**: Ensure location access is granted
4. **Clear all caches**: Metro, Xcode, Gradle
5. **Rebuild completely**: Clean install and rebuild

The map should work with the default San Francisco location even without GPS permissions!
