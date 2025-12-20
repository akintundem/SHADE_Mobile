import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, DollarSign, Filter, Download } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { BudgetDTO, ExpenseDTO } from '../../budget/types/budget';
import { budgetService } from '../../budget/services/budgetService';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { ErrorHandler } from '../../../../common/utils/errorHandler';

type Props = {
  eventId: string;
  onBack: () => void;
};

export default function BudgetScreen({ eventId, onBack }: Props) {
  const { colors, spacing, typography, borderRadius, brand, shadows } = useTheme();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [budget, setBudget] = useState<BudgetDTO | null>(null);
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBudgetData = useCallback(async () => {
    try {
      const summary = await budgetService.getBudgetSummary('mock-budget-1');
      
      // Convert summary to BudgetDTO
      const budgetDto: BudgetDTO = {
        id: '1',
        eventId,
        totalBudget: summary.totalBudget,
        spentAmount: summary.spentAmount,
        remainingAmount: summary.remainingAmount,
        currency: 'USD',
        categories: summary.categoryBreakdown.map((cat: any) => ({
          name: cat.categoryName,
          budgeted: cat.allocatedAmount,
          spent: cat.spentAmount,
          remaining: cat.remainingAmount
        }))
      };
      
      setBudget(budgetDto);
      
      // Map recent expenses to ExpenseDTO
      const expenseDtos: ExpenseDTO[] = summary.recentExpenses.map((exp: any) => ({
        id: exp.id,
        budgetId: '1',
        category: summary.categoryBreakdown.find((c: any) => c.categoryId === exp.categoryId)?.categoryName || 'General',
        description: exp.description,
        amount: exp.amount,
        currency: 'USD',
        date: exp.date,
        vendor: exp.vendor,
        paymentMethod: 'CREDIT_CARD',
        status: exp.status === 'approved' ? 'APPROVED' : (exp.status === 'rejected' ? 'REJECTED' : 'PAID')
      }));
      
      setExpenses(expenseDtos);
    } catch (error) {
      ErrorHandler.handle(error, 'fetchBudgetData');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBudgetData();
  }, [fetchBudgetData]);

  const filteredExpenses = useMemo(() => {
    if (filterCategory === 'all') return expenses;
    return expenses.filter(exp => exp.category === filterCategory);
  }, [expenses, filterCategory]);

  if (isLoading || !budget) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={brand.primary} />
      </View>
    );
  }

  const totalSpent = budget.spentAmount;
  const totalBudget = budget.totalBudget;
  const remaining = budget.remainingAmount;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  const categories = ['all', ...budget.categories.map(c => c.name)];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg, 
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <TouchableOpacity onPress={onBack} style={{ padding: spacing.sm }}>
          <ArrowLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{
          color: colors.text.primary,
          fontWeight: '700',
          fontSize: typography.size.lg
        }}>
          Budget
        </Text>
        <TouchableOpacity
          style={{
            padding: spacing.sm,
            backgroundColor: brand.primary,
            borderRadius: borderRadius.md
          }}
        >
          <Plus size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.primary} />
        }
      >
        {/* Credit Card Style Total Budget */}
        <View style={{
          backgroundColor: '#000000',
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          ...shadows.lg,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Decorative circles for credit card effect */}
          <View style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }} />
          <View style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 250,
            height: 250,
            borderRadius: 125,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }} />
          
          <View style={{ position: 'relative', zIndex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }}>
              <View style={{ flex: 1 }}>
              <Text style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                fontSize: typography.size.sm,
                fontWeight: typography.weight.medium,
                  marginBottom: spacing.xs,
                  letterSpacing: 1,
              }}>
                  TOTAL BUDGET
              </Text>
              <Text style={{
                  color: '#FFFFFF',
                fontWeight: typography.weight.bold,
                fontSize: typography.size['3xl'],
                letterSpacing: -1
              }}>
                ${totalBudget.toLocaleString()}
              </Text>
            </View>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: borderRadius.lg,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
                <DollarSign size={28} color="#FFFFFF" />
            </View>
          </View>

            {/* Progress Bar */}
          <View style={{ 
            height: 8, 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: borderRadius.sm, 
            overflow: 'hidden',
            marginBottom: spacing.md,
          }}>
            <View style={{
              width: `${Math.min(spentPercentage, 100)}%`,
              height: '100%',
                backgroundColor: '#FFFFFF',
              borderRadius: borderRadius.sm,
            }} />
          </View>
          
          <Text style={{
              color: 'rgba(255, 255, 255, 0.7)',
            fontSize: typography.size.xs,
            textAlign: 'right',
            marginBottom: spacing.lg,
          }}>
            {spentPercentage.toFixed(1)}% spent
          </Text>

          <View style={{ 
            flexDirection: 'row', 
            gap: spacing.md,
          }}>
            <View style={{ 
              flex: 1,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: borderRadius.lg,
              alignItems: 'center',
            }}>
              <Text style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: typography.size.xs,
                marginBottom: spacing.xs,
              }}>
                Spent
              </Text>
              <Text style={{
                  color: '#FFFFFF',
                fontWeight: typography.weight.bold,
                fontSize: typography.size.lg,
              }}>
                ${totalSpent.toLocaleString()}
              </Text>
            </View>

            <View style={{ 
              flex: 1,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: borderRadius.lg,
              alignItems: 'center',
            }}>
              <Text style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: typography.size.xs,
                marginBottom: spacing.xs,
              }}>
                Remaining
              </Text>
              <Text style={{
                  color: '#FFFFFF',
                fontWeight: typography.weight.bold,
                fontSize: typography.size.lg,
              }}>
                ${remaining.toLocaleString()}
              </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setFilterCategory(category)}
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.lg,
                backgroundColor: filterCategory === category ? brand.primary : colors.surface,
                borderWidth: 1,
                borderColor: filterCategory === category ? brand.primary : colors.border,
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: filterCategory === category ? colors.text.inverse : colors.text.primary,
                fontWeight: typography.weight.semibold,
                fontSize: typography.size.sm,
              }}>
                {category === 'all' ? 'All' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Breakdown */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.size.lg,
            fontWeight: typography.weight.bold,
            marginBottom: spacing.lg,
          }}>
            Categories
          </Text>

          <View style={{ gap: spacing.lg }}>
            {budget.categories.map((category) => {
              const categoryPercentage = category.budgeted > 0 ? (category.spent / category.budgeted) * 100 : 0;

              return (
                <View key={category.name}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                    <Text style={{
                      color: colors.text.primary,
                      fontWeight: typography.weight.semibold,
                      fontSize: typography.size.base,
                    }}>
                      {category.name}
                    </Text>
                    <Text style={{ 
                      color: colors.text.secondary, 
                      fontSize: typography.size.sm,
                    }}>
                      ${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}
                    </Text>
                  </View>

                  <View style={{
                    height: 6,
                    backgroundColor: colors.background,
                    borderRadius: borderRadius.sm,
                    overflow: 'hidden',
                    marginBottom: spacing.sm,
                  }}>
                    <View style={{
                      width: `${Math.min(categoryPercentage, 100)}%`,
                      height: '100%',
                      backgroundColor: brand.primary,
                      borderRadius: borderRadius.sm
                    }} />
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{
                      color: colors.text.tertiary,
                      fontSize: typography.size.xs,
                    }}>
                      {categoryPercentage.toFixed(1)}% used
                    </Text>
                    <Text style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.xs,
                      fontWeight: typography.weight.semibold,
                    }}>
                      ${category.remaining.toLocaleString()} left
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Expenses List */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg
          }}>
            <Text style={{
              color: colors.text.primary,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.bold,
            }}>
              Recent Expenses
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity 
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity={0.7}
              >
                <Filter size={16} color={colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity={0.7}
              >
                <Download size={16} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            {filteredExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExpenseCard({ expense }: { expense: ExpenseDTO }) {
  const { colors, typography, spacing, borderRadius, brand } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return brand.primary;
      case 'PENDING':
        return colors.text.secondary;
      case 'REJECTED':
        return colors.text.tertiary;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <View style={{
      padding: spacing.lg,
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: colors.text.primary,
            fontWeight: typography.weight.semibold,
            fontSize: typography.size.base,
            marginBottom: spacing.xs,
          }}>
            {expense.description}
          </Text>
          {expense.vendor && (
            <Text style={{
              color: colors.text.secondary,
              fontSize: typography.size.sm,
            }}>
              {expense.vendor}
            </Text>
          )}
        </View>
        <Text style={{
          color: colors.text.primary,
          fontWeight: typography.weight.bold,
          fontSize: typography.size.lg,
        }}>
          ${expense.amount.toLocaleString()}
        </Text>
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.sm,
          }}>
            <Text style={{ 
              color: colors.text.secondary, 
              fontSize: typography.size.xs, 
            }}>
              {expense.category}
            </Text>
          </View>
          <Text style={{ 
            color: colors.text.tertiary, 
            fontSize: typography.size.xs, 
          }}>
            {dateUtils.formatDate(expense.date, DATE_FORMATS.DISPLAY_DATE)}
          </Text>
        </View>

        <View style={{
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          backgroundColor: getStatusColor(expense.status) + '20',
          borderRadius: borderRadius.sm,
        }}>
          <Text style={{
            color: getStatusColor(expense.status),
            fontSize: typography.size.xs,
            fontWeight: typography.weight.semibold,
          }}>
            {expense.status}
          </Text>
        </View>
      </View>

      {expense.notes && (
        <View style={{
          marginTop: spacing.md,
          padding: spacing.md,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.sm,
        }}>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.xs,
            fontStyle: 'italic',
          }}>
            {expense.notes}
          </Text>
        </View>
      )}
    </View>
  );
}
