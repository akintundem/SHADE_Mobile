import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { X, MessageCircle, Repeat2, Heart, Share2, MoreHorizontal, CheckCircle2 } from 'lucide-react-native';
import Video from 'react-native-video';
import { useI18n } from '../../../common/i18n/I18nProvider';
import type { ThreadPost } from '../types';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { getImageUrl } from '../../../config/appConfig';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  posts: ThreadPost[];
};

export const EventThreadModal = ({ visible, onClose, title, posts }: Props) => {
  const { t } = useI18n();
  const { colors } = useTheme();
  const textColor = colors.text;
  const borderColor = colors.border;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View
          className="flex-row items-center justify-between px-lg py-md"
        >
          <Text className="text-lg font-bold text-txt-primary dark:text-txt-dark-primary" numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel={t('Close')}>
            <X size={22} color={textColor.secondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={posts}
          keyExtractor={p => p.id}
          ListFooterComponent={<View className="h-12" />}
          renderItem={({ item }) => <PostCard post={item} />}
          ItemSeparatorComponent={() => null}
        />
      </View>
    </Modal>
  );
};

const PostCard = ({ post }: { post: ThreadPost }) => {
  const { colors } = useTheme();
  const textColor = colors.text;

  const avatarUri = getImageUrl(post.user.avatar) ?? post.user.avatar;
  const videoUri = post.video ? (getImageUrl(post.video) ?? post.video) : undefined;

  return (
    <View className="flex-row px-lg py-md gap-md">
      <Image source={{ uri: avatarUri }} className="w-10 h-10 rounded-full" />

      <View className="flex-1">
        <View className="flex-row items-center gap-[6px]">
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
            {post.user.name}
          </Text>
          {post.user.verified ? <CheckCircle2 size={14} color={textColor.secondary} /> : null}
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
            @{post.user.handle} · {post.timestamp}
          </Text>
          <View className="flex-1" />
          <MoreHorizontal size={18} color={textColor.tertiary} />
        </View>

        {post.text ? (
          <Text className="text-sm text-txt-primary dark:text-txt-dark-primary mt-xs leading-relaxed">
            {post.text}
          </Text>
        ) : null}

        {post.photos && post.photos.length > 0 ? (
          <PhotoGrid urls={post.photos} />
        ) : videoUri ? (
          <View className="mt-sm rounded-lg overflow-hidden bg-neutral-black">
            <Video source={{ uri: videoUri }} className="h-[220px] w-full" resizeMode="cover" controls paused />
          </View>
        ) : null}

        <View className="flex-row items-center justify-between mt-sm pr-lg">
          <Action icon={MessageCircle} value={post.comments} />
          <Action icon={Repeat2} value={post.reposts} />
          <Action icon={Heart} value={post.likes} />
          <Share2 size={16} color={textColor.tertiary} />
        </View>
      </View>
    </View>
  );
};

const Action = ({ icon: Icon, value }: any) => {
  const { colors } = useTheme();
  const textColor = colors.text;

  return (
    <View className="flex-row items-center gap-[6px]">
      <Icon size={16} color={textColor.tertiary} />
      {typeof value === 'number' ? (
        <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
          {value}
        </Text>
      ) : null}
    </View>
  );
};

const PhotoGrid = ({ urls }: { urls: string[] }) => {
  const resolved = urls.map(u => getImageUrl(u) ?? u);
  const n = resolved.length;

  if (n === 1) {
    return (
      <View className="mt-sm">
        <Image source={{ uri: resolved[0] }} className="h-[220px] w-full rounded-lg" />
      </View>
    );
  }
  if (n === 2) {
    return (
      <View className="mt-sm flex-row gap-sm">
        {resolved.map(u => (
          <Image key={u} source={{ uri: u }} className="h-[200px] flex-1 rounded-lg" />
        ))}
      </View>
    );
  }
  if (n === 3) {
    return (
      <View className="mt-sm flex-row gap-sm">
        <Image source={{ uri: resolved[0] }} className="h-[200px] flex-1 rounded-lg" />
        <View className="flex-1 gap-sm">
          <Image source={{ uri: resolved[1] }} className="h-[95px] w-full rounded-lg" />
          <Image source={{ uri: resolved[2] }} className="h-[95px] w-full rounded-lg" />
        </View>
      </View>
    );
  }
  return (
    <View className="mt-sm flex-row gap-sm">
      <View className="flex-1 gap-sm">
        <Image source={{ uri: resolved[0] }} className="h-[95px] w-full rounded-lg" />
        <Image source={{ uri: resolved[2] }} className="h-[95px] w-full rounded-lg" />
      </View>
      <View className="flex-1 gap-sm">
        <Image source={{ uri: resolved[1] }} className="h-[95px] w-full rounded-lg" />
        <Image source={{ uri: resolved[3] }} className="h-[95px] w-full rounded-lg" />
      </View>
    </View>
  );
};
