/**
 * Society Onboarding - Main entry point for society onboarding flow
 *
 * Provides user with choice between:
 * 1. Society code input and verification
 * 2. Society search and selection
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
import { showErrorAlert } from '@/utils/alert';
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

// Validation schema for society code
const societyCodeSchema = z.object({
  societyCode: z
    .string()
    .min(4, 'Society code must be at least 4 characters')
    .max(12, 'Society code cannot exceed 12 characters')
    .regex(/^[A-Z0-9]+$/i, 'Society code can only contain letters and numbers')
    .transform((val) => val.toUpperCase()),
});

type SocietyCodeForm = z.infer<typeof societyCodeSchema>;

export default function SocietyOnboarding() {
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<
    'code' | 'search' | null
  >(null);

  // Store hooks - Use specific selectors to prevent unnecessary re-renders
  const currentStep = useSocietyOnboardingStore((state) => state.currentStep);
  const loading = useSocietyOnboardingStore((state) => state.loading);
  const phoneNumber = useSocietyOnboardingStore(
    (state) => state.userProfile.phoneNumber,
  );

  const { verifySociety, goToStep, updateUserProfile } =
    useSocietyOnboardingActions();

  // Form validation for society code
  const { fields, errors, isValid, isSubmitting, getFieldProps, handleSubmit } =
    useFormValidation<SocietyCodeForm>(
      societyCodeSchema,
      { societyCode: '' },
      {
        validateOnChange: true,
        validateOnBlur: true,
        debounceMs: 300,
      },
    );

  // Check if phoneNumber is available, if not redirect back to phone registration
  React.useEffect(() => {
    if (!phoneNumber) {
      // No phone number available, redirect to phone registration
      router.replace('/auth/phone-registration');
    }
  }, []);

  const handleCodeVerification = React.useCallback(
    async (formData: SocietyCodeForm) => {
      if (!phoneNumber) {
        showErrorAlert('Error', 'Phone number is required');
        return;
      }

      try {
        await verifySociety({
          phoneNumber,
          societyCode: formData.societyCode,
        });
      } catch (error: any) {
        showErrorAlert('Error', error.message || 'Verification failed');
      }
    },
    [phoneNumber, verifySociety],
  );

  const handleSearchFlow = React.useCallback(() => {
    if (!phoneNumber) {
      showErrorAlert('Error', 'Phone number is required');
      return;
    }

    // Navigate to search flow - phoneNumber is already stored in Zustand
    router.push('/auth/society-search-flow');
  }, [phoneNumber, router]);

  const handleSkipForNow = React.useCallback(() => {
    // For MVP, allow users to skip society selection
    // In production, this might create a limited user experience
    router.replace('/(tabs)');
  }, [router]);

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
            Join Your Society
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
                name="building"
                size={responsive.spacing(32)}
                color="#6366f1"
              />
            </View>
            <ResponsiveText
              variant="display"
              size="small"
              className="font-bold mb-2 text-center">
              Welcome to Your Society
            </ResponsiveText>
            <ResponsiveText
              variant="body"
              size="medium"
              className="text-text-secondary text-center">
              To get started, we need to connect you with your housing society.
              You can either enter your society code or search for your society.
            </ResponsiveText>
          </View>

          {/* Option Selection */}
          {!selectedOption && (
            <>
              {/* Society Code Option */}
              <TouchableOpacity
                onPress={() => setSelectedOption('code')}
                className="bg-surface border border-divider rounded-xl p-6 mb-4"
                activeOpacity={0.8}>
                <View className="flex-row items-center">
                  <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center mr-4">
                    <LucideIcons name="key-round" size={24} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-semibold text-lg mb-1">
                      I have a Society Code
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      Enter the code provided by your society management
                    </Text>
                  </View>
                  <LucideIcons name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              {/* Search Option */}
              <TouchableOpacity
                onPress={() => setSelectedOption('search')}
                className="bg-surface border border-divider rounded-xl p-6 mb-6"
                activeOpacity={0.8}>
                <View className="flex-row items-center">
                  <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center mr-4">
                    <LucideIcons name="search" size={24} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-semibold text-lg mb-1">
                      Search for My Society
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      Find your society by name or location
                    </Text>
                  </View>
                  <LucideIcons name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* Society Code Input */}
          {selectedOption === 'code' && (
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setSelectedOption(null)}
                className="flex-row items-center mb-4">
                <LucideIcons name="arrow-left" size={20} color="#6366f1" />
                <Text className="text-primary font-medium ml-2">
                  Back to options
                </Text>
              </TouchableOpacity>

              <Text className="text-text-primary font-semibold text-lg mb-4">
                Enter Society Code
              </Text>

              <ValidatedInput
                label="Society Code"
                {...getFieldProps('societyCode')}
                placeholder="e.g., APT001, RES123"
                autoCapitalize="characters"
                maxLength={12}
                containerStyle={{ marginBottom: 16 }}
                helpText="Ask your society management for this code"
              />

              <Button
                onPress={() => handleSubmit(handleCodeVerification)}
                loading={isSubmitting || loading}
                disabled={!isValid}
                className="mb-4">
                Verify Society Code
              </Button>
            </View>
          )}

          {/* Search Flow Button */}
          {selectedOption === 'search' && (
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setSelectedOption(null)}
                className="flex-row items-center mb-4">
                <LucideIcons name="arrow-left" size={20} color="#6366f1" />
                <Text className="text-primary font-medium ml-2">
                  Back to options
                </Text>
              </TouchableOpacity>

              <Text className="text-text-primary font-semibold text-lg mb-4">
                Search for Your Society
              </Text>
              <Text className="text-text-secondary mb-6">
                We&apos;ll help you find your society by name, location, or
                other details.
              </Text>

              <Button onPress={handleSearchFlow} className="mb-4">
                Start Search
              </Button>
            </View>
          )}

          {/* Skip Option */}
          <View className="mt-8 pt-8 border-t border-divider">
            <TouchableOpacity
              onPress={handleSkipForNow}
              className="items-center py-4">
              <Text className="text-text-secondary text-sm">
                I&apos;ll do this later
              </Text>
              <Text className="text-primary font-medium mt-1">
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View className="bg-primary/5 rounded-xl p-4 mt-4">
            <Text className="text-primary font-semibold mb-2">Need Help?</Text>
            <Text className="text-text-secondary text-sm leading-5">
              • Contact your society management for the society code{'\n'}• The
              code is usually 4-12 characters long{'\n'}• Check notice boards or
              society apps for this information
            </Text>
          </View>
        </ResponsiveContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
