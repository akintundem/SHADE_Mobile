import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  RefreshControl,
  FlatListProps,
} from 'react-native';
import { EmptyState } from '../LoadingStates';
import { useTheme } from '../../theme/ThemeProvider';

type Props<T> = {
  data: T[];
  renderItem: FlatListProps<T>['renderItem'];
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  refreshing?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyAction?: { label: string; onPress: () => void };
  emptyIcon?: React.ReactNode;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  contentContainerStyle?: FlatListProps<T>['contentContainerStyle'];
};

export function PaginatedList<T>({
  data,
  renderItem,
  keyExtractor,
  loading = false,
  refreshing = false,
  loadingMore = false,
  hasMore = false,
  onRefresh,
  onLoadMore,
  emptyTitle = 'No items',
  emptySubtitle,
  emptyAction,
  emptyIcon,
  ListHeaderComponent,
  ItemSeparatorComponent,
  contentContainerStyle,
}: Props<T>) {
  const { colors } = useTheme();
  const refreshTint = colors.text.primary;

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);

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

    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        subtitle={emptySubtitle}
        action={emptyAction}
      />
    );
  }, [emptyAction, emptyIcon, emptySubtitle, emptyTitle, loading, refreshTint]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={5}
      removeClippedSubviews
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={refreshTint}
            colors={[refreshTint]}
          />
        ) : undefined
      }
    />
  );
}
