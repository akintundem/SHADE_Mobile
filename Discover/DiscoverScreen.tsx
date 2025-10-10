import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text } from 'react-native';
import { SectionHeader } from './components/SectionHeader';
import { FilterBar } from './components/FilterBar';
import { TrendingCard, TrendingItem } from './components/TrendingCard';
import { RecentCard, RecentItem } from './components/RecentCard';
import { CollectionCard } from './components/CollectionCard';
import { SegSwitch } from './components/SegSwitch';
import { TopBar } from './components/TopBar';
import { DiscoverHeaderHero } from './components/DiscoverHeaderHero';
import { TabBar } from '../Home/components/TabBar';
import { User } from '../types';
import { trendingExamples, recentExamples } from './examples';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  user: User;
  trending?: TrendingItem[];
  recent?: RecentItem[];
  onCreateEvent?: () => void;
  onCreateCollection?: () => void;
  onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void;
  onPlus?: () => void;
};

export default function DiscoverScreen({ user, trending = trendingExamples, recent = recentExamples, onCreateEvent, onCreateCollection, onTabChange, onPlus }: Props) {
  const { colors } = useTheme();
  const [seg, setSeg] = useState<'events' | 'collections'>('events');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopBar onPlus={onPlus} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <DiscoverHeaderHero />

        <View style={{ paddingHorizontal: 16 }}>
          <FilterBar />
        </View>

        <SegSwitch value={seg} onChange={setSeg} />

        {seg === 'events' ? (
          <>
            <View style={{ height: 180, borderRadius: 12, overflow: 'hidden', marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card }} />
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
          </>
        ) : (
          <>
            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <SectionHeader icon="trending" title="Curated Collections" badge={`3 collections`} ctaLabel="New Collection" onPressCta={onCreateCollection} />
              <View style={{ marginTop: 12, gap: 16 }}>
                <CollectionCard
                  title="Grammy Awards Through Time"
                  description="The complete archive of Grammy ceremonies, performances, and behind-the-scenes moments"
                  imageUrl="https://images.unsplash.com/photo-1506158775495-ecf6f1f1b1b5?q=80&w=1400&auto=format&fit=crop"
                  meta="1958 - 2024    127 events    Shade Archive"
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <TabBar active="discover" onChange={onTabChange} />
    </SafeAreaView>
  );
}
