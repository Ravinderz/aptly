import { DatePickerModalProps, DatePreset } from '@/types/pickers';
import {
  addDays,
  getNextWeekend,
  isDateInRange,
  isPastDate,
  isToday,
} from '@/utils/dateUtils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DatePickerModal({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  minDate,
  maxDate,
  allowPastDates = false,
  maxDaysInAdvance = 30,
  showPresets = true,
  presetOptions,
  title = 'Select Date',
}: DatePickerModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Default presets
  const defaultPresets: DatePreset[] = [
    {
      label: 'Today',
      value: new Date(),
      icon: <Calendar size={16} className="text-primary" />,
    },
    {
      label: 'Tomorrow',
      value: addDays(new Date(), 1),
      icon: <Clock size={16} className="text-primary" />,
    },
    {
      label: 'This Weekend',
      value: getNextWeekend(),
      icon: <Calendar size={16} className="text-primary" />,
    },
  ];

  const presets = presetOptions || defaultPresets;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days: Date[] = [];

    // Add empty cells for days before the first day of month
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(new Date(0)); // Invalid date for empty cells
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateDisabled = (date: Date): boolean => {
    if (date.getTime() === 0) return true; // Empty cell

    // Check past dates restriction
    if (!allowPastDates && isPastDate(date)) return true;

    // Check date range
    if (!isDateInRange(date, minDate, maxDate)) return true;

    // Check max days in advance
    if (maxDaysInAdvance) {
      const maxAllowedDate = addDays(new Date(), maxDaysInAdvance);
      if (date > maxAllowedDate) return true;
    }

    return false;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate || date.getTime() === 0) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    onSelectDate(date);
  };

  const handlePresetSelect = (preset: DatePreset) => {
    if (!isDateDisabled(preset.value)) {
      onSelectDate(preset.value);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(viewDate);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}>
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 bg-black/50 justify-end">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
          }}
          className="bg-surface rounded-t-3xl shadow-xl shadow-black/10">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-divider">
            <Text className="text-headline-large font-semibold text-text-primary">
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-background items-center justify-center">
              <X size={20} className="text-text-primary" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="max-h-128"
            showsVerticalScrollIndicator={false}>
            {/* Quick Presets */}
            {showPresets && (
              <View className="p-6 border-b border-divider">
                <Text className="text-body-large font-medium text-text-primary mb-3">
                  Quick Select
                </Text>
                <View className="flex-row gap-3">
                  {presets.map((preset, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handlePresetSelect(preset)}
                      disabled={isDateDisabled(preset.value)}
                      className={`flex-row items-center px-4 py-2 rounded-xl border ${
                        isDateDisabled(preset.value)
                          ? 'bg-background border-divider opacity-50'
                          : isDateSelected(preset.value)
                            ? 'bg-primary border-primary'
                            : 'bg-background border-divider'
                      }`}>
                      {preset.icon}
                      <Text
                        className={`ml-2 text-label-large font-medium ${
                          isDateDisabled(preset.value)
                            ? 'text-text-secondary'
                            : isDateSelected(preset.value)
                              ? 'text-white'
                              : 'text-text-primary'
                        }`}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Calendar Header */}
            <View className="p-6 pb-3">
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                  onPress={() => navigateMonth('prev')}
                  className="w-10 h-10 rounded-full bg-background items-center justify-center">
                  <ChevronLeft size={20} className="text-text-primary" />
                </TouchableOpacity>

                <Text className="text-headline-medium font-semibold text-text-primary">
                  {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </Text>

                <TouchableOpacity
                  onPress={() => navigateMonth('next')}
                  className="w-10 h-10 rounded-full bg-background items-center justify-center">
                  <ChevronRight size={20} className="text-text-primary" />
                </TouchableOpacity>
              </View>

              {/* Week Days Header */}
              <View className="flex-row mb-2">
                {weekDays.map((day) => (
                  <View key={day} className="flex-1 items-center py-2">
                    <Text className="text-label-medium font-medium text-text-secondary">
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Calendar Grid */}
              <View className="flex-row flex-wrap">
                {days.map((date, index) => {
                  const isEmpty = date.getTime() === 0;
                  const isDisabled = isDateDisabled(date);
                  const isSelected = isDateSelected(date);
                  const isTodayDate = isToday(date);

                  return (
                    <View
                      key={index}
                      className="aspect-square p-1"
                      style={{ width: '14.28%' }}>
                      {!isEmpty && (
                        <TouchableOpacity
                          onPress={() => handleDateSelect(date)}
                          disabled={isDisabled}
                          className={`flex-1 rounded-xl items-center justify-center ${
                            isSelected
                              ? 'bg-primary'
                              : isTodayDate && !isSelected
                                ? 'bg-primary/10 border border-primary'
                                : 'bg-transparent'
                          }`}>
                          <Text
                            className={`text-body-medium font-medium ${
                              isDisabled
                                ? 'text-text-secondary opacity-30'
                                : isSelected
                                  ? 'text-white'
                                  : isTodayDate
                                    ? 'text-primary'
                                    : 'text-text-primary'
                            }`}>
                            {date.getDate()}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row gap-3 p-6 pt-4 border-t border-divider">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 rounded-xl border border-divider items-center">
              <Text className="text-text-primary font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              disabled={!selectedDate}
              className={`flex-1 py-3 rounded-xl items-center ${
                selectedDate ? 'bg-primary' : 'bg-primary/30'
              }`}>
              <Text
                className={`font-medium ${
                  selectedDate ? 'text-white' : 'text-white/60'
                }`}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
