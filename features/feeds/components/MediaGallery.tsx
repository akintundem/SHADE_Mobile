import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Play } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../config/appConfig';
import type { FeedPost } from '../../../core/events/types/event';
import { buildMediaItems } from '../utils';

type Props = {
  posts: FeedPost[];
  onRefresh: () => void;
  refreshing: boolean;
  loading: boolean;
  ListHeaderComponent: React.ComponentType<any>;
};

export function MediaGallery({ posts, onRefresh, refreshing, loading, ListHeaderComponent }: Props) {
  const { width } = useWindowDimensions();
  const { t } = useI18n();
  const { colors } = useTheme();
  const numColumns = 3;
  const gap = 2;
  const itemSize = (width - gap * (numColumns - 1)) / numColumns;

  const mediaItems = useMemo(() => buildMediaItems(posts), [posts]);

  const renderMediaItem = useCallback(
    ({ item, index }: { item: ReturnType<typeof buildMediaItems>[0]; index: number }) => {
      const isVideo = item.type === 'VIDEO';
      const rawUri = item.thumbnailUrl || item.url;
      const imageUri = rawUri ? (getImageUrl(rawUri) ?? rawUri) : undefined;

      if (!imageUri) return null;

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            width: itemSize,
            height: itemSize,
            marginBottom: gap,
            marginRight: index % numColumns < numColumns - 1 ? gap : 0,
          }}
        >
          <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
          {isVideo && (
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-9 h-9 rounded-full items-center justify-center bg-neutral-black/[0.45]">
                <Play size={16} color={colors.text.inverse} fill={colors.text.inverse} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [gap, itemSize, numColumns, colors.text.inverse],
  );

  return (
    <View className="flex-1">
      <FlatList
        data={mediaItems}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        renderItem={renderMediaItem}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text.primary}
            colors={[colors.text.primary]}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View className="px-3xl py-3xl items-center">
              <ActivityIndicator size="large" color={colors.text.primary} />
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mt-md">
                {t('LoadingMedia')}
              </Text>
            </View>
          ) : (
            <View className="px-3xl py-3xl items-center">
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                {t('NoMediaYet')}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          <View className="pb-28">
            {loading && mediaItems.length > 0 ? (
              <View className="p-lg items-center">
                <ActivityIndicator size="small" color={colors.text.primary} />
              </View>
            ) : null}
          </View>
        }
      />
    </View>
  );
}
