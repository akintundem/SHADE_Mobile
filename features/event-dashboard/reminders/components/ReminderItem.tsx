import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Clock, Trash2 } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { EventReminderResponse } from '../../../../core/events/types/event';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';

const getChannelIcon = (channel: string) => {
  switch (channel.toLowerCase()) {
    case 'email': return '📧';
    case 'sms': return '💬';
    case 'push': return '🔔';
    default: return '⏰';
  }
};

type Props = {
  reminder: EventReminderResponse;
  onDelete?: () => void;
  onPress: () => void;
};

export function ReminderItem({ reminder, onDelete, onPress }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const formatReminderTime = (time?: string | null) => {
    if (!time) return t('NotScheduled');
    return dateUtils.formatDate(time, DATE_FORMATS.DISPLAY_DATETIME);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-md rounded-lg border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface p-md"
    >
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-full bg-light-surface-soft dark:bg-dark-surface-strong items-center justify-center mr-md">
          <Text className="text-xl">{getChannelIcon(reminder.channel)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs">
            {reminder.title}
          </Text>
          {reminder.description && (
            <Text
              className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-xs"
              numberOfLines={2}
            >
              {reminder.description}
            </Text>
          )}
          <View className="flex-row items-center mt-xs">
            <Clock size={12} color={colors.text.tertiary} strokeWidth={2} />
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary ml-xs">
              {formatReminderTime(reminder.reminderTime)}
            </Text>
          </View>
          {reminder.reminderType && (
            <View className="self-start px-sm py-[2px] rounded-full bg-light-surface-soft dark:bg-dark-surface-strong mt-xs">
              <Text className="text-xs font-medium text-txt-secondary dark:text-txt-dark-secondary">
                {reminder.reminderType}
              </Text>
            </View>
          )}
        </View>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} className="p-sm">
            <Trash2 size={16} color={colors.text.tertiary} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
