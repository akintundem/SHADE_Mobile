import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Edit2 } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { budgetService } from '../../../../core/budget/services/budget';
import { BudgetSummaryCard } from '../components/summary/BudgetSummaryCard';
import { AddLineItemModal } from '../components/modals/AddLineItemModal';
import { EditBudgetModal } from '../components/modals/EditBudgetModal';
import { CategoriesList } from '../components/categories/CategoriesList';
import { LineItemsList } from '../components/line-items/LineItemsList';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { SegmentedToggle } from '../../../../common/components/SegmentedToggle';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { useBudgetData } from '../hooks';
import { BudgetLineItemResponse } from '../../../../core/budget/types/budget';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

export function BudgetManagementScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);
  const refreshTint = colors.text.primary;

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [viewMode, setViewMode] = useState<'categories' | 'lineItems'>('categories');

  const { budget, categories, lineItems, loading, error, refresh } = useBudgetData(eventId);

  const onRefresh = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    await refresh(true);
    setRefreshing(false);
  }, [eventId, refresh]);

  const formatCurrency = useCallback(
    (amount: number) => {
      const currency = budget?.currency || 'USD';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },
    [budget?.currency]
  );

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      if (!eventId) return;
      try {
        await budgetService.deleteLineItem(eventId, itemId);
        await refresh(true);
      } catch (err) {
        ErrorHandler.handle(err, 'deleteLineItem');
      }
    },
    [eventId, refresh]
  );

  const handleFinalizeItem = useCallback(
    async (item: BudgetLineItemResponse) => {
      if (!eventId) return;
      try {
        await budgetService.finalizeLineItem(eventId, item.id, {
          id: item.id,
          budgetCategoryId: item.budgetCategoryId,
          subcategory: item.subcategory || null,
          description: item.description || null,
          estimatedCost: item.estimatedCost || null,
          actualCost: item.actualCost || null,
          quantity: item.quantity || null,
          unitCost: item.unitCost || null,
          planningStatus: item.planningStatus || null,
          isEssential: item.isEssential || null,
          priority: item.priority || null,
          notes: item.notes || null,
        });
        await refresh(true);
      } catch (err) {
        ErrorHandler.handle(err, 'finalizeLineItem');
      }
    },
    [eventId, refresh]
  );

  const bottomGutter = useMemo(
    () => Math.max(16, Math.min(insets.bottom, 20)),
    [insets.bottom]
  );

  if (!eventId) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('EventNotFound')}
            subtitle={t('WeCouldNotDetermineEvent')}
            action={{ label: t('GoBack'), onPress: goBack }}
          />
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return <LoadingOverlay visible={true} message={t('LoadingBudget')} />;
  }

  if (error && !budget) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('FailedToLoadBudget')}
            subtitle={t('FailedToLoadBudget')}
            action={{ label: t('TryAgain'), onPress: () => refresh(true) }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={t('BudgetManagement')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
        rightAction={
          permissions.canEditBudget
            ? {
                icon: Plus,
                onPress: () => setShowAddModal(true),
                size: 32,
                variant: 'filled',
              }
            : undefined
        }
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={refreshTint}
            colors={[refreshTint]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-[20px]" style={{ paddingBottom: bottomGutter }}>
          {budget && (
            <View>
              <BudgetSummaryCard budget={budget} />
              {permissions.canEditBudget && (
                <TouchableOpacity
                  onPress={() => setShowEditBudgetModal(true)}
                  className="mx-xl mb-xl flex-row items-center justify-center gap-xs py-sm rounded-lg border bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                >
                  <Edit2 size={14} color={colors.text.primary} strokeWidth={2.5} />
                  <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                    {t('EditBudget')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <SegmentedToggle
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'categories', label: t('ViewByCategories') },
              { value: 'lineItems', label: t('ViewByLineItems') },
            ]}
            containerStyle={{ marginBottom: 20, paddingTop: 0, paddingBottom: 0 }}
            labelLetterSpacing={0.1}
          />

          <View className="px-xl">
            {viewMode === 'categories' ? (
              <CategoriesList
                categories={categories}
                lineItems={lineItems}
                formatCurrency={formatCurrency}
                onDeleteItem={permissions.canEditBudget ? handleDeleteItem : undefined}
                onFinalizeItem={permissions.canEditBudget ? handleFinalizeItem : undefined}
              />
            ) : (
              <LineItemsList
                lineItems={lineItems}
                formatCurrency={formatCurrency}
                onDelete={permissions.canEditBudget ? handleDeleteItem : undefined}
                onFinalize={permissions.canEditBudget ? handleFinalizeItem : undefined}
              />
            )}

            {lineItems.length === 0 && budget && (
              <View className="mt-2xl items-center py-2xl">
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-xs text-center">
                  {t('NoExpensesYet')}
                </Text>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center leading-relaxed">
                  {t('AddYourFirstExpense')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading && !refreshing} message={t('LoadingBudget')} transparent />

      {eventId && (
        <>
          <AddLineItemModal
            visible={showAddModal}
            eventId={eventId}
            categories={categories}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => refresh(true)}
          />
          <EditBudgetModal
            visible={showEditBudgetModal}
            eventId={eventId}
            budget={budget}
            onClose={() => setShowEditBudgetModal(false)}
            onSuccess={() => refresh(true)}
          />
        </>
      )}
    </View>
  );
}
