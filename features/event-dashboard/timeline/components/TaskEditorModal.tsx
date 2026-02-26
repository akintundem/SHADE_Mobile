import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, Check, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { DateTimePickerModal } from '../../../../common/datetime';
import {
  combineDateTimeToISO,
  formatDisplayDateTime,
  parseDateInput,
  parseTimeInput,
  toIsoDateString,
  toTimeString,
} from '../../../../common/datetime/dateFormatting';
import { TaskDetailResponse, TimelineStatus } from '../../../../core/timeline/types/timeline';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type TaskFormValues = {
  title: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  priority: string | null;
  status: TimelineStatus | null;
};

type Props = {
  visible: boolean;
  task?: TaskDetailResponse | null;
  onClose: () => void;
  onSave: (values: TaskFormValues) => void;
};

const DEFAULT_START_TIME = { hour: 9, minute: 0 };
const DEFAULT_DUE_TIME = { hour: 17, minute: 0 };

export function TaskEditorModal({ visible, task, onClose, onSave }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const text = colors.text;
  const isEditing = Boolean(task?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [status, setStatus] = useState<TimelineStatus>(TimelineStatus.TO_DO);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowStartPicker(false);
      setShowDuePicker(false);
      return;
    }

    setTitle(task?.title || '');
    setDescription(task?.description || '');

    const normalizedPriority = (task?.priority || 'MEDIUM').toUpperCase();
    setPriority(['HIGH', 'MEDIUM', 'LOW'].includes(normalizedPriority) ? normalizedPriority : 'MEDIUM');
    setStatus(task?.status || TimelineStatus.TO_DO);

    if (task?.startDate) {
      const start = new Date(task.startDate);
      setStartDate(toIsoDateString(start));
      setStartTime(toTimeString({ hour: start.getHours(), minute: start.getMinutes() }));
    } else {
      setStartDate('');
      setStartTime('');
    }

    if (task?.dueDate) {
      const due = new Date(task.dueDate);
      setDueDate(toIsoDateString(due));
      setDueTime(toTimeString({ hour: due.getHours(), minute: due.getMinutes() }));
    } else {
      setDueDate('');
      setDueTime('');
    }
  }, [task, visible]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  const getStatusColor = (value: TimelineStatus | null | undefined) => {
    switch (value) {
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

  const getPriorityColor = (value: string | null | undefined) => {
    switch (value?.toUpperCase()) {
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

  const priorityOptions = useMemo(
    () => [
      { value: 'HIGH', label: t('High') },
      { value: 'MEDIUM', label: t('Medium') },
      { value: 'LOW', label: t('Low') },
    ],
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { value: TimelineStatus.PENDING, label: t('Pending') },
      { value: TimelineStatus.TO_DO, label: t('ToDo') },
      { value: TimelineStatus.ACTIVE, label: t('Active') },
      { value: TimelineStatus.IN_PROGRESS, label: t('InProgress') },
      { value: TimelineStatus.COMPLETED, label: t('Completed') },
      { value: TimelineStatus.DONE, label: t('Done') },
      { value: TimelineStatus.CANCELLED, label: t('Cancelled') },
      { value: TimelineStatus.POSTPONED, label: t('Postponed') },
      { value: TimelineStatus.OVERDUE, label: t('Overdue') },
    ],
    [t]
  );

  const startDisplayValue = useMemo(
    () => formatDisplayDateTime(startDate, startTime) || t('SelectDateTime'),
    [startDate, startTime, t]
  );

  const dueDisplayValue = useMemo(
    () => formatDisplayDateTime(dueDate, dueTime) || t('SelectDateTime'),
    [dueDate, dueTime, t]
  );

  const startDateObj = parseDateInput(startDate);
  const startTimeObj = parseTimeInput(startTime);
  const dueDateObj = parseDateInput(dueDate);
  const dueTimeObj = parseTimeInput(dueTime);

  const handleSave = () => {
    if (!canSave) return;

    const nextStartDate = startDate && startTime ? combineDateTimeToISO(startDate, startTime) : null;
    const nextDueDate = dueDate && dueTime ? combineDateTimeToISO(dueDate, dueTime) : null;

    onSave({
      title: title.trim(),
      description: description.trim().length > 0 ? description.trim() : null,
      startDate: nextStartDate,
      dueDate: nextDueDate,
      priority,
      status,
    });
  };

  const bottomGutter = Math.max(16, Math.min(insets.bottom, 20));

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View className="flex-1 bg-light-background dark:bg-dark-background" style={{ paddingTop: insets.top }}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScreenHeader
            title={isEditing ? t('EditTask') : t('AddTask')}
            titleSize={17}
            leftAction={{
              icon: X,
              onPress: onClose,
              size: 40,
            }}
            rightAction={{
              icon: Check,
              onPress: handleSave,
              size: 32,
              variant: 'filled',
              disabled: !canSave,
            }}
          />

          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-xl pt-xl" style={{ paddingBottom: bottomGutter + 20 }}>
              <View className="mb-2xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                  {t('Title')} *
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('EnterTitle')}
                  placeholderTextColor={text.tertiary}
                  className="rounded-lg px-md py-md text-sm text-txt-primary dark:text-txt-dark-primary bg-light-surface dark:bg-dark-surface border border-[0.5px] border-light-border-strong dark:border-dark-border-strong"
                />
              </View>

              <View className="mb-2xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                  {t('Description')}
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t('EnterDescription')}
                  placeholderTextColor={text.tertiary}
                  multiline
                  className="rounded-lg px-md pt-md pb-md min-h-[100px] text-sm text-txt-primary dark:text-txt-dark-primary bg-light-surface dark:bg-dark-surface border border-[0.5px] border-light-border-strong dark:border-dark-border-strong"
                />
              </View>

              <View className="mb-2xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                  {t('Timeline')}
                </Text>
                <View className="gap-md">
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    activeOpacity={0.7}
                    className="flex-row items-center rounded-lg px-md py-md gap-sm bg-light-surface dark:bg-dark-surface border border-[0.5px] border-light-border-strong dark:border-dark-border-strong"
                  >
                    <CalendarDays size={16} color={text.secondary} strokeWidth={2} />
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                        {t('StartDate')}
                      </Text>
                      <Text
                        className="text-sm font-medium"
                        style={{ color: startDate ? text.primary : text.tertiary }}
                      >
                        {startDisplayValue}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowDuePicker(true)}
                    activeOpacity={0.7}
                    className="flex-row items-center rounded-lg px-md py-md gap-sm bg-light-surface dark:bg-dark-surface border border-[0.5px] border-light-border-strong dark:border-dark-border-strong"
                  >
                    <CalendarDays size={16} color={text.secondary} strokeWidth={2} />
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                        {t('DueDate')}
                      </Text>
                      <Text
                        className="text-sm font-medium"
                        style={{ color: dueDate ? text.primary : text.tertiary }}
                      >
                        {dueDisplayValue}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-2xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                  {t('Priority')}
                </Text>
                <View className="flex-row flex-wrap gap-sm">
                  {priorityOptions.map(option => {
                    const selected = priority === option.value;
                    const color = getPriorityColor(option.value);
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setPriority(option.value)}
                        activeOpacity={0.8}
                        className="px-md py-xs rounded-full border"
                        style={{
                          borderColor: selected ? color : colors.borderLight,
                          backgroundColor: selected ? (isDark ? `${color}25` : `${color}1A`) : 'transparent',
                        }}
                      >
                        <Text
                          className="text-xs"
                          style={{
                            color: selected ? color : text.secondary,
                            fontWeight: selected ? '600' : '500',
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="mb-2xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                  {t('Status')}
                </Text>
                <View className="flex-row flex-wrap gap-sm">
                  {statusOptions.map(option => {
                    const selected = status === option.value;
                    const color = getStatusColor(option.value);
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setStatus(option.value)}
                        activeOpacity={0.8}
                        className="px-md py-xs rounded-full border"
                        style={{
                          borderColor: selected ? color : colors.borderLight,
                          backgroundColor: selected ? (isDark ? `${color}25` : `${color}1A`) : 'transparent',
                        }}
                      >
                        <Text
                          className="text-xs"
                          style={{
                            color: selected ? color : text.secondary,
                            fontWeight: selected ? '600' : '500',
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>

          <DateTimePickerModal
            visible={showStartPicker}
            onClose={() => setShowStartPicker(false)}
            onConfirm={(date, time) => {
              setStartDate(toIsoDateString(date));
              setStartTime(toTimeString(time));
            }}
            title={t('StartDate')}
            initialDate={startDateObj || new Date()}
            initialTime={startTimeObj || DEFAULT_START_TIME}
          />

          <DateTimePickerModal
            visible={showDuePicker}
            onClose={() => setShowDuePicker(false)}
            onConfirm={(date, time) => {
              setDueDate(toIsoDateString(date));
              setDueTime(toTimeString(time));
            }}
            title={t('DueDate')}
            initialDate={dueDateObj || new Date()}
            initialTime={dueTimeObj || DEFAULT_DUE_TIME}
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export type { TaskFormValues };
