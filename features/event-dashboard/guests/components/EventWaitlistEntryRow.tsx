import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle, Clock, User, XCircle } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { EventWaitlistEntryResponse, EventWaitlistStatus } from '../../../../core/events/types/waitlist';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { EventWaitlistStatusPill } from './EventWaitlistStatusPill';

type Props = {
  entry: EventWaitlistEntryResponse;
  onCancel?: (id: string) => void;
};

export function EventWaitlistEntryRow({ entry, onCancel }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const canCancel = !!onCancel && entry.status === EventWaitlistStatus.WAITING;

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
          {entry.requesterEmail && entry.requesterName && (
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-xs ml-[22px]">
              {entry.requesterEmail}
            </Text>
          )}
          {entry.createdAt && (
            <View className="flex-row items-center gap-sm ml-[22px]">
              <Clock size={12} color={colors.text.tertiary} strokeWidth={2} />
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                {dateUtils.formatDate(entry.createdAt, DATE_FORMATS.DISPLAY_DATETIME)}
              </Text>
            </View>
          )}
          {entry.promotedAt && (
            <View className="flex-row items-center gap-sm mt-xs ml-[22px]">
              <CheckCircle size={12} color={colors.semantic.success} strokeWidth={2} />
              <Text className="text-xs text-semantic-success">
                {t('PromotedAt')} {dateUtils.formatDate(entry.promotedAt, DATE_FORMATS.DISPLAY_DATETIME)}
              </Text>
            </View>
          )}
          {entry.cancelledAt && (
            <View className="flex-row items-center gap-sm mt-xs ml-[22px]">
              <XCircle size={12} color={colors.semantic.error} strokeWidth={2} />
              <Text className="text-xs text-semantic-error">
                {t('CancelledAt')} {dateUtils.formatDate(entry.cancelledAt, DATE_FORMATS.DISPLAY_DATETIME)}
              </Text>
            </View>
          )}
        </View>
        <EventWaitlistStatusPill status={entry.status} />
      </View>
      {canCancel && (
        <TouchableOpacity
          onPress={() => onCancel!(entry.id)}
          className="flex-row items-center justify-center gap-xs py-sm rounded-lg bg-semantic-error mt-sm"
        >
          <XCircle size={14} color="#FFFFFF" strokeWidth={2.2} />
          <Text className="text-xs font-semibold text-txt-inverse">{t('CancelEntry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
