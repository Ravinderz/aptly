/**
 * Society Profile Complete Screen
 * 
 * Consolidated form for all remaining user details:
 * - Personal details (name, email optional)
 * - Residence details (flat number, ownership type)
 * - Emergency contact (single required contact)
 * - Vehicle info (optional, collapsible)
 */
import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { Button } from '@/components/ui/Button';
import LucideIcons from '@/components/ui/LucideIcons';
import {
  ResponsiveContainer,
  ResponsiveText,
} from '@/components/ui/ResponsiveContainer';
import { useFormValidation } from '@/hooks/useFormValidation';
import {
  useSocietyOnboardingActions,
  useSocietyOnboardingStore,
} from '@/stores/slices/societyOnboardingStore';
import { showErrorAlert, showSuccessAlert } from '@/utils/alert';
import { responsive } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { z } from 'zod';

// Validation schema for complete profile
const profileCompleteSchema = z.object({
  // Personal details
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  
  // Residence details
  flatNumber: z
    .string()
    .min(1, 'Flat number is required')
    .max(10, 'Flat number cannot exceed 10 characters'),
  ownershipType: z.enum(['owner', 'tenant'], {
    errorMap: () => ({ message: 'Please select ownership type' }),
  }),
  
  // Emergency contact
  emergencyContactName: z
    .string()
    .min(2, 'Contact name must be at least 2 characters')
    .max(50, 'Contact name cannot exceed 50 characters'),
  emergencyContactPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+91\d{10}$/, 'Phone number must be in format +91XXXXXXXXXX'),
  emergencyContactRelationship: z
    .string()
    .min(1, 'Relationship is required')
    .max(30, 'Relationship cannot exceed 30 characters'),
  
  // Vehicle info (optional)
  hasVehicle: z.boolean().default(false),
  vehicleType: z.enum(['2-wheeler', '4-wheeler']).optional(),
  vehicleRegistrationNumber: z
    .string()
    .max(15, 'Registration number cannot exceed 15 characters')
    .optional()
    .or(z.literal('')),
});

type ProfileCompleteForm = z.infer<typeof profileCompleteSchema>;

const OWNERSHIP_OPTIONS = [
  { value: 'owner', label: 'Owner', icon: 'key-round' as const },
  { value: 'tenant', label: 'Tenant', icon: 'home-outline' as const },
];

const VEHICLE_TYPE_OPTIONS = [
  { value: '2-wheeler', label: '2-Wheeler (Bike/Scooter)', icon: 'smartphone' as const },
  { value: '4-wheeler', label: '4-Wheeler (Car)', icon: 'car-outline' as const },
];

const RELATIONSHIP_OPTIONS = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Colleague', 'Neighbor', 'Other'
];

export default function SocietyProfileComplete() {
  const router = useRouter();
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);

  // Store hooks
  const selectedSociety = useSocietyOnboardingStore((state) => state.selectedSociety);
  const userProfile = useSocietyOnboardingStore((state) => state.userProfile);
  const loading = useSocietyOnboardingStore((state) => state.loading || false);
  
  const { submitSocietyJoinRequest } = useSocietyOnboardingActions();

  // Form validation
  const {
    fields,
    errors,
    isValid,
    isSubmitting,
    setValue,
    getFieldProps,
    handleSubmit,
  } = useFormValidation<ProfileCompleteForm>(
    profileCompleteSchema,
    {
      fullName: userProfile.fullName || '',
      email: userProfile.email || '',
      flatNumber: '',
      ownershipType: 'owner' as const,
      emergencyContactName: '',
      emergencyContactPhone: '+91',
      emergencyContactRelationship: '',
      hasVehicle: false,
      vehicleType: undefined,
      vehicleRegistrationNumber: '',
    },
    {
      validateOnChange: false,
      validateOnBlur: true,
      debounceMs: 300,
    },
  );

  // Handle vehicle toggle
  const handleVehicleToggle = useCallback((hasVehicle: boolean) => {
    setValue('hasVehicle', hasVehicle);
    setShowVehicleDetails(hasVehicle);
    if (!hasVehicle) {
      setValue('vehicleType', undefined);
      setValue('vehicleRegistrationNumber', '');
    }
  }, [setValue]);

  // Handle ownership type selection
  const handleOwnershipSelect = useCallback((type: 'owner' | 'tenant') => {
    setValue('ownershipType', type);
  }, [setValue]);

  // Handle vehicle type selection
  const handleVehicleTypeSelect = useCallback((type: '2-wheeler' | '4-wheeler') => {
    setValue('vehicleType', type);
  }, [setValue]);

  // Handle relationship selection
  const handleRelationshipSelect = useCallback((relationship: string) => {
    setValue('emergencyContactRelationship', relationship);
    setShowRelationshipDropdown(false);
  }, [setValue]);

  // Handle form submission
  const handleProfileSubmit = useCallback(async (formData: ProfileCompleteForm) => {
    if (!selectedSociety) {
      showErrorAlert('Error', 'No society selected. Please go back and select a society.');
      return;
    }

    try {
      const joinRequestData = {
        societyId: selectedSociety.id,
        userProfile: {
          fullName: formData.fullName.trim(),
          email: formData.email?.trim() || undefined,
          phoneNumber: userProfile.phoneNumber,
        },
        residenceDetails: {
          flatNumber: formData.flatNumber.trim(),
          ownershipType: formData.ownershipType,
        },
        emergencyContact: {
          name: formData.emergencyContactName.trim(),
          phoneNumber: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        },
        vehicleInfo: formData.hasVehicle && formData.vehicleType ? {
          type: formData.vehicleType,
          registrationNumber: formData.vehicleRegistrationNumber?.trim() || undefined,
        } : undefined,
      };

      await submitSocietyJoinRequest(joinRequestData);

      showSuccessAlert(
        'Profile Complete!',
        'Your society join request has been submitted successfully. You will be notified once approved.',
      );

      // Navigate to main app
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);

    } catch (error: any) {
      console.error('Profile submission error:', error);
      showErrorAlert(
        'Error',
        error.message || 'Failed to complete profile. Please try again.',
      );
    }
  }, [selectedSociety, userProfile.phoneNumber, submitSocietyJoinRequest, router]);

  // Redirect if no society selected
  if (!selectedSociety) {
    router.replace('/auth/society-selection');
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Header */}
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <LucideIcons name="arrow-left" size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary flex-1">
            Complete Profile
          </Text>
        </View>

        <ResponsiveContainer
          type="scroll"
          padding="lg"
          keyboardAware={true}
          preventOverflow={true}>
          
          {/* Selected Society Info */}
          <View className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <View className="flex-row items-center">
              <View className="bg-primary/10 rounded-lg w-12 h-12 items-center justify-center mr-3">
                <LucideIcons name="building" size={20} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-lg mb-1">
                  {selectedSociety.name}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {selectedSociety.address.street}, {selectedSociety.address.city}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row items-center mb-6">
            <View className="bg-primary rounded-full w-8 h-8 items-center justify-center">
              <Text className="text-white font-bold text-sm">2</Text>
            </View>
            <View className="flex-1 mx-3">
              <Text className="text-text-primary font-medium">Final Step</Text>
              <Text className="text-text-secondary text-sm">Complete your profile details</Text>
            </View>
          </View>

          {/* Personal Details Section */}
          <View className="mb-8">
            <Text className="text-text-primary font-bold text-lg mb-4">
              Personal Details
            </Text>
            
            <ValidatedInput
              label="Full Name"
              value={fields.fullName.value}
              onChangeText={(text) => setValue('fullName', text)}
              onBlur={getFieldProps('fullName').onBlur}
              error={errors.fullName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              maxLength={50}
              icon={<LucideIcons name="person" size={20} color="#6b7280" />}
            />

            <ValidatedInput
              label="Email Address (Optional)"
              value={fields.email.value}
              onChangeText={(text) => setValue('email', text.toLowerCase())}
              onBlur={getFieldProps('email').onBlur}
              error={errors.email}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={100}
              icon={<LucideIcons name="mail-outline" size={20} color="#6b7280" />}
              helperText="Optional - for society notifications"
            />
          </View>

          {/* Residence Details Section */}
          <View className="mb-8">
            <Text className="text-text-primary font-bold text-lg mb-4">
              Residence Details
            </Text>
            
            <ValidatedInput
              label="Flat/Unit Number"
              value={fields.flatNumber.value}
              onChangeText={(text) => setValue('flatNumber', text.toUpperCase())}
              onBlur={getFieldProps('flatNumber').onBlur}
              error={errors.flatNumber}
              placeholder="e.g., A-101, B-205, 3F"
              autoCapitalize="characters"
              maxLength={10}
              icon={<LucideIcons name="home-outline" size={20} color="#6b7280" />}
            />

            {/* Ownership Type Selection */}
            <View className="mb-4">
              <Text className="text-text-primary font-medium mb-3">
                Ownership Type
              </Text>
              <View className="flex-row space-x-3">
                {OWNERSHIP_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleOwnershipSelect(option.value)}
                    className={`flex-1 p-4 rounded-xl border ${
                      fields.ownershipType.value === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-divider bg-surface'
                    }`}
                    activeOpacity={0.8}>
                    <View className="items-center">
                      <LucideIcons
                        name={option.icon}
                        size={24}
                        color={fields.ownershipType.value === option.value ? '#6366f1' : '#6b7280'}
                      />
                      <Text className={`font-medium mt-2 ${
                        fields.ownershipType.value === option.value
                          ? 'text-primary'
                          : 'text-text-secondary'
                      }`}>
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Emergency Contact Section */}
          <View className="mb-8">
            <Text className="text-text-primary font-bold text-lg mb-4">
              Emergency Contact
            </Text>
            
            <ValidatedInput
              label="Contact Name"
              value={fields.emergencyContactName.value}
              onChangeText={(text) => setValue('emergencyContactName', text)}
              onBlur={getFieldProps('emergencyContactName').onBlur}
              error={errors.emergencyContactName}
              placeholder="Enter contact person name"
              autoCapitalize="words"
              maxLength={50}
              icon={<LucideIcons name="person-outline" size={20} color="#6b7280" />}
            />

            <ValidatedInput
              label="Contact Phone"
              value={fields.emergencyContactPhone.value}
              onChangeText={(text) => setValue('emergencyContactPhone', text)}
              onBlur={getFieldProps('emergencyContactPhone').onBlur}
              error={errors.emergencyContactPhone}
              placeholder="+91XXXXXXXXXX"
              keyboardType="phone-pad"
              maxLength={13}
              icon={<LucideIcons name="call-outline" size={20} color="#6b7280" />}
            />

            {/* Relationship Selection */}
            <View className="mb-4">
              <Text className="text-text-primary font-medium mb-2">
                Relationship
              </Text>
              <TouchableOpacity
                onPress={() => setShowRelationshipDropdown(!showRelationshipDropdown)}
                className="bg-surface border border-divider rounded-xl px-4 py-4 flex-row items-center justify-between">
                <Text className={fields.emergencyContactRelationship.value ? 'text-text-primary' : 'text-text-secondary'}>
                  {fields.emergencyContactRelationship.value || 'Select relationship'}
                </Text>
                <LucideIcons 
                  name={showRelationshipDropdown ? 'chevron-up-outline' : 'chevron-down-outline'} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
              
              {showRelationshipDropdown && (
                <View className="bg-surface border border-divider rounded-xl mt-2 overflow-hidden">
                  {RELATIONSHIP_OPTIONS.map((relationship) => (
                    <TouchableOpacity
                      key={relationship}
                      onPress={() => handleRelationshipSelect(relationship)}
                      className="px-4 py-3 border-b border-divider last:border-b-0"
                      activeOpacity={0.8}>
                      <Text className="text-text-primary">{relationship}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {errors.emergencyContactRelationship && (
                <Text className="text-error text-sm mt-1">
                  {errors.emergencyContactRelationship}
                </Text>
              )}
            </View>
          </View>

          {/* Vehicle Information Section */}
          <View className="mb-8">
            <Text className="text-text-primary font-bold text-lg mb-4">
              Vehicle Information (Optional)
            </Text>
            
            {/* Vehicle Toggle */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text-primary font-medium">Do you have a vehicle?</Text>
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => handleVehicleToggle(true)}
                  className={`px-4 py-2 rounded-lg ${
                    fields.hasVehicle.value ? 'bg-primary' : 'bg-surface border border-divider'
                  }`}
                  activeOpacity={0.8}>
                  <Text className={fields.hasVehicle.value ? 'text-white' : 'text-text-secondary'}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleVehicleToggle(false)}
                  className={`px-4 py-2 rounded-lg ${
                    !fields.hasVehicle.value ? 'bg-primary' : 'bg-surface border border-divider'
                  }`}
                  activeOpacity={0.8}>
                  <Text className={!fields.hasVehicle.value ? 'text-white' : 'text-text-secondary'}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Vehicle Details (Collapsible) */}
            {showVehicleDetails && fields.hasVehicle.value && (
              <View className="space-y-4">
                {/* Vehicle Type Selection */}
                <View>
                  <Text className="text-text-primary font-medium mb-3">Vehicle Type</Text>
                  <View className="space-y-3">
                    {VEHICLE_TYPE_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleVehicleTypeSelect(option.value)}
                        className={`p-4 rounded-xl border flex-row items-center ${
                          fields.vehicleType.value === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-divider bg-surface'
                        }`}
                        activeOpacity={0.8}>
                        <LucideIcons
                          name={option.icon}
                          size={24}
                          color={fields.vehicleType.value === option.value ? '#6366f1' : '#6b7280'}
                        />
                        <Text className={`font-medium ml-3 ${
                          fields.vehicleType.value === option.value
                            ? 'text-primary'
                            : 'text-text-secondary'
                        }`}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Registration Number */}
                {fields.vehicleType.value && (
                  <ValidatedInput
                    label="Registration Number (Optional)"
                    value={fields.vehicleRegistrationNumber.value}
                    onChangeText={(text) => setValue('vehicleRegistrationNumber', text.toUpperCase())}
                    onBlur={getFieldProps('vehicleRegistrationNumber').onBlur}
                    error={errors.vehicleRegistrationNumber}
                    placeholder="e.g., MH01AB1234"
                    autoCapitalize="characters"
                    maxLength={15}
                    icon={<LucideIcons name="car-outline" size={20} color="#6b7280" />}
                    helperText="Optional - for parking allocation"
                  />
                )}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <Button
            onPress={() => handleSubmit(handleProfileSubmit)}
            loading={isSubmitting || loading}
            disabled={!isValid || isSubmitting}
            className="mb-6">
            Complete Profile & Join Society
          </Button>

          {/* Privacy Notice */}
          <View className="bg-primary/5 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <LucideIcons name="shield-check" size={16} color="#6366f1" />
              <Text className="text-primary font-semibold ml-2">
                Privacy & Security
              </Text>
            </View>
            <Text className="text-text-secondary text-sm leading-5">
              Your information is securely stored and only shared with your society management for verification and communication purposes.
            </Text>
          </View>
        </ResponsiveContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}