import React from 'react';
import { Text, View } from 'react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { EventWaitlistStatus } from '../../../../core/events/types/waitlist';

export function EventWaitlistStatusPill({ status }: { status: EventWaitlistStatus }) {
  const { t } = useI18n();
  const containerClassBase = 'px-sm py-[2px] rounded-full border';
  let containerClass = `${containerClassBase} bg-light-border dark:bg-dark-border border-light-border dark:border-dark-border`;
  let textClass = 'text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary';

  if (status === EventWaitlistStatus.PROMOTED) {
    containerClass = `${containerClassBase} bg-semantic-success-light dark:bg-semantic-success/20 border-semantic-success`;
    textClass = 'text-xs font-medium text-semantic-success';
  } else if (status === EventWaitlistStatus.WAITING) {
    containerClass = `${containerClassBase} bg-semantic-warning-light dark:bg-semantic-warning/20 border-semantic-warning`;
    textClass = 'text-xs font-medium text-semantic-warning';
  } else if (status === EventWaitlistStatus.CANCELLED) {
    containerClass = `${containerClassBase} bg-semantic-error-light dark:bg-semantic-error/20 border-semantic-error`;
    textClass = 'text-xs font-medium text-semantic-error';
  }

  const statusLabels: Record<EventWaitlistStatus, string> = {
    [EventWaitlistStatus.WAITING]: t('Waiting'),
    [EventWaitlistStatus.PROMOTED]: t('Promoted'),
    [EventWaitlistStatus.CANCELLED]: t('Cancelled'),
  };

  return (
    <View className={containerClass}>
      <Text className={textClass}>{statusLabels[status] || status}</Text>
    </View>
  );
}
