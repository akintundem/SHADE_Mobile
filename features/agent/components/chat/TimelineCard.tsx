import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Clock, CheckCircle, Play, AlertTriangle, User } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { TimelineCardDTO } from '../../types/assistant';

interface TimelineCardProps {
  timeline: TimelineCardDTO;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export default function TimelineCard({ 
  timeline, 
  onStart, 
  onComplete, 
  onViewDetails 
}: TimelineCardProps) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.semantic.success;
      case 'in_progress':
        return colors.semantic.warning;
      case 'delayed':
        return colors.semantic.error;
      case 'scheduled':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color={colors.semantic.success} />;
      case 'in_progress':
        return <Play size={16} color={colors.semantic.warning} />;
      case 'delayed':
        return <AlertTriangle size={16} color={colors.semantic.error} />;
      case 'scheduled':
        return <Clock size={16} color={colors.text.secondary} />;
      default:
        return <Clock size={16} color={colors.text.secondary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
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
      case 'critical':
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
            {timeline.title}
          </Text>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.base,
            lineHeight: typography.lineHeight.normal * typography.size.base,
          }}>
            {timeline.description}
          </Text>
        </View>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs
        }}>
          {getStatusIcon(timeline.status)}
          <Text style={{
            color: getStatusColor(timeline.status),
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            textTransform: 'capitalize'
          }}>
            {timeline.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{ marginBottom: spacing.md }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xs
        }}>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold
          }}>
            Progress
          </Text>
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold
          }}>
            {timeline.progress}%
          </Text>
        </View>
        <View style={{
          height: 6,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.sm,
          overflow: 'hidden'
        }}>
          <View style={{
            height: '100%',
            width: `${timeline.progress}%`,
            backgroundColor: getStatusColor(timeline.status),
            borderRadius: borderRadius.sm
          }} />
        </View>
      </View>

      {/* Priority */}
      {getPriorityIcon(timeline.priority) && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          marginBottom: spacing.sm
        }}>
          {getPriorityIcon(timeline.priority)}
          <Text style={{
            color: getPriorityColor(timeline.priority),
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            textTransform: 'capitalize'
          }}>
            {timeline.priority}
          </Text>
        </View>
      )}

      {/* Assigned To */}
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
          Assigned to: {timeline.assignedTo}
        </Text>
      </View>

      {/* Date Range */}
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
          {formatDate(timeline.startDate)} - {formatDate(timeline.endDate)}
        </Text>
      </View>

      {/* Dependencies */}
      {timeline.dependencies && timeline.dependencies.length > 0 && (
        <View style={{
          backgroundColor: colors.surface,
          padding: spacing.md,
          borderRadius: borderRadius.md,
          marginBottom: spacing.md
        }}>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            marginBottom: spacing.xs
          }}>
            Dependencies:
          </Text>
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.size.sm
          }}>
            {timeline.dependencies.join(', ')}
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
          onPress={() => onViewDetails?.(timeline.id)}
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

        {timeline.status === 'scheduled' && (
          <TouchableOpacity
            onPress={() => onStart?.(timeline.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.semantic.warning,
              borderRadius: borderRadius.lg,
              ...shadows.sm
            }}
          >
            <Play size={16} color={colors.text.inverse} />
            <Text style={{
              color: colors.text.inverse,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              Start
            </Text>
          </TouchableOpacity>
        )}

        {timeline.status === 'in_progress' && (
          <TouchableOpacity
            onPress={() => onComplete?.(timeline.id)}
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
            <CheckCircle size={16} color={colors.text.inverse} />
            <Text style={{
              color: colors.text.inverse,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              Complete
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
