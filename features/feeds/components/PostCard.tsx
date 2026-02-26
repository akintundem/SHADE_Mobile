import React, { useCallback, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import {
  CheckCircle2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Quote,
  Repeat2,
  Share2,
} from 'lucide-react-native';
import Video from 'react-native-video';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { feedService } from '../../../core/feeds/services/feeds';
import { getImageUrl } from '../../../config/appConfig';
import type { ThreadPost } from '../types';
import { ActionButton } from './ActionButton';
import { PhotoGrid } from './PhotoGrid';

type Props = {
  post: ThreadPost;
  onOpenThread: () => void;
  eventId: string;
  onQuote?: () => void;
};

export const PostCard = React.memo(({ post, onOpenThread, eventId, onQuote }: Props) => {
  const { colors } = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [repostCount, setRepostCount] = useState(post.reposts || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isRepostLoading, setIsRepostLoading] = useState(false);

  const handleLike = useCallback(async () => {
    if (isLikeLoading) return;
    const nextLiked = !isLiked;
    const previousCount = likeCount;
    setIsLiked(nextLiked);
    setLikeCount(prev => (nextLiked ? prev + 1 : Math.max(prev - 1, 0)));
    setIsLikeLoading(true);
    try {
      if (nextLiked) {
        await feedService.likePost(eventId, post.id);
      } else {
        await feedService.unlikePost(eventId, post.id);
      }
    } catch {
      setIsLiked(!nextLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLikeLoading(false);
    }
  }, [eventId, isLikeLoading, isLiked, likeCount, post.id]);

  const handleRepost = useCallback(async () => {
    if (isRepostLoading) return;
    setIsRepostLoading(true);
    try {
      await feedService.repost(eventId, post.id);
      setRepostCount(prev => prev + 1);
    } catch {
      // leave count unchanged on failure
    } finally {
      setIsRepostLoading(false);
    }
  }, [eventId, isRepostLoading, post.id]);

  const avatarUri = getImageUrl(post.user.avatar) ?? post.user.avatar;
  const videoUri = post.video ? (getImageUrl(post.video) ?? post.video) : undefined;

  return (
    <View className="bg-light-background dark:bg-dark-background px-xl pt-lg pb-md">
      {/* Author row */}
      <View className="flex-row items-center gap-md">
        <Image
          source={{ uri: avatarUri }}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}
        />
        <View className="flex-1">
          <View className="flex-row items-center gap-[5px]">
            <Text className="text-sm font-bold text-txt-primary dark:text-txt-dark-primary">
              {post.user.name}
            </Text>
            {post.user.verified && (
              <CheckCircle2 size={13} color={colors.text.primary} fill={colors.text.primary} />
            )}
          </View>
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[1px]">
            @{post.user.handle} · {post.timestamp}
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} className="p-xs -mr-xs">
          <MoreHorizontal size={16} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {post.text ? (
        <Text className="text-sm text-txt-primary dark:text-txt-dark-primary mt-sm leading-relaxed">
          {post.text}
        </Text>
      ) : null}

      {post.photos && post.photos.length > 0 ? <PhotoGrid urls={post.photos} /> : null}

      {videoUri ? (
        <View className="mt-md rounded-xl overflow-hidden bg-light-surface dark:bg-dark-surface">
          <Video
            source={{ uri: videoUri }}
            className="h-[280px] w-full"
            resizeMode="cover"
            controls
            paused
          />
        </View>
      ) : null}

      {/* Actions row */}
      <View className="flex-row items-center justify-between mt-md pt-xs">
        <ActionButton icon={MessageCircle} value={post.comments} onPress={onOpenThread} />
        <ActionButton icon={Repeat2} value={repostCount} onPress={handleRepost} />
        {onQuote && <ActionButton icon={Quote} value={undefined} onPress={onQuote} />}
        <ActionButton icon={Heart} value={likeCount} onPress={handleLike} active={isLiked} />
        <TouchableOpacity activeOpacity={0.7} className="p-xs">
          <Share2 size={15} color={colors.text.tertiary} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
});
