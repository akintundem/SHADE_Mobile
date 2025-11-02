import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, DollarSign, TrendingUp, TrendingDown, Filter, Download, ChevronRight, Zap } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { BudgetDTO, ExpenseDTO } from '../../types/budget';
import { dateUtils } from '../../utils/helpers';
import { DATE_FORMATS } from '../../utils/constants';

type Props = {
  eventId: string;
  onBack: () => void;
};

export default function BudgetScreen({ eventId, onBack }: Props) {
  const { colors, spacing, typography, borderRadius, brand, shadows } = useTheme();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Sample budget data
  const budget: BudgetDTO = useMemo(() => ({
    id: '1',
    eventId,
    totalBudget: 10000,
    spentAmount: 6500,
    remainingAmount: 3500,
    currency: 'USD',
    categories: [
      { name: 'Venue', budgeted: 3000, spent: 3000, remaining: 0 },
      { name: 'Catering', budgeted: 2500, spent: 1800, remaining: 700 },
      { name: 'Marketing', budgeted: 1500, spent: 1200, remaining: 300 },
      { name: 'Equipment', budgeted: 2000, spent: 500, remaining: 1500 },
      { name: 'Miscellaneous', budgeted: 1000, spent: 0, remaining: 1000 }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }), [eventId]);

  // Sample expenses
  const expenses: ExpenseDTO[] = useMemo(() => [
    {
      id: '1',
      budgetId: '1',
      category: 'Venue',
      description: 'Grand Ballroom rental',
      amount: 3000,
      currency: 'USD',
      date: '2024-01-10T00:00:00Z',
      vendor: 'Grand Ballroom Inc.',
      paymentMethod: 'CREDIT_CARD',
      status: 'PAID',
      receiptUrl: 'https://example.com/receipt1.pdf',
      notes: 'Deposit paid'
    },
    {
      id: '2',
      budgetId: '1',
      category: 'Catering',
      description: 'Catering service',
      amount: 1800,
      currency: 'USD',
      date: '2024-01-12T00:00:00Z',
      vendor: 'Elite Catering',
      paymentMethod: 'BANK_TRANSFER',
      status: 'PAID',
      receiptUrl: 'https://example.com/receipt2.pdf',
      notes: 'Full payment'
    },
    {
      id: '3',
      budgetId: '1',
      category: 'Marketing',
      description: 'Social media advertising',
      amount: 800,
      currency: 'USD',
      date: '2024-01-14T00:00:00Z',
      vendor: 'Digital Ads Co.',
      paymentMethod: 'CREDIT_CARD',
      status: 'PAID'
    },
    {
      id: '4',
      budgetId: '1',
      category: 'Marketing',
      description: 'Print materials',
      amount: 400,
      currency: 'USD',
      date: '2024-01-15T00:00:00Z',
      vendor: 'Print Shop',
      paymentMethod: 'CREDIT_CARD',
      status: 'PAID'
    },
    {
      id: '5',
      budgetId: '1',
      category: 'Equipment',
      description: 'Sound system rental',
      amount: 500,
      currency: 'USD',
      date: '2024-01-16T00:00:00Z',
      vendor: 'Audio Rentals',
      paymentMethod: 'CASH',
      status: 'PAID'
    }
  ], []);

  const filteredExpenses = useMemo(() => {
    if (filterCategory === 'all') return expenses;
    return expenses.filter(exp => exp.category === filterCategory);
  }, [expenses, filterCategory]);

  const totalSpent = budget.spentAmount;
  const totalBudget = budget.totalBudget;
  const remaining = budget.remainingAmount;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  const categories = ['all', ...budget.categories.map(c => c.name)];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      {/* Premium Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...shadows.md
      }}>
        <TouchableOpacity 
          onPress={onBack} 
          style={{ 
            width: 44,
            height: 44,
            borderRadius: borderRadius.full,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.sm
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.text.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            color: colors.text.primary,
            fontWeight: typography.weight.bold,
            fontSize: typography.size['2xl'],
            letterSpacing: -1,
            marginLeft: -44
          }}>
            Budget & Finance
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderRadius: borderRadius.full,
            backgroundColor: brand.primary,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.lg
          }}
          activeOpacity={0.8}
        >
          <Plus size={24} color={colors.text.inverse} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Budget Overview - Hero Card */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius['2xl'],
          padding: spacing['2xl'],
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.lg,
          overflow: 'hidden'
        }}>
          {/* Gradient Background Effect */}
          <View style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 200,
            height: 200,
            borderRadius: borderRadius.full,
            backgroundColor: brand.primary,
            opacity: 0.05
          }} />
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.xl }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                marginBottom: spacing.xs
              }}>
                Total Budget
              </Text>
              <Text style={{
                color: colors.text.primary,
                fontWeight: typography.weight.bold,
                fontSize: 42,
                letterSpacing: -1.5,
                lineHeight: 48
              }}>
                ${totalBudget.toLocaleString()}
              </Text>
            </View>
            <View style={{
              width: 72,
              height: 72,
              borderRadius: borderRadius.xl,
              backgroundColor: brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              ...shadows.lg
            }}>
              <DollarSign size={32} color={colors.text.inverse} strokeWidth={2.5} />
            </View>
          </View>

          {/* Enhanced Progress Bar */}
          <View style={{ 
            height: 14, 
            backgroundColor: colors.border, 
            borderRadius: borderRadius.full, 
            overflow: 'hidden',
            marginBottom: spacing.xl,
            ...shadows.sm
          }}>
            <View style={{
              width: `${Math.min(spentPercentage, 100)}%`,
              height: '100%',
              backgroundColor: spentPercentage > 80 ? colors.semantic.error : brand.primary,
              borderRadius: borderRadius.full,
              shadowColor: brand.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4
            }} />
          </View>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.xs,
            textAlign: 'right',
            marginTop: spacing.xs,
            fontWeight: typography.weight.semibold
          }}>
            {spentPercentage.toFixed(1)}% spent
          </Text>

          <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              backgroundColor: colors.background,
              borderRadius: borderRadius.xl,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.semantic.error,
                  ...shadows.sm
                }} />
                <Text style={{ 
                  color: colors.text.secondary, 
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.semibold
                }}>
                  Spent
                </Text>
              </View>
              <Text style={{
                color: colors.semantic.error,
                fontWeight: typography.weight.bold,
                fontSize: typography.size['2xl'],
                letterSpacing: -0.8
              }}>
                ${totalSpent.toLocaleString()}
              </Text>
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              backgroundColor: colors.background,
              borderRadius: borderRadius.xl,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: borderRadius.full,
                  backgroundColor: remaining > 0 ? colors.semantic.success : colors.semantic.error,
                  ...shadows.sm
                }} />
                <Text style={{ 
                  color: colors.text.secondary, 
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.semibold
                }}>
                  Remaining
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                {remaining > 0 ? (
                  <TrendingDown size={20} color={colors.semantic.success} strokeWidth={2.5} />
                ) : (
                  <TrendingUp size={20} color={colors.semantic.error} strokeWidth={2.5} />
                )}
                <Text style={{
                  color: remaining > 0 ? colors.semantic.success : colors.semantic.error,
                  fontWeight: typography.weight.bold,
                  fontSize: typography.size['2xl'],
                  letterSpacing: -0.8
                }}>
                  ${remaining.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Category Filter Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.xs }}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setFilterCategory(category)}
              style={{
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.full,
                backgroundColor: filterCategory === category ? brand.primary : colors.surface,
                borderWidth: filterCategory === category ? 0 : 1.5,
                borderColor: colors.border,
                ...(filterCategory === category ? shadows.lg : shadows.sm),
                minWidth: 100,
                alignItems: 'center'
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: filterCategory === category ? colors.text.inverse : colors.text.primary,
                fontWeight: typography.weight.bold,
                fontSize: typography.size.sm,
                letterSpacing: 0.5
              }}>
                {category === 'all' ? 'All' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Premium Category Breakdown */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius['2xl'],
          padding: spacing['2xl'],
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.lg
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }}>
            <Text style={{
              color: colors.text.primary,
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              letterSpacing: -1
            }}>
              Category Breakdown
            </Text>
            <View style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              backgroundColor: colors.background,
              borderRadius: borderRadius.full,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold
              }}>
                {budget.categories.length} categories
              </Text>
            </View>
          </View>

          <View style={{ gap: spacing.xl }}>
            {budget.categories.map((category, index) => {
              const categoryPercentage = category.budgeted > 0 ? (category.spent / category.budgeted) * 100 : 0;
              const isOverBudget = category.spent > category.budgeted;

              return (
                <View key={category.name} style={{ gap: spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: borderRadius.full,
                        backgroundColor: brand.primary
                      }} />
                      <Text style={{
                        color: colors.text.primary,
                        fontWeight: typography.weight.bold,
                        fontSize: typography.size.lg,
                        letterSpacing: -0.5
                      }}>
                        {category.name}
                      </Text>
                    </View>
                    <Text style={{ 
                      color: colors.text.secondary, 
                      fontSize: typography.size.sm,
                      fontWeight: typography.weight.semibold
                    }}>
                      ${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}
                    </Text>
                  </View>

                  <View style={{
                    height: 10,
                    backgroundColor: colors.border,
                    borderRadius: borderRadius.full,
                    overflow: 'hidden',
                    ...shadows.sm
                  }}>
                    <View style={{
                      width: `${Math.min(categoryPercentage, 100)}%`,
                      height: '100%',
                      backgroundColor: isOverBudget ? colors.semantic.error : brand.primary,
                      borderRadius: borderRadius.full
                    }} />
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{
                      color: colors.text.tertiary,
                      fontSize: typography.size.xs,
                      fontWeight: typography.weight.medium
                    }}>
                      {categoryPercentage.toFixed(1)}% spent
                    </Text>
                    <View style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                      backgroundColor: category.remaining > 0 ? colors.semantic.success + '15' : colors.semantic.error + '15',
                      borderRadius: borderRadius.full
                    }}>
                      <Text style={{
                        color: category.remaining > 0 ? colors.semantic.success : colors.semantic.error,
                        fontSize: typography.size.sm,
                        fontWeight: typography.weight.bold
                      }}>
                        ${category.remaining.toLocaleString()} remaining
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Premium Expenses List */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius['2xl'],
          padding: spacing['2xl'],
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.lg
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.xl
          }}>
            <Text style={{
              color: colors.text.primary,
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.bold,
              letterSpacing: -1
            }}>
              Recent Expenses
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity 
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  ...shadows.sm
                }}
                activeOpacity={0.7}
              >
                <Filter size={18} color={colors.text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  ...shadows.sm
                }}
                activeOpacity={0.7}
              >
                <Download size={18} color={colors.text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: spacing.md }}>
            {filteredExpenses.map((expense, index) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExpenseCard({ expense }: { expense: ExpenseDTO }) {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return colors.semantic.success;
      case 'PENDING':
        return colors.semantic.warning;
      case 'REJECTED':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <View style={{
      padding: spacing.lg,
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      borderWidth: 1.5,
      borderColor: colors.border,
      ...shadows.md
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: colors.text.primary,
            fontWeight: typography.weight.bold,
            fontSize: typography.size.lg,
            marginBottom: spacing.xs,
            letterSpacing: -0.5
          }}>
            {expense.description}
          </Text>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium
          }}>
            {expense.vendor || 'No vendor'}
          </Text>
        </View>
        <Text style={{
          color: colors.text.primary,
          fontWeight: typography.weight.bold,
          fontSize: typography.size['2xl'],
          letterSpacing: -1
        }}>
          ${expense.amount.toLocaleString()}
        </Text>
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <View style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <Text style={{ 
              color: colors.text.secondary, 
              fontSize: typography.size.xs, 
              fontWeight: typography.weight.semibold 
            }}>
              {expense.category}
            </Text>
          </View>
          <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>•</Text>
          <Text style={{ 
            color: colors.text.tertiary, 
            fontSize: typography.size.xs, 
            fontWeight: typography.weight.medium 
          }}>
            {dateUtils.formatDate(expense.date, DATE_FORMATS.SHORT_DATE)}
          </Text>
        </View>

        <View style={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: getStatusColor(expense.status) + '20',
          borderRadius: borderRadius.full,
          borderWidth: 1.5,
          borderColor: getStatusColor(expense.status) + '40'
        }}>
          <Text style={{
            color: getStatusColor(expense.status),
            fontSize: typography.size.xs,
            fontWeight: typography.weight.bold,
            textTransform: 'uppercase',
            letterSpacing: 0.8
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
          borderRadius: borderRadius.lg,
          borderLeftWidth: 3,
          borderLeftColor: brand.primary
        }}>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.xs,
            fontStyle: 'italic',
            lineHeight: 18
          }}>
            {expense.notes}
          </Text>
        </View>
      )}
    </View>
  );
}
