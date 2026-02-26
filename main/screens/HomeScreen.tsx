import React, { useState } from 'react';
import { View } from 'react-native';
import { HomeHeader } from '../../features/event-dashboard/dashboard/components/HomeHeader';
import { EventsList } from '../../features/event-dashboard/dashboard/components/EventsList';
import { EventSegmentedControl, SegmentType } from '../../features/event-dashboard/dashboard/components/EventSegmentedControl';
import { EventAccessModals } from '../../common/components/EventAccessModals';
import { useEventAccess } from '../hooks/useEventAccess';
import { User } from '../../core/auth/types/auth';
import { EventItem } from '../../features/event-dashboard/dashboard/components/EventCard';

type Props = {
  user: User;
  events?: EventItem[];
  onCreateEvent?: () => void;
};

export default function HomeScreen({
  user,
  events = [],
  onCreateEvent,
}: Props) {
  const [activeSegment, setActiveSegment] = useState<SegmentType>('forYou');
  const {
    selectedEvent,
    showTicketModal,
    showRSVPModal,
    showInviteModal,
    isProcessing,
    actionResult,
    handleEventPress,
    handleTicketModalDismiss,
    handleRSVPModalDismiss,
    handleInviteModalDismiss,
    handleTicketAction,
    handleRSVPAction,
    handleInviteAction,
  } = useEventAccess(user.id);

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <View className="flex-1">
        <View className="bg-light-background dark:bg-dark-background">
          <HomeHeader onCreateEvent={onCreateEvent} />
          <EventSegmentedControl
            activeSegment={activeSegment}
            onSegmentChange={setActiveSegment}
          />
        </View>

        <EventsList
          events={events}
          onCreateEvent={onCreateEvent}
          showCreateAction={true}
          onEventPress={handleEventPress}
          activeSegment={activeSegment}
        />

        {!(selectedEvent?.userContext?.isOwner ||
          selectedEvent?.userContext?.isCollaborator) ? (
          <EventAccessModals
            selectedEvent={selectedEvent}
            showTicketModal={showTicketModal}
            showRSVPModal={showRSVPModal}
            showInviteModal={showInviteModal}
            onTicketAction={handleTicketAction}
            onRSVPAction={handleRSVPAction}
            onInviteAction={handleInviteAction}
            onTicketDismiss={handleTicketModalDismiss}
            onRSVPDismiss={handleRSVPModalDismiss}
            onInviteDismiss={handleInviteModalDismiss}
            isProcessing={isProcessing}
            actionResult={actionResult}
          />
        ) : null}

      </View>
    </View>
  );
}
