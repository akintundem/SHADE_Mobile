import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'react-native';
import { SectionHeader } from './components/SectionHeader';
import { FilterBar } from './components/FilterBar';
import { TrendingCard, TrendingItem } from './components/TrendingCard';
import { RecentCard, RecentItem } from './components/RecentCard';
import { TabBar } from '../Home/components/TabBar';
import { User } from '../types';
import { trendingExamples, recentExamples } from './examples';

type Props = {
  user: User;
  trending?: TrendingItem[];
  recent?: RecentItem[];
  onCreateEvent?: () => void;
  onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void;
};

export default function DiscoverScreen({ user, trending = trendingExamples, recent = recentExamples, onCreateEvent, onTabChange }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <FilterBar />
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <SectionHeader
            icon="trending"
            title="Trending Events"
            badge={`${trending.length} events`}
            ctaLabel="Create Event"
            onPressCta={onCreateEvent}
          />

          <View style={{ marginTop: 12, gap: 16 }}>
            {trending.map(item => (
              <TrendingCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <SectionHeader icon="clock" title="Recent Global Events" />
          <View style={{ marginTop: 12, gap: 16 }}>
            {recent.map(item => (
              <RecentCard key={item.id} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>

      <TabBar active="discover" onChange={onTabChange} />
    </SafeAreaView>
  );
}
