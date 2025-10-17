import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity, Animated } from 'react-native';
import { HomeHeader } from './components/HomeHeader';
import { EventCard, EventItem } from './components/EventCard';
import { EmptyFeed } from './components/EmptyFeed';
import { TabBar } from './components/TabBar';
import { useTheme } from '../theme/ThemeProvider';
import { User } from '../types';
import { Flame, Clock } from 'lucide-react-native';

type Props = {
  user: User;
  events?: EventItem[];
  onCreatePost?: () => void;
  onOpenMenu?: () => void;
  showExampleWhenEmpty?: boolean;
  onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void;
};

export default function HomeScreen({ user, events = [], onOpenMenu, showExampleWhenEmpty = true, onTabChange }: Props) {
  const { colors, spacing, brand, borderRadius, typography, shadows } = useTheme();
  const [seg, setSeg] = useState<'live' | 'past'>('live');

  const dataset = events;
  const liveEvents = dataset.filter(e => !!e.startAt && !e.endAt);
  const pastEvents = dataset.filter(e => !!e.endAt);

  // Pulse animation for the Live indicator
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader user={user} onOpenMenu={onOpenMenu} />

        {/* Segmented control */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderRadius: 28,
            padding: spacing.xs,
            borderWidth: 1,
            borderColor: colors.border,
            ...shadows.sm,
          }}>
            {/* Live */}
            <TouchableOpacity
              onPress={() => setSeg('live')}
              activeOpacity={0.9}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.full,
                backgroundColor: seg === 'live' ? brand.primary : 'transparent',
                ...(seg === 'live' ? shadows.sm : {}),
              }}
            >
              <Animated.View style={{ opacity: pulse }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: seg === 'live' ? '#FFFFFF' : brand.primary }} />
              </Animated.View>
              <Flame size={16} color={seg === 'live' ? '#FFFFFF' : colors.text.secondary} />
              <Text style={{
                color: seg === 'live' ? '#FFFFFF' : colors.text.secondary,
                fontWeight: seg === 'live' ? typography.weight.semibold : typography.weight.medium,
                fontSize: typography.size.sm,
              }}>Live</Text>
            </TouchableOpacity>

            {/* Past */}
            <TouchableOpacity
              onPress={() => setSeg('past')}
              activeOpacity={0.9}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.full,
                backgroundColor: seg === 'past' ? brand.primary : 'transparent',
                ...(seg === 'past' ? shadows.sm : {}),
              }}
            >
              <Clock size={16} color={seg === 'past' ? '#FFFFFF' : colors.text.secondary} />
              <Text style={{
                color: seg === 'past' ? '#FFFFFF' : colors.text.secondary,
                fontWeight: seg === 'past' ? typography.weight.semibold : typography.weight.medium,
                fontSize: typography.size.sm,
              }}>Past</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feed */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.lg }}>
          {(seg === 'live' ? liveEvents : pastEvents).length === 0 ? (
            <EmptyFeed />
          ) : (
            (seg === 'live' ? liveEvents : pastEvents).map(item => <EventCard key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>

      <TabBar active="home" onChange={onTabChange} />
    </SafeAreaView>
  );
}
