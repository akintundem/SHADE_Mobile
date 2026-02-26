import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, CheckCircle, Trash2, List } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay } from '../../../../common/components/LoadingStates';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { timelineService } from '../../../../core/timeline/services/timeline';
import {
  TaskAutoSaveRequest,
  TaskDetailResponse,
  TimelineStatus,
} from '../../../../core/timeline/types/timeline';
import { TaskList } from '../components/TaskList';
import { GanttChart } from '../components/GanttChart';
import { TaskEditorModal, TaskFormValues } from '../components/TaskEditorModal';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { ActionSheet } from '../../../../common/components/ui/ActionSheet';
import { ConfirmModal } from '../../../../common/components/ui/ConfirmModal';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { useTimelineTasks } from '../hooks';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

export function TimelineManagementScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);
  const refreshTint = colors.text.primary;

  const { tasks, loading, refresh, setTasks } = useTimelineTasks(eventId);

  const [refreshing, setRefreshing] = useState(false);
  const [showListView, setShowListView] = useState(false);
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDetailResponse | null>(null);
  const [editingTask, setEditingTask] = useState<TaskDetailResponse | null>(null);
  const [showTaskActionSheet, setShowTaskActionSheet] = useState(false);
  const [actionTask, setActionTask] = useState<TaskDetailResponse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    await refresh(true);
    setRefreshing(false);
  }, [eventId, refresh]);

  const handleTaskPress = useCallback((task: TaskDetailResponse) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  }, []);

  const handleTaskLongPress = useCallback((task: TaskDetailResponse) => {
    if (!permissions.canEditTimeline) return;
    setShowTaskDetails(false);
    setSelectedTask(null);
    setEditingTask(task);
    setShowTaskEditor(true);
  }, [permissions.canEditTimeline]);

  const handleAddTask = useCallback(() => {
    setShowTaskDetails(false);
    setSelectedTask(null);
    setEditingTask(null);
    setShowTaskEditor(true);
  }, []);

  const handleSaveTask = useCallback(
    async (values: TaskFormValues) => {
      if (!eventId) {
        ErrorHandler.handle(new Error('Event ID is missing'), 'saveTask');
        return;
      }

      try {
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

        const request: TaskAutoSaveRequest = {
          id: editingTask?.id || null,
          title: values.title || null,
          description: values.description || null,
          startDate: values.startDate || null,
          dueDate: values.dueDate || null,
          priority: values.priority || null,
          status: values.status || null,
          taskOrder: editingTask?.taskOrder || null,
        };

        if (editingTask) {
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
        } else {
          const newTask = await timelineService.autoSaveTask(eventId, request);
          setTasks([
            ...tasks,
            {
              ...newTask,
              progressPercentage: normalizeProgress(newTask.status, newTask.progressPercentage),
            },
          ]);
        }

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

  const handleTaskAction = useCallback((task: TaskDetailResponse, _action: 'finalize' | 'delete') => {
    if (!permissions.canEditTimeline) return;
    setActionTask(task);
    setShowTaskActionSheet(true);
  }, [permissions.canEditTimeline]);

  const handleFinalizeTask = useCallback(async () => {
    if (!actionTask || !eventId) return;
    setIsProcessing(true);
    setShowFinalizeConfirm(false);
    try {
      const request: TaskAutoSaveRequest = {
        id: actionTask.id,
        title: actionTask.title || null,
        description: actionTask.description || null,
        startDate: actionTask.startDate || null,
        dueDate: actionTask.dueDate || null,
        priority: actionTask.priority || null,
        status: actionTask.status || null,
        taskOrder: actionTask.taskOrder || null,
      };
      const finalized = await timelineService.finalizeTask(eventId, actionTask.id, request);
      if (finalized) {
        setTasks(tasks.map(t => (t.id === actionTask.id ? finalized : t)));
      } else {
        // Task was deleted (empty task)
        setTasks(tasks.filter(t => t.id !== actionTask.id));
      }
      await refresh(true);
    } catch (err) {
      ErrorHandler.handle(err, 'finalizeTask');
    } finally {
      setIsProcessing(false);
      setActionTask(null);
    }
  }, [actionTask, eventId, tasks, setTasks, refresh]);

  const handleDeleteTask = useCallback(async () => {
    if (!actionTask || !eventId) return;
    setIsProcessing(true);
    setShowDeleteConfirm(false);
    try {
      await timelineService.deleteTask(eventId, actionTask.id);
      setTasks(tasks.filter(t => t.id !== actionTask.id));
      await refresh(true);
    } catch (err) {
      ErrorHandler.handle(err, 'deleteTask');
    } finally {
      setIsProcessing(false);
      setActionTask(null);
    }
  }, [actionTask, eventId, tasks, setTasks, refresh]);

  const handleUpdateTaskOrder = useCallback(async (taskIds: string[]) => {
    if (!eventId) return;
    try {
      await timelineService.updateTaskOrder(eventId, taskIds);
      // Update local state to reflect new order
      const orderedTasks = taskIds
        .map(id => tasks.find(t => t.id === id))
        .filter((t): t is TaskDetailResponse => t !== undefined);
      const remainingTasks = tasks.filter(t => !taskIds.includes(t.id));
      setTasks([...orderedTasks, ...remainingTasks]);
    } catch (err) {
      ErrorHandler.handle(err, 'updateTaskOrder');
    }
  }, [eventId, tasks, setTasks]);

  const taskActionOptions = useMemo(() => {
    if (!actionTask) return [];
    const options = [];
    if (actionTask.isDraft) {
      options.push({ id: 'finalize', label: t('FinalizeTask'), icon: CheckCircle });
    }
    options.push({ id: 'delete', label: t('DeleteTask'), icon: Trash2, destructive: true });
    return options;
  }, [actionTask, t]);

  const bottomGutter = useMemo(
    () => Math.max(16, Math.min(insets.bottom, 20)),
    [insets.bottom]
  );

  if (!eventId) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <Text className="text-txt-primary dark:text-txt-dark-primary">
            {t('EventNotFound')}
          </Text>
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return <LoadingOverlay visible={true} message={t('Loading')} />;
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <View
        className="flex-row items-center justify-between px-xl pt-md pb-md border-b border-light-border-light dark:border-dark-border-light bg-light-background dark:bg-dark-background"
      >
        {/* Left: back button */}
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          className="items-center justify-center rounded-full"
          style={{ width: 32, height: 32 }}
        >
          <ChevronLeft size={16} color={colors.text.primary} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Title */}
        <Text
          className="text-sm font-semibold text-center text-txt-primary dark:text-txt-dark-primary"
          numberOfLines={1}
        >
          {t('Timeline')}
        </Text>

        {/* Right: List icon + Plus button (Plus only shown when user can edit) */}
        <View className="flex-row items-center gap-xs">
          <TouchableOpacity
            onPress={() => setShowListView(v => !v)}
            activeOpacity={0.7}
            className="items-center justify-center rounded-full"
            style={{
              width: 32,
              height: 32,
              backgroundColor: showListView ? colors.text.primary : 'transparent',
            }}
          >
            <List
              size={16}
              color={showListView ? colors.text.inverse : colors.text.primary}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
          {permissions.canEditTimeline && (
            <TouchableOpacity
              onPress={handleAddTask}
              activeOpacity={0.7}
              className="items-center justify-center rounded-full bg-txt-primary dark:bg-txt-dark-primary"
              style={{ width: 32, height: 32 }}
            >
              <Plus size={16} color={colors.text.inverse} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showListView ? (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={refreshTint}
              colors={[refreshTint]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View className="px-xl pt-md" style={{ paddingBottom: bottomGutter }}>
            <TaskList
              tasks={tasks}
              onTaskPress={handleTaskPress}
              onTaskLongPress={permissions.canEditTimeline ? handleTaskLongPress : undefined}
              onTaskAction={permissions.canEditTimeline ? handleTaskAction : undefined}
              onMoveTask={(taskId, direction) => {
                const currentIndex = tasks.findIndex(t => t.id === taskId);
                if (currentIndex === -1) return;
                const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
                if (newIndex < 0 || newIndex >= tasks.length) return;
                const newTasks = [...tasks];
                [newTasks[currentIndex], newTasks[newIndex]] = [newTasks[newIndex], newTasks[currentIndex]];
                const taskIds = newTasks.map(t => t.id);
                handleUpdateTaskOrder(taskIds);
              }}
            />
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1">
          <GanttChart
            tasks={tasks}
            onTaskPress={handleTaskPress}
            onTaskLongPress={handleTaskLongPress}
          />
        </View>
      )}

      <TaskDetailsModal
        visible={showTaskDetails}
        task={selectedTask}
        onClose={handleCloseDetails}
        onTaskUpdated={() => refresh(true)}
      />

      <TaskEditorModal
        visible={showTaskEditor}
        task={editingTask}
        onClose={() => {
          setShowTaskEditor(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      {actionTask && (
        <ActionSheet
          visible={showTaskActionSheet}
          title={actionTask.title}
          options={taskActionOptions}
          onSelect={(actionId) => {
            setShowTaskActionSheet(false);
            if (actionId === 'finalize') {
              setShowFinalizeConfirm(true);
            } else if (actionId === 'delete') {
              setShowDeleteConfirm(true);
            }
          }}
          onCancel={() => {
            setShowTaskActionSheet(false);
            setActionTask(null);
          }}
        />
      )}

      <ConfirmModal
        visible={showFinalizeConfirm}
        title={t('FinalizeTask')}
        message={t('FinalizeTaskConfirm', { title: actionTask?.title })}
        confirmLabel={t('Finalize')}
        cancelLabel={t('Cancel')}
        variant="success"
        isLoading={isProcessing}
        onConfirm={handleFinalizeTask}
        onCancel={() => {
          setShowFinalizeConfirm(false);
          setActionTask(null);
        }}
      />

      <ConfirmModal
        visible={showDeleteConfirm}
        title={t('DeleteTask')}
        message={t('DeleteTaskConfirm', { title: actionTask?.title })}
        confirmLabel={t('Delete')}
        cancelLabel={t('Cancel')}
        variant="danger"
        isLoading={isProcessing}
        onConfirm={handleDeleteTask}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setActionTask(null);
        }}
      />

      <LoadingOverlay visible={loading && !refreshing} message={t('Loading')} transparent />
    </View>
  );
}
