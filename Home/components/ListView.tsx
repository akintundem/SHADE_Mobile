import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, User, CheckCircle, Circle, Clock, ChevronRight, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { TaskDTO } from '../../types/timeline';

type Props = {
  tasks: TaskDTO[];
  filterStatus: 'all' | 'to_do' | 'active' | 'done';
  onFilterChange: (filter: 'all' | 'to_do' | 'active' | 'done') => void;
  onTaskPress?: (task: TaskDTO) => void;
};

export default function ListView({ tasks, filterStatus, onFilterChange, onTaskPress }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [expandedTasks, setExpandedTasks] = React.useState<Set<string>>(new Set());

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    switch (filterStatus) {
      case 'to_do':
        return tasks.filter(t => t.status === 'PENDING');
      case 'active':
        return tasks.filter(t => t.status === 'IN_PROGRESS');
      case 'done':
        return tasks.filter(t => t.status === 'COMPLETED');
      default:
        return tasks;
    }
  }, [tasks, filterStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={18} color="#22c55e" />;
      case 'IN_PROGRESS':
        return <Clock size={18} color="#f59e0b" />;
      case 'PENDING':
        return <Circle size={18} color={colors.text.secondary} />;
      default:
        return <Circle size={18} color={colors.text.secondary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '#ef4444';
      case 'MEDIUM':
        return '#f59e0b';
      case 'LOW':
        return '#22c55e';
      default:
        return colors.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getTaskProgress = (task: TaskDTO) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(st => st.status === 'COMPLETED').length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      showsVerticalScrollIndicator={false}
    >
      {filteredTasks.map((task) => {
        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
        const isExpanded = expandedTasks.has(task.id);
        const progress = getTaskProgress(task);
        const completedSubtasks = hasSubtasks ? task.subtasks!.filter(st => st.status === 'COMPLETED').length : 0;
        
        return (
          <View key={task.id}>
            <TouchableOpacity
              onPress={() => onTaskPress?.(task)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                gap: spacing.md
              }}
              activeOpacity={0.7}
            >
              {/* Main Task Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.size.lg,
                    fontWeight: typography.weight.semibold,
                    color: task.status === 'COMPLETED' ? colors.text.secondary : colors.text.primary,
                    textDecorationLine: task.status === 'COMPLETED' ? 'line-through' : 'none',
                    marginBottom: spacing.xs
                  }}>
                    {task.title}
                  </Text>
                  <Text style={{
                    fontSize: typography.size.sm,
                    color: colors.text.secondary
                  }}>
                    {task.description}
                  </Text>
                </View>
                <View style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  backgroundColor: getPriorityColor(task.priority) + '20',
                  borderRadius: borderRadius.sm,
                  borderWidth: 1,
                  borderColor: getPriorityColor(task.priority)
                }}>
                  <Text style={{
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.medium,
                    color: getPriorityColor(task.priority)
                  }}>
                    {task.priority}
                  </Text>
                </View>
              </View>

              {/* Task Details */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Calendar size={16} color={colors.text.tertiary} />
                  <Text style={{
                    fontSize: typography.size.sm,
                    color: colors.text.secondary
                  }}>
                    {formatDate(task.dueDate)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <User size={16} color={colors.text.tertiary} />
                  <Text style={{
                    fontSize: typography.size.sm,
                    color: colors.text.secondary
                  }}>
                    {task.assignedTo}
                  </Text>
                </View>
              </View>

              {/* Status & Progress */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  {getStatusIcon(task.status)}
                  <Text style={{
                    fontSize: typography.size.sm,
                    color: colors.text.secondary,
                    textTransform: 'capitalize'
                  }}>
                    {task.status.toLowerCase().replace('_', ' ')}
                  </Text>
                </View>

                {/* Subtask Summary */}
                {hasSubtasks && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Text style={{
                      fontSize: typography.size.xs,
                      color: colors.text.tertiary
                    }}>
                      {completedSubtasks}/{task.subtasks!.length} tasks
                    </Text>
                    <View style={{
                      width: 40,
                      height: 4,
                      backgroundColor: colors.border,
                      borderRadius: borderRadius.full,
                      overflow: 'hidden'
                    }}>
                      <View style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: colors.brand.primary,
                        borderRadius: borderRadius.full
                      }} />
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Subtask Expand Button */}
            {hasSubtasks && (
              <TouchableOpacity
                onPress={() => toggleTaskExpansion(task.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.sm,
                  marginTop: spacing.xs,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                {isExpanded ? (
                  <ChevronDown size={16} color={colors.text.secondary} />
                ) : (
                  <ChevronRight size={16} color={colors.text.secondary} />
                )}
                <Text style={{
                  fontSize: typography.size.sm,
                  color: colors.text.secondary
                }}>
                  {isExpanded ? 'Hide' : 'Show'} {task.subtasks!.length} subtasks
                </Text>
              </TouchableOpacity>
            )}

            {/* Expanded Subtasks */}
            {hasSubtasks && isExpanded && (
              <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
                {task.subtasks!.map((subtask) => (
                  <View
                    key={subtask.id}
                    style={{
                      marginLeft: spacing.md,
                      backgroundColor: colors.background,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderLeftWidth: 3,
                      borderLeftColor: subtask.status === 'COMPLETED' ? '#22c55e' : colors.brand.primary
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                      {getStatusIcon(subtask.status)}
                      <Text style={{
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.medium,
                        color: subtask.status === 'COMPLETED' ? colors.text.secondary : colors.text.primary,
                        textDecorationLine: subtask.status === 'COMPLETED' ? 'line-through' : 'none',
                        flex: 1
                      }}>
                        {subtask.title}
                      </Text>
                    </View>
                    
                    {subtask.description && (
                      <Text style={{
                        fontSize: typography.size.sm,
                        color: colors.text.secondary,
                        marginBottom: spacing.xs
                      }}>
                        {subtask.description}
                      </Text>
                    )}

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        <Calendar size={14} color={colors.text.tertiary} />
                        <Text style={{
                          fontSize: typography.size.xs,
                          color: colors.text.tertiary
                        }}>
                          {formatDate(subtask.dueDate)}
                        </Text>
                      </View>
                      {subtask.assignedTo && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                          <User size={14} color={colors.text.tertiary} />
                          <Text style={{
                            fontSize: typography.size.xs,
                            color: colors.text.tertiary
                          }}>
                            {subtask.assignedTo}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
