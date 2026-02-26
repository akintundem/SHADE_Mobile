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
import { useTheme } from '../theme/ThemeProvider';

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
  const { colors } = useTheme();
  
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
  };

  const handleConfirm = () => {
    const hour24 = isAM 
      ? (selectedHour === 12 ? 0 : selectedHour)
      : (selectedHour === 12 ? 12 : selectedHour + 12);
    
    onConfirm(selectedDate, { hour: hour24, minute: selectedMinute });
    onClose();
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
      <View className="flex-1 justify-end bg-light-overlay dark:bg-dark-overlay">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          className="bg-light-background dark:bg-dark-background rounded-t-xl pt-lg max-h-[80%]"
          style={{ paddingBottom: Platform.OS === 'ios' ? 64 : 20 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-lg mb-lg">
            <Text
              className="text-xl font-bold text-txt-primary dark:text-txt-dark-primary"
            >
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-xs">
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Date Picker */}
            <View className="px-lg mb-xl">
              <Text
                className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary mb-md"
              >
                Date
              </Text>

              {/* Month Navigation */}
              <View className="flex-row items-center justify-between mb-md">
                <TouchableOpacity onPress={handlePrevMonth} className="p-xs">
                  <ChevronLeft size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text
                  className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary"
                >
                  {monthNames[currentMonth]} {currentYear}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} className="p-xs">
                  <ChevronRight size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Calendar Grid */}
              <View>
                {/* Week day headers */}
                <View className="flex-row mb-sm">
                  {weekDays.map((day) => (
                    <View
                      key={day}
                      className="flex-1 items-center py-sm"
                    >
                      <Text
                        className="text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary"
                      >
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Calendar days */}
                <View className="flex-row flex-wrap">
                  {emptyDays.map((_, index) => (
                    <View key={`empty-${index}`} className="w-[14.28%] aspect-square" />
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
                        className="items-center justify-center mb-xs w-[14.28%] aspect-square"
                      >
                        <View
                          className={`items-center justify-center rounded-full w-[80%] aspect-square ${
                            isSelected ? 'bg-neutral-black dark:bg-neutral-white' : 'bg-transparent'
                          } ${isToday && !isSelected ? 'border border-light-border dark:border-dark-border' : ''}`}
                        >
                          <Text
                            className={`text-base ${isSelected ? 'font-semibold' : 'font-normal'} ${
                              isSelected
                                ? 'text-txt-inverse dark:text-txt-dark-inverse'
                                : 'text-txt-primary dark:text-txt-dark-primary'
                            }`}
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
            <View className="px-lg mb-xl">
              <Text
                className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary mb-md"
              >
                Time
              </Text>

              <View className="flex-row gap-md">
                {/* Hour */}
                <View className="flex-1">
                  <ScrollView
                    className="bg-light-surface dark:bg-dark-surface rounded-lg max-h-[200px]"
                    showsVerticalScrollIndicator={false}
                  >
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        onPress={() => setSelectedHour(hour)}
                        className={`py-md px-md items-center rounded-md ${
                          selectedHour === hour ? 'bg-light-border dark:bg-dark-border' : 'bg-transparent'
                        }`}
                      >
                        <Text
                          className={`text-lg ${
                            selectedHour === hour ? 'font-semibold' : 'font-normal'
                          } ${selectedHour === hour
                            ? 'text-txt-primary dark:text-txt-dark-primary'
                            : 'text-txt-secondary dark:text-txt-dark-secondary'}`}
                        >
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Minute */}
                <View className="flex-1">
                  <ScrollView
                    className="bg-light-surface dark:bg-dark-surface rounded-lg max-h-[200px]"
                    showsVerticalScrollIndicator={false}
                  >
                    {minutes.map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        onPress={() => setSelectedMinute(minute)}
                        className={`py-md px-md items-center rounded-md ${
                          selectedMinute === minute ? 'bg-light-border dark:bg-dark-border' : 'bg-transparent'
                        }`}
                      >
                        <Text
                          className={`text-lg ${
                            selectedMinute === minute ? 'font-semibold' : 'font-normal'
                          } ${selectedMinute === minute
                            ? 'text-txt-primary dark:text-txt-dark-primary'
                            : 'text-txt-secondary dark:text-txt-dark-secondary'}`}
                        >
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* AM/PM */}
                <View className="flex-[0.6]">
                  <View
                    className="bg-light-surface dark:bg-dark-surface rounded-lg overflow-hidden"
                  >
                    <TouchableOpacity
                      onPress={() => setIsAM(true)}
                      className={`py-md items-center ${isAM ? 'bg-neutral-black dark:bg-neutral-white' : 'bg-transparent'}`}
                    >
                      <Text
                        className={`text-base ${isAM ? 'font-semibold' : 'font-normal'} ${
                          isAM
                            ? 'text-txt-inverse dark:text-txt-dark-inverse'
                            : 'text-txt-secondary dark:text-txt-dark-secondary'
                        }`}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsAM(false)}
                      className={`py-md items-center ${!isAM ? 'bg-neutral-black dark:bg-neutral-white' : 'bg-transparent'}`}
                    >
                      <Text
                        className={`text-base ${!isAM ? 'font-semibold' : 'font-normal'} ${
                          !isAM
                            ? 'text-txt-inverse dark:text-txt-dark-inverse'
                            : 'text-txt-secondary dark:text-txt-dark-secondary'
                        }`}
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
          <View className="px-lg pt-md">
            <TouchableOpacity
              onPress={handleConfirm}
              className="h-14 rounded-lg items-center justify-center bg-neutral-black dark:bg-neutral-white"
            >
              <Text
                className="text-lg font-semibold text-txt-inverse dark:text-txt-dark-inverse"
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
