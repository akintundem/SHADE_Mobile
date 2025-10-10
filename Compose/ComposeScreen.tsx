import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { X, Camera, ImagePlus, Search, Hash, Users, Globe, Lock, Save } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { recentExamples } from '../Discover/examples';

type Props = {
  onClose: () => void;
  onPost?: (payload: { caption: string; tags: string[]; eventId?: string }) => void;
  onOpenCamera?: () => void;
  hasDraft?: boolean;
  onContinueDraft?: () => void;
  onClearDraft?: () => void;
  onSaveDraft?: () => void;
};

export default function ComposeScreen({ onClose, onPost, onOpenCamera, hasDraft, onContinueDraft, onClearDraft, onSaveDraft }: Props) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<'moment' | 'thought'>('moment');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [mediaPaths, setMediaPaths] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { getCaptureClips } = await import('../storage/captureSession');
      const clips = getCaptureClips();
      if (clips.length > 0) {
        setMediaPaths(clips.map(c => c.path));
      }
    })();
  }, []);

  const canPost = useMemo(() => (mode === 'thought' ? caption.trim().length > 0 : mediaPaths.length > 0 || caption.trim().length > 0), [mode, caption, mediaPaths]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
          <X size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Create</Text>
        <TouchableOpacity onPress={onOpenCamera} style={{ padding: 4 }}>
          <Camera size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Mode selector */}
      <View style={{ flexDirection: 'row', gap: 12, padding: 12 }}>
        {[
          { key: 'moment', label: 'Moment' },
          { key: 'thought', label: 'Thought' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setMode(t.key as any)}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: mode === t.key ? colors.textPrimary : colors.card }}
          >
            <Text style={{ color: mode === t.key ? '#FFFFFF' : colors.textPrimary, fontWeight: '600' }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {mode === 'moment' ? (
          <>
            {/* Caption first */}
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>Caption</Text>
              <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surface }}>
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Say something about this moment..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  style={{ minHeight: 80, color: colors.textPrimary }}
                />
              </View>
            </View>

            {/* Media second */}
            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>Media</Text>

              {mediaPaths.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {mediaPaths.map((path, idx) => (
                      <View key={idx} style={{ width: 100, height: 100, borderRadius: 12, overflow: 'hidden', backgroundColor: '#E5E7EB' }}>
                        <Image source={{ uri: path }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <View style={{ height: 140, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 12, marginTop: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card }}>
                  <ImagePlus size={22} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, marginTop: 6 }}>Upload photos or videos</Text>
                  <Text style={{ color: colors.textSecondary, marginTop: 2, fontSize: 12 }}>Tap camera icon above</Text>
                </View>
              )}

              {hasDraft ? (
                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>You have an unsent draft</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={onClearDraft} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.card }}>
                      <Text style={{ color: colors.textPrimary }}>Discard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onContinueDraft} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.tint }}>
                      <Text style={{ color: colors.bg, fontWeight: '600' }}>Continue</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Events last */}
            {renderAttachEvent(selectedEventId, setSelectedEventId, colors)}
          </>
        ) : (
          <>
            {/* Thought first */}
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>Write a thought</Text>
              <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surface }}>
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Share a thought..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  style={{ minHeight: 100, color: colors.textPrimary }}
                />
              </View>
            </View>

            {/* Events next */}
            {renderAttachEvent(selectedEventId, setSelectedEventId, colors)}
          </>
        )}

        {/* Tags */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>Tags</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, height: 40, backgroundColor: colors.surface }}>
            <Hash size={16} color={colors.textSecondary} />
            <TextInput
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag"
              placeholderTextColor={colors.textSecondary}
              style={{ marginLeft: 8, flex: 1, color: colors.textPrimary }}
              onSubmitEditing={() => {
                if (!tagInput.trim()) return;
                if (tags.includes(tagInput.trim())) return;
                setTags([...tags, tagInput.trim()]);
                setTagInput('');
              }}
            />
            <TouchableOpacity
              onPress={() => {
                if (!tagInput.trim()) return;
                if (tags.includes(tagInput.trim())) return;
                setTags([...tags, tagInput.trim()]);
                setTagInput('');
              }}
              style={{ backgroundColor: colors.tint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}
            >
              <Text style={{ color: colors.bg, fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>
          </View>

          {tags.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {tags.map(t => (
                <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: colors.textPrimary }}>#{t}</Text>
                  <TouchableOpacity onPress={() => setTags(tags.filter(x => x !== t))}>
                    <X size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Privacy */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>Visibility</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Segment
              active={privacy === 'public'}
              onPress={() => setPrivacy('public')}
              icon={<Globe size={14} color={privacy === 'public' ? colors.bg : colors.textPrimary} />}
              label="Public"
              colors={colors}
            />
            <Segment
              active={privacy === 'followers'}
              onPress={() => setPrivacy('followers')}
              icon={<Users size={14} color={privacy === 'followers' ? colors.bg : colors.textPrimary} />}
              label="Followers"
              colors={colors}
            />
            <Segment
              active={privacy === 'private'}
              onPress={() => setPrivacy('private')}
              icon={<Lock size={14} color={privacy === 'private' ? colors.bg : colors.textPrimary} />}
              label="Private"
              colors={colors}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity onPress={onSaveDraft} style={{ flex: 1, backgroundColor: colors.card, paddingVertical: 12, borderRadius: 999, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <Save size={18} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!canPost}
          onPress={() => onPost?.({ caption, tags, eventId: selectedEventId })}
          style={{ flex: 1, backgroundColor: canPost ? colors.tint : '#9CA3AF', paddingVertical: 12, borderRadius: 999, alignItems: 'center' }}
        >
          <Text style={{ color: colors.bg, fontWeight: '600' }}>Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const Segment = ({ active, onPress, icon, label, colors }: { active: boolean; onPress: () => void; icon: React.ReactNode; label: string; colors: any }) => (
  <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: active ? colors.textPrimary : colors.card }}>
    {icon}
    <Text style={{ color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: '600' }}>{label}</Text>
  </TouchableOpacity>
);

function renderAttachEvent(selectedEventId?: string, onSelect?: (id: string) => void, colors?: any) {
  if (!colors) return null;
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
      <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>Attach to Event</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, height: 42, backgroundColor: colors.surface }}>
        <Search size={16} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>Search events by name or location</Text>
      </View>

      <View style={{ marginTop: 10, gap: 10 }}>
        {recentExamples.slice(0, 3).map(ev => (
          <TouchableOpacity
            key={ev.id}
            onPress={() => onSelect?.(ev.id)}
            style={{ borderWidth: 1, borderColor: selectedEventId === ev.id ? colors.textPrimary : colors.border, backgroundColor: colors.surface, borderRadius: 10, padding: 12 }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{ev.title}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{ev.location}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
