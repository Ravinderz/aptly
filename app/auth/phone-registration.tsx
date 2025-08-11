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
import { showErrorAlert } from '@/utils/alert';
import { responsive } from '@/utils/responsive';
import {
  PhoneRegistrationForm,
  phoneRegistrationSchema,
  phoneSchema,
} from '@/utils/validation.enhanced';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PhoneRegistration() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { authenticateWithBiometrics } = useDirectAuth();
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
  } = useFormValidation<PhoneRegistrationForm>(
    phoneRegistrationSchema,
    {
      phone: '',
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
          'Biometric authentication failed. Please try again or use your phone number.',
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

  // Enhanced phone number formatting
  const formatPhoneNumber = (phone: string): string => {
    // Remove any existing formatting
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Remove +91 or 91 prefix if present
    let number = cleanPhone;
    if (cleanPhone.startsWith('+91')) {
      number = cleanPhone.substring(3);
    } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      number = cleanPhone.substring(2);
    }

    // Add formatting: XXX XXX XXXX
    if (number.length >= 6) {
      return `${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 10)}`;
    } else if (number.length >= 3) {
      return `${number.substring(0, 3)} ${number.substring(3)}`;
    }

    return number;
  };

  const getFullPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // If already has country code, return as is
    if (cleanPhone.startsWith('+91')) {
      return cleanPhone;
    }

    // If starts with 91, add +
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      return `+${cleanPhone}`;
    }

    // Add +91 prefix for Indian numbers
    return `+91${cleanPhone}`;
  };

  const handlePhoneChange = (text: string) => {
    // Only allow numbers, spaces, +, -, (, )
    const cleanText = text.replace(/[^0-9\s\-\(\)\+]/g, '');
    const numbersOnly = cleanText.replace(/[^\d]/g, '');

    if (numbersOnly.length <= 10) {
      const formattedPhone = formatPhoneNumber(numbersOnly);
      setValue('phone', formattedPhone);
    }
  };

  // Enhanced submit handler with comprehensive validation
  const handleFormSubmit = async (formData: PhoneRegistrationForm) => {
    try {
      console.log('🔍 Form submission debug:');
      console.log('formData:', formData);
      console.log('formData.phone:', formData.phone);
      console.log('fields.phone.value:', fields.phone.value);
      
      // Use the actual field value if formData.phone is empty
      const phoneValue = formData.phone || fields.phone.value;
      console.log('Using phone value:', phoneValue);
      const fullPhoneNumber = getFullPhoneNumber(phoneValue);
      console.log('Full phone number:', fullPhoneNumber);
      // No society code needed for initial registration - will be handled in post-auth flow
      const result = await AuthService.registerPhone(
        fullPhoneNumber,
        '', // Empty society code - will be handled in onboarding flow
      );

      if (result.success) {
        // Navigate to OTP verification
        router.push({
          pathname: '/auth/otp-verification',
          params: {
            phoneNumber: fullPhoneNumber,
            sessionId: result.sessionId || 'dev-session',
          },
        });
      } else {
        // Show error alert for API failures
        showErrorAlert(
          'Error',
          result.error || 'Failed to send OTP. Please try again.',
        );
      }
    } catch (error) {
      console.error('Phone registration error:', error);
      showErrorAlert('Error', 'Failed to send OTP. Please try again.');
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
                name="call-outline"
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
                ? 'Enter your registered mobile number and society code to sign in'
                : 'Enter your mobile number and society code to get started with your housing society management'}
            </ResponsiveText>
          </View>

          {/* Enhanced Phone Number Input with Validation */}
          <View className="mb-6">
            <View className="flex-row items-center bg-surface rounded-xl border border-divider px-4 py-4">
              <Text className="text-text-primary font-medium mr-3">🇮🇳 +91</Text>
              <View className="h-6 w-px bg-divider mr-3" />
              <ValidatedInput
                label=""
                value={fields.phone.value}
                onChangeText={handlePhoneChange}
                onBlur={getFieldProps('phone').onBlur}
                error={errors.phone}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                maxLength={13} // Formatted: XXX XXX XXXX
                autoFocus={true}
                containerStyle={{ marginBottom: 0, flex: 1 }}
                variant="default"
                showValidationIcon={false}
                helperText={
                  isSignIn
                    ? "We'll send an OTP to your registered number"
                    : "We'll send an OTP to verify your number"
                }
                validationSchema={phoneSchema}
              />
            </View>
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
            Send OTP
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
              society code. Make sure you're using the mobile number registered
              with your society.
            </Text>
          </View>
        </ResponsiveContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
