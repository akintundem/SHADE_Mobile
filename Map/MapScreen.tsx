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

type Props = {
  user: User;
  regions?: Region[];
  eventsInView?: MapEvent[];
  onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void;
};

export default function MapScreen({ user, regions = regionsExamples, eventsInView = eventsInViewExamples, onTabChange }: Props) {

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <MapSectionHeader />

        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <View style={{ height: 180, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
            <MapPinned size={22} color="#6B7280" />
            <Text style={{ color: '#6B7280', marginTop: 6 }}>Map preview disabled</Text>
            <Text style={{ color: '#9CA3AF', marginTop: 2, fontSize: 12 }}>We’ll enable this once native maps are linked</Text>
          </View>
        </View>

        {/* Regions list */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#111827', fontWeight: '700' }}>Popular Regions</Text>
            <Text style={{ color: '#6B7280' }}>{regions.length} areas</Text>
          </View>
          <View style={{ gap: 12 }}>
            {regions.map(r => (
              <RegionCard key={r.id} name={r.name} totalEvents={r.totalEvents} activeEvents={r.activeEvents} />
            ))}
          </View>
        </View>

        {/* Events in view */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={{ color: '#111827', fontWeight: '700' }}>Events in View ({eventsInView.length})</Text>
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
