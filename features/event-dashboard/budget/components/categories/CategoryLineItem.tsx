import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { TrendingDown, TrendingUp, Trash2, CheckCircle } from 'lucide-react-native';
import { useI18n } from '../../../../../common/i18n/I18nProvider';
import { BudgetLineItemResponse } from '../../../../../core/budget/types/budget';
import { useTheme } from '../../../../../common/theme/ThemeProvider';

type Props = {
  item: BudgetLineItemResponse;
  formatCurrency: (amount: number) => string;
  onDelete?: (itemId: string) => void;
  onFinalize?: (item: BudgetLineItemResponse) => void;
};

export function CategoryLineItem({ item, formatCurrency, onDelete, onFinalize }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const estimated = item.estimatedCost || 0;
  const actual = item.actualCost || 0;
  const variance = actual - estimated;
  const hasVariance = variance !== 0 && actual > 0;
  const isDraft = item.isDraft === true;

  const handleDelete = () => {
    if (!onDelete) return;
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
    <View className="flex-row justify-between items-start rounded-lg px-md py-md bg-light-surface-soft dark:bg-dark-surface-soft">
      <View className="flex-1 pr-sm">
        <View className="flex-row items-center gap-xs mb-xs">
          {isDraft && (
            <View className="rounded-md px-xs py-[1px] border bg-semantic-warning/20 border-semantic-warning/40">
              <Text className="text-xs font-medium text-semantic-warning">
                {t('Draft')}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-xs font-medium text-txt-primary dark:text-txt-dark-primary mb-[2px]">
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
            <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
              {formatCurrency(actual)}
            </Text>
          ) : estimated > 0 ? (
            <Text className="text-xs font-medium text-txt-secondary dark:text-txt-dark-secondary">
              {formatCurrency(estimated)}
            </Text>
          ) : null}
          {hasVariance && (
            <View className="flex-row items-center mt-[2px]">
              {variance > 0 ? (
                <TrendingUp size={10} color={colors.semantic.error} />
              ) : (
                <TrendingDown size={10} color={colors.semantic.success} />
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
              className="p-xs rounded-sm bg-semantic-success/10"
            >
              <CheckCircle size={13} color={colors.semantic.success} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.7}
              className="p-xs rounded-sm bg-semantic-error/10"
            >
              <Trash2 size={13} color={colors.semantic.error} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
