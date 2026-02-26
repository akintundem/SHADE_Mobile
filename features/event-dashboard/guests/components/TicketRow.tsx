import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ticket } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { TicketResponse, TicketStatus } from '../../../../core/tickets/types/ticket';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { TicketStatusPill } from './TicketStatusPill';

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

type Props = {
  ticket: TicketResponse;
  isLast: boolean;
  onPress: () => void;
};

export function TicketRow({ ticket, onPress }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const statusLabels: Record<TicketStatus, string> = {
    [TicketStatus.PENDING]: t('Pending'),
    [TicketStatus.ISSUED]: t('Issued'),
    [TicketStatus.VALIDATED]: t('Validated'),
    [TicketStatus.CANCELLED]: t('Cancelled'),
    [TicketStatus.REFUNDED]: t('Refunded'),
  };

  const pendingExpiration = ticket.pendingExpirationTime
    ? dateUtils.formatDate(ticket.pendingExpirationTime, DATE_FORMATS.DISPLAY_DATETIME)
    : null;

  const checkoutLabel = ticket.checkoutId ? `${t('Checkout')} #${ticket.checkoutId.slice(0, 8)}` : null;
  const pendingLabel =
    ticket.status === TicketStatus.PENDING && (pendingExpiration || checkoutLabel)
      ? [pendingExpiration ? `${t('ExpiresAt')} ${pendingExpiration}` : null, checkoutLabel]
          .filter(Boolean)
          .join(' • ')
      : checkoutLabel;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center py-lg">
      <View className="w-10 h-10 items-center justify-center">
        <Ticket size={18} color={colors.text.tertiary} strokeWidth={2.2} />
      </View>
      <View className="flex-1 ml-md">
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-[2px]">
          {ticket.ticketNumber}
        </Text>
        <View className="flex-row items-center gap-sm">
          {ticket.ticketTypeName && (
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
              {ticket.ticketTypeName}
            </Text>
          )}
          {ticket.attendeeName && (
            <>
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">•</Text>
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                {ticket.attendeeName}
              </Text>
            </>
          )}
        </View>
        {pendingLabel ? (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]">
            {pendingLabel}
          </Text>
        ) : null}
      </View>
      <TicketStatusPill
        label={statusLabels[ticket.status] || formatEnumLabel(ticket.status)}
        status={ticket.status}
      />
    </TouchableOpacity>
  );
}
