import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { TaskDetailResponse, TimelineStatus } from '../../../../core/timeline/types/timeline';
import { CheckCircle2, Circle, AlertCircle, Calendar, User, TrendingUp, MoreVertical, ArrowUp, ArrowDown } from 'lucide-react-native';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { useTheme } from '../../../../common/theme/ThemeProvider';

const withAlpha = (hex: string, alpha: number) => {
  if (!hex.startsWith('#')) return hex;
  const value = hex.replace('#', '');
  const isShort = value.length === 3;
  const r = parseInt(isShort ? value[0] + value[0] : value.slice(0, 2), 16);
  const g = parseInt(isShort ? value[1] + value[1] : value.slice(2, 4), 16);
  const b = parseInt(isShort ? value[2] + value[2] : value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type Props = {
  tasks: TaskDetailResponse[];
  onTaskPress?: (task: TaskDetailResponse) => void;
  onTaskLongPress?: (task: TaskDetailResponse) => void;
  onTaskAction?: (task: TaskDetailResponse, action: 'finalize' | 'delete') => void;
  onMoveTask?: (taskId: string, direction: 'up' | 'down') => void;
};

export function TaskList({ tasks, onTaskPress, onTaskLongPress, onTaskAction, onMoveTask }: Props) {
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  const text = colors.text;
  const shadowColor = isDark ? colors.text.inverse : colors.text.primary;

  const getStatusColor = useCallback((status: TimelineStatus | null | undefined) => {
    switch (status) {
      case TimelineStatus.COMPLETED:
      case TimelineStatus.DONE:
        return colors.semantic.success;
      case TimelineStatus.IN_PROGRESS:
      case TimelineStatus.ACTIVE:
        return colors.semantic.info;
      case TimelineStatus.OVERDUE:
        return colors.semantic.error;
      case TimelineStatus.CANCELLED:
        return text.tertiary;
      default:
        return text.secondary;
    }
  }, [text, colors.semantic.error, colors.semantic.info, colors.semantic.success]);

  const getPriorityColor = useCallback((priority: string | null | undefined) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return colors.semantic.error;
      case 'MEDIUM':
        return colors.semantic.warning;
      case 'LOW':
        return colors.semantic.success;
      default:
        return text.tertiary;
    }
  }, [text, colors.semantic.error, colors.semantic.success, colors.semantic.warning]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return dateUtils.formatDate(dateString, DATE_FORMATS.DISPLAY_DATE);
  };

  const isOverdue = (dueDate: string | null | undefined) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  if (tasks.length === 0) {
    return (
      <View className="items-center py-2xl">
        <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-xs text-center">
          {t('NoTasksYet')}
        </Text>
        <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center leading-relaxed">
          {t('AddYourFirstTask')}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-md">
      {tasks.map((task, index) => {
        const progress = task.progressPercentage || 0;
        const isTaskOverdue = isOverdue(task.dueDate);
        const statusColor = getStatusColor(task.status);
        const priorityColor = getPriorityColor(task.priority);

        return (
          <TouchableOpacity
            key={task.id}
            onPress={() => onTaskPress?.(task)}
            onLongPress={() => onTaskLongPress?.(task)}
            delayLongPress={350}
            activeOpacity={0.7}
            className="rounded-xl p-lg bg-light-surface dark:bg-dark-surface-elevated border border-[0.5px] border-light-border dark:border-dark-border"
            style={{
              shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.2 : 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row items-start justify-between mb-md">
              <View className="flex-1 pr-md">
                <View className="flex-row items-center mb-xs gap-xs">
                  {task.status === TimelineStatus.COMPLETED || task.status === TimelineStatus.DONE ? (
                    <CheckCircle2 size={18} color={statusColor} strokeWidth={2.5} />
                  ) : (
                    <Circle size={18} color={statusColor} strokeWidth={2} />
                  )}
                  <Text
                    className="flex-1 text-sm font-semibold text-txt-primary dark:text-txt-dark-primary"
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                  {task.isDraft && (
                    <View className="rounded-md px-xs py-[1px] border bg-semantic-warning/20 border-semantic-warning/40">
                      <Text className="text-xs font-medium text-semantic-warning">
                        {t('Draft')}
                      </Text>
                    </View>
                  )}
                </View>
                {task.description && (
                  <Text
                    className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed"
                    numberOfLines={2}
                  >
                    {task.description}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center gap-xs">
                {onMoveTask && (
                  <>
                    {index > 0 && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          onMoveTask(task.id, 'up');
                        }}
                        className="p-xs"
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      >
                        <ArrowUp size={14} color={text.tertiary} strokeWidth={2.2} />
                      </TouchableOpacity>
                    )}
                    {index < tasks.length - 1 && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          onMoveTask(task.id, 'down');
                        }}
                        className="p-xs"
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      >
                        <ArrowDown size={14} color={text.tertiary} strokeWidth={2.2} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
                {onTaskAction && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onTaskAction(task, task.isDraft ? 'finalize' : 'delete');
                    }}
                    className="p-sm"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MoreVertical size={18} color={text.tertiary} strokeWidth={2.2} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {progress > 0 && (
              <View className="mb-md">
                <View className="h-1 rounded-full overflow-hidden bg-light-surface-soft dark:bg-dark-surface-strong">
                  <View
                    style={{
                      height: '100%',
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                </View>
              </View>
            )}

            <View
              className="flex-row flex-wrap pt-md gap-sm border-t-[0.5px] border-light-border-light dark:border-dark-border-light"
            >
              {task.priority && (
                <View
                  className="flex-row items-center rounded-md px-sm py-[2px] gap-xs"
                  style={{
                    backgroundColor: isDark ? `${priorityColor}20` : `${priorityColor}15`,
                  }}
                >
                  <AlertCircle size={12} color={priorityColor} strokeWidth={2} />
                  <Text className="text-xs font-medium" style={{ color: priorityColor }}>
                    {task.priority}
                  </Text>
                </View>
              )}

              {task.dueDate && (
                <View
                  className="flex-row items-center rounded-md px-sm py-[2px] gap-xs"
                  style={{
                    backgroundColor: isTaskOverdue
                      ? withAlpha(colors.semantic.error, isDark ? 0.2 : 0.15)
                      : withAlpha(colors.text.primary, isDark ? 0.05 : 0.03),
                  }}
                >
                  <Calendar size={12} color={isTaskOverdue ? colors.semantic.error : text.tertiary} strokeWidth={2} />
                  <Text
                    className={`text-xs font-medium ${isTaskOverdue ? 'text-semantic-error' : 'text-txt-secondary dark:text-txt-dark-secondary'}`}
                  >
                    {formatDate(task.dueDate)}
                  </Text>
                </View>
              )}

              {task.assignedToName && (
                <View className="flex-row items-center rounded-md px-sm py-[2px] gap-xs bg-light-surface-soft dark:bg-dark-surface-soft">
                  <User size={12} color={text.tertiary} strokeWidth={2} />
                  <Text className="text-xs font-medium text-txt-secondary dark:text-txt-dark-secondary" numberOfLines={1}>
                    {task.assignedToName}
                  </Text>
                </View>
              )}

              {task.totalSubtasksCount !== null && task.totalSubtasksCount !== undefined && task.totalSubtasksCount > 0 && (
                <View className="flex-row items-center rounded-md px-sm py-[2px] gap-xs bg-light-surface-soft dark:bg-dark-surface-soft">
                  <TrendingUp size={12} color={text.tertiary} strokeWidth={2} />
                  <Text className="text-xs font-medium text-txt-secondary dark:text-txt-dark-secondary">
                    {task.completedSubtasksCount || 0}/{task.totalSubtasksCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
