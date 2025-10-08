import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
// Load vision-camera at runtime so app won't crash if native module is missing
let CameraModule: any = null as any;
import { X, Camera as CameraIcon, Video, RefreshCcw, Zap, Image as ImageIcon, Film } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';

type Props = {
  onClose: () => void;
  onCapture: (asset: { path: string; type: 'photo' | 'video' }) => void;
};

export default function CameraScreen({ onClose, onCapture }: Props) {
  const [hasPermission, setHasPermission] = useState(false);
  const [front, setFront] = useState(false);
  const [recording, setRecording] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [cameraLoaded, setCameraLoaded] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const mod = await import('react-native-vision-camera');
        CameraModule = mod;
        setCameraLoaded(true);
        const cam = await mod.Camera.requestCameraPermission();
        const mic = await mod.Camera.requestMicrophonePermission();
        const camOK = cam === 'granted' || cam === 'authorized';
        const micOK = mic === 'granted' || mic === 'authorized';
        setHasPermission(camOK && micOK);
      } catch (e) {
        setCameraLoaded(false);
      }
    })();
  }, []);

  // fetch available devices once module + permissions are ready
  useEffect(() => {
    (async () => {
      if (!CameraModule || !hasPermission) return;
      try {
        const list = await CameraModule.Camera.getAvailableCameraDevices();
        const back = list?.find((d: any) => d.position === 'back') || list?.[0] || null;
        const frontD = list?.find((d: any) => d.position === 'front') || back;
        setDevice(front ? frontD : back);
      } catch {}
    })();
  }, [cameraLoaded, hasPermission, front]);

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePhoto({ flash });
    onCapture({ path: photo.path, type: 'photo' });
  }, [flash, onCapture]);

  const startStopRecord = useCallback(async () => {
    if (!cameraRef.current) return;
    if (recording) {
      const file = await cameraRef.current.stopRecording();
      setRecording(false);
      // event handler will fire onRecordingFinished
    } else {
      setRecording(true);
      cameraRef.current.startRecording({
        flash,
        onRecordingFinished: v => {
          setRecording(false);
          onCapture({ path: v.path, type: 'video' });
        },
        onRecordingError: e => {
          setRecording(false);
        },
      });
    }
  }, [flash, recording, onCapture]);

  // Simulator/devices without camera: offer a library picker fallback
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
      <CameraModule.Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive
        photo
        video
        audio
        torch={flash === 'on' ? 'on' : 'off'}
      />

      {/* Controls */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
        <TouchableOpacity onPress={onClose}>
          <X color="#fff" size={22} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}>
          <Zap color={flash === 'on' ? '#FFD54A' : '#fff'} size={22} />
        </TouchableOpacity>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 36, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '80%' }}>
          <TouchableOpacity onPress={() => setFront(f => !f)}>
            <RefreshCcw color="#fff" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={startStopRecord}
            onLongPress={startStopRecord}
            delayLongPress={100}
            style={{ height: 72, width: 72, borderRadius: 36, backgroundColor: recording ? '#f00' : '#fff', alignItems: 'center', justifyContent: 'center' }}
          >
            {recording ? <Video color="#fff" /> : <CameraIcon color="#111" />}
          </TouchableOpacity>

          <TouchableOpacity onPress={takePhoto}>
            <CameraIcon color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
