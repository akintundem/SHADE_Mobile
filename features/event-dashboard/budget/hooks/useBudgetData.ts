import { useCallback, useMemo } from 'react';
import { budgetService } from '../../../../core/budget/services/budget';
import type {
  BudgetCategoryResponse,
  BudgetDetailResponse,
  BudgetLineItemResponse,
} from '../../../../core/budget/types/budget';
import { CACHE_CONFIG } from '../../../../common/utils/constants';
import { useCachedResource } from '../../hooks';

type BudgetData = {
  budget: BudgetDetailResponse | null;
  categories: BudgetCategoryResponse[];
  lineItems: BudgetLineItemResponse[];
};

export function useBudgetData(eventId: string | null) {
  const key = eventId ? `budget:${eventId}` : null;

  const fetcher = useCallback(async (): Promise<BudgetData> => {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    const budget = await budgetService.getBudget(eventId);
    const [categoriesResult, lineItemsResult] = await Promise.allSettled([
      budgetService.getCategories(eventId),
      budgetService.getLineItems(eventId),
    ]);

    return {
      budget,
      categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value ?? [] : [],
      lineItems: lineItemsResult.status === 'fulfilled' ? lineItemsResult.value ?? [] : [],
    };
  }, [eventId]);

  const { data, loading, error, refresh, setData } = useCachedResource<BudgetData>({
    key,
    fetcher,
    ttlMs: CACHE_CONFIG.EVENTS_CACHE_DURATION,
    enabled: Boolean(eventId),
    initialData: null,
  });

  const budget = data?.budget ?? null;
  const categories = useMemo(() => data?.categories ?? [], [data?.categories]);
  const lineItems = useMemo(() => data?.lineItems ?? [], [data?.lineItems]);

  const updateLineItems = useCallback(
    (nextItems: BudgetLineItemResponse[]) => {
      if (!data) return;
      setData({ ...data, lineItems: nextItems });
    },
    [data, setData]
  );

  const updateCategories = useCallback(
    (nextCategories: BudgetCategoryResponse[]) => {
      if (!data) return;
      setData({ ...data, categories: nextCategories });
    },
    [data, setData]
  );

  const memo = useMemo(
    () => ({
      budget,
      categories,
      lineItems,
      loading,
      error,
      refresh,
      setData,
      updateLineItems,
      updateCategories,
    }),
    [
      budget,
      categories,
      lineItems,
      loading,
      error,
      refresh,
      setData,
      updateLineItems,
      updateCategories,
    ]
  );

  return memo;
}
