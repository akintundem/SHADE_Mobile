import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DollarSign, CheckCircle, XCircle, Clock, User, Calendar, Receipt } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { BudgetCardDTO } from '../../../../shared/types';

interface BudgetCardProps {
  budget: BudgetCardDTO;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export default function BudgetCard({ 
  budget, 
  onApprove, 
  onReject, 
  onViewDetails 
}: BudgetCardProps) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.semantic.success;
      case 'rejected':
        return colors.semantic.error;
      case 'pending':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} color={colors.semantic.success} />;
      case 'rejected':
        return <XCircle size={16} color={colors.semantic.error} />;
      case 'pending':
        return <Clock size={16} color={colors.semantic.warning} />;
      default:
        return <Clock size={16} color={colors.text.secondary} />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={{
      backgroundColor: colors.surfaceElevated,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginVertical: spacing.sm,
      ...shadows.sm,
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.size.lg,
            fontWeight: typography.weight.bold,
            marginBottom: spacing.xs
          }}>
            {budget.description}
          </Text>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.base,
            lineHeight: typography.lineHeight.normal * typography.size.base,
          }}>
            {budget.category}
          </Text>
        </View>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs
        }}>
          {getStatusIcon(budget.status)}
          <Text style={{
            color: getStatusColor(budget.status),
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            textTransform: 'capitalize'
          }}>
            {budget.status}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <View style={{
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md
      }}>
        <Text style={{
          color: colors.text.primary,
          fontSize: typography.size['2xl'],
          fontWeight: typography.weight.bold,
          textAlign: 'center'
        }}>
          {formatCurrency(budget.amount, budget.currency)}
        </Text>
      </View>

      {/* Vendor and Date */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm
      }}>
        <User size={16} color={colors.text.secondary} />
        <Text style={{
          color: colors.text.secondary,
          fontSize: typography.size.sm
        }}>
          {budget.vendor}
        </Text>
      </View>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm
      }}>
        <Calendar size={16} color={colors.text.secondary} />
        <Text style={{
          color: colors.text.secondary,
          fontSize: typography.size.sm
        }}>
          {formatDate(budget.date)}
        </Text>
      </View>

      {/* Receipt */}
      {budget.receiptUrl && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.sm
        }}>
          <Receipt size={16} color={colors.text.secondary} />
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm
          }}>
            Receipt attached
          </Text>
        </View>
      )}

      {/* Approved By */}
      {budget.approvedBy && (
        <View style={{
          backgroundColor: colors.surface,
          padding: spacing.sm,
          borderRadius: borderRadius.md,
          marginBottom: spacing.md
        }}>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            marginBottom: spacing.xs
          }}>
            Approved by:
          </Text>
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.size.sm
          }}>
            {budget.approvedBy}
          </Text>
        </View>
      )}

      {/* Actions */}
      {budget.status === 'pending' && (
        <View style={{
          flexDirection: 'row',
          gap: spacing.sm,
          justifyContent: 'flex-end'
        }}>
          <TouchableOpacity
            onPress={() => onViewDetails?.(budget.id)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.border
            }}
          >
            <Text style={{
              color: colors.text.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              View Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => onReject?.(budget.id)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.semantic.errorLight,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.semantic.error
            }}
          >
            <Text style={{
              color: colors.semantic.error,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              Reject
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => onApprove?.(budget.id)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.semantic.success,
              borderRadius: borderRadius.lg,
              ...shadows.sm
            }}
          >
            <Text style={{
              color: colors.text.inverse,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              Approve
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
