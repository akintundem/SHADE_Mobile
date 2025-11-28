import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { User } from '../../../shared/types';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { authService } from '../../../shared/services/authService';
import HomeScreen from '../../events/home/screens/HomeScreen';
import DiscoverScreen from '../../events/discover/screens/DiscoverScreen';
const ProfileScreen = React.lazy(() => import('../../profile/screens/ProfileScreen'));
const CameraScreen = React.lazy(() => import('../../media/camera/screens/CameraScreen'));
const VideoEditorScreen = React.lazy(() => import('../../media/editor/screens/VideoEditorScreen'));
const CreateEventScreen = React.lazy(() => import('../../events/Create/screens/CreateEventScreen'));
const SettingsScreen = React.lazy(() => import('../../settings/screens/SettingsScreen'));
const ChatScreen = React.lazy(() => import('../../chat/screens/ChatScreen'));
const CapturedPhotosScreen = React.lazy(() => import('../../media/camera/screens/CapturedPhotosScreen'));
import { EventThreadScreen } from '../../events/home/components/EventThreadScreen';
import type { ThreadPost } from '../../events/home/components/EventThreadModal';

type Props = {
  user: User;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
};

export default function SocialApp({ user, onLogout }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'home' | 'discover' | 'map' | 'profile'>('home');
  const [isCreateEventOpen, setCreateEventOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);

  const [isCameraOpen, setCameraOpen] = useState(false);
  const [captured, setCaptured] = useState<{ path: string; type: 'photo' | 'video' } | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<Array<{ path: string; type: 'photo' | 'video'; timestamp: number }>>([]);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isGalleryOpen, setGalleryOpen] = useState(false);

  const [threadOpen, setThreadOpen] = useState<null | { title: string; posts: ThreadPost[] }>(null);



  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {tab === 'home' ? (
        <HomeScreen
          user={user}
          onTabChange={setTab}
          onCreateEvent={() => setCreateEventOpen(true)}
          onOpenCamera={() => setCameraOpen(true)}
          onOpenGallery={() => setGalleryOpen(true)}
        />
      ) : tab === 'discover' ? (
        <DiscoverScreen
          user={user}
          onTabChange={setTab}
          onCreateEvent={() => setCreateEventOpen(true)}
        />
      ) : (
        <React.Suspense fallback={null}>
          <ProfileScreen user={user} onTabChange={setTab} onOpenCompose={() => setCreateEventOpen(true)} onLogout={async () => {
            if (loading) return;
            try {
              setLoading(true);
              // Wait for successful logout response from backend
              await authService.logout();
              // Only navigate to login screen after successful logout
              onLogout();
            } catch (err) {
              console.error('Logout error:', err);
              // Don't navigate if logout fails
            } finally {
              setLoading(false);
            }
          }} />
        </React.Suspense>
      )}

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
                // Save photo to gallery
                if (asset.type === 'photo') {
                  setCapturedPhotos(prev => [...prev, { ...asset, timestamp: Date.now() }]);
                  setCameraOpen(false);
                }
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
                  // Perform logout - wait for successful response from backend
                  await authService.logout();
                  // Only navigate to login screen after successful logout
                  // This sets user to null in App.tsx, which triggers Auth screen
                  onLogout();
                } catch (err) {
                  console.error('Logout error:', err);
                  // Don't navigate if logout fails - user stays logged in
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

      {isGalleryOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.background, zIndex: 150 }}>
          <React.Suspense fallback={null}>
            <CapturedPhotosScreen
              photos={capturedPhotos}
              onClose={() => setGalleryOpen(false)}
            />
          </React.Suspense>
        </View>
      ) : null}
    </View>
  );
}
