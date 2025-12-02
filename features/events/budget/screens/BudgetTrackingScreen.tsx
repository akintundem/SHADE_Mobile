import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { ArrowLeft, Plus, Filter, Download } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { BudgetDTO, ExpenseDTO } from '../../types/events';
import { useErrorHandler } from '../../../../common/hooks/useErrorHandler';
import ErrorModal from '../../../../common/components/common/ErrorModal';

type Props = { 
  eventId: string;
  onBack: () => void; 
  onAddExpense?: () => void;
};

export default function BudgetTrackingScreen({ eventId, onBack, onAddExpense }: Props) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy] = useState<'date' | 'amount' | 'category'>('date');
  
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { error, hideError } = useErrorHandler();

  // Sample budget data
  const budget: BudgetDTO = {
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
    updatedAt: '2024-01-15T10:00:00Z'
  };

  // Sample expenses data
  const expenses: ExpenseDTO[] = [
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
    }
  ];

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [filterCategory, sortBy]);

  const totalSpent = budget.spentAmount;
  const totalBudget = budget.totalBudget;
  const remaining = budget.remainingAmount;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ErrorModal
        visible={!!error}
        error={error}
        onClose={hideError}
      />
      
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
          Budget Tracking
        </Text>
        <TouchableOpacity 
          onPress={onAddExpense}
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
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Overview */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <Text style={{ 
            color: colors.text.primary,
            fontSize: typography.size.lg,
            fontWeight: '700',
            marginBottom: spacing.md
          }}>
            Budget Overview
          </Text>
          
          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text.secondary }}>Total Budget</Text>
              <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                ${totalBudget.toLocaleString()}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text.secondary }}>Spent</Text>
              <Text style={{ color: colors.semantic.error, fontWeight: '600' }}>
                ${totalSpent.toLocaleString()}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text.secondary }}>Remaining</Text>
              <Text style={{ 
                color: remaining > 0 ? colors.semantic.success : colors.semantic.error, 
                fontWeight: '600' 
              }}>
                ${remaining.toLocaleString()}
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View style={{ marginTop: spacing.sm }}>
              <View style={{
                height: 8,
                backgroundColor: colors.border,
                borderRadius: borderRadius.sm,
                overflow: 'hidden'
              }}>
                <View style={{
                  width: `${Math.min(spentPercentage, 100)}%`,
                  height: '100%',
                  backgroundColor: spentPercentage > 80 ? colors.semantic.error : colors.brand.primary,
                  borderRadius: borderRadius.sm
                }} />
              </View>
              <Text style={{ 
                color: colors.text.secondary,
                fontSize: 12,
                textAlign: 'right',
                marginTop: spacing.xs
              }}>
                {spentPercentage.toFixed(1)}% spent
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <Text style={{ 
            color: colors.text.primary,
            fontSize: typography.size.lg,
            fontWeight: '700',
            marginBottom: spacing.md
          }}>
            Category Breakdown
          </Text>
          
          <View style={{ gap: spacing.sm }}>
            {budget.categories.map(category => {
              const categoryPercentage = (category.spent / category.budgeted) * 100;
              const isOverBudget = category.spent > category.budgeted;
              
              return (
                <View key={category.name} style={{ gap: spacing.xs }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                      {category.name}
                    </Text>
                    <Text style={{ color: colors.text.secondary }}>
                      ${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={{
                    height: 6,
                    backgroundColor: colors.border,
                    borderRadius: borderRadius.sm,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      width: `${Math.min(categoryPercentage, 100)}%`,
                      height: '100%',
                      backgroundColor: isOverBudget ? colors.semantic.error : colors.brand.primary,
                      borderRadius: borderRadius.sm
                    }} />
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ 
                      color: colors.text.secondary,
                      fontSize: 12
                    }}>
                      {categoryPercentage.toFixed(1)}% spent
                    </Text>
                    <Text style={{ 
                      color: category.remaining > 0 ? colors.semantic.success : colors.semantic.error,
                      fontSize: 12,
                      fontWeight: '600'
                    }}>
                      ${category.remaining.toLocaleString()} remaining
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
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: spacing.md
          }}>
            <Text style={{ 
              color: colors.text.primary,
              fontSize: typography.size.lg,
              fontWeight: '700'
            }}>
              Recent Expenses
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity style={{
                padding: spacing.sm,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.sm,
                borderWidth: 1,
                borderColor: colors.border
              }}>
                <Filter size={16} color={colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={{
                padding: spacing.sm,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.sm,
                borderWidth: 1,
                borderColor: colors.border
              }}>
                <Download size={16} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ gap: spacing.sm }}>
            {filteredExpenses.map(expense => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExpenseCard({ expense }: { expense: ExpenseDTO }) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return colors.semantic.success;
      case 'PENDING':
        return colors.semantic.warning;
      case 'CANCELLED':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
        return '💳';
      case 'BANK_TRANSFER':
        return '🏦';
      case 'CASH':
        return '💵';
      default:
        return '💰';
    }
  };

  return (
    <View style={{
      padding: spacing.md,
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: colors.text.primary,
            fontWeight: '600',
            fontSize: 16
          }}>
            {expense.description}
          </Text>
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: 14
          }}>
            {expense.vendor}
          </Text>
        </View>
        <Text style={{ 
          color: colors.text.primary,
          fontWeight: '700',
          fontSize: 16
        }}>
          ${expense.amount.toLocaleString()}
        </Text>
      </View>
      
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: spacing.sm
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: 12
          }}>
            {expense.category}
          </Text>
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: 12
          }}>
            •
          </Text>
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: 12
          }}>
            {getPaymentMethodIcon(expense.paymentMethod)}
          </Text>
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: 12
          }}>
            {new Date(expense.date).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={{
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          backgroundColor: getStatusColor(expense.status) + '20',
          borderRadius: borderRadius.sm
        }}>
          <Text style={{ 
            color: getStatusColor(expense.status),
            fontSize: 12,
            fontWeight: '600'
          }}>
            {expense.status}
          </Text>
        </View>
      </View>
      
      {expense.notes && (
        <Text style={{ 
          color: colors.text.tertiary,
          fontSize: 12,
          marginTop: spacing.xs,
          fontStyle: 'italic'
        }}>
          {expense.notes}
        </Text>
      )}
    </View>
  );
}
