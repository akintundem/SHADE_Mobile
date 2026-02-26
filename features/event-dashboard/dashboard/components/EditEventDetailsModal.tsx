import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, ChevronDown, Clock, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay } from '../../../../common/components/LoadingStates';
import { Event, EventType, UpdateEventRequest } from '../../../../core/events/types/event';
import { eventService } from '../../../../core/events/services/event';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { EVENT_CATEGORIES } from '../../../../core/events/constants';
import { DateTimePickerModal } from '../../../../common/datetime';
import {
  combineDateTimeToISO,
  formatDisplayDateTime,
  parseDateInput,
  parseTimeInput,
  toIsoDateString,
  toTimeString,
} from '../../../../common/datetime/dateFormatting';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onUpdate: () => void;
};

export function EditEventDetailsModal({ visible, event, onClose, onUpdate }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const text = colors.text;
  const surface = colors.surface;
  const borderColor = colors.borderLight;

  const [isLoading, setIsLoading] = useState(false);
  const [showEventTypePicker, setShowEventTypePicker] = useState(false);

  const [name, setName] = useState(event?.name || '');
  const [description, setDescription] = useState(event?.description || '');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(event?.eventType || null);

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  React.useEffect(() => {
    if (event) {
      setName(event.name || '');
      setDescription(event.description || '');
      setSelectedEventType(event.eventType || null);

      if (event.startDateTime) {
        const start = new Date(event.startDateTime);
        setStartDate(toIsoDateString(start));
        setStartTime(toTimeString({ hour: start.getHours(), minute: start.getMinutes() }));
      } else {
        setStartDate('');
        setStartTime('');
      }

      if (event.endDateTime) {
        const end = new Date(event.endDateTime);
        setEndDate(toIsoDateString(end));
        setEndTime(toTimeString({ hour: end.getHours(), minute: end.getMinutes() }));
      } else {
        setEndDate('');
        setEndTime('');
      }
    }
  }, [event, visible]);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartConfirm = (date: Date, time: { hour: number; minute: number }) => {
    setStartDate(toIsoDateString(date));
    setStartTime(toTimeString(time));
  };

  const handleEndConfirm = (date: Date, time: { hour: number; minute: number }) => {
    setEndDate(toIsoDateString(date));
    setEndTime(toTimeString(time));
  };

  const startDateObj = parseDateInput(startDate);
  const startTimeObj = parseTimeInput(startTime);
  const endDateObj = parseDateInput(endDate);
  const endTimeObj = parseTimeInput(endTime);
  const startDisplayValue = formatDisplayDateTime(startDate, startTime);
  const endDisplayValue = formatDisplayDateTime(endDate, endTime);

  const selectedEventTypeLabel = useMemo(() => {
    const category = EVENT_CATEGORIES.find(cat => cat.value === selectedEventType);
    return category?.label || t('SelectEventType');
  }, [selectedEventType, t]);

  const canSave = useMemo(() => {
    return name.trim().length > 0 && selectedEventType !== null;
  }, [name, selectedEventType]);

  const handleSave = useCallback(async () => {
    if (!event || !canSave) return;

    setIsLoading(true);
    try {
      const updateRequest: UpdateEventRequest = {
        name: name.trim() || null,
        description: description.trim() || null,
        eventType: selectedEventType || null,
        startDateTime: startDate && startTime ? combineDateTimeToISO(startDate, startTime) : null,
        endDateTime: endDate && endTime ? combineDateTimeToISO(endDate, endTime) : null,
        coverImageUrl: null,
      };

      await eventService.updateEvent(event.id, { event: updateRequest });
      onUpdate();
      onClose();
    } catch (error) {
      ErrorHandler.handle(error, 'updateEvent');
    } finally {
      setIsLoading(false);
    }
  }, [event, name, description, selectedEventType, startDate, startTime, endDate, endTime, canSave, onUpdate, onClose]);

  if (!event) return null;

  const bottomGutter = Math.max(insets.bottom, 16);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-light-overlay-soft dark:bg-dark-overlay-strong">
          <TouchableWithoutFeedback>
            <View
              className="bg-light-background dark:bg-dark-background rounded-t-3xl overflow-hidden"
              style={{ maxHeight: '90%' }}
            >
              {/* Handle bar */}
              <View className="items-center pt-sm pb-xs">
                <View className="w-10 h-1 rounded-full bg-light-border-strong dark:bg-dark-border-strong" />
              </View>

              {/* Header */}
              <View className="flex-row items-center justify-between px-xl pt-sm pb-md">
                <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={20} color={text.secondary} strokeWidth={2} />
                </TouchableOpacity>
                <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {t('EditInformation')}
                </Text>
                <TouchableOpacity
                  onPress={handleSave}
                  activeOpacity={canSave && !isLoading ? 0.7 : 1}
                  disabled={!canSave || isLoading}
                >
                  <Text
                    className={`text-sm font-semibold ${canSave && !isLoading ? 'text-brand-primary' : 'text-txt-disabled dark:text-txt-dark-tertiary'}`}
                  >
                    {t('Save')}
                  </Text>
                </TouchableOpacity>
              </View>

              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View className="px-xl pt-xl" style={{ paddingBottom: bottomGutter + 20 }}>
                    <View className="mb-2xl">
                      <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                        {t('EventName')}
                      </Text>
                      <TextInput
                        placeholder={t('EventName')}
                        placeholderTextColor={text.tertiary}
                        value={name}
                        onChangeText={setName}
                        className="rounded-lg px-md py-md text-sm text-txt-primary dark:text-txt-dark-primary min-h-[48px]"
                        style={{
                          backgroundColor: surface,
                          borderWidth: 1,
                          borderColor: borderColor,
                        }}
                      />
                    </View>

                    <View className="mb-2xl">
                      <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
                        {t('About')}
                      </Text>
                      <TextInput
                        placeholder={t('About')}
                        placeholderTextColor={text.tertiary}
                        multiline
                        numberOfLines={6}
                        value={description}
                        onChangeText={setDescription}
                        className="rounded-lg px-md py-md text-sm text-txt-primary dark:text-txt-dark-primary min-h-[120px]"
                        style={{
                          backgroundColor: surface,
                          textAlignVertical: 'top',
                          borderWidth: 1,
                          borderColor: borderColor,
                        }}
                      />
                    </View>

                    <View className="mb-2xl">
                      <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                        {t('EventType')}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowEventTypePicker(!showEventTypePicker)}
                        activeOpacity={0.7}
                        className="rounded-lg border px-md py-md flex-row items-center justify-between min-h-[48px]"
                        style={{
                          backgroundColor: surface,
                          borderColor,
                        }}
                      >
                        <Text className="text-sm" style={{ color: selectedEventType ? text.primary : text.tertiary }}>
                          {selectedEventTypeLabel}
                        </Text>
                        <ChevronDown size={18} color={text.tertiary} strokeWidth={2} />
                      </TouchableOpacity>

                      {showEventTypePicker && (
                        <View
                          className="mt-xs rounded-lg border overflow-hidden max-h-[200px]"
                          style={{ backgroundColor: surface, borderColor }}
                        >
                          <ScrollView className="max-h-[200px]" nestedScrollEnabled showsVerticalScrollIndicator={false}>
                            {EVENT_CATEGORIES.map(category => {
                              const isSelected = selectedEventType === category.value;
                              return (
                                <TouchableOpacity
                                  key={category.value}
                                  onPress={() => {
                                    setSelectedEventType(category.value);
                                    setShowEventTypePicker(false);
                                  }}
                                  activeOpacity={0.7}
                                  className="px-md py-sm border-b"
                                  style={{
                                    borderBottomColor: borderColor,
                                    backgroundColor: isSelected ? colors.surfaceElevated : 'transparent',
                                  }}
                                >
                                  <Text
                                    className="text-sm"
                                    style={{
                                      color: isSelected ? text.primary : text.secondary,
                                      fontWeight: isSelected ? '600' : '400',
                                    }}
                                  >
                                    {category.label}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        </View>
                      )}
                    </View>

                    <View className="mb-2xl">
                      <View className="flex-row items-center mb-md gap-sm">
                        <CalendarDays size={18} color={text.secondary} strokeWidth={2} />
                        <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary">
                          {t('Starts')}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowStartPicker(true)}
                        className="rounded-lg border px-md py-md flex-row items-center justify-between min-h-[48px]"
                        style={{ backgroundColor: surface, borderColor }}
                      >
                        <Text className="text-sm" style={{ color: startDisplayValue ? text.primary : text.tertiary }}>
                          {startDisplayValue || t('SelectStartDateAndTime')}
                        </Text>
                        <Clock size={18} color={text.tertiary} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>

                    <View className="mb-2xl">
                      <View className="flex-row items-center mb-md gap-sm">
                        <Clock size={18} color={text.secondary} strokeWidth={2} />
                        <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary">
                          {t('Ends')}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowEndPicker(true)}
                        className="rounded-lg border px-md py-md flex-row items-center justify-between min-h-[48px]"
                        style={{ backgroundColor: surface, borderColor }}
                      >
                        <Text className="text-sm" style={{ color: endDisplayValue ? text.primary : text.tertiary }}>
                          {endDisplayValue || t('SelectEndDateAndTime')}
                        </Text>
                        <Clock size={18} color={text.tertiary} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>

              <DateTimePickerModal
                visible={showStartPicker}
                initialDate={startDateObj || new Date()}
                initialTime={startTimeObj || { hour: 12, minute: 0 }}
                onClose={() => setShowStartPicker(false)}
                onConfirm={handleStartConfirm}
                title={t('SelectStartDateAndTime')}
              />

              <DateTimePickerModal
                visible={showEndPicker}
                initialDate={endDateObj || new Date()}
                initialTime={endTimeObj || { hour: 12, minute: 0 }}
                onClose={() => setShowEndPicker(false)}
                onConfirm={handleEndConfirm}
                title={t('SelectEndDateAndTime')}
              />

              <LoadingOverlay visible={isLoading} message={t('Saving')} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
