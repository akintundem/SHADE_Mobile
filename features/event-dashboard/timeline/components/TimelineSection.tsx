import React, { useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { timelineService } from '../../../../core/timeline/services/timeline';
import {
  TaskAutoSaveRequest,
  TaskDetailResponse,
  TimelineStatus,
} from '../../../../core/timeline/types/timeline';
import { LoadingOverlay } from '../../../../common/components/LoadingStates';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { TaskEditorModal, TaskFormValues } from './TaskEditorModal';
import { TaskDetailsModal } from './TaskDetailsModal';
import { TaskList } from './TaskList';
import { useEventDashboardFlow } from '../../hooks';
import { useTimelineTasks } from '../hooks';

type Props = {
  eventId: string;
};

export function TimelineSection({ eventId }: Props) {
  const { t } = useI18n();
  const { goToTimeline } = useEventDashboardFlow(eventId);
  const { tasks, loading, setTasks } = useTimelineTasks(eventId);

  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDetailResponse | null>(null);
  const [editingTask, setEditingTask] = useState<TaskDetailResponse | null>(null);

  const displayedTasks = useMemo(() => tasks.slice(0, 3), [tasks]);

  const handleTaskPress = useCallback((task: TaskDetailResponse) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  }, []);

  const handleTaskLongPress = useCallback((task: TaskDetailResponse) => {
    setShowTaskDetails(false);
    setSelectedTask(null);
    setEditingTask(task);
    setShowTaskEditor(true);
  }, []);

  const handleSaveTask = useCallback(
    async (values: TaskFormValues) => {
      const normalizeProgress = (
        nextStatus: TimelineStatus | null | undefined,
        currentProgress?: number | null
      ) => {
        if (nextStatus === TimelineStatus.COMPLETED || nextStatus === TimelineStatus.DONE) {
          return 100;
        }
        if (nextStatus === TimelineStatus.TO_DO || nextStatus === TimelineStatus.PENDING) {
          return 0;
        }
        return typeof currentProgress === 'number' ? currentProgress : 0;
      };

      if (!editingTask || !eventId) {
        setShowTaskEditor(false);
        return;
      }

      try {
        const request: TaskAutoSaveRequest = {
          id: editingTask.id,
          title: values.title || null,
          description: values.description || null,
          startDate: values.startDate || null,
          dueDate: values.dueDate || null,
          priority: values.priority || null,
          status: values.status || null,
          taskOrder: editingTask.taskOrder || null,
        };

        const updatedTask = await timelineService.autoSaveTask(eventId, request);
        setTasks(
          tasks.map(task =>
            task.id === editingTask.id
              ? {
                  ...updatedTask,
                  progressPercentage: normalizeProgress(
                    updatedTask.status,
                    updatedTask.progressPercentage
                  ),
                }
              : task
          )
        );

        setShowTaskEditor(false);
        setEditingTask(null);
      } catch (err) {
        ErrorHandler.handle(err, 'saveTask');
      }
    },
    [editingTask, eventId, setTasks, tasks]
  );

  const handleCloseDetails = useCallback(() => {
    setShowTaskDetails(false);
    setSelectedTask(null);
  }, []);

  if (loading) {
    return (
      <View className="min-h-[200px]">
        <LoadingOverlay visible={true} message={t('Loading')} transparent />
      </View>
    );
  }

  return (
    <View className="mb-2xl">
      <View className="flex-row items-center justify-between mb-lg">
        <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary">
          {t('Timeline')}
        </Text>
        {tasks.length > 3 && (
          <TouchableOpacity onPress={goToTimeline} activeOpacity={0.7}>
            <Text className="text-xs font-medium text-txt-primary dark:text-txt-dark-primary">
              {t('ViewAll')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TaskList
        tasks={displayedTasks}
        onTaskPress={handleTaskPress}
        onTaskLongPress={handleTaskLongPress}
      />

      <TaskDetailsModal visible={showTaskDetails} task={selectedTask} onClose={handleCloseDetails} />

      <TaskEditorModal
        visible={showTaskEditor}
        task={editingTask}
        onClose={() => {
          setShowTaskEditor(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </View>
  );
}
