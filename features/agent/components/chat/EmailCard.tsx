import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mail, Send, Clock, CheckCircle, XCircle, Paperclip, Eye, Edit } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { EmailCardDTO } from '../../types/events';

interface EmailCardProps {
  email: EmailCardDTO;
  onSend?: (id: string) => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onSchedule?: (id: string) => void;
}

export default function EmailCard({ 
  email, 
  onSend, 
  onEdit, 
  onView, 
  onSchedule 
}: EmailCardProps) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return colors.semantic.success;
      case 'failed':
        return colors.semantic.error;
      case 'scheduled':
        return colors.semantic.warning;
      case 'draft':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={16} color={colors.semantic.success} />;
      case 'failed':
        return <XCircle size={16} color={colors.semantic.error} />;
      case 'scheduled':
        return <Clock size={16} color={colors.semantic.warning} />;
      case 'draft':
        return <Edit size={16} color={colors.text.secondary} />;
      default:
        return <Mail size={16} color={colors.text.secondary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.semantic.error;
      case 'normal':
        return colors.brand.primary;
      case 'low':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            {email.subject}
          </Text>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm
          }}>
            To: {email.toName} ({email.toEmail})
          </Text>
        </View>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs
        }}>
          {getStatusIcon(email.status)}
          <Text style={{
            color: getStatusColor(email.status),
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            textTransform: 'capitalize'
          }}>
            {email.status}
          </Text>
        </View>
      </View>

      {/* Preview */}
      <View style={{
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md
      }}>
        <Text style={{
          color: colors.text.secondary,
          fontSize: typography.size.sm,
          lineHeight: typography.lineHeight.normal * typography.size.sm
        }}>
          {email.preview}
        </Text>
      </View>

      {/* Template Type and Priority */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md
      }}>
        <View style={{
          backgroundColor: colors.brand.primaryLight,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: borderRadius.sm
        }}>
          <Text style={{
            color: colors.brand.primary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            textTransform: 'capitalize'
          }}>
            {email.templateType}
          </Text>
        </View>
        
        <View style={{
          backgroundColor: getPriorityColor(email.priority) + '20',
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: borderRadius.sm
        }}>
          <Text style={{
            color: getPriorityColor(email.priority),
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            textTransform: 'capitalize'
          }}>
            {email.priority}
          </Text>
        </View>
      </View>

      {/* Timing Info */}
      {email.scheduledAt && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.sm
        }}>
          <Clock size={16} color={colors.text.secondary} />
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm
          }}>
            Scheduled: {formatDate(email.scheduledAt)}
          </Text>
        </View>
      )}

      {email.sentAt && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.sm
        }}>
          <Send size={16} color={colors.text.secondary} />
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm
          }}>
            Sent: {formatDate(email.sentAt)}
          </Text>
        </View>
      )}

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
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
            {email.attachments.length} attachment(s)
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={{
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'flex-end'
      }}>
        <TouchableOpacity
          onPress={() => onView?.(email.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <Eye size={16} color={colors.text.primary} />
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold
          }}>
            View
          </Text>
        </TouchableOpacity>

        {email.status === 'draft' && (
          <TouchableOpacity
            onPress={() => onEdit?.(email.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.brand.primaryLight,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.brand.primary
            }}
          >
            <Edit size={16} color={colors.brand.primary} />
            <Text style={{
              color: colors.brand.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              Edit
            </Text>
          </TouchableOpacity>
        )}

        {email.status === 'draft' && (
          <TouchableOpacity
            onPress={() => onSchedule?.(email.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.semantic.warningLight,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.semantic.warning
            }}
          >
            <Clock size={16} color={colors.semantic.warning} />
            <Text style={{
              color: colors.semantic.warning,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              Schedule
            </Text>
          </TouchableOpacity>
        )}

        {email.status === 'draft' && (
          <TouchableOpacity
            onPress={() => onSend?.(email.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.semantic.success,
              borderRadius: borderRadius.lg,
              ...shadows.sm
            }}
          >
            <Send size={16} color={colors.text.inverse} />
            <Text style={{
              color: colors.text.inverse,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              Send
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}