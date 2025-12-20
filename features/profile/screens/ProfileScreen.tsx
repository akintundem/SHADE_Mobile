import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { ProfileHeader } from '../components/ProfileHeader';
import { EventMiniCard } from '../components/EventMiniCard';
import { TabBar } from '../../events/Home/components/TabBar';
import SettingsScreen from '../../settings/screens/main/SettingsScreen';
import EditProfileScreen from './EditProfileScreen';
import { User } from '../../../core/auth/types/auth';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { eventService } from '../../../core/events/services';
import { EventResponse } from '../../../core/events/types';
import { dateUtils } from '../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../common/utils/constants';
import LoadingState from '../../../common/components/LoadingState';

type Props = { user: User; onTabChange?: (tab: 'home' | 'manage' | 'profile') => void; onLogout?: () => void };

type Post = {
  id: string;
  content?: string;
  mediaUrl?: string;
  createdAt: string;
};

export default function ProfileScreen({ user, onTabChange, onLogout }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [view, setView] = useState<'profile' | 'settings' | 'edit'>('profile');
  const [section, setSection] = useState<'posts' | 'events'>('events');
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserEvents = useCallback(async () => {
    try {
      const response = await eventService.getMyEvents({ page: 0, size: 20 });
      setEvents(response.content || []);
    } catch (error) {
      console.error('Failed to fetch user events:', error);
      setEvents([]);
    }
  }, []);

  const fetchUserPosts = useCallback(async () => {
    // TODO: Implement posts fetching when posts service is available
    setPosts([]);
  }, []);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      if (section === 'events') {
        await fetchUserEvents();
      } else {
        await fetchUserPosts();
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [section, fetchUserEvents, fetchUserPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatEventDate = (dateString: string | null) => {
    if (!dateString) return '';
    return dateUtils.formatDate(dateString, DATE_FORMATS.DISPLAY_DATE);
  };

  const formatEventLocation = (event: EventResponse) => {
    // TODO: Get actual location from venue when venue data is available in EventResponse
    // For now, return a placeholder
    return 'Location TBD';
  };

  const getEventStatus = (event: EventResponse): 'upcoming' | 'completed' => {
    if (!event.endDateTime) return 'upcoming';
    const endDate = new Date(event.endDateTime);
    const now = new Date();
    return endDate < now ? 'completed' : 'upcoming';
  };

  if (view === 'settings') {
    return (
      <View style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: colors.background, 
        zIndex: 1000,
        elevation: 1000,
      }}>
        <SettingsScreen onClose={() => setView('profile')} onLogout={onLogout} />
      </View>
    );
  }

  if (view === 'edit') {
    return (
      <View style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: colors.background, 
        zIndex: 1000,
        elevation: 1000,
      }}>
        <EditProfileScreen user={user} onBack={() => setView('profile')} />
      </View>
    );
  }

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <ProfileHeader user={user} onEditProfile={() => setView('edit')} onOpenSettings={() => setView('settings')} />
        <LoadingState />
        <TabBar active="profile" onChange={onTabChange} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.primary} />
        }
      >
        <ProfileHeader user={user} onEditProfile={() => setView('edit')} onOpenSettings={() => setView('settings')} />

        <View style={{ marginTop: spacing.lg }}>
          {/* Wealthsimple-style Flat Navigation */}
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: spacing.xl,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.divider,
          }}>
            {[
              { key: 'events', label: 'Events' },
              { key: 'posts', label: 'Posts' },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setSection(t.key as any)}
                activeOpacity={0.7}
                style={{
                  paddingVertical: spacing.md,
                  marginRight: spacing['2xl'],
                  borderBottomWidth: section === t.key ? 2 : 0,
                  borderBottomColor: colors.text.primary,
                }}
              >
                <Text style={{
                  color: section === t.key ? colors.text.primary : colors.text.tertiary,
                  fontWeight: section === t.key ? typography.weight.semibold : typography.weight.medium,
                  fontSize: typography.size.sm,
                  letterSpacing: -0.1,
                }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg }}>
            {section === 'events' ? (
              events.length > 0 ? (
                <View style={{ gap: spacing.md }}>
                  {events.map((event, index) => (
                    <React.Fragment key={event.id}>
                      {index > 0 && (
                        <View style={{ height: 0.5, backgroundColor: colors.divider, opacity: 0.5 }} />
                      )}
                      <EventMiniCard
                        title={event.name}
                        date={formatEventDate(event.startDateTime)}
                        location={formatEventLocation(event)}
                        tagLeft={getEventStatus(event)}
                        tagRight="Creator"
                        imageUrl={event.coverImageUrl || 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=400&auto=format&fit=crop'}
                      />
                    </React.Fragment>
                  ))}
                </View>
              ) : (
                <View style={{
                  alignItems: 'center',
                  paddingVertical: spacing['4xl'],
                }}>
                  <Text style={{
                    color: colors.text.tertiary,
                    fontSize: typography.size.sm,
                    fontWeight: typography.weight.medium,
                  }}>
                    No events yet
                  </Text>
                </View>
              )
            ) : (
              posts.length > 0 ? (
                <View style={{ gap: spacing.md }}>
                  {posts.map((post, index) => (
                    <React.Fragment key={post.id}>
                      {index > 0 && (
                        <View style={{ height: 0.5, backgroundColor: colors.divider, opacity: 0.5 }} />
                      )}
                      {/* TODO: Create PostMiniCard component when posts are implemented */}
                      <View style={{ padding: spacing.md }}>
                        <Text style={{
                          color: colors.text.primary,
                          fontSize: typography.size.sm,
                        }}>
                          Post content will go here
                        </Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              ) : (
                <View style={{
                  alignItems: 'center',
                  paddingVertical: spacing['4xl'],
                }}>
                  <Text style={{
                    color: colors.text.tertiary,
                    fontSize: typography.size.sm,
                    fontWeight: typography.weight.medium,
                  }}>
                    No posts yet
                  </Text>
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>

      <TabBar active="profile" onChange={onTabChange} />
    </SafeAreaView>
  );
}
