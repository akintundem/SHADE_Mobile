import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
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
  X,
} from 'lucide-react-native';
import Video from 'react-native-video';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { ThreadPost } from '../components/EventThreadModal';
import { ComposePostModal } from '../components/ComposePostModal';

type Props = {
  eventId: string;
  eventName: string;
  onBack: () => void;
};

// Mock posts data - replace with actual API call
const MOCK_POSTS: ThreadPost[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Johnson',
      handle: 'sarahj',
      avatar: 'https://i.pravatar.cc/150?img=1',
      verified: true,
    },
    timestamp: '2h',
    text: 'Amazing event! The energy here is incredible! 🎉',
    photos: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'],
    comments: 12,
    reposts: 5,
    likes: 89,
  },
  {
    id: '2',
    user: {
      name: 'Mike Chen',
      handle: 'mikechen',
      avatar: 'https://i.pravatar.cc/150?img=2',
      verified: false,
    },
    timestamp: '4h',
    text: 'Just uploaded some photos from the event!',
    photos: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
    ],
    comments: 8,
    reposts: 3,
    likes: 45,
  },
  {
    id: '3',
    user: {
      name: 'Emma Wilson',
      handle: 'emmaw',
      avatar: 'https://i.pravatar.cc/150?img=3',
      verified: true,
    },
    timestamp: '6h',
    text: 'Check out this video from the opening ceremony!',
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    comments: 23,
    reposts: 15,
    likes: 156,
  },
  {
    id: '4',
    user: {
      name: 'David Lee',
      handle: 'davidl',
      avatar: 'https://i.pravatar.cc/150?img=4',
      verified: false,
    },
    timestamp: '8h',
    text: 'Great networking session! Met so many interesting people.',
    photos: [
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
    ],
    comments: 5,
    reposts: 2,
    likes: 32,
  },
];

export const EventFeedsScreen = ({ eventId, eventName, onBack }: Props) => {
  const { spacing, typography, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<ThreadPost[]>(MOCK_POSTS);
  const [showCompose, setShowCompose] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch posts from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handlePostCreated = useCallback((newPost: ThreadPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCompose(false);
  }, []);

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
        ListEmptyComponent={
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
        padding: spacing.xl,
      }}
    >
      {/* User Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Image
          source={{ uri: post.user.avatar }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            marginRight: spacing.md,
            borderWidth: 1.5,
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
          <MoreHorizontal size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Post Text */}
      {post.text && (
        <Text
          style={{
            color: '#111827',
            fontSize: typography.size.base,
            lineHeight: 22,
            marginBottom: spacing.md,
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
          marginTop: spacing.lg,
          paddingTop: spacing.md,
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
        size={20}
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

