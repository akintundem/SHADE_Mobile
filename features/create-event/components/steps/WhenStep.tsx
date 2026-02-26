import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { CalendarDays, Clock, ChevronRight } from 'lucide-react-native';
import {
  DateTimePickerModal,
  formatDisplayDateTime,
  parseDateInput,
  parseTimeInput,
  toIsoDateString,
  toTimeString,
} from '../../../../common/datetime';
import { useCreateEvent } from '../../context';
import { useTheme } from '../../../../common/theme/ThemeProvider';

export function WhenStep() {
  const { form, actions, validation } = useCreateEvent();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const { colors } = useTheme();
  const iconColor = colors.text.secondary;
  const iconTertiary = colors.text.tertiary;

  const handleStartConfirm = (date: Date, time: { hour: number; minute: number }) => {
    const isoDate = toIsoDateString(date);
    const isoTime = toTimeString(time);
    actions.setStartDate(isoDate);
    actions.setStartTime(isoTime);
    validation.setFieldTouched('startDate');
    validation.setFieldTouched('startTime');
    validation.validateField('startDate', isoDate);
    validation.validateField('startTime', isoTime);
  };

  const handleEndConfirm = (date: Date, time: { hour: number; minute: number }) => {
    const isoDate = toIsoDateString(date);
    const isoTime = toTimeString(time);
    actions.setEndDate(isoDate);
    actions.setEndTime(isoTime);
    validation.validateField('endDate', isoDate);
    validation.validateField('endTime', isoTime);
  };

  const startDateObj = parseDateInput(form.startDate);
  const startTimeObj = parseTimeInput(form.startTime);
  const endDateObj = parseDateInput(form.endDate);
  const endTimeObj = parseTimeInput(form.endTime);
  const startDisplayValue = formatDisplayDateTime(form.startDate, form.startTime);
  const endDisplayValue = formatDisplayDateTime(form.endDate, form.endTime);

  const startDateError = validation.getFieldError('startDate');
  const startTimeError = validation.getFieldError('startTime');

  return (
    <>
      <ScrollView keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="px-lg pt-xl pb-[120px]">
            <View className="mb-xl">
              <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary mb-xs">
                When
              </Text>
              <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary">
                Schedule your event
              </Text>
            </View>

            <View className="gap-lg">
              <View>
                <View className="flex-row items-center gap-sm mb-sm">
                  <CalendarDays size={20} color={iconColor} />
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    Start
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowStartPicker(true)}
                  className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-md py-md min-h-[48px] flex-row items-center justify-between"
                  activeOpacity={0.7}
                >
                  <Text className={`text-base ${startDisplayValue ? 'text-txt-primary dark:text-txt-dark-primary' : 'text-txt-tertiary dark:text-txt-dark-tertiary'}`}>
                    {startDisplayValue || 'Select start date and time'}
                  </Text>
                  <ChevronRight size={20} color={iconTertiary} />
                </TouchableOpacity>
                {startDateError ? (
                  <Text className="text-semantic-error text-xs mt-xs">
                    {startDateError}
                  </Text>
                ) : null}
                {startTimeError ? (
                  <Text className="text-semantic-error text-xs mt-xs">
                    {startTimeError}
                  </Text>
                ) : null}
              </View>

              <View>
                <View className="flex-row items-center gap-sm mb-sm">
                  <Clock size={20} color={iconColor} />
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    End
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowEndPicker(true)}
                  className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-md py-md min-h-[48px] flex-row items-center justify-between"
                  activeOpacity={0.7}
                >
                  <Text className={`text-base ${endDisplayValue ? 'text-txt-primary dark:text-txt-dark-primary' : 'text-txt-tertiary dark:text-txt-dark-tertiary'}`}>
                    {endDisplayValue || 'Select end date and time'}
                  </Text>
                  <ChevronRight size={20} color={iconTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <DateTimePickerModal
        visible={showStartPicker}
        initialDate={startDateObj || new Date()}
        initialTime={startTimeObj || { hour: 12, minute: 0 }}
        onClose={() => setShowStartPicker(false)}
        onConfirm={handleStartConfirm}
        title="Select Start Date & Time"
      />

      <DateTimePickerModal
        visible={showEndPicker}
        initialDate={endDateObj || new Date()}
        initialTime={endTimeObj || { hour: 12, minute: 0 }}
        onClose={() => setShowEndPicker(false)}
        onConfirm={handleEndConfirm}
        title="Select End Date & Time"
      />
    </>
  );
}
