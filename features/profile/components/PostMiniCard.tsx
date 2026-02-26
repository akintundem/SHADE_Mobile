import React, { useMemo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import type { FeedPostResponse } from '../../../core/feeds/types/feeds';
import { getImageUrl } from '../../../config/appConfig';
import { formatPostTimestamp } from '../../feeds/utils/feed';
import { getPostPreview } from '../utils/profile';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  post: FeedPostResponse;
  onPress?: () => void;
};

export const PostMiniCard = React.memo(function PostMiniCard({ post, onPress }: Props) {
  const { colors } = useTheme();
  const preview = useMemo(() => getPostPreview(post), [post]);
  const timestamp = formatPostTimestamp(post.createdAt ?? undefined);
  const iconColor = colors.text.tertiary;
  const resolvedMedia = post.mediaUrl ? (getImageUrl(post.mediaUrl) ?? post.mediaUrl) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="flex-row items-start gap-md py-md px-xl"
    >
      {resolvedMedia ? (
        <Image
          source={{ uri: resolvedMedia }}
          className="h-[68px] w-[68px] rounded-xl bg-light-surface dark:bg-dark-surface"
          resizeMode="cover"
        />
      ) : null}
      <View className="flex-1 justify-center">
        <Text className="text-xs font-bold uppercase tracking-[0.8px] text-txt-tertiary dark:text-txt-dark-tertiary mb-[3px]">
          {timestamp}
        </Text>
        <Text
          className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary tracking-[-0.3px] leading-snug"
          numberOfLines={2}
        >
          {preview}
        </Text>
        <View className="flex-row items-center gap-lg mt-sm">
          <View className="flex-row items-center gap-xs">
            <Heart size={13} color={iconColor} strokeWidth={2} />
            <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
              {post.likeCount ?? 0}
            </Text>
          </View>
          <View className="flex-row items-center gap-xs">
            <MessageCircle size={13} color={iconColor} strokeWidth={2} />
            <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
              {post.commentCount ?? 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});
