import { TimePickerModalProps, TimePreset } from '@/types/pickers';
import { formatTimeToDisplay, parseTime } from '@/utils/dateUtils';
import { Moon, Sun, Sunset, X } from 'lucide-react-native';
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

export default function TimePickerModal({
  visible,
  onClose,
  onSelectTime,
  selectedTime,
  minTime,
  maxTime,
  timeInterval = 15,
  format = '12',
  restrictedHours,
  showPresets = true,
  title = 'Select Time',
}: TimePickerModalProps) {
  const [currentTime, setCurrentTime] = useState(selectedTime || '09:00 AM');
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Default presets
  const defaultPresets: TimePreset[] = [
    {
      label: 'Morning',
      value: '09:00 AM',
      period: 'morning',
    },
    {
      label: 'Afternoon',
      value: '02:00 PM',
      period: 'afternoon',
    },
    {
      label: 'Evening',
      value: '06:00 PM',
      period: 'evening',
    },
  ];

  useEffect(() => {
    if (visible) {
      // Parse selected time when modal opens
      if (selectedTime) {
        const parsed = parseTime(selectedTime);
        setSelectedHour(parsed.hours);
        setSelectedMinute(parsed.minutes);
        setSelectedPeriod(parsed.period);
        setCurrentTime(selectedTime);
      }

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

  // Update current time when selections change
  useEffect(() => {
    const formattedTime = formatTimeToDisplay(
      selectedHour,
      selectedMinute,
      selectedPeriod,
    );
    setCurrentTime(formattedTime);
  }, [selectedHour, selectedMinute, selectedPeriod]);

  const handlePresetSelect = (preset: TimePreset) => {
    const parsed = parseTime(preset.value);
    setSelectedHour(parsed.hours);
    setSelectedMinute(parsed.minutes);
    setSelectedPeriod(parsed.period);
  };

  const handleConfirm = () => {
    onSelectTime(currentTime);
    onClose();
  };

  // Generate hour options (1-12 for 12-hour format)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // Generate minute options based on interval
  const minuteOptions = Array.from(
    { length: Math.floor(60 / timeInterval) },
    (_, i) => i * timeInterval,
  );

  const getPresetIcon = (period: string) => {
    switch (period) {
      case 'morning':
        return <Sun size={16} className="text-warning" />;
      case 'afternoon':
        return <Sunset size={16} className="text-secondary" />;
      case 'evening':
        return <Moon size={16} className="text-primary" />;
      default:
        return null;
    }
  };

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
                  {defaultPresets.map((preset, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handlePresetSelect(preset)}
                      className={`flex-row items-center px-4 py-2 rounded-xl border ${
                        currentTime === preset.value
                          ? 'bg-primary border-primary'
                          : 'bg-background border-divider'
                      }`}>
                      {getPresetIcon(preset.period)}
                      <Text
                        className={`ml-2 text-label-large font-medium ${
                          currentTime === preset.value
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

            {/* Time Display */}
            <View className="p-6 items-center border-b border-divider">
              <Text className="text-display-small font-bold text-primary mb-2">
                {currentTime}
              </Text>
              <Text className="text-body-medium text-text-secondary">
                Selected time
              </Text>
            </View>

            {/* Time Picker Wheels */}
            <View className="p-6">
              <Text className="text-body-large font-medium text-text-primary mb-4">
                Custom Time
              </Text>

              <View className="flex-row items-center justify-center gap-4">
                {/* Hour Picker */}
                <View className="items-center">
                  <Text className="text-label-medium font-medium text-text-secondary mb-2">
                    Hour
                  </Text>
                  <ScrollView
                    className="max-h-32 w-16"
                    showsVerticalScrollIndicator={false}>
                    {hourOptions.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        onPress={() => setSelectedHour(hour)}
                        className={`py-2 px-3 my-1 rounded-lg items-center ${
                          selectedHour === hour ? 'bg-primary' : 'bg-background'
                        }`}>
                        <Text
                          className={`text-body-large font-medium ${
                            selectedHour === hour
                              ? 'text-white'
                              : 'text-text-primary'
                          }`}>
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Separator */}
                <Text className="text-headline-large font-bold text-text-secondary mt-6">
                  :
                </Text>

                {/* Minute Picker */}
                <View className="items-center">
                  <Text className="text-label-medium font-medium text-text-secondary mb-2">
                    Minute
                  </Text>
                  <ScrollView
                    className="max-h-32 w-16"
                    showsVerticalScrollIndicator={false}>
                    {minuteOptions.map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        onPress={() => setSelectedMinute(minute)}
                        className={`py-2 px-3 my-1 rounded-lg items-center ${
                          selectedMinute === minute
                            ? 'bg-primary'
                            : 'bg-background'
                        }`}>
                        <Text
                          className={`text-body-large font-medium ${
                            selectedMinute === minute
                              ? 'text-white'
                              : 'text-text-primary'
                          }`}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Period Picker (AM/PM) */}
                {format === '12' && (
                  <View className="items-center">
                    <Text className="text-label-medium font-medium text-text-secondary mb-2">
                      Period
                    </Text>
                    <View className="gap-2">
                      {(['AM', 'PM'] as const).map((period) => (
                        <TouchableOpacity
                          key={period}
                          onPress={() => setSelectedPeriod(period)}
                          className={`py-2 px-3 rounded-lg items-center ${
                            selectedPeriod === period
                              ? 'bg-primary'
                              : 'bg-background'
                          }`}>
                          <Text
                            className={`text-body-large font-medium ${
                              selectedPeriod === period
                                ? 'text-white'
                                : 'text-text-primary'
                            }`}>
                            {period}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
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
              onPress={handleConfirm}
              className="flex-1 py-3 rounded-xl bg-primary items-center">
              <Text className="text-white font-medium">Confirm</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
