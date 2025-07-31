import {
  DatePickerModal,
  DateTimeInput,
  TimePickerModal,
} from '@/components/ui/pickers';
import { formatDate } from '@/utils/dateUtils';
import { router } from 'expo-router';
import { safeGoBack } from '@/utils/navigation';
import { useAlert } from '@/components/ui/AlertCard';
import {
  Calendar,
  Clock,
  FileText,
  Phone,
  User,
  Shield,
  CheckCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface VisitorFormData {
  visitorName: string;
  contactNumber: string;
  visitDate: string;
  visitTime: string;
  visitPurpose: string;
  category: 'Personal' | 'Delivery' | 'Service' | 'Official';
  preApproved: boolean;
}

const VISITOR_CATEGORIES = [
  {
    key: 'Personal',
    label: 'Personal Visit',
    description: 'Friends, family members',
  },
  {
    key: 'Delivery',
    label: 'Delivery',
    description: 'Amazon, Flipkart, food delivery',
  },
  {
    key: 'Service',
    label: 'Service Provider',
    description: 'Plumber, electrician, cleaning',
  },
  {
    key: 'Official',
    label: 'Official',
    description: 'Government, bank, insurance',
  },
];

const QUICK_TEMPLATES = [
  {
    name: 'Amazon Delivery',
    category: 'Delivery',
    purpose: 'Package delivery',
  },
  {
    name: 'Flipkart Delivery',
    category: 'Delivery',
    purpose: 'Package delivery',
  },
  { name: 'Zomato Delivery', category: 'Delivery', purpose: 'Food delivery' },
  { name: 'Plumber', category: 'Service', purpose: 'Plumbing work' },
  { name: 'Electrician', category: 'Service', purpose: 'Electrical work' },
];

export default function AddVisitor() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Personal');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [preApproved, setPreApproved] = useState(false);

  const { showAlert, AlertComponent } = useAlert();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VisitorFormData>({
    defaultValues: {
      visitorName: '',
      contactNumber: '',
      visitDate: '',
      visitTime: '',
      visitPurpose: '',
      category: 'Personal',
      preApproved: false,
    },
  });

  const validatePhoneNumber = (phone: string): boolean => {
    // Indian mobile number validation: starts with 6-9, followed by 9 digits
    const indianMobileRegex = /^[6-9]\d{9}$/;
    return indianMobileRegex.test(phone.replace(/\D/g, ''));
  };

  const formatPhoneNumber = (text: string): string => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');

    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);

    // Format as XXX-XXX-XXXX for display
    if (limited.length >= 6) {
      return `${limited.substring(0, 3)}-${limited.substring(
        3,
        6,
      )}-${limited.substring(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.substring(0, 3)}-${limited.substring(3)}`;
    }

    return limited;
  };

  const onSubmit = (data: VisitorFormData) => {
    // Validate phone number
    const cleanedPhone = data.contactNumber.replace(/\D/g, '');
    if (!validatePhoneNumber(cleanedPhone)) {
      showAlert({
        type: 'error',
        title: 'Invalid Phone Number',
        message:
          'Please enter a valid Indian mobile number (10 digits, starting with 6-9)',
        primaryAction: {
          label: 'OK',
          onPress: () => {},
        },
      });
      return;
    }

    console.log('Visitor data:', {
      ...data,
      contactNumber: cleanedPhone,
      category: selectedCategory,
      preApproved: preApproved,
    });

    showAlert({
      type: 'success',
      title: 'Success',
      message:
        'Visitor added successfully! You can now track their entry and generate QR codes.',
      primaryAction: {
        label: 'OK',
        onPress: () => safeGoBack(),
      },
    });
  };

  const useTemplate = (template: any) => {
    setValue('visitorName', template.name);
    setValue('visitPurpose', template.purpose);
    setSelectedCategory(template.category);
    setValue('category', template.category as any);
    setShowTemplates(false);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Quick Templates */}
        <View className="mb-6 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-headline-medium font-bold text-text-primary">
              Quick Templates
            </Text>
            <TouchableOpacity
              onPress={() => setShowTemplates(!showTemplates)}
              className={`px-4 py-2 rounded-xl flex-row items-center ${showTemplates ? 'bg-primary' : 'bg-primary/10'}`}>
              <Text
                className={`text-label-medium font-semibold ${showTemplates ? 'text-white' : 'text-primary'}`}>
                {showTemplates ? 'Hide' : 'Show'} Templates
              </Text>
            </TouchableOpacity>
          </View>

          {showTemplates && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4">
              {QUICK_TEMPLATES.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => useTemplate(template)}
                  className="bg-surface border border-divider rounded-2xl p-4 mr-3 min-w-36"
                  activeOpacity={0.8}>
                  <Text className="text-body-medium font-bold text-text-primary mb-2">
                    {template.name}
                  </Text>
                  <View className="bg-primary/10 px-2 py-1 rounded-full">
                    <Text className="text-primary text-label-small font-medium">
                      {template.category}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Visitor Category */}
        <View className="mb-6">
          <Text className="text-headline-medium font-bold text-text-primary mb-4">
            Select Visitor Type
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {VISITOR_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => {
                  setSelectedCategory(category.key);
                  setValue('category', category.key as any);
                }}
                className={`flex-1 min-w-40 p-5 rounded-2xl border ${
                  selectedCategory === category.key
                    ? 'bg-primary/10 border-primary border-2'
                    : 'bg-surface border-divider'
                }`}
                activeOpacity={0.8}>
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    className={`text-body-large font-bold ${
                      selectedCategory === category.key
                        ? 'text-primary'
                        : 'text-text-primary'
                    }`}>
                    {category.label}
                  </Text>
                  {selectedCategory === category.key && (
                    <View className="w-3 h-3 bg-primary rounded-full" />
                  )}
                </View>
                <Text className="text-label-medium text-text-secondary leading-4">
                  {category.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pre-Approval Option */}
        <View className="mb-6">
          <Text className="text-headline-medium font-bold text-text-primary mb-4">
            Pre-Approval Settings
          </Text>
          <TouchableOpacity
            onPress={() => {
              setPreApproved(!preApproved);
              setValue('preApproved', !preApproved);
            }}
            className={`p-5 rounded-2xl border-2 flex-row items-center ${
              preApproved
                ? 'bg-success/10 border-success/30'
                : 'bg-surface border-divider'
            }`}
            activeOpacity={0.8}>
            <View
              className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                preApproved ? 'bg-success/20' : 'bg-primary/10'
              }`}>
              {preApproved ? (
                <CheckCircle size={24} className="text-success" />
              ) : (
                <Shield size={24} className="text-primary" />
              )}
            </View>
            <View className="flex-1">
              <Text
                className={`text-body-large font-bold mb-1 ${
                  preApproved ? 'text-success' : 'text-text-primary'
                }`}>
                {preApproved
                  ? 'Pre-Approved Visitor'
                  : 'Regular Approval Process'}
              </Text>
              <Text className="text-text-secondary text-label-medium leading-4">
                {preApproved
                  ? 'Visitor will get direct gate access without security approval. Use for trusted visitors.'
                  : 'Visitor will need security approval at the gate. Recommended for new or unknown visitors.'}
              </Text>
            </View>
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ml-3 ${
                preApproved ? 'border-success bg-success' : 'border-divider'
              }`}>
              {preApproved && <CheckCircle size={14} color="white" />}
            </View>
          </TouchableOpacity>

          {/* Pre-Approval Info */}
          {preApproved && (
            <View className="mt-3 bg-warning/10 border border-warning/20 rounded-xl p-4">
              <View className="flex-row items-start">
                <Text className="text-warning mr-2">⚠️</Text>
                <View className="flex-1">
                  <Text className="text-warning text-body-medium font-medium mb-1">
                    Pre-Approval Responsibility
                  </Text>
                  <Text className="text-text-secondary text-label-medium leading-4">
                    By pre-approving this visitor, you take full responsibility
                    for their identity and purpose of visit. Security will allow
                    direct entry based on your approval.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Visitor Name */}
        <View className="mb-4">
          <Text className="text-headline-medium font-semibold text-text-primary mb-2">
            Visitor Name
          </Text>
          <Controller
            control={control}
            rules={{
              required: 'Visitor name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="relative">
                <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                  <User size={20} className="text-text-secondary" />
                </View>
                <TextInput
                  placeholder="Enter visitor's full name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="w-full p-4 pl-12 border border-divider rounded-xl bg-surface text-text-primary text-body-large placeholder:text-text-secondary"
                />
              </View>
            )}
            name="visitorName"
          />
          {errors.visitorName && (
            <Text className="text-error text-body-medium mt-2">
              {errors.visitorName.message}
            </Text>
          )}
        </View>

        {/* Contact Number */}
        <View className="mb-4">
          <Text className="text-headline-medium font-bold text-text-primary mb-3">
            Contact Number
          </Text>
          <Controller
            control={control}
            rules={{
              required: 'Contact number is required',
              validate: (value) => {
                const cleaned = value.replace(/\D/g, '');
                if (!validatePhoneNumber(cleaned)) {
                  return 'Enter a valid Indian mobile number (10 digits, starting with 6-9)';
                }
                return true;
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => {
              const cleaned = value.replace(/\D/g, '');
              const isValid =
                validatePhoneNumber(cleaned) && cleaned.length === 10;
              const hasContent = value.length > 0;

              return (
                <View className="relative">
                  <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                    <Phone
                      size={20}
                      className={`${hasContent && isValid ? 'text-success' : 'text-text-secondary'}`}
                    />
                  </View>
                  <TextInput
                    placeholder="9876543210"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      const formatted = formatPhoneNumber(text);
                      onChange(formatted);
                    }}
                    value={value}
                    keyboardType="phone-pad"
                    maxLength={12} // XXX-XXX-XXXX format
                    className={`w-full p-4 pl-12 pr-12 border-2 rounded-2xl bg-surface text-text-primary text-body-large placeholder:text-text-secondary ${
                      errors.contactNumber
                        ? 'border-error'
                        : hasContent && isValid
                          ? 'border-success'
                          : 'border-divider/50'
                    }`}
                  />
                  {hasContent && (
                    <View className="absolute right-4 top-0 bottom-0 justify-center">
                      <View
                        className={`w-2 h-2 rounded-full ${isValid ? 'bg-success' : 'bg-warning'}`}
                      />
                    </View>
                  )}
                </View>
              );
            }}
            name="contactNumber"
          />
          {errors.contactNumber ? (
            <Text className="text-error text-body-medium mt-2 ml-1">
              {errors.contactNumber.message}
            </Text>
          ) : (
            <Text className="text-text-secondary text-label-medium mt-2 ml-1">
              Enter 10-digit Indian mobile number (starting with 6, 7, 8, or 9)
            </Text>
          )}
        </View>

        {/* Date and Time Row */}
        <View className="flex-row gap-4 mb-4">
          {/* Visit Date */}
          <Controller
            control={control}
            rules={{
              required: 'Visit date is required',
            }}
            render={({ field: { onChange, value } }) => (
              <DateTimeInput
                type="date"
                label="Visit Date"
                value={selectedDate ? formatDate(selectedDate) : ''}
                onPress={() => setShowDatePicker(true)}
                placeholder="DD/MM/YYYY"
                error={errors.visitDate?.message}
                icon={<Calendar size={20} className="text-primary" />}
              />
            )}
            name="visitDate"
          />

          {/* Visit Time */}
          <Controller
            control={control}
            rules={{
              required: 'Visit time is required',
            }}
            render={({ field: { onChange, value } }) => (
              <DateTimeInput
                type="time"
                label="Visit Time"
                value={selectedTime}
                onPress={() => setShowTimePicker(true)}
                placeholder="10:00 AM"
                error={errors.visitTime?.message}
                icon={<Clock size={20} className="text-primary" />}
              />
            )}
            name="visitTime"
          />
        </View>

        {/* Purpose of Visit */}
        <View className="mb-6">
          <Text className="text-headline-medium font-semibold text-text-primary mb-2">
            Purpose of Visit
          </Text>
          <Controller
            control={control}
            rules={{
              required: 'Purpose of visit is required',
              minLength: {
                value: 3,
                message: 'Purpose must be at least 3 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <FileText size={20} className="text-text-secondary" />
                </View>
                <TextInput
                  placeholder="Brief description of the visit purpose"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="w-full p-4 pl-12 border border-divider rounded-xl bg-surface text-text-primary text-body-large placeholder:text-text-secondary min-h-20"
                />
              </View>
            )}
            name="visitPurpose"
          />
          {errors.visitPurpose && (
            <Text className="text-error text-body-medium mt-2">
              {errors.visitPurpose.message}
            </Text>
          )}
        </View>

        {/* Submit Button - Always Visible */}
        <View className="my-6">
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="p-5 rounded-2xl border-2"
            style={{
              backgroundColor: preApproved ? '#4CAF50' : '#6366f1',
              borderColor: preApproved ? '#4CAF50' : '#6366f1',
            }}
            activeOpacity={0.8}>
            <Text className="text-white text-center font-bold text-headline-medium">
              {preApproved ? 'Submit Pre-Approved Visitor' : 'Add Visitor'}
            </Text>
            <Text
              className="text-white text-center font-medium text-label-large mt-1"
              style={{ opacity: 0.9 }}>
              {preApproved
                ? 'Add to visitor list with pre-approved status'
                : 'Submit for approval & generate QR code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Info Cards */}
        <View className="gap-4 mb-6">
          {/* Quick Tip */}
          <View className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
            <View className="flex-row items-start">
              <View className="bg-primary/20 p-2 rounded-full mr-3">
                <Text className="text-primary">📱</Text>
              </View>
              <View className="flex-1">
                <Text className="text-primary text-body-medium font-bold mb-2">
                  Instant QR Generation
                </Text>
                <Text className="text-text-secondary text-body-medium leading-5">
                  Your visitor will get a QR code once approved for contactless
                  gate entry and faster security verification.
                </Text>
              </View>
            </View>
          </View>

          {/* Security Note */}
          <View className="bg-success/10 border border-success/20 rounded-2xl p-5">
            <View className="flex-row items-start">
              <View className="bg-success/20 p-2 rounded-full mr-3">
                <Text className="text-success">🔒</Text>
              </View>
              <View className="flex-1">
                <Text className="text-success text-body-medium font-bold mb-2">
                  Security & Privacy
                </Text>
                <Text className="text-text-secondary text-body-medium leading-5">
                  All visitor data is encrypted and automatically purged after
                  the visit is completed for maximum privacy.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setValue('visitDate', formatDate(date));
          setShowDatePicker(false);
        }}
        selectedDate={selectedDate || undefined}
        allowPastDates={false}
        maxDaysInAdvance={30}
        showPresets={true}
        title="Select Visit Date"
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelectTime={(time) => {
          setSelectedTime(time);
          setValue('visitTime', time);
          setShowTimePicker(false);
        }}
        selectedTime={selectedTime || undefined}
        format="12"
        timeInterval={15}
        restrictedHours={{
          start: '06:00 AM',
          end: '10:00 PM',
        }}
        showPresets={true}
        title="Select Visit Time"
      />

      {/* Custom Alert Component */}
      {AlertComponent}
    </View>
  );
}
