/**
 * Profile Setup Screen - User profile creation form
 *
 * Allows users to create their basic profile with:
 * - Full Name
 * - Phone Number (pre-filled from auth flow)
 * - Email Address
 * - Passcode (for app security)
 */
import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { Button } from '@/components/ui/Button';
import LucideIcons from '@/components/ui/LucideIcons';
import {
  ResponsiveContainer,
  ResponsiveText,
} from '@/components/ui/ResponsiveContainer';
import { useFormValidation } from '@/hooks/useFormValidation';
import { AuthService } from '@/services';
import {
  useSocietyOnboardingActions,
  useSocietyOnboardingStore,
} from '@/stores/slices/societyOnboardingStore';
import { showErrorAlert, showSuccessAlert } from '@/utils/alert';
import { responsive } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

// Validation schema for profile setup
const profileSetupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
    phoneNumber: z
      .string()
      .min(10, 'Phone number is required')
      .regex(/^\+91\d{10}$/, 'Invalid phone number format'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .min(5, 'Email is required')
      .max(100, 'Email cannot exceed 100 characters'),
    passcode: z
      .string()
      .min(4, 'Passcode must be at least 4 digits')
      .max(6, 'Passcode cannot exceed 6 digits')
      .regex(/^\d+$/, 'Passcode can only contain numbers'),
    confirmPasscode: z.string().min(4, 'Please confirm your passcode'),
  })
  .refine((data) => data.passcode === data.confirmPasscode, {
    message: "Passcodes don't match",
    path: ['confirmPasscode'],
  });

type ProfileSetupForm = z.infer<typeof profileSetupSchema>;

export default function ProfileSetup() {
  const router = useRouter();
  const [showPasscode, setShowPasscode] = useState(false);
  const [showConfirmPasscode, setShowConfirmPasscode] = useState(false);

  // Get phone number from store
  const phoneNumber = useSocietyOnboardingStore(
    (state) => state.userProfile.phoneNumber,
  );
  const { updateUserProfile } = useSocietyOnboardingActions();

  // Form validation
  const {
    fields,
    errors,
    isValid,
    isSubmitting,
    setValue,
    getFieldProps,
    handleSubmit,
  } = useFormValidation<ProfileSetupForm>(
    profileSetupSchema,
    {
      fullName: '',
      phoneNumber: phoneNumber || '',
      email: '',
      passcode: '',
      confirmPasscode: '',
    },
    {
      validateOnChange: false, // Only validate on blur, not during typing
      validateOnBlur: true,
      debounceMs: 300,
    },
  );

  // Check if phoneNumber is available, if not redirect back to phone registration
  React.useEffect(() => {
    if (!phoneNumber) {
      router.replace('/auth/phone-registration');
    }
  }, [phoneNumber, router]);

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+91')) {
      const number = phone.substring(3);
      return `+91 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    return phone;
  };

  const handleProfileSubmit = React.useCallback(
    async (formData: ProfileSetupForm) => {
      try {
        console.log('📝 Submitting profile setup:', formData);

        // Create user profile
        const profileData = {
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber,
          email: formData.email.toLowerCase().trim(),
          passcode: formData.passcode,
        };

        // Call auth service to create user profile
        const result = await AuthService.createUserProfile(profileData);

        if (result.success) {
          // Update the store with profile data
          updateUserProfile({
            fullName: profileData.fullName,
            phone: profileData.phoneNumber,
            email: profileData.email,
          });

          showSuccessAlert(
            'Profile Created!',
            'Your profile has been created successfully.',
          );

          // Navigate to society onboarding
          setTimeout(() => {
            router.push('/auth/society-onboarding');
          }, 500);
        } else {
          showErrorAlert(
            'Error',
            result.error || 'Failed to create profile. Please try again.',
          );
        }
      } catch (error: any) {
        console.error('Profile setup error:', error);
        showErrorAlert(
          'Error',
          'Failed to create profile. Please check your internet connection and try again.',
        );
      }
    },
    [updateUserProfile, router],
  );

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
          <Text className="text-xl font-bold text-text-primary">
            Create Profile
          </Text>
        </View>

        <ResponsiveContainer
          type="scroll"
          padding="lg"
          keyboardAware={true}
          preventOverflow={true}>
          {/* Welcome Section */}
          <View className="items-center mb-8">
            <View
              className="bg-primary/10 rounded-full items-center justify-center mb-4"
              style={{
                width: responsive.spacing(64),
                height: responsive.spacing(64),
              }}>
              <LucideIcons
                name="user-plus"
                size={responsive.spacing(32)}
                color="#6366f1"
              />
            </View>
            <ResponsiveText
              variant="display"
              size="small"
              className="font-bold mb-2 text-center">
              Complete Your Profile
            </ResponsiveText>
            <ResponsiveText
              variant="body"
              size="medium"
              className="text-text-secondary text-center">
              Please provide your basic information to set up your account
            </ResponsiveText>
          </View>

          {/* Profile Form */}
          <View className="space-y-6">
            {/* Full Name */}
            <ValidatedInput
              label="Full Name"
              placeholder="Enter your full name"
              value={fields.fullName.value}
              onChangeText={(text) => setValue('fullName', text)}
              onBlur={getFieldProps('fullName').onBlur}
              error={errors.fullName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              maxLength={50}
            />

            {/* Phone Number (Read-only) */}
            <View>
              <Text className="text-text-primary font-medium mb-2">
                Phone Number
              </Text>
              <View className="bg-surface/50 border border-divider rounded-xl px-4 py-4 flex-row items-center">
                <LucideIcons
                  name="phone"
                  size={20}
                  color="#6b7280"
                  className="mr-3"
                />
                <Text className="text-text-primary font-medium flex-1">
                  {formatPhoneNumber(fields.phoneNumber.value)}
                </Text>
                <View className="bg-success/10 px-2 py-1 rounded-full">
                  <Text className="text-success text-xs font-medium">
                    Verified
                  </Text>
                </View>
              </View>
              <Text className="text-text-secondary text-sm mt-1">
                Your verified phone number
              </Text>
            </View>

            {/* Email Address */}
            <ValidatedInput
              label="Email Address"
              placeholder="Enter your email address"
              value={fields.email.value}
              onChangeText={(text) => setValue('email', text.toLowerCase())}
              onBlur={getFieldProps('email').onBlur}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              maxLength={100}
            />

            {/* Passcode */}
            <ValidatedInput
              label="App Passcode"
              placeholder="Create a 4-6 digit passcode"
              value={fields.passcode.value}
              onChangeText={(text) =>
                setValue('passcode', text.replace(/[^0-9]/g, ''))
              }
              onBlur={getFieldProps('passcode').onBlur}
              error={errors.passcode}
              secureTextEntry={!showPasscode}
              keyboardType="number-pad"
              maxLength={6}
              helperText="Used for quick app access and secure operations"
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPasscode(!showPasscode)}
                  className="p-1">
                  <LucideIcons
                    name={showPasscode ? 'eye-off' : 'eye'}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              }
            />

            {/* Confirm Passcode */}
            <ValidatedInput
              label="Confirm Passcode"
              placeholder="Re-enter your passcode"
              value={fields.confirmPasscode.value}
              onChangeText={(text) =>
                setValue('confirmPasscode', text.replace(/[^0-9]/g, ''))
              }
              onBlur={getFieldProps('confirmPasscode').onBlur}
              error={errors.confirmPasscode}
              secureTextEntry={!showConfirmPasscode}
              keyboardType="number-pad"
              maxLength={6}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPasscode(!showConfirmPasscode)}
                  className="p-1">
                  <LucideIcons
                    name={showConfirmPasscode ? 'eye-off' : 'eye'}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              }
            />
          </View>

          {/* Submit Button */}
          <Button
            onPress={() => handleSubmit(handleProfileSubmit)}
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
            className="mt-8 mb-6">
            Create Profile
          </Button>

          {/* Security Info */}
          <View className="bg-primary/5 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <LucideIcons name="shield-check" size={16} color="#6366f1" />
              <Text className="text-primary font-semibold ml-2">
                Your data is secure
              </Text>
            </View>
            <Text className="text-text-secondary text-sm leading-5">
              Your personal information is encrypted and stored securely. Your
              passcode is used only for app access and will never be shared.
            </Text>
          </View>

          {/* Skip Option (Optional) */}
          <View className="mt-6 pt-6 border-t border-divider">
            <TouchableOpacity
              onPress={() => router.push('/auth/society-onboarding')}
              className="items-center">
              <Text className="text-text-secondary text-sm">
                Skip for now, I&apos;ll complete this later
              </Text>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
