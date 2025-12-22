import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import Video from 'react-native-video';
import { X, ImageIcon, Film, Quote } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useI18n } from '../../../../common/i18n/I18nProvider';

type MediaItem = { id: string; type: 'photo' | 'video' | 'thought'; url?: string; text?: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  media: MediaItem[];
};

export const EventDetailModal = ({ visible, onClose, title, media }: Props) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { t } = useI18n();
  const [tab, setTab] = useState<'photos' | 'videos' | 'thoughts'>('photos');

  const photos = useMemo(() => media.filter(m => m.type === 'photo'), [media]);
  const videos = useMemo(() => media.filter(m => m.type === 'video'), [media]);
  const thoughts = useMemo(() => media.filter(m => m.type === 'thought'), [media]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text.primary, fontWeight: typography.weight.bold, fontSize: typography.size.lg }}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
          <Tab label={t('Photos')} active={tab === 'photos'} onPress={() => setTab('photos')} Icon={ImageIcon} />
          <Tab label={t('Videos')} active={tab === 'videos'} onPress={() => setTab('videos')} Icon={Film} />
          <Tab label={t('Thoughts')} active={tab === 'thoughts'} onPress={() => setTab('thoughts')} Icon={Quote} />
        </View>

        {/* Content */}
        {tab === 'photos' ? (
          <FlatList
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md } as any}
            data={photos}
            numColumns={2}
            keyExtractor={i => i.id}
            columnWrapperStyle={{ gap: spacing.md }}
            renderItem={({ item }) => (
              <Image source={{ uri: item.url! }} style={{ height: 160, flex: 1, borderRadius: borderRadius.lg }} />
            )}
          />
        ) : tab === 'videos' ? (
          <FlatList
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md } as any}
            data={videos}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <View style={{ height: 220, borderRadius: borderRadius.lg, overflow: 'hidden', backgroundColor: '#000' }}>
                <Video source={{ uri: item.url! }} style={{ flex: 1 }} resizeMode="cover" controls paused />
              </View>
            )}
          />
        ) : (
          <FlatList
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md } as any}
            data={thoughts}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <View style={{ padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}>
                <Text style={{ color: colors.text.primary, fontSize: typography.size.base }}>{item.text}</Text>
              </View>
            )}
          />
        )}
      </View>
    </Modal>
  );
};

const Tab = ({ label, active, onPress, Icon }: any) => {
  const { colors, brand, typography, spacing, borderRadius } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: active ? brand.primary : colors.surface,
        borderWidth: 1,
        borderColor: active ? brand.primary : colors.border,
      }}
    >
      <Icon size={14} color={active ? '#FFFFFF' : colors.text.secondary} />
      <Text style={{ color: active ? '#FFFFFF' : colors.text.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>{label}</Text>
    </TouchableOpacity>
  );
};


