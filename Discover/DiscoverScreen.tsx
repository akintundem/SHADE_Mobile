import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text } from 'react-native';
import { SectionHeader } from './components/SectionHeader';
import { FilterBar } from './components/FilterBar';
import { TrendingCard, TrendingItem } from './components/TrendingCard';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { RecentCard, RecentItem } from './components/RecentCard';
import { CollectionCard } from './components/CollectionCard';
import { SegSwitch } from './components/SegSwitch';
import { TopBar } from './components/TopBar';
import { DiscoverHeaderHero } from './components/DiscoverHeaderHero';
import { TabBar } from '../Home/components/TabBar';
import { User } from '../types';
import { trendingExamples, recentExamples } from './examples';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';

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
  const { colors, spacing } = useTheme();
  const { t } = useI18n();
  const [seg, setSeg] = useState<'events' | 'collections'>('events');
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TopBar onPlus={onPlus} />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <DiscoverHeaderHero />

        <View style={{ paddingHorizontal: spacing.lg }}>
          <FilterBar />
        </View>

        <SegSwitch value={seg} onChange={setSeg} />

        {seg === 'events' ? (
          <>
            <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
              <SectionHeader
                icon="trending"
                title={t('TrendingEvents')}
                badge={`${trending.length} events`}
                ctaLabel="Create Event"
                onPressCta={onCreateEvent}
              />

              {/* Featured / Sponsored Carousel */}
              <View style={{ marginTop: spacing.md }}>
                <FeaturedCarousel
                  items={[
                    {
                      id: 'featured-1',
                      typeLabel: 'Featured',
                      archived: false,
                      title: 'Coachella 2024 - Weekend 1',
                      date: 'Apr 12 - 14, 2024',
                      location: 'Indio, California',
                      description: 'The iconic music and arts festival featuring world-class performances and unforgettable moments',
                      imageUrl: 'https://images.unsplash.com/photo-1506158775495-ecf6f1f1b1b5?q=80&w=1400&auto=format&fit=crop',
                      stats: { attendees: 125000, posts: 2410 },
                      hashtags: ['coachella', 'festival', 'live']
                    },
                    {
                      id: 'featured-2',
                      typeLabel: 'Featured',
                      archived: false,
                      title: 'Glastonbury Highlights',
                      date: 'Jun 26 - 30, 2024',
                      location: 'Somerset, UK',
                      description: 'Legendary performances across multiple stages — a cultural milestone every year',
                      imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1400&auto=format&fit=crop',
                      stats: { attendees: 203000, posts: 5321 },
                      hashtags: ['glasto', 'uk', 'festival']
                    },
                    {
                      id: 'featured-3',
                      typeLabel: 'Featured',
                      archived: false,
                      title: 'Burning Man: The Archive',
                      date: 'Aug 25 - Sep 2, 2024',
                      location: 'Black Rock City, NV',
                      description: 'Art, community, and radical self-expression captured through iconic moments',
                      imageUrl: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?q=80&w=1400&auto=format&fit=crop',
                      stats: { attendees: 70000, posts: 1842 },
                      hashtags: ['burningman', 'art', 'desert']
                    }
                  ]}
                />
              </View>

              {/* Trending list */}
              <View style={{ marginTop: spacing['2xl'], gap: spacing.lg }}>
                {trending.map(item => (
                  <TrendingCard key={item.id} item={item} />
                ))}
              </View>
            </View>

            <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing['3xl'] }}>
              <SectionHeader icon="clock" title={t('RecentGlobalEvents')} />
              <View style={{ marginTop: spacing.md, gap: spacing.lg }}>
                {recent.map(item => (
                  <RecentCard key={item.id} item={item} />
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
              <SectionHeader 
                icon="trending" 
                title="Curated Collections" 
                badge={`3 collections`} 
                ctaLabel="New Collection" 
                onPressCta={onCreateCollection} 
              />
              <View style={{ marginTop: spacing.md, gap: spacing.lg }}>
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
