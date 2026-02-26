import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useI18n } from '../../common/i18n/I18nProvider';
import { ProfileHeader } from '../../features/profile/components/ProfileHeader';
import { EventMiniCard } from '../../features/profile/components/EventMiniCard';
import { PostMiniCard } from '../../features/profile/components/PostMiniCard';
import SettingsScreen from '../../features/settings/screens/main/SettingsScreen';
import EditProfileScreen from '../../features/profile/screens/EditProfileScreen';
import { User } from '../../core/auth/types/auth';
import { EventResponse } from '../../core/events/types';
import type { FeedPostResponse } from '../../core/feeds/types/feeds';
import { EventMiniCardSkeleton } from '../../common/components/LoadingStates';
import { useCurrentUser } from '../../features/auth/hooks';
import { useProfileData, useProfileFlow } from '../../features/profile/hooks';
import { useCollaboratorInvites } from '../../features/profile/hooks/useCollaboratorInvites';
import { CollaboratorInviteCard } from '../../features/profile/components/CollaboratorInviteCard';
import type { ProfileSection } from '../../features/profile/types';
import {
  formatEventDate,
  formatEventLocation,
  getEventStatus,
} from '../../features/profile/utils/profile';
import { useTheme } from '../../common/theme/ThemeProvider';
import { getImageUrl } from '../../config/appConfig';

const FALLBACK_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=400&auto=format&fit=crop';

type Props = {
  user: User;
  onLogout?: () => void;
  onInternalNavigate?: (isInternal: boolean) => void;
};

type TabItem = { key: ProfileSection; label: string };

export default function ProfileScreen({ user, onLogout, onInternalNavigate }: Props) {
  const { t } = useI18n();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const refreshTint = colors.text.primary;

  const { user: currentUser } = useCurrentUser();
  const displayUser = currentUser ?? user;
  const userId = currentUser?.id ?? user.id;
  const editUser: User = useMemo(
    () => ({
      id: userId,
      email: displayUser?.email ?? user.email,
      name: displayUser?.name ?? user.name,
      provider: user.provider,
    }),
    [displayUser, user, userId]
  );

  const flow = useProfileFlow();

  // Handle Android hardware back button for internal sub-navigation
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (flow.canGoBack) {
          flow.goBack();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [flow])
  );

  // Reset profile flow when returning from another screen (e.g. EventAdmin)
  // to avoid showing a stale settings/edit sub-view with hidden tab bar
  const flowRef = useRef(flow);
  flowRef.current = flow;

  useFocusEffect(
    useCallback(() => {
      if (flowRef.current.canGoBack) {
        flowRef.current.reset();
      }
    }, [])
  );

  // Notify parent when entering/exiting internal screens (settings, edit)
  useEffect(() => {
    const isInternalScreen = flow.view === 'settings' || flow.view === 'edit';
    onInternalNavigate?.(isInternalScreen);
  }, [flow.view, onInternalNavigate]);
  const [section, setSection] = useState<ProfileSection>('events');

  const {
    events,
    invitedEvents,
    posts,
    stats,
    loading,
    refreshing,
    statsLoading,
    refresh,
    loadSection,
  } = useProfileData({
    userId,
    section,
    enabled: Boolean(userId),
  });

  const {
    invites: collaboratorInvites,
    loading: collaboratorInvitesLoading,
    acceptInvite,
    declineInvite,
    refresh: refreshCollaboratorInvites,
  } = useCollaboratorInvites();

  const handleRefresh = useCallback(async () => {
    await Promise.all([refresh(), refreshCollaboratorInvites()]);
  }, [refresh, refreshCollaboratorInvites]);

  useEffect(() => {
    if (section !== 'events') {
      loadSection('events', { showLoading: false });
    }
  }, [loadSection, section]);

  const tabs = useMemo<TabItem[]>(
    () => [
      { key: 'events', label: t('MyEvents') },
      { key: 'invited', label: t('Invitations') },
      { key: 'posts', label: t('Posts') },
    ],
    [t]
  );

  const handleEventPress = useCallback(
    (event: EventResponse) => {
      navigation.navigate('EventAdmin', {
        eventId: event.id,
        title: event.name,
        imageUrl: getImageUrl(event.coverImageUrl) || undefined,
      });
    },
    [navigation]
  );

  const handleArchiveEvent = useCallback(
    (event: EventResponse) => {
      Alert.alert(
        t('ArchiveEventTitle'),
        t('ArchiveEventMessage', { eventName: event.name }),
        [
          { text: t('Cancel'), style: 'cancel' },
          { text: t('Archive'), style: 'default' },
        ]
      );
    },
    [t]
  );

  const handleDeleteEvent = useCallback(
    (event: EventResponse) => {
      Alert.alert(
        t('DeleteEventTitle'),
        t('DeleteEventMessage', { eventName: event.name }),
        [
          { text: t('Cancel'), style: 'cancel' },
          { text: t('Delete'), style: 'destructive' },
        ]
      );
    },
    [t]
  );

  const handleFollowersPress = useCallback(() => {
    if (!userId) return;
    navigation.navigate('FollowersList', {
      userId,
      userName: displayUser?.name,
      currentUserId: userId,
    });
  }, [displayUser?.name, navigation, userId]);

  const handleFollowingPress = useCallback(() => {
    if (!userId) return;
    navigation.navigate('FollowingList', {
      userId,
      userName: displayUser?.name,
      currentUserId: userId,
    });
  }, [displayUser?.name, navigation, userId]);

  const listData = section === 'events' ? events : section === 'invited' ? invitedEvents : posts;
  const hasCollaboratorInvites = section === 'invited' && collaboratorInvites.length > 0;

  const renderItem = useCallback(
    ({ item, index: _index }: { item: EventResponse | FeedPostResponse; index: number }) => {
      if (section === 'posts') {
        return <PostMiniCard post={item as FeedPostResponse} />;
      }

      const event = item as EventResponse;
      return (
        <EventMiniCard
          title={event.name}
          date={formatEventDate(event.startDateTime ?? null)}
          location={formatEventLocation(event, t('LocationTBD'))}
          tagLeft={getEventStatus(event, t('Upcoming'), t('Completed'))}
          tagRight={section === 'events' ? t('Creator') : t('Invited')}
          imageUrl={getImageUrl(event.coverImageUrl) || FALLBACK_EVENT_IMAGE}
          accessType={event.accessType}
          userContext={event.userContext}
          onPress={() => handleEventPress(event)}
          onSwipeLeft={section === 'events' ? () => handleArchiveEvent(event) : undefined}
          onSwipeRight={section === 'events' ? () => handleDeleteEvent(event) : undefined}
          enableSwipe={section === 'events'}
        />
      );
    },
    [
      handleArchiveEvent,
      handleDeleteEvent,
      handleEventPress,
      section,
      t,
    ]
  );

  const renderCollaboratorInvites = useCallback(() => {
    if (!hasCollaboratorInvites) return null;

    return (
      <View className="px-xl">
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-md mt-lg">
          {t('CollaboratorInvites')}
        </Text>
        {collaboratorInvites.map((invite, index) => (
          <CollaboratorInviteCard
            key={invite.inviteId}
            invite={invite}
            onAccept={acceptInvite}
            onDecline={declineInvite}
            isLast={index === collaboratorInvites.length - 1}
          />
        ))}
      </View>
    );
  }, [hasCollaboratorInvites, collaboratorInvites, acceptInvite, declineInvite, t]);

  const listHeader = useMemo(
    () => (
      <View>
        <ProfileHeader
          user={displayUser}
          stats={stats}
          statsLoading={statsLoading}
          onEditProfile={() => flow.goTo('edit')}
          onOpenSettings={() => flow.goTo('settings')}
          onFollowersPress={handleFollowersPress}
          onFollowingPress={handleFollowingPress}
        />

        <View>
          <View className="flex-row px-xl">
            {tabs.map((tabItem) => {
              const isActive = section === tabItem.key;
              return (
                <TouchableOpacity
                  key={tabItem.key}
                  onPress={() => setSection(tabItem.key)}
                  activeOpacity={0.7}
                  className={`py-md mr-2xl ${isActive ? 'border-b-[1.5px] border-txt-primary dark:border-txt-dark-primary' : ''}`}
                >
                  <Text
                    className={
                      isActive
                        ? 'text-sm font-semibold text-txt-primary dark:text-txt-dark-primary tracking-wide'
                        : 'text-sm font-medium text-txt-tertiary dark:text-txt-dark-tertiary tracking-wide'
                    }
                  >
                    {tabItem.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {renderCollaboratorInvites()}
      </View>
    ),
    [displayUser, flow, handleFollowersPress, handleFollowingPress, section, stats, statsLoading, tabs, renderCollaboratorInvites]
  );

  const listEmptyComponent = useMemo(() => {
    if (loading) {
      if (section === 'posts') {
        return (
          <View className="px-xl py-xl">
            <ActivityIndicator size="small" color={refreshTint} />
          </View>
        );
      }
      return (
        <View className="pt-lg">
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={`profile-skeleton-${index}`}>
              <EventMiniCardSkeleton />
            </View>
          ))}
        </View>
      );
    }

    const emptyText =
      section === 'events'
        ? t('NoEventsYetShort')
        : section === 'invited'
        ? collaboratorInvites.length > 0
          ? t('NoEventInvitationsYet')
          : t('NoInvitationsYet')
        : t('NoPostsYet');

    return (
      <View className="items-center py-4xl">
        <Text className="text-sm font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
          {emptyText}
        </Text>
      </View>
    );
  }, [loading, refreshTint, section, t, collaboratorInvites.length]);

  if (flow.view === 'settings') {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <SettingsScreen onClose={flow.goBack} onLogout={onLogout} />
      </View>
    );
  }

  if (flow.view === 'edit') {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <EditProfileScreen user={editUser} onBack={flow.goBack} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <FlatList
        key={section}
        data={listData}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={<View className="h-16" />}
        ItemSeparatorComponent={() => null}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || collaboratorInvitesLoading} onRefresh={handleRefresh} tintColor={refreshTint} colors={[refreshTint]} />
        }
      />
    </View>
  );
}
