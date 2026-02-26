import React from 'react';
import { Text, View } from 'react-native';
import { useI18n } from '../../../../../common/i18n/I18nProvider';
import { BudgetLineItemResponse } from '../../../../../core/budget/types/budget';
import { LineItemCard } from './LineItemCard';

type Props = {
  lineItems: BudgetLineItemResponse[];
  formatCurrency: (amount: number) => string;
  onDelete?: (itemId: string) => void;
  onFinalize?: (item: BudgetLineItemResponse) => void;
};

export function LineItemsList({ lineItems, formatCurrency, onDelete, onFinalize }: Props) {
  const { t } = useI18n();

  if (lineItems.length === 0) {
    return null;
  }

  return (
    <View className="mb-2xl">
      <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
        {t('Expenses')}
      </Text>

      <View className="gap-md">
        {lineItems.map(item => (
          <LineItemCard
            key={item.id}
            item={item}
            formatCurrency={formatCurrency}
            onDelete={onDelete}
            onFinalize={onFinalize}
          />
        ))}
      </View>
    </View>
  );
}
