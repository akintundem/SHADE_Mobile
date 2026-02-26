import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, PenLine } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import type { FeedPost, UserEventContext } from '../../../core/events/types/event';
import { dateUtils } from '../../../common/utils/helpers';
import { ComposePostModal } from '../components/ComposePostModal';
import { EventThreadModal } from '../components/EventThreadModal';
import { QuotePostModal } from '../components/QuotePostModal';
import { PostCard } from '../components/PostCard';
import { MediaGallery } from '../components/MediaGallery';
import { FeedProvider, useFeedContext } from '../context';
import { useEventFeed, useFeedFlow, useFeedPermissions } from '../hooks';
import type { FeedFilter, ThreadPost } from '../types';
import { convertFeedPostToThreadPost } from '../utils';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../config/appConfig';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop';

type Props = {
  eventId: string;
  eventName: string;
  onBack: () => void;
  coverImageUrl?: string | null;
  userContext?: UserEventContext | null;
};

type FilterOption = 'ALL' | 'MEDIA' | 'TEXT';

const FILTERS: Array<{ label: string; value: FilterOption }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Posts', value: 'TEXT' },
  { label: 'Media', value: 'MEDIA' },
];

export const EventFeedsScreen = ({ eventId, eventName, onBack, coverImageUrl, userContext }: Props) => {
  return (
    <FeedProvider
      eventId={eventId}
      eventName={eventName}
      coverImageUrl={coverImageUrl}
      userContext={userContext}
    >
      <EventFeedsView onBack={onBack} />
    </FeedProvider>
  );
};

const EventFeedsView = ({ onBack }: { onBack: () => void }) => {
  const { eventId, eventName, coverImageUrl, userContext } = useFeedContext();
  const [quotePost, setQuotePost] = useState<ThreadPost | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  const textColor = colors.text;
  const borderLight = colors.borderLight;
  const [refreshing, setRefreshing] = useState(false);
  const [localFilter, setLocalFilter] = useState<FilterOption | null>(null);

  const {
    posts: feedPosts,
    loading,
    error,
    hasNext,
    loadMore,
    refresh,
    filterByType,
    feedInfo,
    activeFilter,
  } = useEventFeed(eventId, { initialPage: 0 });

  const resolvedUserContext = feedInfo?.userContext ?? userContext;
  const permissions = useFeedPermissions(resolvedUserContext);
  const flow = useFeedFlow({ onBack, permissions });

  const posts = useMemo(() => feedPosts.map(convertFeedPostToThreadPost), [feedPosts]);

  const mediaPosts = useMemo(
    () => feedPosts.filter(post => post.type === 'IMAGE' || post.type === 'VIDEO'),
    [feedPosts]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh(true);
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleFilterChange = useCallback(
    async (filter: FilterOption) => {
      if (filter === activeFilter && localFilter === null) {
        return;
      }
      if (filter === 'MEDIA') {
        setLocalFilter('MEDIA');
        if (activeFilter !== 'ALL') {
          await filterByType('ALL');
        }
      } else {
        setLocalFilter(null);
        await filterByType(filter as FeedFilter);
      }
    },
    [activeFilter, filterByType, localFilter]
  );

  const handleEndReached = useCallback(() => {
    if (hasNext && !loading) {
      loadMore();
    }
  }, [hasNext, loading, loadMore]);

  const handlePostCreated = useCallback(async () => {
    flow.closeOverlay();
    await refresh(true);
  }, [flow, refresh]);

  const handleQuotePost = useCallback(async (_quotedPost: ThreadPost) => {
    setShowQuoteModal(false);
    setQuotePost(null);
    await refresh(true);
  }, [refresh]);

  const heroImage = getImageUrl(feedInfo?.coverImageUrl || coverImageUrl) || FALLBACK_IMAGE;
  const displayName = feedInfo?.eventName ?? eventName;
  const description = feedInfo?.description;
  const hashtag = feedInfo?.hashtag;

  const listHeader = useCallback(() => {
    const active = localFilter || activeFilter;

    return (
      <View className="bg-light-background dark:bg-dark-background">
        {/* Hero section */}
        <View className="h-[220px]">
          <ImageBackground source={{ uri: heroImage }} className="flex-1" resizeMode="cover">
            {/* Gradient-style overlay: light at top, dark at bottom */}
            <View
              className="flex-1 justify-end"
              style={{ backgroundColor: 'rgba(0,0,0,0.52)' }}
            >
              <View className="px-xl pb-xl pt-2xl">
                {hashtag ? (
                  <View className="self-start mb-sm px-sm py-[3px] rounded-full bg-neutral-white/[0.16] border border-neutral-white/[0.22]">
                    <Text className="text-xs font-semibold text-txt-inverse tracking-wide uppercase">
                      {hashtag}
                    </Text>
                  </View>
                ) : null}

                <Text
                  className="text-3xl font-bold text-txt-inverse leading-tight"
                  numberOfLines={2}
                  style={{ letterSpacing: -0.5 }}
                >
                  {displayName}
                </Text>

                {description ? (
                  <Text
                    className="text-sm text-txt-inverse mt-xs leading-relaxed"
                    numberOfLines={2}
                    style={{ opacity: 0.82 }}
                  >
                    {description}
                  </Text>
                ) : null}
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Filter tabs */}
        <View className="flex-row">
          {FILTERS.map(filter => {
            const isActive = active === filter.value;
            return (
              <TouchableOpacity
                key={filter.value}
                onPress={() => handleFilterChange(filter.value)}
                activeOpacity={0.8}
                className="flex-1 items-center py-md"
              >
                <Text
                  className={
                    isActive
                      ? 'text-sm font-semibold text-txt-primary dark:text-txt-dark-primary'
                      : 'text-sm font-medium text-txt-tertiary dark:text-txt-dark-tertiary'
                  }
                >
                  {filter.value === 'ALL' ? t('All') : filter.value === 'TEXT' ? t('Posts') : t('Media')}
                </Text>
                <View
                  className={`mt-[3px] h-[2px] w-8 rounded-full ${isActive ? 'bg-txt-primary dark:bg-txt-dark-primary' : 'bg-transparent'}`}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {error && !loading ? (
          <View className="px-xl py-md">
            <Text className="text-sm text-semantic-error leading-relaxed">
              {t('ErrorLoadingFeed', { error: error.message })}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              activeOpacity={0.8}
              className="mt-sm self-start px-md py-xs rounded-md bg-txt-primary"
            >
              <Text className="text-xs font-medium text-txt-inverse">{t('TryAgain')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }, [
    activeFilter,
    borderLight,
    displayName,
    description,
    error,
    handleFilterChange,
    heroImage,
    localFilter,
    loading,
    onRefresh,
    t,
    hashtag,
  ]);

  return (
    <SafeAreaView
      className="flex-1 bg-light-background dark:bg-dark-background"
      edges={['bottom']}
    >
      {/* Nav bar */}
      <View
        className="flex-row items-center px-lg py-md border-b"
        style={{ borderBottomColor: borderLight }}
      >
        <TouchableOpacity
          onPress={flow.handleBack}
          activeOpacity={0.7}
          className="w-9 h-9 rounded-full items-center justify-center mr-md"
        >
          <ChevronLeft size={18} color={textColor.primary} strokeWidth={2.3} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-base font-bold text-txt-primary dark:text-txt-dark-primary"
            numberOfLines={1}
          >
            {t('EventFeeds')}
          </Text>
        </View>
      </View>

      {(localFilter || activeFilter) === 'MEDIA' ? (
        <MediaGallery
          posts={mediaPosts}
          onRefresh={onRefresh}
          refreshing={refreshing}
          loading={loading}
          ListHeaderComponent={listHeader}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onOpenThread={() => flow.openThread(displayName, [item])}
              eventId={eventId}
              onQuote={() => {
                setQuotePost(item);
                setShowQuoteModal(true);
              }}
            />
          )}
          ListHeaderComponent={listHeader}
          ItemSeparatorComponent={() => null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={textColor.primary}
              colors={[textColor.primary]}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            loading ? (
              <View className="px-3xl py-3xl items-center">
                <ActivityIndicator size="large" color={textColor.primary} />
                <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mt-md">
                  {t('LoadingPosts')}
                </Text>
              </View>
            ) : (
              <View className="px-3xl py-3xl items-center">
                <Text className="text-sm font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
                  {t('NoPostsYet')}
                </Text>
                {permissions.canUpload && (
                  <TouchableOpacity
                    onPress={flow.openComposer}
                    activeOpacity={0.8}
                    className="mt-md px-lg py-sm rounded-full bg-txt-primary dark:bg-txt-dark-primary"
                  >
                    <Text className="text-sm font-semibold text-txt-inverse dark:text-txt-primary">
                      {t('CreateFirstPost')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          }
          ListFooterComponent={
            <View className="pb-28">
              {loading && posts.length > 0 ? (
                <View className="p-lg items-center">
                  <ActivityIndicator size="small" color={textColor.primary} />
                </View>
              ) : null}
            </View>
          }
        />
      )}

      {/* Floating compose button */}
      {permissions.canUpload && (
        <TouchableOpacity
          onPress={flow.openComposer}
          activeOpacity={0.85}
          className="absolute bottom-8 right-xl w-14 h-14 rounded-full items-center justify-center"
          style={{
            backgroundColor: textColor.primary,
            shadowColor: isDark ? textColor.inverse : textColor.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.2,
            shadowRadius: 12,
            elevation: 6,
          }}
          accessibilityRole="button"
          accessibilityLabel={t('NewPost')}
        >
          <PenLine size={22} color={textColor.inverse} strokeWidth={2} />
        </TouchableOpacity>
      )}

      {flow.overlay === 'COMPOSE' && (
        <ComposePostModal onClose={flow.closeOverlay} onPost={handlePostCreated} />
      )}

      <EventThreadModal
        visible={flow.overlay === 'THREAD'}
        onClose={flow.closeOverlay}
        title={flow.thread?.title ?? displayName}
        posts={flow.thread?.posts ?? []}
      />

      <QuotePostModal
        visible={showQuoteModal}
        originalPost={quotePost}
        onClose={() => {
          setShowQuoteModal(false);
          setQuotePost(null);
        }}
        onQuote={handleQuotePost}
      />
    </SafeAreaView>
  );
};

