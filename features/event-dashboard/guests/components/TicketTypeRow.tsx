import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MoreVertical, Tag } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { TicketTypeResponse } from '../../../../core/tickets/types/ticket';

type Props = {
  ticketType: TicketTypeResponse;
  isLast: boolean;
  formatCurrency: (priceMinor: number | null | undefined, currency: string | null | undefined) => string;
  onAction?: (ticketType: TicketTypeResponse) => void;
};

export function TicketTypeRow({ ticketType, isLast: _isLast, formatCurrency, onAction }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const isActive = ticketType.isActive !== false;
  const remaining = ticketType.quantityRemaining ?? 0;
  const total = ticketType.quantityAvailable ?? 0;
  const sold = ticketType.quantitySold ?? 0;

  return (
    <TouchableOpacity
      className="flex-row items-center py-lg"
      style={{ opacity: isActive ? 1 : 0.5 }}
      onPress={() => onAction?.(ticketType)}
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 items-center justify-center">
        <Tag size={18} color={colors.text.tertiary} strokeWidth={2.2} />
      </View>
      <View className="flex-1 ml-md">
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-[2px]">
          {ticketType.name}
        </Text>
        <View className="flex-row items-center gap-sm">
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
            {formatCurrency(ticketType.priceMinor, ticketType.currency)}
          </Text>
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">•</Text>
          <Text
            className={`text-xs ${remaining > 0 ? 'text-txt-tertiary dark:text-txt-dark-tertiary' : 'text-semantic-error'}`}
          >
            {remaining} / {total} {t('left').toLowerCase()}
          </Text>
          {sold > 0 && (
            <>
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">•</Text>
              <Text className="text-xs text-semantic-success">
                {sold} {t('Sold').toLowerCase()}
              </Text>
            </>
          )}
        </View>
      </View>
      {onAction && (
        <TouchableOpacity
          onPress={() => onAction(ticketType)}
          className="p-sm"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreVertical size={18} color={colors.text.tertiary} strokeWidth={2.2} />
        </TouchableOpacity>
      )}
      {!isActive && (
        <View className="px-sm py-[2px] rounded-full bg-light-surface-soft dark:bg-dark-surface-strong ml-sm">
          <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
            {t('Inactive')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
