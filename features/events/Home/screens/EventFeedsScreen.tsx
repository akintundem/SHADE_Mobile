import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MessageCircle,
  Repeat2,
  Heart,
  Share2,
  MoreHorizontal,
  CheckCircle2,
  Plus,
} from 'lucide-react-native';
import Video from 'react-native-video';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { ThreadPost } from '../components/EventThreadModal';
import { ComposePostModal } from '../components/ComposePostModal';
import { useEventFeed } from '../../../../shared/hooks/useEventFeed';
import { FeedPost } from '../../../../shared/types';
import { dateUtils } from '../../../../shared/utils/helpers';

type Props = {
  eventId: string;
  eventName: string;
  onBack: () => void;
  coverImageUrl?: string | null;
};

// Helper function to convert FeedPost to ThreadPost
const convertFeedPostToThreadPost = (feedPost: FeedPost): ThreadPost => {
  // Format timestamp (e.g., "2h", "3d", etc.)
  const formatTimestamp = (dateString: string): string => {
    const postedDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - postedDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return dateUtils.formatDate(dateString, 'MMM d');
  };

  // Extract handle from author name or generate one
  const getHandle = (name?: string): string => {
    if (!name) return 'anonymous';
    return name.toLowerCase().replace(/\s+/g, '').substring(0, 15);
  };

  return {
    id: feedPost.id,
    user: {
      name: feedPost.authorName || 'Anonymous',
      handle: getHandle(feedPost.authorName),
      avatar: feedPost.authorAvatarUrl || 'https://i.pravatar.cc/150?img=1',
      verified: false, // API doesn't provide verification status
    },
    timestamp: formatTimestamp(feedPost.postedAt),
    text: feedPost.content,
    photos: feedPost.type === 'IMAGE' && feedPost.mediaUrl ? [feedPost.mediaUrl] : undefined,
    video: feedPost.type === 'VIDEO' && feedPost.mediaUrl ? feedPost.mediaUrl : undefined,
    comments: feedPost.comments || 0,
    reposts: 0, // API doesn't provide reposts count
    likes: feedPost.likes || 0,
  };
};

type FilterOption = 'ALL' | 'IMAGE' | 'VIDEO' | 'TEXT';

const FILTERS: Array<{ label: string; value: FilterOption }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Photos', value: 'IMAGE' },
  { label: 'Videos', value: 'VIDEO' },
  { label: 'Text', value: 'TEXT' },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop';

export const EventFeedsScreen = ({ eventId, eventName, onBack, coverImageUrl }: Props) => {
  const { spacing, typography, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const [showCompose, setShowCompose] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    posts: feedPosts,
    loading,
    error,
    hasNext,
    loadMore,
    refresh,
    filterByType,
    totalPosts,
    feedInfo,
    activeFilter,
  } = useEventFeed(eventId, 0);

  // Convert FeedPost[] to ThreadPost[]
  const posts = useMemo(() => {
    return feedPosts.map(convertFeedPostToThreadPost);
  }, [feedPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleFilterChange = useCallback(async (filter: FilterOption) => {
    if (filter === activeFilter) {
      return;
    }
    await filterByType(filter);
  }, [activeFilter, filterByType]);

  const handleEndReached = useCallback(() => {
    if (hasNext && !loading) {
      loadMore();
    }
  }, [hasNext, loading, loadMore]);

  const renderListHeader = useCallback(() => {
    const heroImage = feedInfo?.coverImageUrl || coverImageUrl || FALLBACK_IMAGE;
    const displayName = feedInfo?.eventName ?? eventName;
    const description = feedInfo?.description;
    const hashtag = feedInfo?.hashtag;
    const website = feedInfo?.eventWebsiteUrl;
    const startDate = feedInfo?.startDateTime
      ? dateUtils.formatDate(feedInfo.startDateTime, 'EEE, MMM d • h:mm a')
      : undefined;
    const endDate = feedInfo?.endDateTime
      ? dateUtils.formatDate(feedInfo.endDateTime, 'EEE, MMM d • h:mm a')
      : undefined;

    return (
      <View style={{ backgroundColor: '#FFFFFF' }}>
        <View style={{ height: 220, backgroundColor: '#000000' }}>
          <ImageBackground
            source={{ uri: heroImage }}
            style={{ flex: 1 }}
            resizeMode="cover"
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.28)',
                paddingHorizontal: spacing.xl,
                paddingBottom: spacing['2xl'],
                justifyContent: 'flex-end',
                paddingTop: spacing['3xl'],
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: typography.weight.bold,
                  fontSize: typography.size['3xl'],
                }}
                numberOfLines={1}
              >
                {displayName}
              </Text>

              {description ? (
                <Text
                  style={{
                    color: '#F9FAFB',
                    fontSize: typography.size.sm,
                    marginTop: spacing.sm,
                    lineHeight: 20,
                  }}
                  numberOfLines={2}
                >
                  {description}
                </Text>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginTop: spacing.md,
                  gap: spacing.sm,
                }}
              >
                {hashtag ? (
                  <View
                    style={{
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: 'rgba(255,255,255,0.18)',
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: typography.size.xs,
                        fontWeight: typography.weight.medium,
                      }}
                    >
                      {hashtag}
                    </Text>
                  </View>
                ) : null}

                {website ? (
                  <Text
                    style={{
                      color: '#E5E7EB',
                      fontSize: typography.size.xs,
                    }}
                    numberOfLines={1}
                  >
                    {website.replace(/^https?:\/\//, '')}
                  </Text>
                ) : null}
              </View>
            </View>
          </ImageBackground>
        </View>

        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
            backgroundColor: '#FFFFFF',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <StatBlock label="Posts" value={totalPosts} emphasis />
          <StatBlock label="Starts" value={startDate} />
          <StatBlock label="Ends" value={endDate} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}
        >
          {FILTERS.map(filter => {
            const isActive = activeFilter === filter.value;
            return (
              <TouchableOpacity
                key={filter.value}
                onPress={() => handleFilterChange(filter.value)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                }}
              >
                <Text
                  style={{
                    color: isActive ? '#000000' : '#6B7280',
                    fontSize: typography.size.sm,
                    fontWeight: isActive
                      ? typography.weight.semibold
                      : typography.weight.medium,
                    textTransform: 'none',
                  }}
                >
                  {filter.label}
                </Text>
                <View
                  style={{
                    marginTop: spacing.xs / 2,
                    height: 2,
                    width: '50%',
                    borderRadius: 999,
                    backgroundColor: isActive ? '#000000' : 'transparent',
                  }}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {error && !loading ? (
          <View
            style={{
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              backgroundColor: '#FEF2F2',
              borderBottomWidth: 1,
              borderBottomColor: '#FECACA',
            }}
          >
            <Text
              style={{
                color: '#991B1B',
                fontSize: typography.size.sm,
                lineHeight: 20,
              }}
            >
              Error loading feed: {error.message}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              activeOpacity={0.8}
              style={{
                marginTop: spacing.sm,
                alignSelf: 'flex-start',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: borderRadius.md,
                backgroundColor: '#000000',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                }}
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }, [
    activeFilter,
    borderRadius,
    error,
    eventName,
    feedInfo,
    coverImageUrl,
    handleFilterChange,
    loading,
    onRefresh,
    spacing,
    typography,
    totalPosts,
  ]);

  const handlePostCreated = useCallback(async (_newPost: ThreadPost) => {
    // After creating a post, refresh the feed to show the new post
    setShowCompose(false);
    await refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
          }}
        >
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#000000',
              fontWeight: typography.weight.bold,
              fontSize: typography.size.xl,
            }}
            numberOfLines={1}
          >
            Feeds
          </Text>
          <Text
            style={{
              color: '#6B7280',
              fontSize: typography.size.sm,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {eventName}
          </Text>
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] + 80 }}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={renderListHeader}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000000"
            colors={['#000000']}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? (
            <View style={{ padding: spacing['3xl'], alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#000000" />
              <Text
                style={{
                  color: '#6B7280',
                  fontSize: typography.size.base,
                  marginTop: spacing.md,
                }}
              >
                Loading posts...
              </Text>
            </View>
          ) : (
            <View style={{ padding: spacing['3xl'], alignItems: 'center' }}>
              <Text
                style={{
                  color: '#6B7280',
                  fontSize: typography.size.base,
                }}
              >
                No posts yet. Be the first to share!
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && posts.length > 0 ? (
            <View style={{ padding: spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#000000" />
            </View>
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowCompose(true)}
        activeOpacity={0.8}
        style={{
          position: 'absolute',
          bottom: Math.max(insets.bottom, spacing.xl) + spacing.lg,
          right: spacing.xl,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#000000',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={3} />
      </TouchableOpacity>

      {/* Compose Modal */}
      {showCompose && (
        <ComposePostModal
          eventId={eventId}
          eventName={eventName}
          onClose={() => setShowCompose(false)}
          onPost={handlePostCreated}
        />
      )}
    </SafeAreaView>
  );
};

const StatBlock = ({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value?: string | number | null;
  emphasis?: boolean;
}) => {
  const { typography } = useTheme();

  const hasValue =
    value !== undefined && value !== null && value !== '';

  if (!hasValue) {
    return <View style={{ flex: 1 }} />;
  }

  const displayValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: '#6B7280',
          fontSize: typography.size.xs,
          fontWeight: typography.weight.medium,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: '#000000',
          fontSize: emphasis ? typography.size.lg : typography.size.sm,
          fontWeight: emphasis
            ? typography.weight.semibold
            : typography.weight.medium,
          marginTop: 4,
        }}
        numberOfLines={1}
      >
        {displayValue}
      </Text>
    </View>
  );
};

const PostCard = ({ post }: { post: ThreadPost }) => {
  const { spacing, typography, borderRadius } = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
      }}
    >
      {/* User Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
        }}
      >
        <Image
          source={{ uri: post.user.avatar }}
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Text
              style={{
                color: '#000000',
                fontWeight: typography.weight.bold,
                fontSize: typography.size.base,
              }}
            >
              {post.user.name}
            </Text>
            {post.user.verified && (
              <CheckCircle2 size={14} color="#000000" fill="#000000" />
            )}
          </View>
          <Text
            style={{
              color: '#6B7280',
              fontSize: typography.size.sm,
              marginTop: 1,
            }}
          >
            @{post.user.handle} · {post.timestamp}
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <MoreHorizontal size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Post Text */}
      {post.text && (
        <Text
          style={{
            color: '#111827',
            fontSize: typography.size.base,
            lineHeight: 22,
            marginTop: spacing.sm,
          }}
        >
          {post.text}
        </Text>
      )}

      {/* Media */}
      {post.photos && post.photos.length > 0 && (
        <PhotoGrid urls={post.photos} />
      )}
      {post.video && (
        <View
          style={{
            marginTop: spacing.md,
            borderRadius: borderRadius.lg,
            overflow: 'hidden',
            backgroundColor: '#000000',
          }}
        >
          <Video
            source={{ uri: post.video }}
            style={{ height: 300, width: '100%' }}
            resizeMode="cover"
            controls
            paused
          />
        </View>
      )}

      {/* Actions */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: spacing.md,
          paddingTop: spacing.sm,
        }}
      >
        <ActionButton
          icon={MessageCircle}
          value={post.comments}
          onPress={() => {}}
        />
        <ActionButton
          icon={Repeat2}
          value={post.reposts}
          onPress={() => {}}
        />
        <ActionButton
          icon={Heart}
          value={likeCount}
          onPress={handleLike}
          active={isLiked}
        />
        <TouchableOpacity activeOpacity={0.7}>
          <Share2 size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ActionButton = ({
  icon: Icon,
  value,
  onPress,
  active = false,
}: {
  icon: any;
  value?: number;
  onPress: () => void;
  active?: boolean;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Icon
        size={18}
        color={active ? '#EF4444' : '#6B7280'}
        fill={active ? '#EF4444' : 'none'}
      />
      {typeof value === 'number' && value > 0 && (
        <Text
          style={{
            color: active ? '#EF4444' : '#6B7280',
            fontSize: 14,
            fontWeight: '500',
          }}
        >
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const PhotoGrid = ({ urls }: { urls: string[] }) => {
  const { spacing, borderRadius } = useTheme();
  const { width } = Dimensions.get('window');
  const padding = spacing.xl * 2;
  const gap = spacing.sm;
  const availableWidth = width - padding;
  const n = urls.length;

  if (n === 1) {
    return (
      <View
        style={{
          marginTop: spacing.md,
          borderRadius: borderRadius.lg,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: urls[0] }}
          style={{ height: 400, width: '100%' }}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (n === 2) {
    const imageWidth = (availableWidth - gap) / 2;
    return (
      <View
        style={{
          marginTop: spacing.md,
          flexDirection: 'row',
          gap: gap,
        }}
      >
        {urls.map((u, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              borderRadius: borderRadius.lg,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: u }}
              style={{ height: 200, width: '100%' }}
              resizeMode="cover"
            />
          </View>
        ))}
      </View>
    );
  }

  if (n === 3) {
    const imageWidth = (availableWidth - gap) / 2;
    return (
      <View
        style={{
          marginTop: spacing.md,
          flexDirection: 'row',
          gap: gap,
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{ uri: urls[0] }}
            style={{ height: 200, width: '100%' }}
            resizeMode="cover"
          />
        </View>
        <View style={{ flex: 1, gap: gap }}>
          {urls.slice(1).map((u, i) => (
            <View
              key={i}
              style={{
                borderRadius: borderRadius.lg,
                overflow: 'hidden',
              }}
            >
              <Image
                source={{ uri: u }}
                style={{ height: 96, width: '100%' }}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      </View>
    );
  }

  // 4+ photos
  return (
    <View
      style={{
        marginTop: spacing.md,
        flexDirection: 'row',
        gap: gap,
      }}
    >
      <View style={{ flex: 1, gap: gap }}>
        {[urls[0], urls[2]].map((u, i) => (
          <View
            key={i}
            style={{
              borderRadius: borderRadius.lg,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: u }}
              style={{ height: 96, width: '100%' }}
              resizeMode="cover"
            />
          </View>
        ))}
      </View>
      <View style={{ flex: 1, gap: gap }}>
        {[urls[1], urls[3]].map((u, i) => (
          <View
            key={i}
            style={{
              borderRadius: borderRadius.lg,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: u }}
              style={{ height: 96, width: '100%' }}
              resizeMode="cover"
            />
          </View>
        ))}
      </View>
    </View>
  );
};

