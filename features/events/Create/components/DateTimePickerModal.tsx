import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

type Props = {
  visible: boolean;
  initialDate?: Date;
  initialTime?: { hour: number; minute: number };
  onClose: () => void;
  onConfirm: (date: Date, time: { hour: number; minute: number }) => void;
  title: string;
};

export function DateTimePickerModal({
  visible,
  initialDate,
  initialTime,
  onClose,
  onConfirm,
  title,
}: Props) {
  const { colors, typography, spacing, borderRadius, brand, isDark } = useTheme();
  
  // Convert 24-hour to 12-hour format for display
  const get12Hour = (hour24: number) => {
    if (hour24 === 0) return 12;
    if (hour24 > 12) return hour24 - 12;
    return hour24;
  };
  
  const initialHour24 = initialTime?.hour || 12;
  const initialDateValue = initialDate || new Date();
  const initialHour12 = get12Hour(initialHour24);
  const initialMinute = initialTime?.minute || 0;
  const initialIsAM = initialHour24 < 12;

  const [selectedDate, setSelectedDate] = useState<Date>(initialDateValue);
  const [selectedHour, setSelectedHour] = useState<number>(initialHour12);
  const [selectedMinute, setSelectedMinute] = useState<number>(initialMinute);
  const [isAM, setIsAM] = useState<boolean>(initialIsAM);

  // Update state when modal opens with new initial values
  useEffect(() => {
    if (visible) {
      setSelectedDate(initialDate || new Date());
      setSelectedHour(get12Hour(initialTime?.hour || 12));
      setSelectedMinute(initialTime?.minute || 0);
      setIsAM((initialTime?.hour || 12) < 12);
    }
  }, [visible, initialDate, initialTime]);

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const currentDay = selectedDate.getDate();

  // Generate days for current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDaySelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    console.log('Day selected:', day, 'New date:', newDate);
  };

  const handleConfirm = () => {
    const hour24 = isAM 
      ? (selectedHour === 12 ? 0 : selectedHour)
      : (selectedHour === 12 ? 12 : selectedHour + 12);
    
    console.log('Confirming:', {
      date: selectedDate,
      hour24,
      minute: selectedMinute,
      isAM
    });
    
    onConfirm(selectedDate, { hour: hour24, minute: selectedMinute });
    onClose();
  };

  const formatTime = () => {
    const hour12 = selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;
    const minuteStr = selectedMinute.toString().padStart(2, '0');
    const period = isAM ? 'AM' : 'PM';
    return `${hour12}:${minuteStr} ${period}`;
  };

  const formatDate = () => {
    return `${currentYear} - ${(currentMonth + 1).toString().padStart(2, '0')} - ${currentDay.toString().padStart(2, '0')}`;
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  // Show minutes in 5-minute intervals for better UX
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            paddingTop: spacing.lg,
            paddingBottom: Platform.OS === 'ios' ? spacing['6xl'] : spacing.xl,
            maxHeight: '80%',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.lg,
            }}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: typography.weight.bold,
                fontSize: typography.size.xl,
              }}
            >
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: spacing.xs }}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Date Picker */}
            <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.xl }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.semibold,
                  marginBottom: spacing.md,
                }}
              >
                Date
              </Text>

              {/* Month Navigation */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing.md,
                }}
              >
                <TouchableOpacity onPress={handlePrevMonth} style={{ padding: spacing.xs }}>
                  <ChevronLeft size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.size.lg,
                    fontWeight: typography.weight.semibold,
                  }}
                >
                  {monthNames[currentMonth]} {currentYear}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={{ padding: spacing.xs }}>
                  <ChevronRight size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Calendar Grid */}
              <View>
                {/* Week day headers */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginBottom: spacing.sm,
                  }}
                >
                  {weekDays.map((day) => (
                    <View
                      key={day}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: spacing.sm,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.text.secondary,
                          fontSize: typography.size.sm,
                          fontWeight: typography.weight.medium,
                        }}
                      >
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Calendar days */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {emptyDays.map((_, index) => (
                    <View key={`empty-${index}`} style={{ width: '14.28%', aspectRatio: 1 }} />
                  ))}
                  {days.map((day) => {
                    const isSelected = day === currentDay;
                    const isToday = day === new Date().getDate() && 
                                   currentMonth === new Date().getMonth() &&
                                   currentYear === new Date().getFullYear();
                    
                    return (
                      <TouchableOpacity
                        key={day}
                        onPress={() => handleDaySelect(day)}
                        style={{
                          width: '14.28%',
                          aspectRatio: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: spacing.xs,
                        }}
                      >
                        <View
                          style={{
                            width: '80%',
                            aspectRatio: 1,
                            borderRadius: borderRadius.full,
                            backgroundColor: isSelected
                              ? (isDark ? '#FFFFFF' : '#000000')
                              : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: isToday && !isSelected ? 1 : 0,
                            borderColor: colors.border,
                          }}
                        >
                          <Text
                            style={{
                              color: isSelected
                                ? (isDark ? '#000000' : '#FFFFFF')
                                : colors.text.primary,
                              fontSize: typography.size.base,
                              fontWeight: isSelected
                                ? typography.weight.semibold
                                : typography.weight.regular,
                            }}
                          >
                            {day}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Time Picker */}
            <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.xl }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.semibold,
                  marginBottom: spacing.md,
                }}
              >
                Time
              </Text>

              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {/* Hour */}
                <View style={{ flex: 1 }}>
                  <ScrollView
                    style={{
                      maxHeight: 200,
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                    }}
                    showsVerticalScrollIndicator={false}
                  >
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        onPress={() => setSelectedHour(hour)}
                        style={{
                          paddingVertical: spacing.md,
                          paddingHorizontal: spacing.md,
                          alignItems: 'center',
                          backgroundColor: selectedHour === hour ? colors.border : 'transparent',
                          borderRadius: borderRadius.md,
                        }}
                      >
                        <Text
                          style={{
                            color: selectedHour === hour ? colors.text.primary : colors.text.secondary,
                            fontSize: typography.size.lg,
                            fontWeight: selectedHour === hour
                              ? typography.weight.semibold
                              : typography.weight.regular,
                          }}
                        >
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Minute */}
                <View style={{ flex: 1 }}>
                  <ScrollView
                    style={{
                      maxHeight: 200,
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                    }}
                    showsVerticalScrollIndicator={false}
                  >
                    {minutes.map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        onPress={() => setSelectedMinute(minute)}
                        style={{
                          paddingVertical: spacing.md,
                          paddingHorizontal: spacing.md,
                          alignItems: 'center',
                          backgroundColor: selectedMinute === minute ? colors.border : 'transparent',
                          borderRadius: borderRadius.md,
                        }}
                      >
                        <Text
                          style={{
                            color: selectedMinute === minute ? colors.text.primary : colors.text.secondary,
                            fontSize: typography.size.lg,
                            fontWeight: selectedMinute === minute
                              ? typography.weight.semibold
                              : typography.weight.regular,
                          }}
                        >
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* AM/PM */}
                <View style={{ flex: 0.6 }}>
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius.lg,
                      overflow: 'hidden',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setIsAM(true)}
                      style={{
                        paddingVertical: spacing.md,
                        alignItems: 'center',
                        backgroundColor: isAM ? (isDark ? '#FFFFFF' : '#000000') : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          color: isAM ? (isDark ? '#000000' : '#FFFFFF') : colors.text.secondary,
                          fontSize: typography.size.base,
                          fontWeight: isAM ? typography.weight.semibold : typography.weight.regular,
                        }}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsAM(false)}
                      style={{
                        paddingVertical: spacing.md,
                        alignItems: 'center',
                        backgroundColor: !isAM ? (isDark ? '#FFFFFF' : '#000000') : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          color: !isAM ? (isDark ? '#000000' : '#FFFFFF') : colors.text.secondary,
                          fontSize: typography.size.base,
                          fontWeight: !isAM ? typography.weight.semibold : typography.weight.regular,
                        }}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Confirm Button */}
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                height: 56,
                borderRadius: borderRadius.lg,
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: isDark ? '#000000' : '#FFFFFF',
                  fontWeight: typography.weight.semibold,
                  fontSize: typography.size.lg,
                }}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

