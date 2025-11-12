import React, { useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, PanResponder } from 'react-native';
import SwipeToDismiss from '../../../shared/gestures/SwipeToDismiss';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import { X, Scissors, ArrowUp, ArrowDown, Trash2, Music, Volume2, Sparkles, SlidersHorizontal, Layers, Type as TypeIcon, Image as ImageIcon, Video as VideoIcon } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { getCaptureClips, addCaptureClip, clearCaptureClips, updateClip as updateSessionClip, removeClipById } from '../../../shared/storage/captureSession';
import { saveDraftClips, clearDraftClips } from '../../../shared/storage/drafts';
import type { CaptureClip } from '../../../shared/storage/captureSession';

type Props = {
  onClose: () => void;
  onSaved?: (outputPath?: string) => void;
};

type TimelineClip = CaptureClip & {
  trimStart: number;
  trimEnd: number;
  volume: number;
  transition?: TransitionType;
};

type TransitionType = 'none' | 'fade' | 'zoom' | 'slide' | 'glitch';

type Overlay = { id: string; type: 'text' | 'sticker' | 'image'; value: string };

type AudioLayer = { id: string; label: string; type: 'music' | 'voiceover' | 'sfx'; volume: number };

const DEFAULT_TRANSITIONS: TransitionType[] = ['none', 'fade', 'zoom', 'slide', 'glitch'];

export default function VideoEditorScreen({ onClose, onSaved }: Props) {
  const insets = useSafeAreaInsets();
  const [clips, setClips] = useState<TimelineClip[]>(() =>
    getCaptureClips().map(clip => ({
      ...clip,
      trimStart: 0,
      trimEnd: clip.duration,
      volume: 1,
      transition: 'none',
    })),
  );
  const [audioLayers, setAudioLayers] = useState<AudioLayer[]>([]);
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  const FILTERS: Array<'none' | 'warm' | 'cool' | 'vintage'> = ['none', 'warm', 'cool', 'vintage'];
  const [filterIndex, setFilterIndex] = useState(0);

  const totalDuration = useMemo(
    () => clips.reduce((sum, clip) => sum + Math.max(0, clip.trimEnd - clip.trimStart), 0),
    [clips],
  );

  const updateClip = (id: string, update: Partial<TimelineClip>) => {
    setClips(prev => prev.map(c => (c.id === id ? { ...c, ...update } : c)));
    updateSessionClip(id, update);
  };

  const moveClip = (index: number, direction: -1 | 1) => {
    setClips(prev => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const removeClip = (id: string) => {
    removeClipById(id);
    setClips(prev => prev.filter(c => c.id !== id));
  };

  const splitClip = (clip: TimelineClip) => {
    const midpoint = clip.trimStart + (clip.trimEnd - clip.trimStart) / 2;
    const first: TimelineClip = { ...clip, id: `${clip.id}-a`, trimEnd: midpoint };
    const second: TimelineClip = { ...clip, id: `${clip.id}-b`, trimStart: midpoint };
    removeClipById(clip.id);
    addCaptureClip(first);
    addCaptureClip(second);
    setClips(prev => prev.flatMap(c => (c.id === clip.id ? [first, second] : [c])));
  };

  const addClipFromLibrary = async () => {
    try {
      const res = await launchImageLibrary({ mediaType: 'video' });
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      const clip: TimelineClip = {
        id: `${Date.now()}`,
        path: asset.uri,
        duration: asset.duration ?? 5,
        speed: 1,
        type: 'video',
        trimStart: 0,
        trimEnd: asset.duration ?? 5,
        volume: 1,
        transition: 'none',
      };
      addCaptureClip(clip);
      setClips(prev => [...prev, clip]);
    } catch {}
  };

  const addOverlay = (type: Overlay['type']) => {
    const baseLabel = type === 'text' ? 'New text' : type === 'sticker' ? 'Sticker' : 'Image';
    setOverlays(prev => [...prev, { id: `${Date.now()}-${type}`, type, value: baseLabel }]);
  };

  const removeOverlay = (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id));
  };

  const addAudioLayer = (type: AudioLayer['type']) => {
    const label = type === 'music' ? 'Music track' : type === 'voiceover' ? 'Voiceover' : 'SFX';
    setAudioLayers(prev => [...prev, { id: `${Date.now()}-${type}`, label, type, volume: 1 }]);
  };

  const updateAudioVolume = (id: string, delta: number) => {
    setAudioLayers(prev =>
      prev.map(layer => (layer.id === id ? { ...layer, volume: Math.min(1, Math.max(0, Number((layer.volume + delta).toFixed(2)))) } : layer)),
    );
  };

  const handleSave = async () => {
    // Persist as a draft within the app
    try {
      await saveDraftClips(clips);
    } catch {}
    clearCaptureClips();
    onSaved?.();
    onClose();
  };

  const handleDiscard = async () => {
    try {
      await clearDraftClips();
    } catch {}
    clearCaptureClips();
    onClose();
  };

  // Swipe left/right to change filter like Instagram
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 12,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx <= -40) {
          // swipe left -> next filter
          setFilterIndex(prev => Math.min(FILTERS.length - 1, prev + 1));
        } else if (gestureState.dx >= 40) {
          // swipe right -> previous filter
          setFilterIndex(prev => Math.max(0, prev - 1));
        }
      },
    }),
  ).current;

  const activeFilter = FILTERS[filterIndex];
  const primaryPath = clips[0]?.path;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: insets.top, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, zIndex: 10 }}>
        <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
          <X color="#FFFFFF" size={22} />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Review</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={handleDiscard} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(239,68,68,0.9)', borderRadius: 999 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={{ paddingHorizontal: 14, paddingVertical: 6, backgroundColor: 'rgba(34,197,94,0.95)', borderRadius: 999 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SwipeToDismiss direction="left" edgeWidth={12} onDismiss={onClose} />
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }} {...panResponder.panHandlers}>
        {primaryPath ? (
          <Video
            source={{ uri: primaryPath }}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            resizeMode="cover"
            repeat
            muted={false}
            paused={false}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF' }}>No video to preview</Text>
          </View>
        )}

        {activeFilter !== 'none' ? (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: activeFilter === 'warm' ? 'rgba(255,160,64,0.28)' : activeFilter === 'cool' ? 'rgba(64,160,255,0.28)' : 'rgba(112,66,20,0.28)' }}
          />
        ) : null}

        {/* HUD */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 40, alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{activeFilter.toUpperCase()}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity onPress={() => setFilterIndex(i => Math.max(0, i - 1))} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999 }}>
              <Text style={{ color: '#FFFFFF' }}>Prev</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterIndex(i => Math.min(FILTERS.length - 1, i + 1))} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999 }}>
              <Text style={{ color: '#FFFFFF' }}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Old section components removed in favor of live preview UI
