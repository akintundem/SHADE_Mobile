import React, { useMemo, useState, useCallback } from 'react';
import { Modal, ScrollView, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Plus, CheckCircle, Trash2, MoreVertical, Circle, ArrowUp, ArrowDown } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { TaskDetailResponse, TimelineStatus, ChecklistItemResponse, ChecklistAutoSaveRequest } from '../../../../core/timeline/types/timeline';
import { timelineService } from '../../../../core/timeline/services/timeline';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { ActionSheet } from '../../../../common/components/ui/ActionSheet';
import { ConfirmModal } from '../../../../common/components/ui/ConfirmModal';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  task: TaskDetailResponse | null;
  onClose: () => void;
  onTaskUpdated?: () => void;
};

export function TaskDetailsModal({ visible, task, onClose, onTaskUpdated }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const text = colors.text;

  const [checklistItems, setChecklistItems] = useState<ChecklistItemResponse[]>(task?.checklist || []);
  const [showAddChecklistItem, setShowAddChecklistItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [selectedItem, setSelectedItem] = useState<ChecklistItemResponse | null>(null);
  const [showItemActionSheet, setShowItemActionSheet] = useState(false);
  const [showDeleteItemConfirm, setShowDeleteItemConfirm] = useState(false);
  const [showFinalizeItemConfirm, setShowFinalizeItemConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateChecklistOrder = useCallback(async (itemIds: string[]) => {
    if (!task) return;
    try {
      await timelineService.updateChecklistOrder(task.id, itemIds);
      const orderedItems = itemIds
        .map(id => checklistItems.find(item => item.id === id))
        .filter((item): item is ChecklistItemResponse => item !== undefined);
      const remainingItems = checklistItems.filter(item => !itemIds.includes(item.id));
      setChecklistItems([...orderedItems, ...remainingItems]);
      onTaskUpdated?.();
    } catch (err) {
      ErrorHandler.handle(err, 'updateChecklistOrder');
    }
  }, [task, checklistItems, onTaskUpdated]);

  React.useEffect(() => {
    if (task) {
      setChecklistItems(task.checklist || []);
    }
  }, [task]);

  const statusLabelMap = useMemo(
    () => ({
      [TimelineStatus.PENDING]: t('Pending'),
      [TimelineStatus.TO_DO]: t('ToDo'),
      [TimelineStatus.ACTIVE]: t('Active'),
      [TimelineStatus.IN_PROGRESS]: t('InProgress'),
      [TimelineStatus.COMPLETED]: t('Completed'),
      [TimelineStatus.DONE]: t('Done'),
      [TimelineStatus.CANCELLED]: t('Cancelled'),
      [TimelineStatus.POSTPONED]: t('Postponed'),
      [TimelineStatus.OVERDUE]: t('Overdue'),
    }),
    [t]
  );

  if (!task) {
    return null;
  }

  const getStatusColor = (status: TimelineStatus | null | undefined) => {
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
  };

  const getPriorityColor = (priority: string | null | undefined) => {
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
  };

  const formatDate = (value?: string | null) => {
    if (!value) return t('NotSet');
    return dateUtils.formatDate(value, DATE_FORMATS.DISPLAY_DATE);
  };

  const statusLabel = task.status ? statusLabelMap[task.status] : t('NotSet');
  const statusColor = getStatusColor(task.status);
  const priorityKey = task.priority ? task.priority.toUpperCase() : null;
  const priorityLabel =
    priorityKey === 'HIGH'
      ? t('High')
      : priorityKey === 'MEDIUM'
      ? t('Medium')
      : priorityKey === 'LOW'
      ? t('Low')
      : priorityKey;
  const priorityColor = getPriorityColor(task.priority);
  const progress = typeof task.progressPercentage === 'number' ? task.progressPercentage : null;
  const safeProgress = progress === null ? null : Math.max(0, Math.min(progress, 100));

  const metaItems = [
    { label: t('StartDate'), value: formatDate(task.startDate || undefined) },
    { label: t('DueDate'), value: formatDate(task.dueDate || undefined) },
  ];

  if (task.category) {
    metaItems.push({ label: t('Category'), value: task.category });
  }

  if (task.assignedToName) {
    metaItems.push({ label: t('AssignedTo'), value: task.assignedToName });
  }

  const bottomPadding = Math.max(16, Math.min(insets.bottom, 20)) + 20;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View className="flex-1 bg-light-background dark:bg-dark-background" style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title={t('TaskDetails')}
          titleSize={17}
          leftAction={{
            icon: X,
            onPress: onClose,
            size: 40,
          }}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-xl pt-xl" style={{ paddingBottom: bottomPadding }}>
            <View className="mb-lg">
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs">
                {task.title}
              </Text>
              {task.description ? (
                <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
                  {task.description}
                </Text>
              ) : null}
            </View>

            <View className="flex-row flex-wrap mb-lg gap-sm">
              <View
                className="px-md py-xs rounded-full border"
                style={{
                  borderColor: statusColor,
                  backgroundColor: isDark ? `${statusColor}25` : `${statusColor}1A`,
                }}
              >
                <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                  {statusLabel}
                </Text>
              </View>
              {priorityLabel ? (
                <View
                  className="px-md py-xs rounded-full border"
                  style={{
                    borderColor: priorityColor,
                    backgroundColor: isDark ? `${priorityColor}25` : `${priorityColor}1A`,
                  }}
                >
                  <Text className="text-xs font-semibold" style={{ color: priorityColor }}>
                    {priorityLabel}
                  </Text>
                </View>
              ) : null}
            </View>

            {safeProgress !== null ? (
              <View className="mb-xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Progress')}
                </Text>
                <View className="h-1.5 rounded-full overflow-hidden bg-light-surface-soft dark:bg-dark-surface-strong">
                  <View style={{ height: '100%', width: `${safeProgress}%`, backgroundColor: statusColor }} />
                </View>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                  {`${Math.round(safeProgress)}%`}
                </Text>
              </View>
            ) : null}

            <View
              className="rounded-xl border border-light-border dark:border-dark-border p-lg bg-light-surface dark:bg-dark-surface-elevated"
            >
              {metaItems.map(item => (
                <View key={item.label} className="mb-md">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-xs">
                    {item.label}
                  </Text>
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Checklist Section */}
            {task && (
              <View className="mt-xl">
                <View className="flex-row items-center justify-between mb-lg">
                  <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-tertiary">
                    {t('Checklist')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowAddChecklistItem(true)}
                    className="flex-row items-center gap-xs px-sm py-xs rounded-lg bg-brand-primary"
                  >
                    <Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />
                    <Text className="text-xs font-semibold text-txt-inverse">
                      {t('AddItem')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showAddChecklistItem && (
                  <View className="mb-md flex-row items-center gap-sm">
                    <TextInput
                      value={newItemTitle}
                      onChangeText={setNewItemTitle}
                      placeholder={t('EnterItemTitle')}
                      placeholderTextColor={text.tertiary}
                      className="flex-1 rounded-lg px-md py-sm border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted text-sm text-txt-primary dark:text-txt-dark-primary"
                      autoFocus
                      onSubmitEditing={async () => {
                        if (!newItemTitle.trim() || !task) return;
                        try {
                          const newItem = await timelineService.autoSaveChecklistItem(task.id, {
                            id: null,
                            title: newItemTitle.trim(),
                          });
                          setChecklistItems([...checklistItems, newItem]);
                          setNewItemTitle('');
                          setShowAddChecklistItem(false);
                          onTaskUpdated?.();
                        } catch (err) {
                          ErrorHandler.handle(err, 'addChecklistItem');
                        }
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setNewItemTitle('');
                        setShowAddChecklistItem(false);
                      }}
                      className="p-sm"
                    >
                      <X size={18} color={text.tertiary} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                )}

                {checklistItems.length === 0 ? (
                  <View className="py-lg items-center rounded-lg border border-[0.5px] bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted">
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                      {t('NoChecklistItems')}
                    </Text>
                  </View>
                ) : (
                  <View className="gap-sm">
                    {checklistItems.map((item, index) => {
                      const isDraft = item.isDraft === true;
                      const isCompleted = item.status === TimelineStatus.COMPLETED || item.status === TimelineStatus.DONE;
                      return (
                        <View
                          key={item.id}
                          className="flex-row items-center gap-sm rounded-lg px-md py-sm border border-[0.5px] bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                        >
                          {isCompleted ? (
                            <CheckCircle size={18} color={colors.semantic.success} strokeWidth={2.5} />
                          ) : (
                            <Circle size={18} color={text.tertiary} strokeWidth={2} />
                          )}
                          <Text
                            className={`flex-1 text-sm ${
                              isCompleted
                                ? 'text-txt-tertiary dark:text-txt-dark-tertiary line-through'
                                : 'text-txt-primary dark:text-txt-dark-primary'
                            }`}
                          >
                            {item.title}
                          </Text>
                          {isDraft && (
                            <View className="rounded-md px-xs py-[1px] border bg-semantic-warning/20 border-semantic-warning/40">
                              <Text className="text-xs font-medium text-semantic-warning">
                                {t('Draft')}
                              </Text>
                            </View>
                          )}
                          <View className="flex-row items-center gap-xs">
                            <View className="flex-row items-center gap-xs">
                              {index > 0 && (
                                <TouchableOpacity
                                  onPress={async () => {
                                    const currentIndex = checklistItems.findIndex(i => i.id === item.id);
                                    if (currentIndex <= 0) return;
                                    const newItems = [...checklistItems];
                                    [newItems[currentIndex], newItems[currentIndex - 1]] = [newItems[currentIndex - 1], newItems[currentIndex]];
                                    const itemIds = newItems.map(i => i.id);
                                    await handleUpdateChecklistOrder(itemIds);
                                  }}
                                  className="p-xs"
                                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                                >
                                  <ArrowUp size={14} color={text.tertiary} strokeWidth={2.2} />
                                </TouchableOpacity>
                              )}
                              {index < checklistItems.length - 1 && (
                                <TouchableOpacity
                                  onPress={async () => {
                                    const currentIndex = checklistItems.findIndex(i => i.id === item.id);
                                    if (currentIndex >= checklistItems.length - 1) return;
                                    const newItems = [...checklistItems];
                                    [newItems[currentIndex], newItems[currentIndex + 1]] = [newItems[currentIndex + 1], newItems[currentIndex]];
                                    const itemIds = newItems.map(i => i.id);
                                    await handleUpdateChecklistOrder(itemIds);
                                  }}
                                  className="p-xs"
                                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                                >
                                  <ArrowDown size={14} color={text.tertiary} strokeWidth={2.2} />
                                </TouchableOpacity>
                              )}
                            </View>
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedItem(item);
                                setShowItemActionSheet(true);
                              }}
                              className="p-xs"
                            >
                              <MoreVertical size={16} color={text.tertiary} strokeWidth={2.2} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {selectedItem && task && (
        <>
          <ActionSheet
            visible={showItemActionSheet}
            title={selectedItem.title}
            options={[
              ...(selectedItem.isDraft
                ? [{ id: 'finalize', label: t('FinalizeItem'), icon: CheckCircle }]
                : []),
              { id: 'delete', label: t('DeleteItem'), icon: Trash2, destructive: true },
            ]}
            onSelect={(actionId) => {
              setShowItemActionSheet(false);
              if (actionId === 'finalize') {
                setShowFinalizeItemConfirm(true);
              } else if (actionId === 'delete') {
                setShowDeleteItemConfirm(true);
              }
            }}
            onCancel={() => {
              setShowItemActionSheet(false);
              setSelectedItem(null);
            }}
          />
          <ConfirmModal
            visible={showFinalizeItemConfirm}
            title={t('FinalizeChecklistItem')}
            message={t('FinalizeChecklistItemConfirm', { title: selectedItem.title })}
            confirmLabel={t('Finalize')}
            cancelLabel={t('Cancel')}
            variant="success"
            isLoading={isProcessing}
            onConfirm={async () => {
              if (!selectedItem || !task) return;
              setIsProcessing(true);
              setShowFinalizeItemConfirm(false);
              try {
                const request: ChecklistAutoSaveRequest = {
                  id: selectedItem.id,
                  title: selectedItem.title || null,
                  description: selectedItem.description || null,
                  dueDate: selectedItem.dueDate || null,
                  assignedTo: selectedItem.assignedTo || null,
                  status: selectedItem.status || null,
                  taskOrder: selectedItem.taskOrder || null,
                };
                const finalized = await timelineService.finalizeChecklistItem(task.id, selectedItem.id, request);
                if (finalized) {
                  setChecklistItems(checklistItems.map(item => (item.id === selectedItem.id ? finalized : item)));
                } else {
                  setChecklistItems(checklistItems.filter(item => item.id !== selectedItem.id));
                }
                onTaskUpdated?.();
              } catch (err) {
                ErrorHandler.handle(err, 'finalizeChecklistItem');
              } finally {
                setIsProcessing(false);
                setSelectedItem(null);
              }
            }}
            onCancel={() => {
              setShowFinalizeItemConfirm(false);
              setSelectedItem(null);
            }}
          />
          <ConfirmModal
            visible={showDeleteItemConfirm}
            title={t('DeleteChecklistItem')}
            message={t('DeleteChecklistItemConfirm', { title: selectedItem.title })}
            confirmLabel={t('Delete')}
            cancelLabel={t('Cancel')}
            variant="danger"
            isLoading={isProcessing}
            onConfirm={async () => {
              if (!selectedItem || !task) return;
              setIsProcessing(true);
              setShowDeleteItemConfirm(false);
              try {
                await timelineService.deleteChecklistItem(task.id, selectedItem.id);
                setChecklistItems(checklistItems.filter(item => item.id !== selectedItem.id));
                onTaskUpdated?.();
              } catch (err) {
                ErrorHandler.handle(err, 'deleteChecklistItem');
              } finally {
                setIsProcessing(false);
                setSelectedItem(null);
              }
            }}
            onCancel={() => {
              setShowDeleteItemConfirm(false);
              setSelectedItem(null);
            }}
          />
        </>
      )}
    </Modal>
  );
}
