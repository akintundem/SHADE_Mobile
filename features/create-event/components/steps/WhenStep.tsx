import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { CalendarDays, Clock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import {
  DateTimePickerModal,
  formatDisplayDateTime,
  parseDateInput,
  parseTimeInput,
  toIsoDateString,
  toTimeString,
} from '../../../../common/datetime';

type Props = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  onStartDateChange: (text: string) => void;
  onStartTimeChange: (text: string) => void;
  onEndDateChange: (text: string) => void;
  onEndTimeChange: (text: string) => void;
  onStartDateBlur: () => void;
  onStartTimeBlur: () => void;
  startDateError?: string;
  startTimeError?: string;
};

export function WhenStep({
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onStartDateBlur,
  onStartTimeBlur,
  startDateError,
  startTimeError,
}: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartConfirm = (date: Date, time: { hour: number; minute: number }) => {
    onStartDateChange(toIsoDateString(date));
    onStartTimeChange(toTimeString(time));
    onStartDateBlur();
    onStartTimeBlur();
  };

  const handleEndConfirm = (date: Date, time: { hour: number; minute: number }) => {
    onEndDateChange(toIsoDateString(date));
    onEndTimeChange(toTimeString(time));
  };

  const startDateObj = parseDateInput(startDate);
  const startTimeObj = parseTimeInput(startTime);
  const endDateObj = parseDateInput(endDate);
  const endTimeObj = parseTimeInput(endTime);
  const startDisplayValue = formatDisplayDateTime(startDate, startTime);
  const endDisplayValue = formatDisplayDateTime(endDate, endTime);

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <View style={{ marginBottom: spacing.xl }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: typography.weight.bold,
                  fontSize: typography.size['2xl'],
                  marginBottom: spacing.xs,
                }}
              >
                When
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                }}
              >
                Schedule your event
              </Text>
            </View>

            <View style={{ gap: spacing.lg }}>
              {/* Start */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                  <CalendarDays size={20} color={colors.text.secondary} />
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.sm,
                      fontWeight: typography.weight.medium,
                    }}
                  >
                    Start
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowStartPicker(true)}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.lg,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    minHeight: 48,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.size.base,
                      color: startDisplayValue ? colors.text.primary : colors.text.tertiary,
                    }}
                  >
                    {startDisplayValue || 'Select start date and time'}
                  </Text>
                  <ChevronRight size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
                {startDateError && (
                  <Text style={{ color: colors.semantic.error, fontSize: typography.size.xs, marginTop: spacing.xs }}>
                    {startDateError}
                  </Text>
                )}
                {startTimeError && (
                  <Text style={{ color: colors.semantic.error, fontSize: typography.size.xs, marginTop: spacing.xs }}>
                    {startTimeError}
                  </Text>
                )}
              </View>

              {/* End */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                  <Clock size={20} color={colors.text.secondary} />
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.size.sm,
                      fontWeight: typography.weight.medium,
                    }}
                  >
                    End
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowEndPicker(true)}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.lg,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    minHeight: 48,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.size.base,
                      color: endDisplayValue ? colors.text.primary : colors.text.tertiary,
                    }}
                  >
                    {endDisplayValue || 'Select end date and time'}
                  </Text>
                  <ChevronRight size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Date/Time Pickers */}
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
