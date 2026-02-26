import React, { useState } from 'react';
import { View, Modal } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../core/auth/types/auth';
import { RootStackParamList } from '../navigation/types';
import { TabBar } from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import ManageScreen from './screens/ManageScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';
import { ErrorBoundary } from '../common/components/ErrorBoundary';
const EventAdminDashboard = React.lazy(() => import('../features/event-dashboard/dashboard/screens/EventAdminDashboard'));
const EventFeedsScreen = React.lazy(() => import('../features/feeds/screens/EventFeedsScreen').then(module => ({ default: module.EventFeedsScreen })));
const BudgetManagementScreen = React.lazy(() => import('../features/event-dashboard/budget/screens/BudgetManagementScreen').then(module => ({ default: module.BudgetManagementScreen })));
const TimelineManagementScreen = React.lazy(() => import('../features/event-dashboard/timeline/screens/TimelineManagementScreen').then(module => ({ default: module.TimelineManagementScreen })));
const CollaborationManagementScreen = React.lazy(() => import('../features/event-dashboard/collaboration/screens/CollaborationManagementScreen').then(module => ({ default: module.CollaborationManagementScreen })));
const RSVPManagementScreen = React.lazy(() => import('../features/event-dashboard/guests/screens/RSVPManagementScreen').then(module => ({ default: module.RSVPManagementScreen })));
const AttendeeDetailScreen = React.lazy(() => import('../features/event-dashboard/guests/screens/AttendeeDetailScreen').then(module => ({ default: module.AttendeeDetailScreen })));
const InvitesManagementScreen = React.lazy(() => import('../features/event-dashboard/guests/screens/InvitesManagementScreen').then(module => ({ default: module.InvitesManagementScreen })));
const TicketsManagementScreen = React.lazy(() => import('../features/event-dashboard/guests/screens/TicketsManagementScreen').then(module => ({ default: module.TicketsManagementScreen })));
const TicketApprovalsScreen = React.lazy(() => import('../features/event-dashboard/guests/screens/TicketApprovalsScreen').then(module => ({ default: module.TicketApprovalsScreen })));
const TicketWaitlistScreen = React.lazy(() => import('../features/event-dashboard/guests/screens/TicketWaitlistScreen').then(module => ({ default: module.TicketWaitlistScreen })));
const EventWaitlistScreen = React.lazy(() => import('../features/event-dashboard/guests/screens/EventWaitlistScreen').then(module => ({ default: module.EventWaitlistScreen })));
const MediaLibraryScreen = React.lazy(() => import('../features/event-dashboard/media/screens/MediaLibraryScreen').then(module => ({ default: module.MediaLibraryScreen })));
const AssetsScreen = React.lazy(() => import('../features/event-dashboard/assets/screens/AssetsScreen').then(module => ({ default: module.AssetsScreen })));
const RemindersScreen = React.lazy(() => import('../features/event-dashboard/reminders/screens/RemindersScreen').then(module => ({ default: module.RemindersScreen })));
const CreateEventScreen = React.lazy(() => import('../features/create-event/screens/CreateEventScreen'));
const PublicProfileScreen = React.lazy(() => import('../features/social/screens/PublicProfileScreen').then(module => ({ default: module.PublicProfileScreen })));
const FollowersListScreen = React.lazy(() => import('../features/social/screens/FollowersListScreen').then(module => ({ default: module.FollowersListScreen })));
const FollowingListScreen = React.lazy(() => import('../features/social/screens/FollowingListScreen').then(module => ({ default: module.FollowingListScreen })));
const EventSettingsScreen = React.lazy(() => import('../features/event-dashboard/settings/screens/EventSettingsScreen').then(module => ({ default: module.EventSettingsScreen })));
const AcceptInviteByTokenScreen = React.lazy(() => import('../features/event-dashboard/collaboration/screens/AcceptInviteByTokenScreen').then(module => ({ default: module.AcceptInviteByTokenScreen })));
const EventDetailScreen = React.lazy(() => import('../features/event-detail/screens/EventDetailScreen').then(module => ({ default: module.EventDetailScreen })));

const RootStack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  user: User;
  onLogout: () => void;
};

function MainTabs({ user, onLogout }: Props) {
  const [tab, setTab] = useState<'home' | 'search' | 'manage' | 'profile'>('home');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [hideTabBar, setHideTabBar] = useState(false);

  const handleCreateEvent = () => {
    setShowCreateEvent(true);
  };

  const handleCloseCreateEvent = () => {
    setShowCreateEvent(false);
  };

  const handleEventCreated = () => {
    setShowCreateEvent(false);
    // Optionally refresh the manage screen or show a success message
  };

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ErrorBoundary>
        {tab === 'home' ? (
          <HomeScreen user={user} onCreateEvent={handleCreateEvent} />
        ) : tab === 'search' ? (
          <SearchScreen />
        ) : tab === 'manage' ? (
          <ManageScreen
            user={user}
            onCreateEvent={handleCreateEvent}
          />
        ) : (
          <ProfileScreen
            user={user}
            onInternalNavigate={setHideTabBar}
            onLogout={onLogout}
          />
        )}
      </ErrorBoundary>

      {/* Centralized TabBar for navigation - hide when in internal screens */}
      {!hideTabBar && <TabBar active={tab} onChange={setTab} />}

      {/* Create Event Modal */}
      <Modal
        visible={showCreateEvent}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseCreateEvent}
      >
        <ErrorBoundary>
          <React.Suspense fallback={null}>
            <CreateEventScreen
              onClose={handleCloseCreateEvent}
              onCreate={handleEventCreated}
            />
          </React.Suspense>
        </ErrorBoundary>
      </Modal>
    </View>
  );
}

export default function MainApp({ user, onLogout }: Props) {
  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false }}
      screenLayout={({ children }) => (
        <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background" edges={['top', 'left', 'right']}>
          {children}
        </SafeAreaView>
      )}
    >
      <RootStack.Screen name="MainTabs">
        {() => <MainTabs user={user} onLogout={onLogout} />}
      </RootStack.Screen>
      <RootStack.Screen name="EventAdmin">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <EventAdminDashboard />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="EventFeeds">
        {({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'EventFeeds'>) => {
          const { eventId, eventName, coverImageUrl, userContext } = route.params;
          return (
            <ErrorBoundary>
              <React.Suspense fallback={null}>
                <EventFeedsScreen
                  eventId={eventId || ''}
                  eventName={eventName || 'Event'}
                  coverImageUrl={coverImageUrl}
                  userContext={userContext}
                  onBack={() => navigation.goBack()}
                />
              </React.Suspense>
            </ErrorBoundary>
          );
        }}
      </RootStack.Screen>
      <RootStack.Screen name="BudgetManagement">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <BudgetManagementScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="TimelineManagement">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <TimelineManagementScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="CollaborationManagement">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <CollaborationManagementScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="RSVPManagement">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <RSVPManagementScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="AttendeeDetail">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <AttendeeDetailScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="InvitesManagement">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <InvitesManagementScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="TicketsManagement">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <TicketsManagementScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="TicketApprovals">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <TicketApprovalsScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="TicketWaitlist">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <TicketWaitlistScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="EventWaitlist">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <EventWaitlistScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="MediaLibrary">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <MediaLibraryScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="Assets">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <AssetsScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="Reminders">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <RemindersScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="PublicProfile">
        {({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'PublicProfile'>) => {
          const { userId, currentUserId } = route.params;
          return (
            <ErrorBoundary>
              <React.Suspense fallback={null}>
                <PublicProfileScreen
                  userId={userId}
                  currentUserId={currentUserId}
                  onBack={() => navigation.goBack()}
                  onFollowersPress={(id, name) => navigation.navigate('FollowersList', { userId: id, userName: name, currentUserId })}
                  onFollowingPress={(id, name) => navigation.navigate('FollowingList', { userId: id, userName: name, currentUserId })}
                />
              </React.Suspense>
            </ErrorBoundary>
          );
        }}
      </RootStack.Screen>
      <RootStack.Screen name="FollowersList">
        {({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'FollowersList'>) => {
          const { userId, userName, currentUserId } = route.params;
          return (
            <ErrorBoundary>
              <React.Suspense fallback={null}>
                <FollowersListScreen
                  userId={userId}
                  userName={userName}
                  currentUserId={currentUserId}
                  onBack={() => navigation.goBack()}
                  onUserPress={(user) => navigation.navigate('PublicProfile', { userId: user.id, currentUserId })}
                />
              </React.Suspense>
            </ErrorBoundary>
          );
        }}
      </RootStack.Screen>
      <RootStack.Screen name="FollowingList">
        {({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'FollowingList'>) => {
          const { userId, userName, currentUserId } = route.params;
          return (
            <ErrorBoundary>
              <React.Suspense fallback={null}>
                <FollowingListScreen
                  userId={userId}
                  userName={userName}
                  currentUserId={currentUserId}
                  onBack={() => navigation.goBack()}
                  onUserPress={(user) => navigation.navigate('PublicProfile', { userId: user.id, currentUserId })}
                />
              </React.Suspense>
            </ErrorBoundary>
          );
        }}
      </RootStack.Screen>
      <RootStack.Screen name="EventDetail">
        {({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'EventDetail'>) => {
          const { eventId, accessType, userContext, ticketTypes } = route.params;
          return (
            <ErrorBoundary>
              <React.Suspense fallback={null}>
                <EventDetailScreen
                  eventId={eventId}
                  accessType={accessType}
                  userContext={userContext}
                  ticketTypes={ticketTypes}
                  onBack={() => navigation.goBack()}
                  onAdminPress={
                    userContext?.isOwner || userContext?.isCollaborator
                      ? () => navigation.navigate('EventAdmin', { eventId, accessType, userContext, ticketTypes })
                      : undefined
                  }
                />
              </React.Suspense>
            </ErrorBoundary>
          );
        }}
      </RootStack.Screen>
      <RootStack.Screen name="AcceptInviteByToken">
        {() => (
          <ErrorBoundary>
            <React.Suspense fallback={null}>
              <AcceptInviteByTokenScreen />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </RootStack.Screen>
      <RootStack.Screen name="EventSettings">
        {({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'EventSettings'>) => {
          const { eventId, event, onEventUpdated } = route.params;
          return (
            <ErrorBoundary>
              <React.Suspense fallback={null}>
                <EventSettingsScreen
                  eventId={eventId}
                  event={event}
                  onEventUpdated={onEventUpdated}
                  onBack={() => navigation.goBack()}
                />
              </React.Suspense>
            </ErrorBoundary>
          );
        }}
      </RootStack.Screen>
    </RootStack.Navigator>
  );
}
