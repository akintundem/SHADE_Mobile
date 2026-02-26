import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { ScreenHeader } from '../../../common/components/ScreenHeader';
import { EmptyState } from '../../../common/components/LoadingStates';
import { PostMiniCard } from '../../profile/components/PostMiniCard';
import { FollowButton } from '../components/FollowButton';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useFollowActions } from '../hooks/useFollowActions';
import type { FeedPostResponse } from '../../../core/feeds/types/feeds';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../config/appConfig';
import { getDisplayNameFromUser, getHandleFromUser } from '../../profile/utils/profile';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop';

type Props = {
  userId: string;
  currentUserId?: string;
  onBack: () => void;
  onFollowersPress?: (userId: string, userName?: string) => void;
  onFollowingPress?: (userId: string, userName?: string) => void;
};

export function PublicProfileScreen({
  userId,
  currentUserId,
  onBack,
  onFollowersPress,
  onFollowingPress,
}: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const refreshTint = colors.text.primary;
  const isOwnProfile = currentUserId === userId;

  const {
    data,
    loading,
    refreshing,
    error,
    refresh,
    loadMorePosts,
    hasMorePosts,
    loadingMorePosts,
  } = usePublicProfile({ userId });

  const displayUser = data?.user;
  const displayName = useMemo(() => getDisplayNameFromUser(displayUser, t('User')), [displayUser, t]);
  const handle = useMemo(() => getHandleFromUser(displayUser), [displayUser]);

  const { isFollowing, isLoading: followLoading, toggleFollow } = useFollowActions({
    userId,
    initialIsFollowing: data.followStatus?.isFollowing ?? false,
  });

  const handleFollowPress = useCallback(async () => {
    try {
      await toggleFollow();
    } catch {
      // Error handled in hook
    }
  }, [toggleFollow]);

  const handleFollowersPress = useCallback(() => {
    onFollowersPress?.(userId, displayName);
  }, [displayName, onFollowersPress, userId]);

  const handleFollowingPress = useCallback(() => {
    onFollowingPress?.(userId, displayName);
  }, [displayName, onFollowingPress, userId]);

  const handleEndReached = useCallback(() => {
    if (hasMorePosts && !loadingMorePosts) {
      loadMorePosts();
    }
  }, [hasMorePosts, loadMorePosts, loadingMorePosts]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('') || '?';
  };

  const renderItem = useCallback(
    ({ item }: { item: FeedPostResponse }) => <PostMiniCard post={item} />,
    []
  );

  const ListHeaderComponent = useMemo(() => {
    const user = data.user;
    const stats = data.stats;
    const avatarUri = getImageUrl(user?.profilePictureUrl) || DEFAULT_AVATAR;

    return (
      <View className="bg-light-background dark:bg-dark-background">
        {/* Profile Header */}
        <View className="px-xl pt-lg pb-xl">
          {/* Avatar */}
          <View className="mb-lg">
            {user?.profilePictureUrl ? (
              <Image
                source={{ uri: avatarUri }}
                className="w-20 h-20 rounded-full bg-light-surface dark:bg-dark-surface"
                resizeMode="cover"
              />
            ) : (
              <View
                className="w-20 h-20 rounded-full items-center justify-center bg-light-surface dark:bg-dark-surface"
              >
                <Text
                  className="text-2xl font-semibold text-txt-secondary dark:text-txt-dark-secondary"
                >
                  {getInitials(displayName)}
                </Text>
              </View>
            )}
          </View>

          {/* Name and Username */}
          <Text
            className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary tracking-[-0.5px]"
          >
            {displayName}
          </Text>
          {handle !== 'member' && (
            <Text
              className="text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary mt-[2px]"
            >
              @{handle}
            </Text>
          )}

          {/* Stats Row */}
          <View className="flex-row gap-2xl mt-xl">
            <TouchableOpacity onPress={handleFollowersPress} activeOpacity={0.7}>
              <Text
                className="text-lg font-bold text-txt-primary dark:text-txt-dark-primary"
              >
                {stats?.followersCount ?? 0}
              </Text>
              <Text
                className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]"
              >
                {t('Followers')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleFollowingPress} activeOpacity={0.7}>
              <Text
                className="text-lg font-bold text-txt-primary dark:text-txt-dark-primary"
              >
                {stats?.followingCount ?? 0}
              </Text>
              <Text
                className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]"
              >
                {t('Following')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Follow Button (only for other users) */}
          {!isOwnProfile && (
            <View className="mt-xl">
              <FollowButton
                isFollowing={isFollowing}
                isLoading={followLoading}
                onPress={handleFollowPress}
              />
              {data.followStatus?.isFollowedBy && (
                <Text
                  className="text-xs mt-sm text-txt-disabled dark:text-txt-dark-disabled"
                >
                  {t('FollowsYou')}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Posts Section Header */}
        <View className="px-xl py-md">
          <Text className="text-sm font-semibold uppercase tracking-[0.5px] text-txt-primary dark:text-txt-dark-primary">
            {t('Posts')}
          </Text>
        </View>
      </View>
    );
  }, [
    data.followStatus?.isFollowedBy,
    data.stats,
    data.user,
    displayName,
    handle,
    followLoading,
    handleFollowPress,
    handleFollowersPress,
    handleFollowingPress,
    isFollowing,
    isOwnProfile,
    t,
  ]);

  const ListFooterComponent = useMemo(() => (
    <View className="pb-5">
      {loadingMorePosts ? (
        <View className="py-xl items-center">
          <ActivityIndicator size="small" color={refreshTint} />
        </View>
      ) : null}
    </View>
  ), [loadingMorePosts, refreshTint]);

  const ListEmptyComponent = useMemo(() => {
    if (loading) {
      return (
        <View className="py-4xl items-center">
          <ActivityIndicator size="small" color={refreshTint} />
        </View>
      );
    }

    return (
      <View className="py-4xl items-center">
        <Text className="text-sm font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
          {t('NoPostsYet')}
        </Text>
      </View>
    );
  }, [loading, refreshTint, t]);

  if (loading && !data.user) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <ScreenHeader
          title=""
          leftAction={{
            icon: ChevronLeft,
            onPress: onBack,
            size: 32,
          }}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={refreshTint} />
        </View>
      </View>
    );
  }

  if (error && !data.user) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <ScreenHeader
          title=""
          leftAction={{
            icon: ChevronLeft,
            onPress: onBack,
            size: 32,
          }}
        />
        <EmptyState
          title={t('FailedToLoad')}
          subtitle={error.message || t('SomethingWentWrong')}
          action={{ label: t('TryAgain'), onPress: refresh }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={data.user?.name || t('Profile')}
        leftAction={{
          icon: ChevronLeft,
          onPress: onBack,
          size: 32,
        }}
      />

      <FlatList
        data={data.posts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        ItemSeparatorComponent={() => null}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={refreshTint}
            colors={[refreshTint]}
          />
        }
      />
    </View>
  );
}
