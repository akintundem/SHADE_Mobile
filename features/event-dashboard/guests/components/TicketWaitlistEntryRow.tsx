import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Send, Ticket, User } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { TicketWaitlistEntryResponse, TicketWaitlistStatus } from '../../../../core/tickets/types/ticket';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { TicketWaitlistStatusPill } from './TicketWaitlistStatusPill';

type Props = {
  entry: TicketWaitlistEntryResponse;
  onFulfill?: (id: string) => void;
};

export function TicketWaitlistEntryRow({ entry, onFulfill }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const canFulfill = !!onFulfill && entry.status === TicketWaitlistStatus.WAITING;

  return (
    <View className="rounded-lg border p-md mb-sm bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted">
      <View className="flex-row items-start justify-between mb-sm">
        <View className="flex-1">
          <View className="flex-row items-center gap-sm mb-xs">
            <User size={14} color={colors.text.tertiary} strokeWidth={2.2} />
            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
              {entry.requesterName || entry.requesterEmail || t('Unknown')}
            </Text>
          </View>
          <View className="flex-row items-center gap-sm mb-xs">
            <Ticket size={14} color={colors.text.tertiary} strokeWidth={2.2} />
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
              {entry.ticketTypeName || t('UnknownTicketType')}
            </Text>
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">•</Text>
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
              {entry.quantity} {t('Tickets')}
            </Text>
          </View>
          {entry.createdAt && (
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
              {dateUtils.formatDate(entry.createdAt, DATE_FORMATS.DISPLAY_DATETIME)}
            </Text>
          )}
          {entry.fulfilledAt && (
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
              {t('FulfilledAt')} {dateUtils.formatDate(entry.fulfilledAt, DATE_FORMATS.DISPLAY_DATETIME)}
            </Text>
          )}
        </View>
        <TicketWaitlistStatusPill status={entry.status} />
      </View>
      {canFulfill && (
        <TouchableOpacity
          onPress={() => onFulfill!(entry.id)}
          className="flex-row items-center justify-center gap-xs py-sm rounded-lg bg-semantic-success mt-sm"
        >
          <Send size={14} color={colors.text.inverse} strokeWidth={2.2} />
          <Text className="text-xs font-semibold text-txt-inverse">{t('Fulfill')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
