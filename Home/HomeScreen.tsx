import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'react-native';
import { HomeHeader } from './components/HomeHeader';
import { SharePostCard } from './components/SharePostCard';
import { EventCard, EventItem } from './components/EventCard';
import { EmptyFeed } from './components/EmptyFeed';
import { TabBar } from './components/TabBar';
import { examplePost } from './examples/examplePost';
import { User } from '../types';

type Props = {
  user: User;
  events?: EventItem[]; // Provide real items from backend when available
  onCreatePost?: () => void;
  onOpenMenu?: () => void;
  showExampleWhenEmpty?: boolean;
};

export default function HomeScreen({ user, events = [], onCreatePost, onOpenMenu, showExampleWhenEmpty = true }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <HomeHeader user={user} onOpenMenu={onOpenMenu} onCreatePost={onCreatePost} />

        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <SharePostCard onPress={onCreatePost} />
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16, gap: 16 }}>
          {events.length === 0 ? (
            showExampleWhenEmpty ? <EventCard item={examplePost} /> : <EmptyFeed />
          ) : (
            events.map(item => <EventCard key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>

      <TabBar active="home" />
    </SafeAreaView>
  );
}
