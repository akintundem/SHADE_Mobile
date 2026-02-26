import React, { useCallback, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../../../../navigation/types';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { RegistrationToggle } from '../components/RegistrationToggle';
import { EventActionsMenu } from '../components/EventActionsMenu';
import { ArchiveEventModal } from '../components/ArchiveEventModal';
import { CloneEventModal } from '../components/CloneEventModal';
import { useEventActions } from '../hooks/useEventActions';
import type { EventResponse, CloneEventRequest } from '../../../../core/events/types/event';

type Props = {
  eventId: string;
  event: EventResponse;
  onEventUpdated?: (event: EventResponse) => void;
  onBack: () => void;
};

export function EventSettingsScreen({ eventId, event, onEventUpdated, onBack }: Props) {
  const { t } = useI18n();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);

  const { isLoading, archiveEvent, restoreEvent, cloneEvent, toggleRegistration, removeCoverImage } =
    useEventActions({
      eventId,
      onEventUpdated,
    });

  const isRegistrationOpen = event.registrationOpen ?? false;
  const isArchived = event.isArchived ?? false;
  const hasCoverImage = Boolean(event.coverImageUrl);

  const handleToggleRegistration = useCallback(
    async (open: boolean) => {
      try {
        await toggleRegistration(open);
      } catch {
        Alert.alert(t('Error'), t('FailedToUpdateRegistration'));
      }
    },
    [t, toggleRegistration]
  );

  const handleArchive = useCallback(
    async (reason?: string) => {
      await archiveEvent(reason);
    },
    [archiveEvent]
  );

  const handleRestore = useCallback(async () => {
    Alert.alert(t('RestoreEvent'), t('RestoreEventConfirm', { eventName: event.name }), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Restore'),
        onPress: async () => {
          try {
            await restoreEvent();
          } catch {
            Alert.alert(t('Error'), t('FailedToRestoreEvent'));
          }
        },
      },
    ]);
  }, [event.name, restoreEvent, t]);

  const handleClone = useCallback(
    async (options: CloneEventRequest) => {
      const clonedEvent = await cloneEvent(options);
      Alert.alert(t('Success'), t('EventClonedSuccess'), [
        { text: t('OK') },
        {
          text: t('ViewClonedEvent'),
          onPress: () => {
            navigation.replace('EventAdmin', {
              eventId: clonedEvent.id,
              title: clonedEvent.name,
            });
          },
        },
      ]);
    },
    [cloneEvent, navigation, t]
  );

  const handleRemoveCover = useCallback(() => {
    Alert.alert(t('RemoveCoverImage'), t('RemoveCoverImageConfirm'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Remove'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCoverImage();
          } catch {
            Alert.alert(t('Error'), t('FailedToRemoveCover'));
          }
        },
      },
    ]);
  }, [removeCoverImage, t]);

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={t('EventSettings')}
        leftAction={{
          icon: ChevronLeft,
          onPress: onBack,
          size: 32,
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-xl pb-4xl gap-lg">
        {/* Registration Toggle */}
        <RegistrationToggle
          isOpen={isRegistrationOpen}
          isLoading={isLoading}
          onToggle={handleToggleRegistration}
          disabled={isArchived}
        />

        {/* Event Actions */}
        <EventActionsMenu
          isArchived={isArchived}
          hasCoverImage={hasCoverImage}
          onArchive={() => setShowArchiveModal(true)}
          onRestore={handleRestore}
          onClone={() => setShowCloneModal(true)}
          onRemoveCover={handleRemoveCover}
          disabled={isLoading}
        />
        </View>
      </ScrollView>

      {/* Archive Modal */}
      <ArchiveEventModal
        visible={showArchiveModal}
        eventName={event.name}
        isLoading={isLoading}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchive}
      />

      {/* Clone Modal */}
      <CloneEventModal
        visible={showCloneModal}
        eventName={event.name}
        isLoading={isLoading}
        onClose={() => setShowCloneModal(false)}
        onConfirm={handleClone}
      />
    </View>
  );
}
