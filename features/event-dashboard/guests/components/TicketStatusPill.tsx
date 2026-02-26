import React from 'react';
import { Text, View } from 'react-native';
import { TicketStatus } from '../../../../core/tickets/types/ticket';

type Props = {
  label: string;
  status: TicketStatus;
};

export function TicketStatusPill({ label, status }: Props) {
  const containerClassBase = 'px-sm py-[2px] rounded-full border';
  let containerClass = `${containerClassBase} bg-light-border dark:bg-dark-border border-light-border dark:border-dark-border`;
  let textClass = 'text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary';

  if (status === TicketStatus.VALIDATED) {
    containerClass = `${containerClassBase} bg-semantic-success-light dark:bg-semantic-success/20 border-semantic-success`;
    textClass = 'text-xs font-medium text-semantic-success';
  } else if (status === TicketStatus.PENDING || status === TicketStatus.ISSUED) {
    containerClass = `${containerClassBase} bg-semantic-warning-light dark:bg-semantic-warning/20 border-semantic-warning`;
    textClass = 'text-xs font-medium text-semantic-warning';
  } else if (status === TicketStatus.CANCELLED || status === TicketStatus.REFUNDED) {
    containerClass = `${containerClassBase} bg-semantic-error-light dark:bg-semantic-error/20 border-semantic-error`;
    textClass = 'text-xs font-medium text-semantic-error';
  }

  return (
    <View className={containerClass}>
      <Text className={textClass}>{label}</Text>
    </View>
  );
}
