import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { ScreenHeader } from '../../../common/components/ScreenHeader';
import { EmptyState } from '../../../common/components/LoadingStates';
import { UserListItem } from '../components/UserListItem';
import { useFollowList } from '../hooks/useFollowList';
import { useTheme } from '../../../common/theme/ThemeProvider';
import type { UserProfileResponse } from '../../../core/social/types/userFollow';

type Props = {
  userId: string;
  userName?: string;
  currentUserId?: string;
  onBack: () => void;
  onUserPress?: (user: UserProfileResponse) => void;
};

export function FollowingListScreen({
  userId,
  userName,
  currentUserId,
  onBack,
  onUserPress,
}: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const refreshTint = colors.text.primary;

  const {
    users,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    totalCount,
    refresh,
    loadMore,
  } = useFollowList({
    userId,
    type: 'following',
  });

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadMore();
    }
  }, [hasMore, loadMore, loadingMore]);

  const renderItem = useCallback(
    ({ item, index }: { item: UserProfileResponse; index: number }) => (
      <UserListItem
        user={item}
        onPress={onUserPress}
        currentUserId={currentUserId}
        isLast={index === users.length - 1}
      />
    ),
    [currentUserId, onUserPress, users.length]
  );

  const ListFooterComponent = useMemo(() => (
    <View className="pb-5">
      {loadingMore ? (
        <View className="py-xl items-center">
          <ActivityIndicator size="small" color={refreshTint} />
        </View>
      ) : null}
    </View>
  ), [loadingMore, refreshTint]);

  const ListEmptyComponent = useMemo(() => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center pt-[60px]">
          <ActivityIndicator size="large" color={refreshTint} />
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          title={t('FailedToLoad')}
          subtitle={error.message || t('SomethingWentWrong')}
          action={{ label: t('TryAgain'), onPress: refresh }}
        />
      );
    }

    return (
      <EmptyState
        title={t('NotFollowingAnyone')}
        subtitle={t('NotFollowingSubtitle')}
      />
    );
  }, [error, loading, refresh, refreshTint, t]);

  const isValidName = userName && !/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(userName);
  const title = isValidName ? t('FollowingOf', { name: userName }) : t('Following');

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={title}
        leftAction={{
          icon: ChevronLeft,
          onPress: onBack,
          size: 32,
        }}
      />

      {totalCount > 0 && !loading && (
        <View className="px-xl py-sm">
          <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
            {t('FollowingCount', { count: totalCount })}
          </Text>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
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
