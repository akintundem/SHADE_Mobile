import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, User, CheckCircle, Circle, Clock, ChevronRight, ChevronDown, MoreVertical } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { TaskDTO } from '../../timeline/types/timeline';

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
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
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
              activeOpacity={0.7}
              style={{
                flex: 1,
                backgroundColor: isActive ? colors.text.primary : colors.cardElevated,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: isActive ? colors.background : colors.text.primary,
                fontSize: typography.size.xl,
                fontFamily: typography.family.bold,
                fontWeight: typography.weight.bold
              }}>
                {count}
              </Text>
              <Text style={{
                color: isActive ? colors.background : colors.text.tertiary,
                fontSize: 10,
                fontFamily: typography.family.bold,
                textTransform: 'uppercase',
                marginTop: 2,
                fontWeight: typography.weight.bold,
                letterSpacing: 0.5,
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
              activeOpacity={0.7}
              style={{
                backgroundColor: colors.cardElevated,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              }}
            >
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                    {getStatusIcon(task.status)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: task.status === 'COMPLETED' ? colors.text.tertiary : colors.text.primary,
                      fontSize: typography.size.lg,
                      fontFamily: typography.family.semibold,
                      fontWeight: typography.weight.semibold,
                      textDecorationLine: task.status === 'COMPLETED' ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </Text>
                    <Text style={{
                      color: colors.text.tertiary,
                      fontSize: typography.size.sm,
                      fontFamily: typography.family.regular,
                      marginTop: 2
                    }}>
                      {task.description}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <MoreVertical size={18} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>

              {/* Tags and Priority */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
                <View style={{
                  backgroundColor: getPriorityColor(task.priority) + '15',
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4
                }}>
                  <Text style={{
                    color: getPriorityColor(task.priority),
                    fontSize: 10,
                    fontFamily: typography.family.bold,
                    fontWeight: typography.weight.bold,
                    textTransform: 'uppercase'
                  }}>
                    {task.priority}
                  </Text>
                </View>
                {task.tags && task.tags.slice(0, 2).map((tag, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.full,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 4
                    }}
                  >
                    <Text style={{
                      color: colors.text.tertiary,
                      fontSize: 10,
                      fontFamily: typography.family.bold,
                      fontWeight: typography.weight.bold,
                      textTransform: 'uppercase'
                    }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Date and Assignee */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Calendar size={14} color={colors.text.tertiary} />
                  <Text style={{
                    color: colors.text.tertiary,
                    fontSize: typography.size.xs,
                    fontFamily: typography.family.medium,
                  }}>
                    {formatDate(task.dueDate)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <User size={14} color={colors.text.tertiary} />
                  <Text style={{
                    color: colors.text.tertiary,
                    fontSize: typography.size.xs,
                    fontFamily: typography.family.medium,
                  }}>
                    {task.assignedTo}
                  </Text>
                </View>
              </View>

              {/* Subtasks Progress */}
              {hasSubtasks && (
                <View style={{ marginTop: spacing.xs }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{
                      color: colors.text.tertiary,
                      fontSize: 10,
                      fontFamily: typography.family.bold,
                      fontWeight: typography.weight.bold,
                      textTransform: 'uppercase'
                    }}>
                      {completedSubtasks} / {totalSubtasks} SUBTASKS
                    </Text>
                    <Text style={{
                      color: colors.text.primary,
                      fontSize: 10,
                      fontFamily: typography.family.bold,
                      fontWeight: typography.weight.bold
                    }}>
                      {progress}%
                    </Text>
                  </View>
                  <View style={{
                    height: 4,
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.full,
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: colors.text.primary,
                      borderRadius: borderRadius.full
                    }} />
                  </View>
                </View>
              )}

              {/* View/Expand Subtasks */}
              {hasSubtasks && (
                <TouchableOpacity
                  onPress={() => toggleSubtasks(task.id)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: spacing.md,
                    backgroundColor: colors.surface,
                    paddingHorizontal: spacing.md,
                    paddingVertical: 8,
                    borderRadius: borderRadius.md,
                    alignSelf: 'flex-start'
                  }}
                >
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: typography.size.xs,
                    fontFamily: typography.family.semibold,
                    fontWeight: typography.weight.semibold
                  }}>
                    {isExpanded(task.id) ? 'Hide' : 'View'} {totalSubtasks} subtasks
                  </Text>
                  {isExpanded(task.id) ? (
                    <ChevronDown size={14} color={colors.text.primary} />
                  ) : (
                    <ChevronRight size={14} color={colors.text.primary} />
                  )}
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
                          marginLeft: spacing.xs,
                          padding: spacing.md,
                          backgroundColor: colors.surface,
                          borderRadius: borderRadius.lg,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 }}>
                          {getStatusIcon(subtask.status)}
                          <Text style={{
                            color: isCompleted ? colors.text.tertiary : colors.text.primary,
                            fontSize: typography.size.sm,
                            fontFamily: typography.family.semibold,
                            fontWeight: typography.weight.semibold,
                            textDecorationLine: isCompleted ? 'line-through' : 'none',
                            flex: 1
                          }}>
                            {subtask.title}
                          </Text>
                        </View>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginLeft: 26 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} color={colors.text.tertiary} />
                            <Text style={{
                              color: colors.text.tertiary,
                              fontSize: 10,
                              fontFamily: typography.family.medium
                            }}>
                              {formatDate(subtask.dueDate)}
                            </Text>
                          </View>
                          {subtask.assignedTo && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <User size={12} color={colors.text.tertiary} />
                              <Text style={{
                                color: colors.text.tertiary,
                                fontSize: 10,
                                fontFamily: typography.family.medium
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

