import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { User } from '../../../shared/types';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { authService } from '../../../shared/services/authService';
import HomeScreen from '../../events/Home/HomeScreen';
import DiscoverScreen from '../../events/Discover/DiscoverScreen';
const ProfileScreen = React.lazy(() => import('../../profile/Profile/ProfileScreen'));
const ComposeScreen = React.lazy(() => import('../../media/Compose/ComposeScreen'));
const CameraScreen = React.lazy(() => import('../../media/Camera/CameraScreen'));
const VideoEditorScreen = React.lazy(() => import('../../media/Editor/VideoEditorScreen'));
const CreateEventScreen = React.lazy(() => import('../../events/Create/CreateEventScreen'));
const SettingsScreen = React.lazy(() => import('../../profile/Settings/SettingsScreen'));
const ChatScreen = React.lazy(() => import('../../chat/Chat/ChatScreen'));
import { EventThreadScreen } from '../../events/Home/components/EventThreadScreen';
import type { ThreadPost } from '../../events/Home/components/EventThreadModal';

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
  const [isChatOpen, setChatOpen] = useState(false);
  
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [captured, setCaptured] = useState<{ path: string; type: 'photo' | 'video' } | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const [threadOpen, setThreadOpen] = useState<null | { title: string; posts: ThreadPost[] }>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { loadDraftClips } = await import('../../../shared/storage/drafts');
      const clips = await loadDraftClips();
      if (mounted) setHasDraft(!!clips && clips.length > 0);
    })();
    return () => {
      mounted = false;
    };
  }, [isComposeOpen]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {tab === 'home' ? (
        <HomeScreen
          user={user}
          onTabChange={setTab}
          onCreateEvent={() => setComposeOpen(true)}
          onOpenChat={() => setChatOpen(true)}
        />
      ) : tab === 'discover' ? (
        <DiscoverScreen
          user={user}
          onTabChange={setTab}
          onCreateEvent={() => setCreateEventOpen(true)}
        />
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
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.background, zIndex: 100 }}>
          <React.Suspense fallback={null}>
            <ComposeScreen
              onClose={() => setComposeOpen(false)}
              onOpenCamera={() => setCameraOpen(true)}
              hasDraft={hasDraft}
              onContinueDraft={async () => {
                const [{ loadDraftClips, clearDraftClips }, { setCaptureClips }] = await Promise.all([
                  import('../../../shared/storage/drafts'),
                  import('../../../shared/storage/captureSession'),
                ]);
                const clips = (await loadDraftClips()) || [];
                setCaptureClips(clips as any);
                setComposeOpen(false);
                setEditorOpen(true);
              }}
              onClearDraft={async () => {
                const { clearDraftClips } = await import('../../../shared/storage/drafts');
                await clearDraftClips();
                setHasDraft(false);
              }}
              onSaveDraft={async () => {
                const { saveDraftClips } = await import('../../../shared/storage/drafts');
                const { getCaptureClips } = await import('../../../shared/storage/captureSession');
                await saveDraftClips(getCaptureClips() as any);
                setHasDraft(true);
                setComposeOpen(false);
              }}
            />
          </React.Suspense>
        </View>
      ) : null}

      {isCreateEventOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.background, zIndex: 100 }}>
          <React.Suspense fallback={null}>
            <CreateEventScreen onClose={() => setCreateEventOpen(false)} />
          </React.Suspense>
        </View>
      ) : null}

      

      {isCameraOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.background, zIndex: 110 }}>
          <React.Suspense fallback={null}>
            <CameraScreen
              onClose={() => setCameraOpen(false)}
              onCapture={asset => {
                setCaptured(asset);
                const isFile = asset.path?.startsWith('file:') || asset.path?.startsWith('/') || asset.path?.startsWith('content:');
                if (asset.type === 'video' && isFile) {
                  setCameraOpen(false);
                  setEditorOpen(true);
                }
              }}
            />
          </React.Suspense>
        </View>
      ) : null}

      {isEditorOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.background, zIndex: 120 }}>
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
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.overlay, zIndex: 130 }}>
          <React.Suspense fallback={null}>
            <SettingsScreen 
              onClose={() => setSettingsOpen(false)} 
              onLogout={async () => {
                if (loading) return;
                try {
                  setLoading(true);
                  // Close settings modal first
                  setSettingsOpen(false);
                  // Perform logout - this clears tokens
                  await authService.logout();
                  // Navigate to login screen by calling parent onLogout
                  // This sets user to null in App.tsx, which triggers Auth screen
                  onLogout();
                } catch (err) {
                  console.error('Logout error:', err);
                  // Even if logout fails, navigate to login
                  onLogout();
                } finally {
                  setLoading(false);
                }
              }}
            />
          </React.Suspense>
        </View>
      ) : null}

      {isChatOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.background, zIndex: 140 }}>
          <React.Suspense fallback={null}>
            <ChatScreen onClose={() => setChatOpen(false)} />
          </React.Suspense>
        </View>
      ) : null}

      {threadOpen ? (
        <EventThreadScreen visible={true} onClose={() => setThreadOpen(null)} title={threadOpen.title} posts={threadOpen.posts} />
      ) : null}
    </View>
  );
}
