import React from 'react';
import { Text, View } from 'react-native';
import { useI18n } from '../../../../../common/i18n/I18nProvider';
import { BudgetCategoryResponse, BudgetLineItemResponse } from '../../../../../core/budget/types/budget';
import { CategoryCard } from './CategoryCard';

type Props = {
  categories: BudgetCategoryResponse[];
  lineItems: BudgetLineItemResponse[];
  formatCurrency: (amount: number) => string;
  onDeleteItem?: (itemId: string) => void;
  onFinalizeItem?: (item: BudgetLineItemResponse) => void;
};

export function CategoriesList({ categories, lineItems, formatCurrency, onDeleteItem, onFinalizeItem }: Props) {
  const { t } = useI18n();

  const categoriesWithItems = categories.filter(category => {
    return lineItems.some(item => item.budgetCategoryId === category.id);
  });

  if (categoriesWithItems.length === 0) {
    return null;
  }

  return (
    <View className="mb-2xl">
      <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
        {t('Categories')}
      </Text>

      <View className="gap-md">
        {categoriesWithItems.map(category => {
          const categoryLineItems = lineItems.filter(item => item.budgetCategoryId === category.id);

          return (
            <CategoryCard
              key={category.id}
              category={category}
              lineItems={categoryLineItems}
              formatCurrency={formatCurrency}
              onDeleteItem={onDeleteItem}
              onFinalizeItem={onFinalizeItem}
            />
          );
        })}
      </View>
    </View>
  );
}
