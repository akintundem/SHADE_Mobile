import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { User } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { authService } from '../services/authService';
import HomeScreen from '../Home/HomeScreen';
import DiscoverScreen from '../Discover/DiscoverScreen';
// Lazy-load MapScreen to avoid initializing native map module until needed
// This also sidesteps import-time errors if native module isn't linked yet
const LazyMapScreen = React.lazy(() => import('../Map/MapScreen'));
const ProfileScreen = React.lazy(() => import('../Profile/ProfileScreen'));
const ComposeScreen = React.lazy(() => import('../Compose/ComposeScreen'));
const CameraScreen = React.lazy(() => import('../Camera/CameraScreen'));
const VideoEditorScreen = React.lazy(() => import('../Editor/VideoEditorScreen'));
const CreateEventScreen = React.lazy(() => import('../Create/CreateEventScreen'));
const CreateCollectionScreen = React.lazy(() => import('../Create/CreateCollectionScreen'));
const SettingsScreen = React.lazy(() => import('../Settings/SettingsScreen'));

type Props = {
  user: User;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
};

export default function SocialApp({ user, onLogout }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'home' | 'discover' | 'map' | 'profile'>('home');
  const [isComposeOpen, setComposeOpen] = useState(false);
  const [isCreateEventOpen, setCreateEventOpen] = useState(false);
  const [isCreateCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [captured, setCaptured] = useState<{ path: string; type: 'photo' | 'video' } | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { loadDraftClips } = await import('../storage/drafts');
      const clips = await loadDraftClips();
      if (mounted) setHasDraft(!!clips && clips.length > 0);
    })();
    return () => {
      mounted = false;
    };
  }, [isComposeOpen]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {tab === 'home' ? (
        <HomeScreen user={user} onTabChange={setTab} onCreatePost={() => setComposeOpen(true)} />
      ) : tab === 'discover' ? (
        <DiscoverScreen
          user={user}
          onTabChange={setTab}
          onPlus={() => setComposeOpen(true)}
          onCreateEvent={() => setCreateEventOpen(true)}
          onCreateCollection={() => setCreateCollectionOpen(true)}
        />
      ) : tab === 'map' ? (
        <React.Suspense fallback={null}>
          <LazyMapScreen user={user} onTabChange={setTab} />
        </React.Suspense>
      ) : (
        <React.Suspense fallback={null}>
          <ProfileScreen user={user} onTabChange={setTab} onOpenCompose={() => setComposeOpen(true)} onLogout={async () => {
            if (loading) return;
            setLoading(true);
            await authService.logout();
            setLoading(false);
            onLogout();
          }} />
        </React.Suspense>
      )}

      {isComposeOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.surface, zIndex: 100 }}>
          <React.Suspense fallback={null}>
            <ComposeScreen
              onClose={() => setComposeOpen(false)}
              onOpenCamera={() => setCameraOpen(true)}
              hasDraft={hasDraft}
              onContinueDraft={async () => {
                const [{ loadDraftClips, clearDraftClips }, { setCaptureClips }] = await Promise.all([
                  import('../storage/drafts'),
                  import('../storage/captureSession'),
                ]);
                const clips = (await loadDraftClips()) || [];
                setCaptureClips(clips as any);
                setComposeOpen(false);
                setEditorOpen(true);
              }}
              onClearDraft={async () => {
                const { clearDraftClips } = await import('../storage/drafts');
                await clearDraftClips();
                setHasDraft(false);
              }}
              onSaveDraft={async () => {
                const { saveDraftClips } = await import('../storage/drafts');
                const { getCaptureClips } = await import('../storage/captureSession');
                await saveDraftClips(getCaptureClips() as any);
                setHasDraft(true);
                setComposeOpen(false);
              }}
            />
          </React.Suspense>
        </View>
      ) : null}

      {isCreateEventOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.bg, zIndex: 100 }}>
          <React.Suspense fallback={null}>
            <CreateEventScreen onClose={() => setCreateEventOpen(false)} />
          </React.Suspense>
        </View>
      ) : null}

      {isCreateCollectionOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.bg, zIndex: 100 }}>
          <React.Suspense fallback={null}>
            <CreateCollectionScreen onClose={() => setCreateCollectionOpen(false)} />
          </React.Suspense>
        </View>
      ) : null}

      {isCameraOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.bg, zIndex: 110 }}>
          <React.Suspense fallback={null}>
            <CameraScreen
              onClose={() => setCameraOpen(false)}
              onCapture={asset => {
                setCaptured(asset);
                // Only open editor for video; keep camera open for photos
                const isFile = asset.path?.startsWith('file:') || asset.path?.startsWith('/') || asset.path?.startsWith('content:');
                if (asset.type === 'video' && isFile) {
                  setCameraOpen(false);
                  setEditorOpen(true);
                }
                // For photos, keep camera open (don't call setCameraOpen(false))
              }}
            />
          </React.Suspense>
        </View>
      ) : null}

      {isEditorOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.bg, zIndex: 120 }}>
          <React.Suspense fallback={null}>
            <VideoEditorScreen
              onClose={() => {
                setEditorOpen(false);
                setCaptured(null);
              }}
              onSaved={() => {
                setEditorOpen(false);
                setCaptured(null);
              }}
            />
          </React.Suspense>
        </View>
      ) : null}

      {isSettingsOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.scrim, zIndex: 130 }}>
          <React.Suspense fallback={null}>
            <SettingsScreen onClose={() => setSettingsOpen(false)} />
          </React.Suspense>
        </View>
      ) : null}
    </View>
  );
}
