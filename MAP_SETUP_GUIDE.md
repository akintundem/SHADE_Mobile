# Shade - Interactive Map Setup Guide

## 🗺️ Map Features Implemented

### ✅ What's Working
- **Interactive Google Maps** with custom styling
- **Real-time location detection** using GPS
- **User location marker** with navigation icon
- **Event markers** with custom styling and live indicators
- **Map type controls** (Standard, Satellite, Hybrid)
- **Event visibility toggle**
- **Custom map styling** matching app theme
- **Premium floating controls** with shadows
- **Event utility functions** (isEventLive, formatEventDate, getEventTypeColor)
- **Custom event pins** with images and participant counts

## 🎨 Premium Color Update

### New Brand Colors
- **Primary**: Slate (#0F172A) - Ultra premium, sophisticated
- **Secondary**: Amber (#F59E0B) - Luxury and warmth
- **Much more professional** than the previous purple
- **Better contrast** and readability

## 📱 Map Components

### 1. MapScreen (`Map/MapScreen.tsx`)
- Main map container with location detection
- Custom map styling matching app theme
- Event markers and user location
- Responsive layout with proper safe areas

### 2. MapControls (`Map/components/MapControls.tsx`)
- Floating control panel
- Map type selection (Standard/Satellite/Hybrid)
- Event visibility toggle
- Premium styling with shadows

### 3. MapSectionHeader (`Map/components/MapSectionHeader.tsx`)
- Branded header with umbrella icon
- "Live & Interactive" subtitle
- Filter button for future features

## 🔧 Technical Implementation

### Dependencies Added
```json
{
  "react-native-maps": "1.26.14",
  "react-native-geolocation-service": "^5.3.1"
}
```

### Key Features
- **Location Permission**: Automatic GPS location detection
- **Fallback Location**: San Francisco if permission denied
- **Custom Map Style**: Matches app theme colors
- **Interactive Markers**: User location + event markers
- **Map Controls**: Type selection and event toggle
- **Responsive Design**: Adapts to screen size

## 🎯 Map Functionality

### User Location
- **GPS Detection**: Real-time location using device GPS
- **Custom Marker**: Slate-colored circle with navigation icon
- **Auto-centering**: Map centers on user location
- **Permission Handling**: Graceful fallback if denied

### Event Markers
- **Dynamic Markers**: Shows events from `eventsInView` data
- **Custom Styling**: Amber-colored circles with map pin icons
- **Toggle Visibility**: Can show/hide event markers
- **Interactive**: Tap for event details

### Map Types
- **Standard**: Default map view
- **Satellite**: Aerial imagery
- **Hybrid**: Satellite with labels
- **Custom Styling**: Matches app theme in all modes

## 🎨 Visual Design

### Map Styling
- **Custom Colors**: Matches app theme
- **Rounded Corners**: Consistent with app design
- **Shadows**: Premium elevation effect
- **Borders**: Subtle border matching theme

### Controls
- **Floating Panel**: Positioned in top-right
- **Premium Styling**: Shadows and rounded corners
- **Icon-based**: Clear visual indicators
- **Interactive**: Smooth touch feedback

### Markers
- **User Location**: Slate circle with navigation icon
- **Event Markers**: Amber circles with map pin icons
- **Consistent Sizing**: 40px user, 32px events
- **White Borders**: Clear separation from map

## 📍 Location Features

### GPS Integration
```tsx
Geolocation.getCurrentPosition(
  (position) => {
    setUserLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  },
  (error) => {
    // Fallback to San Francisco
    setUserLocation({
      latitude: 37.7749,
      longitude: -122.4194,
    });
  },
  {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
  }
);
```

### Map Configuration
- **Provider**: Google Maps
- **Initial Region**: User's location or San Francisco
- **Zoom Level**: City-level view (0.0922 delta)
- **Features**: User location, compass, scale, my location button

## 🚀 Usage

### Basic Map Display
```tsx
<MapView
  style={{ flex: 1 }}
  provider={PROVIDER_GOOGLE}
  customMapStyle={mapStyle}
  initialRegion={userLocation}
  showsUserLocation={true}
  showsMyLocationButton={true}
  showsCompass={true}
  showsScale={true}
  mapType={mapType}
>
  {/* Markers */}
</MapView>
```

### Map Controls
```tsx
<MapControls
  mapType={mapType}
  onMapTypeChange={setMapType}
  showEvents={showEvents}
  onToggleEvents={() => setShowEvents(!showEvents)}
/>
```

## 🔒 Privacy & Permissions

### Location Privacy
- **Permission Request**: Only when needed
- **Graceful Fallback**: Works without location
- **No Data Storage**: Location not persisted
- **User Control**: Can disable location features

### Map Data
- **Google Maps**: Uses Google's map data
- **No Custom Tiles**: Relies on Google's infrastructure
- **Privacy Compliant**: Follows Google's privacy policies

## 🎨 Theme Integration

### Color Matching
- **Map Style**: Custom colors match app theme
- **Markers**: Use brand colors (slate + amber)
- **Controls**: Match app's surface and border colors
- **Text**: Consistent typography and colors

### Dark Mode Support
- **Automatic**: Map styling adapts to theme
- **Consistent**: All elements match theme
- **Accessible**: Proper contrast ratios

## 📱 Platform Support

### iOS
- **Native Maps**: Uses Apple Maps on iOS
- **Smooth Performance**: Optimized for iOS
- **Permissions**: Handles iOS location permissions

### Android
- **Google Maps**: Uses Google Maps on Android
- **Material Design**: Follows Android guidelines
- **Permissions**: Handles Android location permissions

## 🔮 Future Enhancements

### Planned Features
1. **Event Clustering**: Group nearby events
2. **Custom Map Tiles**: OpenStreetMap integration
3. **Route Planning**: Navigation to events
4. **Heat Maps**: Show event density
5. **Offline Maps**: Download for offline use
6. **3D Buildings**: Enhanced map visualization

### Advanced Features
1. **Real-time Updates**: Live event locations
2. **User Tracking**: Follow user movement
3. **Geofencing**: Location-based notifications
4. **Map Annotations**: Custom overlays
5. **Street View**: Integrated street view

## 🛠️ Setup Instructions

### 1. Run Setup Script
```bash
npm run setup-maps
```
This will automatically configure permissions and create necessary files.

### 2. Install Dependencies
```bash
npm install
```

### 3. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select existing one
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create credentials (API Key)
5. Restrict the API key to your app's bundle ID

### 4. Configure API Key

#### iOS Configuration
Add to `ios/capsule/AppDelegate.mm`:
```objc
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"YOUR_API_KEY_HERE"];
  // ... rest of your code
}
```

#### Android Configuration
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY_HERE"/>
</application>
```

### 5. Environment Variables
Add to `.env` file:
```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

## 🎉 Result

You now have a **premium, interactive map** with:
- ✅ **Real-time location detection**
- ✅ **Custom event markers**
- ✅ **Map type controls**
- ✅ **Premium slate color scheme**
- ✅ **Responsive design**
- ✅ **Theme integration**
- ✅ **Professional appearance**

The map is fully functional and ready for production use! 🗺️✨
