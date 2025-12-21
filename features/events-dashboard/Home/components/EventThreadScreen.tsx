import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MessageCircle, Repeat2, Heart, Share2, MoreHorizontal, CheckCircle2 } from 'lucide-react-native';
import Video from 'react-native-video';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import type { ThreadPost } from './EventThreadModal';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  posts: ThreadPost[];
};

export const EventThreadScreen = ({ visible, onClose, title, posts }: Props) => {
  const { colors, typography, spacing } = useTheme();
  const { t } = useI18n();
  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background, zIndex: 1000 }]}> 
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.bold, fontSize: typography.size.lg }} numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel={t('Close')}>
            <X size={22} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
          renderItem={({ item }) => <PostCard post={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        />
      </SafeAreaView>
    </View>
  );
};

const PostCard = ({ post }: { post: ThreadPost }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md }}>
      {/* Avatar */}
      <Image source={{ uri: post.user.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />

      {/* Body */}
      <View style={{ flex: 1 }}>
        {/* Name row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>{post.user.name}</Text>
          {post.user.verified ? <CheckCircle2 size={14} color={colors.text.secondary} /> : null}
          <Text style={{ color: colors.text.tertiary }}>@{post.user.handle} · {post.timestamp}</Text>
          <View style={{ flex: 1 }} />
          <MoreHorizontal size={18} color={colors.text.tertiary} />
        </View>

        {/* Text */}
        {post.text ? (
          <Text style={{ color: colors.text.primary, marginTop: spacing.xs, lineHeight: 20 }}>{post.text}</Text>
        ) : null}

        {/* Media */}
        {post.photos && post.photos.length > 0 ? (
          <PhotoGrid urls={post.photos} />
        ) : post.video ? (
          <View style={{ marginTop: spacing.sm, borderRadius: borderRadius.lg, overflow: 'hidden', backgroundColor: '#000' }}>
            <Video source={{ uri: post.video }} style={{ height: 220, width: '100%' }} resizeMode="cover" controls paused />
          </View>
        ) : null}

        {/* Actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingRight: spacing.lg }}>
          <Action icon={MessageCircle} value={post.comments} />
          <Action icon={Repeat2} value={post.reposts} />
          <Action icon={Heart} value={post.likes} />
          <Share2 size={16} color={colors.text.tertiary} />
        </View>
      </View>
    </View>
  );
};

const Action = ({ icon: Icon, value }: any) => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon size={16} color={colors.text.tertiary} />
      {typeof value === 'number' ? (
        <Text style={{ color: colors.text.tertiary }}>{value}</Text>
      ) : null}
    </View>
  );
};

const PhotoGrid = ({ urls }: { urls: string[] }) => {
  const { spacing, borderRadius } = useTheme();
  const n = urls.length;
  if (n === 1) {
    return (
      <View style={{ marginTop: spacing.sm }}>
        <Image source={{ uri: urls[0] }} style={{ height: 220, width: '100%', borderRadius: borderRadius.lg }} />
      </View>
    );
  }
  if (n === 2) {
    return (
      <View style={{ marginTop: spacing.sm, flexDirection: 'row', gap: spacing.sm }}>
        {urls.map(u => (
          <Image key={u} source={{ uri: u }} style={{ height: 200, flex: 1, borderRadius: borderRadius.lg }} />
        ))}
      </View>
    );
  }
  if (n === 3) {
    return (
      <View style={{ marginTop: spacing.sm, flexDirection: 'row', gap: spacing.sm }}>
        <Image source={{ uri: urls[0] }} style={{ height: 200, flex: 1, borderRadius: borderRadius.lg }} />
        <View style={{ flex: 1, gap: spacing.sm }}>
          <Image source={{ uri: urls[1] }} style={{ height: 95, width: '100%', borderRadius: borderRadius.lg }} />
          <Image source={{ uri: urls[2] }} style={{ height: 95, width: '100%', borderRadius: borderRadius.lg }} />
        </View>
      </View>
    );
  }
  return (
    <View style={{ marginTop: spacing.sm, flexDirection: 'row', gap: spacing.sm }}>
      <View style={{ flex: 1, gap: spacing.sm }}>
        <Image source={{ uri: urls[0] }} style={{ height: 95, width: '100%', borderRadius: borderRadius.lg }} />
        <Image source={{ uri: urls[2] }} style={{ height: 95, width: '100%', borderRadius: borderRadius.lg }} />
      </View>
      <View style={{ flex: 1, gap: spacing.sm }}>
        <Image source={{ uri: urls[1] }} style={{ height: 95, width: '100%', borderRadius: borderRadius.lg }} />
        <Image source={{ uri: urls[3] }} style={{ height: 95, width: '100%', borderRadius: borderRadius.lg }} />
      </View>
    </View>
  );
};


