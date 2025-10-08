import React, { useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, PanResponder, NativeModules } from 'react-native';
import Video from 'react-native-video';
import { X, Scissors, Volume2, VolumeX } from 'lucide-react-native';

type Props = { path: string; onClose: () => void; onSaved?: (outPath: string) => void };

export default function VideoEditorScreen({ path, onClose, onSaved }: Props) {
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const progressBarRef = useRef<View>(null);

  const handleLoad = (meta: any) => {
    setDuration(meta.duration);
    setEnd(meta.duration);
  };

  // Native trimming via platform bridges (VideoEditor)

  const trim = async () => {
    try {
      const out: string = await NativeModules.VideoEditor.trim({
        path,
        start: start,
        end: end,
        muted,
      });
      onSaved?.(out || path);
    } catch (e) {
      // fallback to original
      onSaved?.(path);
    }
  };

  const panStart = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const w = barWidth();
        const nx = Math.max(0, Math.min(w, g.dx + posFromTime(start)));
        const t = (nx / w) * duration;
        setStart(Math.min(t, end - 0.1));
      },
    }),
  ).current;

  const panEnd = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const w = barWidth();
        const nx = Math.max(0, Math.min(w, g.dx + posFromTime(end)));
        const t = (nx / w) * duration;
        setEnd(Math.max(t, start + 0.1));
      },
    }),
  ).current;

  const barWidth = () => 260; // static width for simple math
  const posFromTime = (t: number) => (t / Math.max(duration, 0.1)) * barWidth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
        <TouchableOpacity onPress={onClose}>
          <X color="#fff" size={22} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMuted(m => !m)}>
          {muted ? <VolumeX color="#fff" /> : <Volume2 color="#fff" />}
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <Video source={{ uri: path }} style={{ flex: 1 }} resizeMode="contain" onLoad={handleLoad} paused={false} repeat muted={muted} />
      </View>

      {/* Trim Bar */}
      <View style={{ alignItems: 'center', paddingVertical: 12 }}>
        <Text style={{ color: '#fff', marginBottom: 6 }}>Trim</Text>
        <View ref={progressBarRef} style={{ width: barWidth(), height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <View style={{ position: 'absolute', left: posFromTime(start), right: barWidth() - posFromTime(end), top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 12 }} />
          {/* Start handle */}
          <View {...panStart.panHandlers} style={{ position: 'absolute', left: posFromTime(start) - 10, top: -6, width: 20, height: 36, borderRadius: 10, backgroundColor: '#fff' }} />
          {/* End handle */}
          <View {...panEnd.panHandlers} style={{ position: 'absolute', left: posFromTime(end) - 10, top: -6, width: 20, height: 36, borderRadius: 10, backgroundColor: '#fff' }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: barWidth(), marginTop: 6 }}>
          <Text style={{ color: '#9CA3AF' }}>{start.toFixed(1)}s</Text>
          <Text style={{ color: '#9CA3AF' }}>{end.toFixed(1)}s</Text>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <TouchableOpacity onPress={trim} style={{ height: 48, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
          <Scissors color="#111" />
          <Text style={{ color: '#111827', fontWeight: '700' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
