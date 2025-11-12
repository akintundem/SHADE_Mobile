import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, User, CheckCircle, Circle, Clock, ChevronRight, ChevronDown, MoreVertical } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { TaskDTO } from '../../../../shared/types/timeline';

type Props = {
  tasks: TaskDTO[];
  filterStatus: 'all' | 'to_do' | 'active' | 'done';
  onFilterChange: (filter: 'all' | 'to_do' | 'active' | 'done') => void;
  onTaskPress?: (task: TaskDTO) => void;
};

export default function ListView({ tasks, filterStatus, onFilterChange, onTaskPress }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Calculate statistics
  const stats = React.useMemo(() => {
    const all = tasks.length;
    const done = tasks.filter(t => t.status === 'COMPLETED').length;
    const active = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const toDo = tasks.filter(t => t.status === 'PENDING').length;
    return { all, done, active, toDo };
  }, [tasks]);

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
        return <CheckCircle size={18} color={colors.semantic.success} />;
      case 'IN_PROGRESS':
        return <Clock size={18} color={colors.semantic.warning} />;
      case 'PENDING':
        return <Circle size={18} color={colors.text.secondary} />;
      default:
        return <Circle size={18} color={colors.text.secondary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return colors.semantic.error;
      case 'MEDIUM':
        return colors.semantic.warning;
      case 'LOW':
        return colors.semantic.success;
      default:
        return colors.text.secondary;
    }
  };

  const getTaskProgress = (task: TaskDTO) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      if (task.status === 'COMPLETED') return 100;
      if (task.status === 'IN_PROGRESS') {
        return task.estimatedHours > 0 ? Math.round((task.actualHours / task.estimatedHours) * 100) : 50;
      }
      return 0;
    }
    const completed = task.subtasks.filter(st => st.status === 'COMPLETED').length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleSubtasks = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const isExpanded = (taskId: string) => expandedTasks.has(taskId);

  return (
    <View style={{ flex: 1 }}>
      {/* Status Summary Cards */}
      <View style={{
        flexDirection: 'row',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md
      }}>
        {[
          { key: 'all' as const, label: 'ALL', count: stats.all },
          { key: 'to_do' as const, label: 'TO DO', count: stats.toDo },
          { key: 'active' as const, label: 'ACTIVE', count: stats.active },
          { key: 'done' as const, label: 'DONE', count: stats.done },
        ].map(({ key, label, count }) => {
          const isActive = filterStatus === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onFilterChange(key)}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                alignItems: 'center',
                borderWidth: isActive ? 2 : 1,
                borderColor: isActive ? colors.text.primary : colors.border
              }}
            >
              <Text style={{
                color: colors.text.primary,
                fontSize: typography.size['2xl'],
                fontWeight: typography.weight.bold
              }}>
                {count}
              </Text>
              <Text style={{
                color: colors.text.secondary,
                fontSize: typography.size.xs,
                textTransform: 'uppercase',
                marginTop: spacing.xs,
                fontWeight: typography.weight.semibold
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tasks List */}
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.map((task) => {
          const progress = getTaskProgress(task);
          const hasSubtasks = task.subtasks && task.subtasks.length > 0;
          const completedSubtasks = hasSubtasks && task.subtasks ? task.subtasks.filter(st => st.status === 'COMPLETED').length : 0;
          const totalSubtasks = hasSubtasks && task.subtasks ? task.subtasks.length : 0;

          return (
            <TouchableOpacity
              key={task.id}
              onPress={() => onTaskPress?.(task)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                  {getStatusIcon(task.status)}
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: task.status === 'COMPLETED' ? colors.text.secondary : colors.text.primary,
                      fontSize: typography.size.lg,
                      fontWeight: typography.weight.semibold,
                      textDecorationLine: task.status === 'COMPLETED' ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </Text>
                    <Text style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.sm,
                      marginTop: spacing.xs
                    }}>
                      {task.description}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <MoreVertical size={18} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
                  <View style={{
                    backgroundColor: colors.border,
                    borderRadius: borderRadius.full,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs
                  }}>
                    <Text style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.xs,
                      fontWeight: typography.weight.semibold,
                      textTransform: 'uppercase'
                    }}>
                      {task.priority}
                    </Text>
                  </View>
                  {task.tags.slice(0, 2).map((tag, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: colors.border,
                        borderRadius: borderRadius.full,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs
                      }}
                    >
                      <Text style={{
                        color: colors.text.secondary,
                        fontSize: typography.size.xs,
                        fontWeight: typography.weight.semibold,
                        textTransform: 'uppercase'
                      }}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Date and Assignee */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Calendar size={14} color={colors.text.secondary} />
                  <Text style={{
                    color: colors.text.secondary,
                    fontSize: typography.size.sm
                  }}>
                    {formatDate(task.dueDate)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <User size={14} color={colors.text.secondary} />
                  <Text style={{
                    color: colors.text.secondary,
                    fontSize: typography.size.sm
                  }}>
                    {task.assignedTo}
                  </Text>
                </View>
              </View>

              {/* Subtasks Progress */}
              {hasSubtasks && (
                <View style={{ marginTop: spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
                    <Text style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.xs,
                      fontWeight: typography.weight.semibold,
                      textTransform: 'uppercase'
                    }}>
                      {completedSubtasks} OF {totalSubtasks} SUBTASKS
                    </Text>
                    <Text style={{
                      color: colors.text.secondary,
                      fontSize: typography.size.xs,
                      fontWeight: typography.weight.semibold
                    }}>
                      {progress}%
                    </Text>
                  </View>
                  <View style={{
                    height: 6,
                    backgroundColor: colors.border,
                    borderRadius: borderRadius.sm,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: colors.brand.primary,
                      borderRadius: borderRadius.sm
                    }} />
                  </View>
                </View>
              )}

              {/* View/Expand Subtasks */}
              {hasSubtasks && (
                <TouchableOpacity
                  onPress={() => toggleSubtasks(task.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    marginTop: spacing.sm,
                    paddingVertical: spacing.xs
                  }}
                >
                  {isExpanded(task.id) ? (
                    <ChevronDown size={16} color={colors.text.secondary} />
                  ) : (
                    <ChevronRight size={16} color={colors.text.secondary} />
                  )}
                  <Text style={{
                    color: colors.text.secondary,
                    fontSize: typography.size.sm
                  }}>
                    {isExpanded(task.id) ? 'Hide' : 'View'} {totalSubtasks} subtasks
                  </Text>
                </TouchableOpacity>
              )}

              {/* Expanded Subtasks List */}
              {hasSubtasks && isExpanded(task.id) && task.subtasks && (
                <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                  {task.subtasks.map((subtask) => {
                    const isCompleted = subtask.status === 'COMPLETED';
                    return (
                      <View
                        key={subtask.id}
                        style={{
                          marginLeft: spacing.lg,
                          paddingLeft: spacing.md,
                          borderLeftWidth: 2,
                          borderLeftColor: colors.border,
                          paddingVertical: spacing.sm,
                          paddingRight: spacing.sm,
                          backgroundColor: colors.background,
                          borderRadius: borderRadius.md,
                          borderWidth: 1,
                          borderColor: colors.border
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                          {getStatusIcon(subtask.status)}
                          <Text style={{
                            color: isCompleted ? colors.text.secondary : colors.text.primary,
                            fontSize: typography.size.sm,
                            fontWeight: typography.weight.medium,
                            textDecorationLine: isCompleted ? 'line-through' : 'none',
                            flex: 1
                          }}>
                            {subtask.title}
                          </Text>
                        </View>
                        
                        {subtask.description && (
                          <Text style={{
                            color: colors.text.secondary,
                            fontSize: typography.size.xs,
                            marginLeft: spacing.lg,
                            marginBottom: spacing.xs
                          }}>
                            {subtask.description}
                          </Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginLeft: spacing.lg }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Calendar size={12} color={colors.text.tertiary} />
                            <Text style={{
                              color: colors.text.tertiary,
                              fontSize: typography.size.xs
                            }}>
                              {formatDate(subtask.dueDate)}
                            </Text>
                          </View>
                          {subtask.assignedTo && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                              <User size={12} color={colors.text.tertiary} />
                              <Text style={{
                                color: colors.text.tertiary,
                                fontSize: typography.size.xs
                              }}>
                                {subtask.assignedTo}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

