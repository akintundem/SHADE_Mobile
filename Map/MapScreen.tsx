import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabBar } from '../Home/components/TabBar';
import { MapSectionHeader } from './components/MapSectionHeader';
import { RegionCard } from './components/RegionCard';
import { EventListItem } from './components/EventListItem';
import { regionsExamples, eventsInViewExamples, Region, MapEvent } from './examples';
import { User } from '../types';
import { MapPinned } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  user: User;
  regions?: Region[];
  eventsInView?: MapEvent[];
  onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void;
};

export default function MapScreen({ user, regions = regionsExamples, eventsInView = eventsInViewExamples, onTabChange }: Props) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <MapSectionHeader />

        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <View style={{ height: 180, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
            <MapPinned size={22} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginTop: 6 }}>Map preview disabled</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 2, fontSize: 12 }}>We’ll enable this once native maps are linked</Text>
          </View>
        </View>

        {/* Regions list */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Popular Regions</Text>
            <Text style={{ color: colors.textSecondary }}>{regions.length} areas</Text>
          </View>
          <View style={{ gap: 12 }}>
            {regions.map(r => (
              <RegionCard key={r.id} name={r.name} totalEvents={r.totalEvents} activeEvents={r.activeEvents} />
            ))}
          </View>
        </View>

        {/* Events in view */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Events in View ({eventsInView.length})</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
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
