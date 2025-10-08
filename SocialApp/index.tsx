import React, { useState } from 'react';
import { View } from 'react-native';
import { User } from '../types';
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

type Props = {
  user: User;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
};

export default function SocialApp({ user, onLogout }: Props) {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'home' | 'discover' | 'map' | 'profile'>('home');
  const [isComposeOpen, setComposeOpen] = useState(false);
  const [isCreateEventOpen, setCreateEventOpen] = useState(false);
  const [isCreateCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [captured, setCaptured] = useState<{ path: string; type: 'photo' | 'video' } | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
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
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#FFFFFF', zIndex: 100 }}>
          <React.Suspense fallback={null}>
            <ComposeScreen onClose={() => setComposeOpen(false)} onOpenCamera={() => setCameraOpen(true)} />
          </React.Suspense>
        </View>
      ) : null}

      {isCreateEventOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#000000', zIndex: 100 }}>
          <React.Suspense fallback={null}>
            <CreateEventScreen onClose={() => setCreateEventOpen(false)} />
          </React.Suspense>
        </View>
      ) : null}

      {isCreateCollectionOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#000000', zIndex: 100 }}>
          <React.Suspense fallback={null}>
            <CreateCollectionScreen onClose={() => setCreateCollectionOpen(false)} />
          </React.Suspense>
        </View>
      ) : null}

      {isCameraOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#000', zIndex: 110 }}>
          <React.Suspense fallback={null}>
            <CameraScreen
              onClose={() => setCameraOpen(false)}
              onCapture={asset => {
                setCaptured(asset);
                // Only open editor for local file paths; library URIs on simulator (ph://) are not supported by the native trimmer
                const isFile = asset.path?.startsWith('file:') || asset.path?.startsWith('/') || asset.path?.startsWith('content:');
                if (asset.type === 'video' && isFile) {
                  setCameraOpen(false);
                  setEditorOpen(true);
                } else {
                  setCameraOpen(false);
                }
              }}
            />
          </React.Suspense>
        </View>
      ) : null}

      {isEditorOpen && captured ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#000', zIndex: 120 }}>
          <React.Suspense fallback={null}>
            <VideoEditorScreen
              path={captured.path}
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
    </View>
  );
}
