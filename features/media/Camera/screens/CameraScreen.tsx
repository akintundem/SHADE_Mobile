import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Platform, Pressable } from 'react-native';
// Load vision-camera at runtime so app won't crash if native module is missing
let CameraModule: any = null as any;
import {
  X,
  Camera as CameraIcon,
  Video,
  RefreshCcw,
  Zap,
  Image as ImageIcon,
  Film,
  Music,
  Sparkles,
  Gauge,
  Wand2,
  Timer as TimerIcon,
  Layers,
  Trash2,
  ZoomIn,
  ZoomOut,
  Sun,
  SunDim,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import SwipeToDismiss from '../../../../shared/gestures/SwipeToDismiss';
import RoundIcon from '../components/RoundIcon';
import SideToolButton from '../components/SideToolButton';
import ClipProgressBar from '../components/ClipProgressBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addCaptureClip, clearCaptureClips, getCaptureClips, removeLastClip as sessionRemoveLastClip } from '../../../../shared/storage/captureSession';

type Props = {
  onClose: () => void;
  onCapture: (asset: { path: string; type: 'photo' | 'video' }) => void;
};

type Clip = {
  id: string;
  path: string;
  duration: number;
  speed: number;
  type: 'photo' | 'video';
};

export default function CameraScreen({ onClose, onCapture }: Props) {
  const insets = useSafeAreaInsets();
  const [hasPermission, setHasPermission] = useState(false);
  const [front, setFront] = useState(false);
  const [recording, setRecording] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [cameraLoaded, setCameraLoaded] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const cameraRef = useRef<any>(null);

  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0);
  const [timer, setTimer] = useState<0 | 3 | 10>(0);
  const [grid, setGrid] = useState(false);
  const [ratio, setRatio] = useState<'full' | '1:1' | '9:16' | '16:9'>('full');
  const [stabilize, setStabilize] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordMs, setRecordMs] = useState(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressActiveRef = useRef(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);

  const [filter, setFilter] = useState<'none' | 'warm' | 'cool' | 'vintage'>('none');
  const [filterStrength, setFilterStrength] = useState(0.35);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [beauty, setBeauty] = useState(0);
  const [greenScreen, setGreenScreen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSoundPanel, setShowSoundPanel] = useState(false);

  const [clips, setClips] = useState<Clip[]>(() => getCaptureClips());

  useEffect(() => {
    clearCaptureClips();
    setClips([]);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const mod = await import('react-native-vision-camera');
        CameraModule = mod;
        setCameraLoaded(true);
        const cam = await mod.Camera.requestCameraPermission();
        const mic = await mod.Camera.requestMicrophonePermission();
        const camOK = cam === 'granted';
        const micOK = mic === 'granted';
        setHasPermission(camOK && micOK);
      } catch (e) {
        setCameraLoaded(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!CameraModule || !hasPermission) return;
      try {
        const list = await CameraModule.Camera.getAvailableCameraDevices();
        const back = list?.find((d: any) => d.position === 'back') || list?.[0] || null;
        const frontD = list?.find((d: any) => d.position === 'front') || back;
        setDevice(front ? frontD : back);
        if (frontD && front) setDevice(frontD);
      } catch {}
    })();
  }, [cameraLoaded, hasPermission, front]);

  const totalDuration = useMemo(() => clips.reduce((sum, clip) => sum + clip.duration, 0), [clips]);

  const runCountdown = useCallback(
    (callback: () => void) => {
      if (timer === 0) {
        callback();
        return;
      }
      setCountdown(timer);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if ((prev || 0) <= 1) {
            clearInterval(interval);
            setCountdown(null);
            setTimeout(callback, 50);
            return null;
          }
          return (prev || 0) - 1;
        });
      }, 1000);
    },
    [timer],
  );

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    const capture = async () => {
      const photo = await cameraRef.current.takePhoto({ flash: flash === 'on' ? 'on' : 'off' });
      const clip: Clip = { id: `${Date.now()}`, path: photo.path, duration: 3, speed: 1, type: 'photo' };
      setClips(prev => [...prev, clip]);
      addCaptureClip(clip);
      // Do not auto-close camera on photo capture; keep user in camera
      onCapture({ path: photo.path, type: 'photo' });
    };
    runCountdown(capture);
  }, [flash, onCapture, runCountdown]);

  const pushClip = useCallback(
    (videoFile: { path: string; duration?: number }) => {
      const duration = videoFile.duration ?? recordMs / 1000;
      const clip: Clip = {
        id: `${Date.now()}`,
        path: videoFile.path,
        duration,
        speed,
        type: 'video',
      };
      setClips(prev => [...prev, clip]);
      addCaptureClip(clip);
      onCapture({ path: videoFile.path, type: 'video' });
    },
    [onCapture, recordMs, speed],
  );

  const stopTimers = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const startStopRecord = useCallback(async () => {
    if (!cameraRef.current) return;
    if (recording) {
      const file = await cameraRef.current.stopRecording();
      stopTimers();
      setRecording(false);
      pushClip(file);
    } else {
      const start = () => {
        setRecordMs(0);
        setRecording(true);
        stopTimers();
        recordTimerRef.current = setInterval(() => setRecordMs(ms => ms + 100), 100);
        cameraRef.current.startRecording({
          flash: flash === 'on' ? 'on' : 'off',
          onRecordingFinished: (video: any) => {
            stopTimers();
            setRecording(false);
            pushClip(video);
          },
          onRecordingError: () => {
            stopTimers();
            setRecording(false);
          },
        });
      };
      runCountdown(start);
    }
  }, [flash, pushClip, recording, runCountdown]);

  // Explicit handlers for shutter behaviors
  const handleShutterPress = useCallback(() => {
    // If a long press was recognized, ignore the tap-up press
    if (longPressActiveRef.current) {
      longPressActiveRef.current = false;
      return;
    }
    // Tap to take photo
    takePhoto();
  }, [takePhoto]);

  const handleShutterLongPress = useCallback(() => {
    longPressActiveRef.current = true;
    // Start recording on long press
    if (!recording) {
      startStopRecord();
    }
  }, [recording, startStopRecord]);

  const handleShutterRelease = useCallback(() => {
    // Stop recording when user releases long press
    if (recording) {
      startStopRecord();
    }
  }, [recording, startStopRecord]);

  const deleteLastClip = useCallback(() => {
    setClips(prev => prev.slice(0, -1));
    sessionRemoveLastClip();
  }, []);

  const onTapToFocus = useCallback(
    async (evt: any) => {
      try {
        if (!cameraRef.current || !CameraModule?.Camera?.focus || !device?.supportsFocus) return;
        const { locationX, locationY } = evt.nativeEvent || {};
        setFocusPoint({ x: locationX, y: locationY });
        await cameraRef.current.focus({ x: locationX, y: locationY });
        setTimeout(() => setFocusPoint(null), 1200);
      } catch {}
    },
    [device],
  );

  const openLibrary = useCallback(async () => {
    try {
      const res = await launchImageLibrary({ mediaType: 'mixed' });
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      const type = (asset.type || '').startsWith('video') ? 'video' : 'photo';
      const duration = type === 'video' ? asset.duration ?? 5 : 3;
      const clip: Clip = { id: `${Date.now()}`, path: asset.uri, duration, speed: 1, type };
      addCaptureClip(clip);
      setClips(prev => [...prev, clip]);
      onCapture({ path: asset.uri, type });
    } catch {}
  }, [onCapture]);

  const adjustZoom = useCallback(
    (delta: number) => {
      const min = device?.minZoom || 1;
      const max = device?.maxZoom || 5;
      setZoom(prev => {
        const next = Number((prev + delta).toFixed(2));
        return Math.min(max, Math.max(min, next));
      });
    },
    [device],
  );

  const adjustExposure = useCallback(
    (delta: number) => {
      const min = device?.minExposure ?? -2;
      const max = device?.maxExposure ?? 2;
      setExposure(prev => {
        const next = Number((prev + delta).toFixed(2));
        return Math.min(max, Math.max(min, next));
      });
    },
    [device],
  );

  if (Platform.OS === 'ios' && !device) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ color: '#fff' }}>Simulator: no camera device</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={async () => {
              const res = await launchImageLibrary({ mediaType: 'photo' });
              const uri = res.assets?.[0]?.uri;
              if (uri) onCapture({ path: uri, type: 'photo' });
            }}
            style={{ backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <ImageIcon color="#111" size={16} />
            <Text>Pick Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const res = await launchImageLibrary({ mediaType: 'video' });
              const uri = res.assets?.[0]?.uri;
              if (uri) onCapture({ path: uri, type: 'video' });
            }}
            style={{ backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Film color="#111" size={16} />
            <Text>Pick Video</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 16, left: 16 }}>
          <X color="#fff" size={22} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!CameraModule || !device || !hasPermission) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff' }}>Preparing camera… (rebuild may be required)</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <SwipeToDismiss direction="left" edgeWidth={12} onDismiss={onClose} />
      <Pressable onPress={onTapToFocus} style={{ flex: 1 }}>
        <CameraModule.Camera
          ref={cameraRef}
          style={{ flex: 1 }}
          device={device}
          isActive
          photo
          video
          audio
          torch={flash === 'on' ? 'on' : 'off'}
          zoom={zoom}
          exposure={exposure}
          enableZoomGesture
          videoStabilizationMode={stabilize ? 'cinematic-extended' : 'off'}
        />

        {filter !== 'none' ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor:
                filter === 'warm'
                  ? `rgba(255,160,64,${filterStrength})`
                  : filter === 'cool'
                  ? `rgba(64,160,255,${filterStrength})`
                  : `rgba(112,66,20,${filterStrength})`,
            }}
          />
        ) : null}
        {beauty > 0 ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: `rgba(255,255,255,${Math.min(0.18, beauty * 0.12)})` }} />
        ) : null}
        {greenScreen ? <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,128,0,0.08)' }} /> : null}

        {grid ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
            <View style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <View style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <View style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />
            <View style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />
          </View>
        ) : null}

        {focusPoint ? (
          <View style={{ position: 'absolute', left: focusPoint.x - 30, top: focusPoint.y - 30, width: 60, height: 60, borderRadius: 6, borderWidth: 2, borderColor: '#fff' }} />
        ) : null}

        {countdown != null ? (
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 64, fontWeight: '800' }}>{countdown}</Text>
          </View>
        ) : null}
      </Pressable>

      {/* Top Bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: insets.top + 8,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <RoundIcon onPress={onClose}>
          <X color="#fff" size={18} />
        </RoundIcon>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <RoundIcon onPress={() => setFlash(prev => (prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off'))}>
            <View style={{ alignItems: 'center' }}>
              <Zap size={18} color={flash === 'on' ? '#FFD54A' : '#fff'} />
              {flash === 'auto' ? <Text style={{ color: '#fff', fontSize: 9, marginTop: -2 }}>A</Text> : null}
            </View>
          </RoundIcon>
          <RoundIcon onPress={() => setTimer(t => (t === 0 ? 3 : t === 3 ? 10 : 0))}>
            <Text style={{ color: '#fff', fontSize: 11 }}>{timer || 0}s</Text>
          </RoundIcon>
          <RoundIcon onPress={() => setShowFilterPanel(p => !p)}>
            <Sparkles size={18} color={showFilterPanel ? '#FACC15' : '#fff'} />
          </RoundIcon>
          <RoundIcon onPress={() => setFront(f => !f)}>
            <RefreshCcw size={18} color="#fff" />
          </RoundIcon>
        </View>
      </View>

      {/* Left rail - nudge higher for easier thumb reach */}
      <View style={{ position: 'absolute', left: 12, top: insets.top + 96, gap: 16 }}>
        <SideToolButton label={`Speed ${speed}x`} active={speed !== 1} onPress={() => setSpeed(prev => (prev === 0.5 ? 1 : prev === 1 ? 2 : 0.5))} icon={<Gauge size={16} color="#fff" />} />
        <SideToolButton label={`Beauty ${Math.round(beauty * 100)}%`} active={beauty > 0} onPress={() => setBeauty(prev => (prev <= 0 ? 0.5 : prev < 1 ? 1 : 0))} icon={<Wand2 size={16} color="#fff" />} />
        <SideToolButton label="Filters" active={showFilterPanel} onPress={() => setShowFilterPanel(p => !p)} icon={<Sparkles size={16} color="#fff" />} />
        <SideToolButton label={`Timer ${timer || 0}s`} active={timer !== 0} onPress={() => setTimer(t => (t === 0 ? 3 : t === 3 ? 10 : 0))} icon={<TimerIcon size={16} color="#fff" />} />
        <SideToolButton label={`Grid ${grid ? 'On' : 'Off'}`} active={grid} onPress={() => setGrid(g => !g)} icon={<Layers size={16} color="#fff" />} />
        <SideToolButton label={`Ratio ${ratio}`} onPress={() => setRatio(r => (r === 'full' ? '1:1' : r === '1:1' ? '9:16' : r === '9:16' ? '16:9' : 'full'))} icon={<Video size={16} color="#fff" />} />
        <SideToolButton label={`Green ${greenScreen ? 'On' : 'Off'}`} active={greenScreen} onPress={() => setGreenScreen(s => !s)} icon={<ImageIcon size={16} color="#fff" />} />
      </View>

      {/* Right rail controls - align with left rail */}
      <View style={{ position: 'absolute', right: 16, top: insets.top + 96, alignItems: 'center', gap: 12 }}>
        <RoundIcon onPress={() => adjustZoom(0.25)}>
          <ZoomIn size={18} color="#fff" />
        </RoundIcon>
        <RoundIcon onPress={() => adjustZoom(-0.25)}>
          <ZoomOut size={18} color="#fff" />
        </RoundIcon>
        <RoundIcon onPress={() => adjustExposure(0.2)}>
          <Sun size={18} color="#fff" />
        </RoundIcon>
        <RoundIcon onPress={() => adjustExposure(-0.2)}>
          <SunDim size={18} color="#fff" />
        </RoundIcon>
      </View>

      {/* Recording side tools - lift above bottom controls but keep out of center */}
      <View style={{ position: 'absolute', right: 16, bottom: insets.bottom + 200, alignItems: 'center', gap: 12 }}>
        <RoundIcon onPress={() => setShowSoundPanel(true)}>
          <Music size={18} color="#fff" />
        </RoundIcon>
        <RoundIcon onPress={() => setShowFilterPanel(true)}>
          <Sparkles size={18} color="#fff" />
        </RoundIcon>
      </View>

      {/* Clip progress at top under status bar, like TikTok/IG */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: insets.top + 52, alignItems: 'center' }}>
        <ClipProgressBar clips={clips} totalDuration={totalDuration} />
        {clips.length > 0 ? (
          <TouchableOpacity onPress={deleteLastClip} style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Trash2 color="#fff" size={16} />
            <Text style={{ color: '#fff', fontSize: 12 }}>Delete last clip</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Bottom controls anchored, wider spacing, not centered on screen */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 18, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '86%' }}>
          <TouchableOpacity
            onPress={openLibrary}
            style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }}
          >
            <ImageIcon color="#fff" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShutterPress}
            onLongPress={handleShutterLongPress}
            onPressOut={handleShutterRelease}
            delayLongPress={180}
            style={{ height: 82, width: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: recording ? '#EF4444' : '#fff', backgroundColor: 'rgba(0,0,0,0.12)' }}
          >
            {recording ? <Text style={{ color: '#fff', fontWeight: '700' }}>{Math.floor(recordMs / 1000)}s</Text> : <View style={{ height: 64, width: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><CameraIcon color="#111" /></View>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowFilterPanel(true)} style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }}>
            <Sparkles color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter palette */}
      {showFilterPanel ? (
        <View style={{ position: 'absolute', left: 16, bottom: 120, backgroundColor: 'rgba(0,0,0,0.45)', padding: 12, borderRadius: 16, gap: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '600', marginBottom: 4 }}>Filters</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <FilterDot label="Off" color="transparent" active={filter === 'none'} onPress={() => setFilter('none')} />
            <FilterDot label="Warm" color={`rgba(255,160,64,${filterStrength})`} active={filter === 'warm'} onPress={() => setFilter('warm')} />
            <FilterDot label="Cool" color={`rgba(64,160,255,${filterStrength})`} active={filter === 'cool'} onPress={() => setFilter('cool')} />
            <FilterDot label="Vint" color={`rgba(112,66,20,${filterStrength})`} active={filter === 'vintage'} onPress={() => setFilter('vintage')} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>Intensity</Text>
            <TouchableOpacity onPress={() => setFilterStrength(s => Math.max(0.15, Number((s - 0.1).toFixed(2))))} style={{ padding: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>-</Text>
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 12 }}>{Math.round(filterStrength * 100)}%</Text>
            <TouchableOpacity onPress={() => setFilterStrength(s => Math.min(0.6, Number((s + 0.1).toFixed(2))))} style={{ padding: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {showSoundPanel ? (
        <View style={{ position: 'absolute', right: 16, bottom: 120, backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Sound library</Text>
          <Text style={{ color: '#fff', marginTop: 6, fontSize: 12 }}>Coming soon — add tracks and voiceovers.</Text>
          <TouchableOpacity onPress={() => setShowSoundPanel(false)} style={{ marginTop: 10 }}>
            <Text style={{ color: '#FACC15', fontSize: 12 }}>Close</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function FilterDot({ label, color, active, onPress }: { label: string; color: string; active: boolean; onPress: () => void }) {
  const background = color === 'transparent' ? 'rgba(255,255,255,0.08)' : color;
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ height: 26, width: 26, borderRadius: 13, backgroundColor: background, borderWidth: active ? 2 : 1, borderColor: active ? '#fff' : 'rgba(255,255,255,0.4)' }} />
      <Text style={{ color: '#fff', fontSize: 10 }}>{label}</Text>
    </TouchableOpacity>
  );
}
