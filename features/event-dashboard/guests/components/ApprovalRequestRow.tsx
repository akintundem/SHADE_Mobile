import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle, Ticket, User, XCircle } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { TicketApprovalRequestResponse, TicketApprovalStatus } from '../../../../core/tickets/types/ticket';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { ApprovalStatusPill } from './ApprovalStatusPill';

type Props = {
  request: TicketApprovalRequestResponse;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
};

export function ApprovalRequestRow({ request, onApprove, onReject, onCancel }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const canApprove = !!onApprove && request.status === TicketApprovalStatus.PENDING;
  const canReject = !!onReject && request.status === TicketApprovalStatus.PENDING;
  const canCancel = !!onCancel && request.status === TicketApprovalStatus.PENDING;

  return (
    <View className="rounded-lg border p-md mb-sm bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted">
      <View className="flex-row items-start justify-between mb-sm">
        <View className="flex-1">
          <View className="flex-row items-center gap-sm mb-xs">
            <User size={14} color={colors.text.tertiary} strokeWidth={2.2} />
            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
              {request.requesterName || request.requesterEmail || t('Unknown')}
            </Text>
          </View>
          <View className="flex-row items-center gap-sm mb-xs">
            <Ticket size={14} color={colors.text.tertiary} strokeWidth={2.2} />
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
              {request.ticketTypeName || t('UnknownTicketType')}
            </Text>
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">•</Text>
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
              {request.quantity} {t('Tickets')}
            </Text>
          </View>
          {request.createdAt && (
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
              {dateUtils.formatDate(request.createdAt, DATE_FORMATS.DISPLAY_DATETIME)}
            </Text>
          )}
        </View>
        <ApprovalStatusPill status={request.status} />
      </View>
      {(canApprove || canReject || canCancel) && (
        <View className="flex-row gap-sm mt-sm">
          {canApprove && (
            <TouchableOpacity
              onPress={() => onApprove!(request.id)}
              className="flex-1 flex-row items-center justify-center gap-xs py-sm rounded-lg bg-semantic-success"
            >
              <CheckCircle size={14} color={colors.text.inverse} strokeWidth={2.2} />
              <Text className="text-xs font-semibold text-txt-inverse">{t('Approve')}</Text>
            </TouchableOpacity>
          )}
          {canReject && (
            <TouchableOpacity
              onPress={() => onReject!(request.id)}
              className="flex-1 flex-row items-center justify-center gap-xs py-sm rounded-lg bg-semantic-error"
            >
              <XCircle size={14} color={colors.text.inverse} strokeWidth={2.2} />
              <Text className="text-xs font-semibold text-txt-inverse">{t('Reject')}</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              onPress={() => onCancel!(request.id)}
              className="px-md py-sm rounded-lg bg-light-surface-soft dark:bg-dark-surface-strong"
            >
              <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('Cancel')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
