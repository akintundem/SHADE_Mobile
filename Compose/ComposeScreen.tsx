import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { X, Camera, ImagePlus, Search, Hash, Users, Globe, Lock } from 'lucide-react-native';
import { recentExamples } from '../Discover/examples';

type Props = {
  onClose: () => void;
  onPost?: (payload: { caption: string; tags: string[]; eventId?: string }) => void;
};

export default function ComposeScreen({ onClose, onPost }: Props) {
  const [mode, setMode] = useState<'moment' | 'thought'>('moment');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();

  const canPost = useMemo(() => (mode === 'thought' ? caption.trim().length > 0 : true), [mode, caption]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#E5E7EB' }}>
        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
          <X size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={{ color: '#111827', fontWeight: '700' }}>Create</Text>
        <TouchableOpacity
          disabled={!canPost}
          onPress={() => onPost?.({ caption, tags, eventId: selectedEventId })}
          style={{ backgroundColor: canPost ? '#111827' : '#9CA3AF', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Post</Text>
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
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: mode === t.key ? '#111827' : '#F3F4F6' }}
          >
            <Text style={{ color: mode === t.key ? '#FFFFFF' : '#111827', fontWeight: '600' }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {mode === 'moment' ? (
          <>
            {/* Caption first */}
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 8 }}>Caption</Text>
              <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF' }}>
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Say something about this moment..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  style={{ minHeight: 80, color: '#111827' }}
                />
              </View>
            </View>

            {/* Media second */}
            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 8 }}>Media</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <QuickAction icon={<Camera size={16} color="#111827" />} label="Open Camera" />
                <QuickAction icon={<ImagePlus size={16} color="#111827" />} label="Add from Library" />
              </View>

              <View style={{ height: 140, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, marginTop: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
                <ImagePlus size={22} color="#6B7280" />
                <Text style={{ color: '#6B7280', marginTop: 6 }}>Upload photos or videos</Text>
                <Text style={{ color: '#9CA3AF', marginTop: 2, fontSize: 12 }}>Tap to select multiple</Text>
              </View>
            </View>

            {/* Events last */}
            {renderAttachEvent(selectedEventId, setSelectedEventId)}
          </>
        ) : (
          <>
            {/* Thought first */}
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 8 }}>Write a thought</Text>
              <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF' }}>
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Share a thought..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  style={{ minHeight: 100, color: '#111827' }}
                />
              </View>
            </View>

            {/* Events next */}
            {renderAttachEvent(selectedEventId, setSelectedEventId)}
          </>
        )}

        {/* Tags */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 8 }}>Tags</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 999, paddingHorizontal: 12, height: 40, backgroundColor: '#FFFFFF' }}>
            <Hash size={16} color="#6B7280" />
            <TextInput
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag"
              placeholderTextColor="#9CA3AF"
              style={{ marginLeft: 8, flex: 1, color: '#111827' }}
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
              style={{ backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>
          </View>

          {tags.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {tags.map(t => (
                <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: '#111827' }}>#{t}</Text>
                  <TouchableOpacity onPress={() => setTags(tags.filter(x => x !== t))}>
                    <X size={14} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Privacy */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 8 }}>Visibility</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Segment
              active={privacy === 'public'}
              onPress={() => setPrivacy('public')}
              icon={<Globe size={14} color={privacy === 'public' ? '#FFFFFF' : '#111827'} />}
              label="Public"
            />
            <Segment
              active={privacy === 'followers'}
              onPress={() => setPrivacy('followers')}
              icon={<Users size={14} color={privacy === 'followers' ? '#FFFFFF' : '#111827'} />}
              label="Followers"
            />
            <Segment
              active={privacy === 'private'}
              onPress={() => setPrivacy('private')}
              icon={<Lock size={14} color={privacy === 'private' ? '#FFFFFF' : '#111827'} />}
              label="Private"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const QuickAction = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
    {icon}
    <Text style={{ color: '#111827', fontWeight: '600' }}>{label}</Text>
  </View>
);

const Segment = ({ active, onPress, icon, label }: { active: boolean; onPress: () => void; icon: React.ReactNode; label: string }) => (
  <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: active ? '#111827' : '#F3F4F6' }}>
    {icon}
    <Text style={{ color: active ? '#FFFFFF' : '#111827', fontWeight: '600' }}>{label}</Text>
  </TouchableOpacity>
);

function renderAttachEvent(selectedEventId?: string, onSelect?: (id: string) => void) {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
      <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 8 }}>Attach to Event</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 42, backgroundColor: '#FFFFFF' }}>
        <Search size={16} color="#6B7280" />
        <Text style={{ color: '#9CA3AF', marginLeft: 8 }}>Search events by name or location</Text>
      </View>

      <View style={{ marginTop: 10, gap: 10 }}>
        {recentExamples.slice(0, 3).map(ev => (
          <TouchableOpacity
            key={ev.id}
            onPress={() => onSelect?.(ev.id)}
            style={{ borderWidth: 1, borderColor: selectedEventId === ev.id ? '#111827' : '#E5E7EB', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12 }}
          >
            <Text style={{ color: '#111827', fontWeight: '600' }}>{ev.title}</Text>
            <Text style={{ color: '#6B7280', marginTop: 2 }}>{ev.location}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

