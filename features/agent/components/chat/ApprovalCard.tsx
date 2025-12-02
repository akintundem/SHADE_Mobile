import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, Clock, AlertTriangle, User, Calendar, Paperclip } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { ApprovalCardDTO } from '../../types/assistant';

interface ApprovalCardProps {
  approval: ApprovalCardDTO;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export default function ApprovalCard({ 
  approval, 
  onApprove, 
  onReject, 
  onViewDetails 
}: ApprovalCardProps) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return colors.semantic.error;
      case 'high':
        return colors.semantic.warning;
      case 'medium':
        return colors.brand.primary;
      case 'low':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle size={16} color={colors.semantic.error} />;
      case 'high':
        return <AlertTriangle size={16} color={colors.semantic.warning} />;
      default:
        return null;
    }
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
            {approval.title}
          </Text>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.base,
            lineHeight: typography.lineHeight.normal * typography.size.base,
          }}>
            {approval.description}
          </Text>
        </View>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs
        }}>
          {getStatusIcon(approval.status)}
          <Text style={{
            color: getStatusColor(approval.status),
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            textTransform: 'capitalize'
          }}>
            {approval.status}
          </Text>
        </View>
      </View>

      {/* Priority and Category */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md
      }}>
        {getPriorityIcon(approval.priority) && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs
          }}>
            {getPriorityIcon(approval.priority)}
            <Text style={{
              color: getPriorityColor(approval.priority),
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
              textTransform: 'capitalize'
            }}>
              {approval.priority}
            </Text>
          </View>
        )}
        
        <View style={{
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: borderRadius.md
        }}>
          <Text style={{
            color: colors.text.tertiary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium,
            textTransform: 'capitalize'
          }}>
            {approval.category}
          </Text>
        </View>
      </View>

      {/* Approver Info */}
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
          {approval.approverName}
        </Text>
        <Text style={{
          color: colors.text.tertiary,
          fontSize: typography.size.sm
        }}>
          ({approval.approverEmail})
        </Text>
      </View>

      {/* Due Date */}
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
          Due: {formatDate(approval.dueDate)}
        </Text>
      </View>

      {/* Attachments */}
      {approval.attachments && approval.attachments.length > 0 && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.sm
        }}>
          <Paperclip size={16} color={colors.text.secondary} />
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm
          }}>
            {approval.attachments.length} attachment(s)
          </Text>
        </View>
      )}

      {/* Comments */}
      {approval.comments && (
        <View style={{
          backgroundColor: colors.surface,
          padding: spacing.md,
          borderRadius: borderRadius.md,
          marginBottom: spacing.md
        }}>
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.size.sm,
            fontStyle: 'italic',
            lineHeight: typography.lineHeight.normal * typography.size.sm
          }}>
            "{approval.comments}"
          </Text>
        </View>
      )}

      {/* Actions */}
      {approval.status === 'pending' && (
        <View style={{
          flexDirection: 'row',
          gap: spacing.sm,
          justifyContent: 'flex-end'
        }}>
          <TouchableOpacity
            onPress={() => onViewDetails?.(approval.id)}
            style={{
              paddingHorizontal: spacing.lg,
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
            onPress={() => onReject?.(approval.id)}
            style={{
              paddingHorizontal: spacing.lg,
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
            onPress={() => onApprove?.(approval.id)}
            style={{
              paddingHorizontal: spacing.lg,
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