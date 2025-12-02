import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, Clock, AlertTriangle, User, Calendar, Tag, Play, Pause } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { TaskCardDTO } from '../../types/assistant';

interface TaskCardProps {
  task: TaskCardDTO;
  onComplete?: (id: string) => void;
  onStart?: (id: string) => void;
  onPause?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export default function TaskCard({ 
  task, 
  onComplete, 
  onStart, 
  onPause, 
  onViewDetails 
}: TaskCardProps) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.semantic.success;
      case 'in_progress':
        return colors.semantic.warning;
      case 'cancelled':
        return colors.semantic.error;
      case 'pending':
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
      case 'cancelled':
        return <AlertTriangle size={16} color={colors.semantic.error} />;
      case 'pending':
        return <Clock size={16} color={colors.text.secondary} />;
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
            {task.title}
          </Text>
          <Text style={{
            color: colors.text.secondary,
            fontSize: typography.size.base,
            lineHeight: typography.lineHeight.normal * typography.size.base,
          }}>
            {task.description}
          </Text>
        </View>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs
        }}>
          {getStatusIcon(task.status)}
          <Text style={{
            color: getStatusColor(task.status),
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            textTransform: 'capitalize'
          }}>
            {task.status.replace('_', ' ')}
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
            {task.progress}%
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
            width: `${task.progress}%`,
            backgroundColor: getStatusColor(task.status),
            borderRadius: borderRadius.sm
          }} />
        </View>
      </View>

      {/* Priority and Category */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md
      }}>
        {getPriorityIcon(task.priority) && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs
          }}>
            {getPriorityIcon(task.priority)}
            <Text style={{
              color: getPriorityColor(task.priority),
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
              textTransform: 'capitalize'
            }}>
              {task.priority}
            </Text>
          </View>
        )}
        
        <View style={{
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: borderRadius.sm
        }}>
          <Text style={{
            color: colors.text.tertiary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium,
            textTransform: 'capitalize'
          }}>
            {task.category}
          </Text>
        </View>
      </View>

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
          Assigned to: {task.assignedTo}
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
          Due: {formatDate(task.dueDate)}
        </Text>
      </View>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.xs,
          marginBottom: spacing.sm
        }}>
          {task.tags.map((tag, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                backgroundColor: colors.brand.primaryLight,
                borderRadius: borderRadius.sm
              }}
            >
              <Tag size={12} color={colors.brand.primary} />
              <Text style={{
                color: colors.brand.primary,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold
              }}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Dependencies */}
      {task.dependencies && task.dependencies.length > 0 && (
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
            {task.dependencies.join(', ')}
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
          onPress={() => onViewDetails?.(task.id)}
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

        {task.status === 'pending' && (
          <TouchableOpacity
            onPress={() => onStart?.(task.id)}
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

        {task.status === 'in_progress' && (
          <TouchableOpacity
            onPress={() => onPause?.(task.id)}
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
            <Pause size={16} color={colors.semantic.warning} />
            <Text style={{
              color: colors.semantic.warning,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold
            }}>
              Pause
            </Text>
          </TouchableOpacity>
        )}

        {task.status === 'in_progress' && (
          <TouchableOpacity
            onPress={() => onComplete?.(task.id)}
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