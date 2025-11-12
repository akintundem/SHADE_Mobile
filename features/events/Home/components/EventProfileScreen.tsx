import React, { useMemo, useState } from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { useI18n } from '../../../../shared/i18n/I18nProvider';
import { MessageCircle, Repeat2, Heart, Share2, CheckCircle2 } from 'lucide-react-native';

type Post = {
  id: string;
  user: { name: string; handle: string; avatar: string; verified?: boolean };
  timestamp: string;
  text?: string;
  photos?: string[];
  video?: string;
};

type Props = {
  onClose: () => void;
  title: string;
  imageUrl?: string;
  bio?: string;
  posts?: Post[];
};

export const EventProfileScreen = ({ title, imageUrl, bio, posts = [] }: Props) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();
  const [tab, setTab] = useState<'all' | 'highlight' | 'media'>('all');

  const mediaPosts = useMemo(() => posts.filter(p => (p.photos && p.photos.length > 0) || p.video), [posts]);
  const highlight = useMemo(() => posts.slice(0, Math.min(3, posts.length)), [posts]);

  const current = tab === 'media' ? mediaPosts : tab === 'highlight' ? highlight : posts;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
      ) : null}

      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Text style={{ color: colors.text.primary, fontWeight: typography.weight.bold, fontSize: typography.size['2xl'] }}>{title}</Text>
        {bio ? (
          <Text style={{ color: colors.text.secondary, marginTop: spacing.xs }}>{bio}</Text>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        <Seg label="All Posts" active={tab === 'all'} onPress={() => setTab('all')} />
        <Seg label="Highlight" active={tab === 'highlight'} onPress={() => setTab('highlight')} />
        <Seg label="Media" active={tab === 'media'} onPress={() => setTab('media')} />
      </View>

      <FlatList
        style={{ marginTop: spacing.md }}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
        data={current}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderTopWidth: 1, borderColor: colors.border }}>
            {/* User row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Image source={{ uri: item.user.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>{item.user.name}</Text>
                  {item.user.verified ? <CheckCircle2 size={14} color={colors.text.secondary} /> : null}
                  <Text style={{ color: colors.text.tertiary }}>@{item.user.handle} · {item.timestamp}</Text>
                </View>
                {item.text ? (
                  <Text style={{ color: colors.text.primary, marginTop: spacing.xs, lineHeight: 20 }}>{item.text}</Text>
                ) : null}
              </View>
            </View>

            {/* Media */}
            {item.photos && item.photos.length > 0 ? (
              <PhotoGrid urls={item.photos} />
            ) : null}

            {/* Actions */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingRight: spacing.lg }}>
              <Action icon={MessageCircle} />
              <Action icon={Repeat2} />
              <Action icon={Heart} />
              <Share2 size={16} color={colors.text.tertiary} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const Seg = ({ label, active, onPress }: any) => {
  const { colors, brand, spacing, borderRadius, typography } = useTheme();
  return (
    <Text onPress={onPress} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: active ? brand.primary : colors.surface, borderWidth: 1, borderColor: active ? brand.primary : colors.border, color: active ? '#FFFFFF' : colors.text.secondary, fontWeight: active ? typography.weight.semibold : typography.weight.medium, fontSize: typography.size.sm }}>
      {label}
    </Text>
  );
};

const Action = ({ icon: Icon }: any) => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon size={16} color={colors.text.tertiary} />
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


