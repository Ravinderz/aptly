import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { Button } from '@/components/ui/Button';
import LucideIcons from '@/components/ui/LucideIcons';
import {
  ResponsiveContainer,
  ResponsiveText,
} from '@/components/ui/ResponsiveContainer';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useFormValidation } from '@/hooks/useFormValidation';
import { AuthService, BiometricService } from '@/services';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';
import { useSocietyOnboardingActions } from '@/stores/slices/societyOnboardingStore';
import { showErrorAlert } from '@/utils/alert';
import { responsive } from '@/utils/responsive';
import {
  EmailRegistrationForm,
  emailRegistrationSchema,
} from '@/utils/validation.enhanced';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EmailRegistration() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ mode?: string }>();

  // Properly cache the mode to prevent getSnapshot infinite loop warning
  const [mode, setMode] = React.useState<string | undefined>('');

  // Update mode when searchParams changes, but only if it's different
  React.useEffect(() => {
    const newMode = searchParams.mode;
    if (newMode !== mode) {
      setMode(newMode);
    }
  }, [searchParams.mode, mode]);

  const { authenticateWithBiometrics } = useDirectAuth();
  const { updateUserProfile } = useSocietyOnboardingActions();
  const biometricAuthEnabled = useFeatureFlagStore(
    (state) => state.flags.biometric_auth,
  );
  const isSignIn = mode === 'signin';
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  // Enhanced form validation
  const {
    fields,
    errors,
    isValid,
    isSubmitting,
    setValue,
    getFieldProps,
    handleSubmit,
  } = useFormValidation<EmailRegistrationForm>(
    emailRegistrationSchema,
    {
      email: '',
      agreeToTerms: false,
    },
    {
      validateOnChange: true,
      validateOnBlur: true,
      debounceMs: 500,
    },
  );

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    if (!isSignIn) return; // Only show for sign in

    const biometricConfig = await BiometricService.checkBiometricSupport();
    const isEnabled = await BiometricService.isBiometricEnabled();

    if (
      biometricConfig.hasHardware &&
      biometricConfig.isEnrolled &&
      isEnabled
    ) {
      setShowBiometricOption(true);
      setBiometricType(
        BiometricService.getBiometricTypeName(biometricConfig.supportedTypes),
      );
    }
  };

  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);

    try {
      const success = await authenticateWithBiometrics();

      if (success) {
        router.replace('/(tabs)');
      } else {
        showErrorAlert(
          'Authentication Failed',
          'Biometric authentication failed. Please try again or use your email address.',
        );
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      showErrorAlert(
        'Error',
        'An error occurred during biometric authentication. Please try again.',
      );
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // Enhanced email formatting (basic normalization)
  const formatEmail = (email: string): string => {
    // Basic email normalization: trim and lowercase
    return email.trim().toLowerCase();
  };

  const handleEmailChange = (text: string) => {
    const formattedEmail = formatEmail(text);
    setValue('email', formattedEmail);
  };

  // Enhanced submit handler with comprehensive validation
  const handleFormSubmit = async (formData: EmailRegistrationForm) => {
    try {
      console.log('🔍 Form submission debug:');
      console.log('formData:', formData);
      console.log('formData.email:', formData.email);

      const normalizedEmail = formatEmail(formData.email);
      console.log('Normalized email:', normalizedEmail);
      
      // No society code needed for initial registration - will be handled in post-auth flow
      const result = await AuthService.registerEmail(
        normalizedEmail,
        '', // Empty society code - will be handled in onboarding flow
      );

      if (result.success) {
        // Add a small delay to ensure navigation state is ready
        updateUserProfile({ email: normalizedEmail });
        setTimeout(() => {
          router.push({
            pathname: '/auth/otp-verification',
          });
        }, 100);
      } else {
        // Show error alert for API failures
        showErrorAlert(
          'Error',
          result.error || 'Failed to send verification email. Please try again.',
        );
      }
    } catch (error) {
      console.error('Email registration error:', error);
      showErrorAlert('Error', 'Failed to send verification email. Please try again.');
    }
  };

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
            {isSignIn ? 'Sign In' : 'Sign Up'}
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
                name="mail"
                size={responsive.spacing(32)}
                color="#6366f1"
              />
            </View>
            <ResponsiveText
              variant="display"
              size="small"
              className="font-bold mb-2 text-center">
              Welcome to Aptly
            </ResponsiveText>
            <ResponsiveText
              variant="body"
              size="medium"
              className="text-text-secondary text-center">
              {isSignIn
                ? 'Enter your registered email address and society code to sign in'
                : 'Enter your email address and society code to get started with your housing society management'}
            </ResponsiveText>
          </View>

          {/* Enhanced Email Input with Validation */}
          <View className="mb-6">
            <View className="flex-row items-center bg-surface rounded-xl border border-divider px-4 py-4">
              <LucideIcons name="mail" size={20} color="#6b7280" className="mr-3" />
              <View className="h-6 w-px bg-divider mr-3" />
              <ValidatedInput
                label=""
                value={fields.email.value}
                onChangeText={handleEmailChange}
                onBlur={getFieldProps('email').onBlur}
                error={errors.email}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                autoFocus={true}
                containerStyle={{ marginBottom: 0, flex: 1 }}
                variant="default"
                showValidationIcon={false}
                helperText={
                  isSignIn
                    ? "We'll send a verification link to your registered email"
                    : "We'll send a verification link to verify your email"
                }
                showError={false} // Use form-level error display instead
              />
            </View>
            {errors.email && (
              <Text className="text-error text-sm mt-2">{errors.email}</Text>
            )}
          </View>

          {/* Terms Agreement Checkbox */}
          <View className="mb-8 flex-row items-start">
            <TouchableOpacity
              onPress={() =>
                setValue('agreeToTerms', !fields.agreeToTerms.value)
              }
              className="mr-3 mt-1">
              <View
                className={`w-5 h-5 border-2 rounded ${
                  fields.agreeToTerms.value
                    ? 'bg-primary border-primary'
                    : 'border-divider bg-surface'
                } items-center justify-center`}>
                {fields.agreeToTerms.value && (
                  <LucideIcons name="check" size={12} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setValue('agreeToTerms', !fields.agreeToTerms.value)
              }
              className="flex-1">
              <Text className="text-text-secondary text-sm">
                I agree to the{' '}
                <Text className="text-primary underline">
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text className="text-primary underline">Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>
          {errors.agreeToTerms && (
            <Text className="text-error text-sm mb-4 mt-[-16px]">
              {errors.agreeToTerms}
            </Text>
          )}

          {/* Enhanced Submit Button with Form Validation */}
          <Button
            onPress={() => handleSubmit(handleFormSubmit)}
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
            className="mb-6">
            Send Verification Email
          </Button>

          {/* Biometric Login Option */}
          {biometricAuthEnabled && showBiometricOption && (
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="flex-1 h-px bg-divider" />
                <Text className="text-text-secondary text-sm mx-4">or</Text>
                <View className="flex-1 h-px bg-divider" />
              </View>

              <TouchableOpacity
                onPress={handleBiometricLogin}
                disabled={isBiometricLoading}
                className="bg-surface border border-primary/20 rounded-xl p-4 flex-row items-center justify-center"
                activeOpacity={0.8}>
                <View className="bg-primary/10 rounded-full w-10 h-10 items-center justify-center mr-3">
                  <LucideIcons name="fingerprint" size={20} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary font-semibold">
                    Sign in with {biometricType}
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    Quick and secure access to your account
                  </Text>
                </View>
                {isBiometricLoading && (
                  <View className="ml-3">
                    <Text className="text-primary text-sm">Loading...</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Help Section */}
          <View className="bg-primary/5 rounded-xl p-4 mt-4">
            <Text className="text-primary font-semibold mb-2">Need Help?</Text>
            <Text className="text-text-secondary text-sm leading-5">
              Contact your society manager or housing committee to get your
              society code. Make sure you're using the email address registered
              with your society.
            </Text>
          </View>
        </ResponsiveContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}