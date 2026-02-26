import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Trash2, TrendingDown, TrendingUp, CheckCircle } from 'lucide-react-native';
import { useI18n } from '../../../../../common/i18n/I18nProvider';
import { BudgetLineItemResponse } from '../../../../../core/budget/types/budget';
import { useTheme } from '../../../../../common/theme/ThemeProvider';

type Props = {
  item: BudgetLineItemResponse;
  formatCurrency: (amount: number) => string;
  onDelete?: (itemId: string) => void;
  onFinalize?: (item: BudgetLineItemResponse) => void;
};

export function LineItemCard({ item, formatCurrency, onDelete, onFinalize }: Props) {
  const { t } = useI18n();
  const { colors, isDark } = useTheme();

  const estimated = item.estimatedCost || 0;
  const actual = item.actualCost || 0;
  const variance = actual - estimated;
  const hasVariance = variance !== 0 && actual > 0;
  const isDraft = item.isDraft === true;

  const handleDelete = () => {
    Alert.alert(t('DeleteExpense'), t('AreYouSureDeleteExpense'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Delete'), style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  const handleFinalize = () => {
    if (!onFinalize) return;
    Alert.alert(t('FinalizeLineItem'), t('FinalizeLineItemConfirm'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Finalize'), style: 'default', onPress: () => onFinalize(item) },
    ]);
  };

  return (
    <View
      className="rounded-xl p-lg flex-row items-start gap-lg bg-light-surface dark:bg-dark-surface-elevated border border-[0.5px] border-light-border-strong dark:border-dark-border-strong"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.15 : 0.03,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-sm gap-xs">
          {isDraft && (
            <View className="rounded-md px-sm py-[2px] border bg-semantic-warning/20 border-semantic-warning/40">
              <Text className="text-xs font-medium text-semantic-warning">
                {t('Draft')}
              </Text>
            </View>
          )}
          {item.budgetCategoryName && (
            <View
              className="rounded-md px-sm py-[2px] border bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border"
            >
              <Text className="text-xs font-medium text-txt-secondary dark:text-txt-dark-secondary">
                {item.budgetCategoryName}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-[2px]">
          {item.description || t('Expense')}
        </Text>
        {item.subcategory && (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
            {item.subcategory}
          </Text>
        )}
      </View>
      <View className="items-end gap-xs">
        <View className="items-end">
          {actual > 0 ? (
            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
              {formatCurrency(actual)}
            </Text>
          ) : estimated > 0 ? (
            <Text className="text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary">
              {formatCurrency(estimated)}
            </Text>
          ) : null}
          {hasVariance && (
            <View className="flex-row items-center mt-[2px]">
              {variance > 0 ? (
                <TrendingUp size={12} color={colors.semantic.error} />
              ) : (
                <TrendingDown size={12} color={colors.semantic.success} />
              )}
              <Text
                className={`text-xs ml-xs ${variance > 0 ? 'text-semantic-error' : 'text-semantic-success'}`}
              >
                {formatCurrency(Math.abs(variance))}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center gap-xs">
          {isDraft && onFinalize && (
            <TouchableOpacity
              onPress={handleFinalize}
              activeOpacity={0.7}
              className="p-sm rounded-md border bg-semantic-success/10 border-semantic-success/20"
            >
              <CheckCircle size={15} color={colors.semantic.success} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.7}
              className="p-sm rounded-md border bg-semantic-error/10 border-semantic-error/20"
            >
              <Trash2 size={15} color={colors.semantic.error} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
