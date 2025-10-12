import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Geolocation temporarily disabled to avoid NativeEventEmitter crash from missing native module
import { TabBar } from '../Home/components/TabBar';
import { MapSectionHeader } from './components/MapSectionHeader';
import { MapControls } from './components/MapControls';
import { MapLibreView } from './components/MapLibreView';
import { RegionCard } from './components/RegionCard';
import { EventListItem } from './components/EventListItem';
import { regionsExamples, eventsInViewExamples, Region, MapEvent } from './examples';
import { User } from '../types';
import { MapPinned } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Event, isEventLive, formatEventDate, getEventTypeColorHex } from '../utils/eventUtils';
import { useI18n } from '../i18n/I18nProvider';

type Props = {
  user: User;
  regions?: Region[];
  eventsInView?: MapEvent[];
  onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void;
};

const { width, height } = Dimensions.get('window');

export default function MapScreen({ user, regions = regionsExamples, eventsInView = eventsInViewExamples, onTabChange }: Props) {
  const { colors, brand, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showEvents, setShowEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>({
    latitude: 37.7749,
    longitude: -122.4194,
  });

  // Convert MapEvent to Event format
  const events: Event[] = eventsInView.map((mapEvent, index) => ({
    id: mapEvent.id,
    title: mapEvent.title,
    description: mapEvent.location,
    startDate: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + index * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: {
      name: mapEvent.location,
      coordinates: {
        latitude: 37.7749 + (index * 0.01),
        longitude: -122.4194 + (index * 0.01),
      }
    },
    type: 'party' as const,
    image: undefined,
    cosigners: [],
    creators: [],
  }));

  // If needed, we can re-enable geolocation later once native module is confirmed linked

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    Alert.alert(
      event.title,
      `${event.location.name}\n${formatEventDate(event.startDate, event.endDate)}\n${isEventLive(event.startDate, event.endDate) ? '🔴 LIVE' : '⏰ Upcoming'}`,
      [{ text: 'OK' }]
    );
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: spacing['5xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <MapSectionHeader />

        {/* Map (scrolls with content) */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md, position: 'relative' }}>
          <MapLibreView
            events={events}
            userLocation={userLocation || undefined}
            onEventSelect={handleEventSelect}
            showEvents={showEvents}
            mapType={mapType}
          />
          {/* Map Controls Overlay */}
          <View style={{
            position: 'absolute',
            top: spacing.lg,
            right: spacing.lg,
          }}>
          <MapControls
            showEvents={showEvents}
            onToggleEvents={() => setShowEvents(!showEvents)}
          />
          </View>
        </View>

        {/* Regions list */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
          <View style={{ 
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
          }}>
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.lg,
            }}>
              {t('PopularRegions')}
            </Text>
            <Text style={{ 
              color: colors.text.tertiary,
              fontSize: typography.size.sm,
            }}>
              {regions.length} {t('AreasSuffix')}
            </Text>
          </View>
          <View style={{ gap: spacing.md }}>
            {regions.map(r => (
              <RegionCard key={r.id} name={r.name} totalEvents={r.totalEvents} activeEvents={r.activeEvents} />
            ))}
          </View>
        </View>

        {/* Events in view */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Text style={{ 
            color: colors.text.primary,
            fontWeight: typography.weight.bold,
            fontSize: typography.size.lg,
            marginBottom: spacing.md,
          }}>
            {t('EventsInView', { count: String(eventsInView.length) })}
          </Text>
          <View style={{ gap: spacing.md }}>
            {eventsInView.map(e => (
              <EventListItem key={e.id} color={e.color} title={e.title} location={e.location} dates={e.dates} typeLabel={e.type} people={e.people} />
            ))}
          </View>
        </View>
      </ScrollView>

      <TabBar active="map" onChange={onTabChange} />
    </SafeAreaView>
  );
}
