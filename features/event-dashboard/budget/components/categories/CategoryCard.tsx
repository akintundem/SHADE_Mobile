import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useI18n } from '../../../../../common/i18n/I18nProvider';
import { BudgetCategoryResponse, BudgetLineItemResponse } from '../../../../../core/budget/types/budget';
import { CategoryLineItem } from './CategoryLineItem';
import { useTheme } from '../../../../../common/theme/ThemeProvider';

type Props = {
  category: BudgetCategoryResponse;
  lineItems: BudgetLineItemResponse[];
  formatCurrency: (amount: number) => string;
  onDeleteItem?: (itemId: string) => void;
  onFinalizeItem?: (item: BudgetLineItemResponse) => void;
};

export function CategoryCard({ category, lineItems, formatCurrency, onDeleteItem, onFinalizeItem }: Props) {
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  const text = colors.text;

  const [isExpanded, setIsExpanded] = useState(true);

  const categorySpent = category.totalActual || category.totalEstimated || 0;
  const categoryRemaining = (category.allocatedAmount || 0) - categorySpent;
  const categoryPercentage =
    category.allocatedAmount > 0 ? (categorySpent / category.allocatedAmount) * 100 : 0;

  return (
    <View
      className="rounded-xl p-xl bg-light-surface dark:bg-dark-surface-elevated border border-[0.5px] border-light-border-strong dark:border-dark-border-strong"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-start mb-md">
        <View className="flex-1 pr-md">
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-[2px]">
            {category.name}
          </Text>
          {category.description && (
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
              {category.description}
            </Text>
          )}
        </View>
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
          {formatCurrency(category.allocatedAmount)}
        </Text>
      </View>

      <View className="mb-lg">
        <View className="h-1.5 rounded-full overflow-hidden bg-light-surface-soft dark:bg-dark-surface-strong">
          <View
            style={{
              height: '100%',
              width: `${Math.min(categoryPercentage, 100)}%`,
              backgroundColor:
                categoryRemaining < 0
                  ? colors.semantic.error
                  : categoryPercentage >= 80
                  ? colors.semantic.warning
                  : colors.semantic.success,
            }}
          />
        </View>
      </View>

      <View className="flex-row justify-between pt-md border-t border-light-border-strong dark:border-dark-border-strong">
        <View>
          <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-xs">
            {t('Spent')}
          </Text>
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
            {formatCurrency(categorySpent)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-xs">
            {t('Remaining')}
          </Text>
          <Text
            className={`text-sm font-semibold ${categoryRemaining < 0 ? 'text-semantic-error' : 'text-txt-primary dark:text-txt-dark-primary'}`}
          >
            {formatCurrency(categoryRemaining)}
          </Text>
        </View>
      </View>

      {lineItems.length > 0 && (
        <View className="mt-lg pt-lg border-t border-light-border-strong dark:border-dark-border-strong">
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
            className={`flex-row items-center justify-between rounded-md px-sm py-sm ${
              isExpanded ? 'bg-light-surface-soft dark:bg-dark-surface-soft' : ''
            }`}
          >
            <View className="flex-row items-center gap-xs">
              <Text className="text-xs font-semibold uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary">
                {lineItems.length} {t('Expenses')}
              </Text>
            </View>
            <View className="w-7 h-7 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong">
              {isExpanded ? (
                <ChevronUp size={16} color={text.tertiary} strokeWidth={2} />
              ) : (
                <ChevronDown size={16} color={text.tertiary} strokeWidth={2} />
              )}
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View className="mt-md gap-xs">
              {lineItems.map(item => (
                <CategoryLineItem
                  key={item.id}
                  item={item}
                  formatCurrency={formatCurrency}
                  onDelete={onDeleteItem}
                  onFinalize={onFinalizeItem}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
