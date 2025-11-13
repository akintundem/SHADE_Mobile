import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { CalendarDays, Clock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { DateTimePickerModal } from '../DateTimePickerModal';

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

  const parseDateTime = (dateStr: string, timeStr: string): { date: Date | null; time: { hour: number; minute: number } | null } => {
    let date: Date | null = null;
    let time: { hour: number; minute: number } | null = null;

    if (dateStr) {
      const [year, month, day] = dateStr.split(' - ').map(Number);
      if (year && month && day) {
        date = new Date(year, month - 1, day);
      }
    }

    if (timeStr) {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = parseInt(match[2]);
        const period = match[3].toUpperCase();
        
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        
        time = { hour, minute };
      }
    }

    return { date, time };
  };

  const handleStartConfirm = (date: Date, time: { hour: number; minute: number }) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const hour12 = time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
    const minuteStr = time.minute.toString().padStart(2, '0');
    const period = time.hour < 12 ? 'AM' : 'PM';
    
    onStartDateChange(`${year} - ${month} - ${day}`);
    onStartTimeChange(`${hour12}:${minuteStr} ${period}`);
    onStartDateBlur();
    onStartTimeBlur();
  };

  const handleEndConfirm = (date: Date, time: { hour: number; minute: number }) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const hour12 = time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
    const minuteStr = time.minute.toString().padStart(2, '0');
    const period = time.hour < 12 ? 'AM' : 'PM';
    
    onEndDateChange(`${year} - ${month} - ${day}`);
    onEndTimeChange(`${hour12}:${minuteStr} ${period}`);
  };

  const { date: startDateObj, time: startTimeObj } = parseDateTime(startDate, startTime);
  const { date: endDateObj, time: endTimeObj } = parseDateTime(endDate, endTime);

  const formatDisplayValue = (dateStr: string, timeStr: string) => {
    if (!dateStr && !timeStr) return null;
    const parts = [];
    if (dateStr) parts.push(dateStr);
    if (timeStr) parts.push(timeStr);
    return parts.join(' at ');
  };

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
                      color: formatDisplayValue(startDate, startTime)
                        ? colors.text.primary
                        : colors.text.tertiary,
                    }}
                  >
                    {formatDisplayValue(startDate, startTime) || 'Select start date and time'}
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
                      color: formatDisplayValue(endDate, endTime)
                        ? colors.text.primary
                        : colors.text.tertiary,
                    }}
                  >
                    {formatDisplayValue(endDate, endTime) || 'Select end date and time'}
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

