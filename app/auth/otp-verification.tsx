import { Button } from '@/components/ui/Button';
import { AuthService } from '@/services';
import {
  useSocietyOnboardingActions,
  useSocietyOnboardingStore,
} from '@/stores/slices/societyOnboardingStore';
import { showErrorAlert, showSuccessAlert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, Shield } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OTPVerification() {
  const router = useRouter();
  const { updateUserProfile } = useSocietyOnboardingActions();

  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const phoneNumber = useSocietyOnboardingStore(
    (state) => state.userProfile.phone,
  );
  const sessionId = useSocietyOnboardingStore(
    (state) => state.userProfile.sessionId,
  );

  const email = useSocietyOnboardingStore((state) => state.userProfile.email);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOTPChange = (value: string, index: number) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');

    if (__DEV__) {
      console.log('🔢 OTP Input Change:', numericValue, 'at index:', index);
    }

    if (numericValue.length <= 1) {
      const newOTP = [...otp];
      newOTP[index] = numericValue;
      setOTP(newOTP);

      // Clear error when user starts typing
      if (error) setError('');

      // Auto-focus next input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit if all fields are filled
      if (
        index === 5 &&
        numericValue &&
        newOTP.every((digit) => digit !== '')
      ) {
        handleVerifyOTP(newOTP.join(''));
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input if current is empty and backspace is pressed
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');

    if (otpToVerify.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    console.log('🔐 Starting OTP verification:', {
      otpLength: otpToVerify.length,
      phoneNumber: phoneNumber ? '***' + phoneNumber.slice(-4) : null,
      email: email ? '***' + email.split('@')[1] : null,
      sessionId: sessionId ? sessionId.substring(0, 8) + '...' : null,
    });

    if (!phoneNumber && !email) {
      setError('Phone number or email is required for verification');
      return;
    }

    if (!sessionId) {
      setError('Session ID is required for verification');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use the existing verifyOTP method that handles both email and phone
      const result = await AuthService.verifyOTP(
        email || phoneNumber,
        otpToVerify,
        sessionId,
      );

      console.log('🔐 OTP verification result:', {
        success: result.success,
        hasData: !!result.data,
        hasUser: !!result.data?.user,
      });

      if (result.success && result.data) {
        console.log('✅ OTP verification successful, authentication data stored in service');
        
        // Update onboarding store with user profile data
        if (result.data.user) {
          updateUserProfile({
            fullName: result.data.user.name || '', // Will be filled in onboarding
            phone: result.data.user.phone || phoneNumber || '',
            email: result.data.user.email || email || '',
            dateOfBirth: '',
            photo: '',
            sessionId: sessionId,
          });
        } else {
          // Fallback if user data not in response
          updateUserProfile({
            fullName: '',
            phone: phoneNumber || '',
            email: email || '',
            dateOfBirth: '',
            photo: '',
            sessionId: sessionId,
          });
        }
        
        console.log('🎯 Authentication complete, navigating to society selection');
        
        // Navigate to society selection for onboarding
        router.replace('/auth/society-selection');
        
      } else {
        console.warn('⚠️ OTP verification failed:', result.error);
        setError(result.error || 'Invalid OTP. Please try again.');
        
        // Clear OTP inputs on failure
        setOTP(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      
      let errorMessage = 'Verification failed. Please try again.';
      
      if (error.code === 'OTP_EXPIRED') {
        errorMessage = 'OTP has expired. Please request a new code.';
      } else if (error.code === 'OTP_INVALID') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    console.log('📤 Resending OTP request');
    setIsResending(true);

    try {
      // For email OTP, we need to call the email registration endpoint again
      if (email) {
        const result = await AuthService.registerEmail(email);

        if (result.success) {
          // Reset timer
          setTimeLeft(30);
          setCanResend(false);
          setError('');

          console.log('✅ Email OTP resent successfully');
          showSuccessAlert(
            'OTP Sent',
            'A new OTP has been sent to your email address.',
          );
        } else {
          console.warn('⚠️ Failed to resend email OTP:', result.error);
          showErrorAlert(
            'Error',
            result.error || 'Failed to resend OTP. Please try again.',
          );
        }
      } else if (phoneNumber) {
        // For phone OTP (if implemented later)
        const result = await AuthService.registerPhone(phoneNumber);
        
        if (result.success) {
          setTimeLeft(30);
          setCanResend(false);
          setError('');
          
          console.log('✅ Phone OTP resent successfully');
          showSuccessAlert(
            'OTP Sent',
            'A new OTP has been sent to your mobile number.',
          );
        } else {
          console.warn('⚠️ Failed to resend phone OTP:', result.error);
          showErrorAlert(
            'Error',
            result.error || 'Failed to resend OTP. Please try again.',
          );
        }
      }
    } catch (error: any) {
      console.error('❌ Resend OTP error:', error);
      showErrorAlert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+91')) {
      const number = phone.substring(3);
      return `+91 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    return phone;
  };
  
  const formatEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 3) {
      return email;
    }
    const maskedUsername = username.substring(0, 2) + '***' + username.slice(-1);
    return `${maskedUsername}@${domain}`;
  };
    return phone;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Verify OTP</Text>
      </View>

      <View className="flex-1 px-6 py-8">
        {/* Header Section */}
        <View className="items-center mb-8">
          <View className="bg-primary/10 rounded-full w-20 h-20 items-center justify-center mb-4">
            <Shield size={32} color="#6366f1" />
          </View>
          <Text className="text-2xl font-bold text-text-primary mb-2 text-center">
            Verify Your Number
          </Text>
          <Text className="text-text-secondary text-center leading-6 mb-2">
            We&apos;ve sent a 6-digit verification code to
          </Text>
          <Text className="text-text-primary font-semibold">
            {formatPhoneNumber(phoneNumber || '')}
          </Text>
        </View>

        {/* OTP Input Section */}
        <View className="mb-6">
          <Text className="text-text-primary font-semibold mb-4 text-center">
            Enter Verification Code
          </Text>
          <View className="flex-row justify-between mb-4">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className={`w-12 h-14 text-center text-xl font-bold bg-surface rounded-xl border ${
                  error ? 'border-error' : 'border-divider'
                } text-text-primary`}
                value={digit}
                onChangeText={(value) => handleOTPChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus={true}
              />
            ))}
          </View>

          {error && (
            <Text className="text-error text-sm text-center mb-4">{error}</Text>
          )}
        </View>

        {/* Verify Button */}
        <Button
          onPress={() => handleVerifyOTP()}
          loading={isLoading}
          disabled={isLoading || otp.some((digit) => !digit)}
          className="mb-6">
          Verify OTP
        </Button>

        {/* Resend Section */}
        <View className="items-center">
          <Text className="text-text-secondary mb-4">
            Didn&apos;t receive the code?
          </Text>

          {canResend ? (
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={isResending}
              className="flex-row items-center">
              <RefreshCw
                size={16}
                color="#6366f1"
                className={isResending ? 'animate-spin mr-2' : 'mr-2'}
              />
              <Text className="text-primary font-semibold">
                {isResending ? 'Resending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-text-secondary">
              Resend OTP in {timeLeft}s
            </Text>
          )}
        </View>

        {/* Help Section */}
        <View className="mt-8 bg-warning/5 rounded-xl p-4">
          <Text className="text-warning font-semibold mb-2">Demo Mode</Text>
          <Text className="text-text-secondary text-sm leading-5">
            For demonstration purposes, use OTP:{' '}
            <Text className="font-mono font-bold">123456</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
