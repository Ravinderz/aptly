import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Shield, RefreshCw } from "lucide-react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { Button } from "@/components/ui/Button";

export default function OTPVerification() {
  const router = useRouter();
  const { phoneNumber, societyCode } = useLocalSearchParams<{
    phoneNumber: string;
    societyCode: string;
  }>();
  
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

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
    const numericValue = value.replace(/[^0-9]/g, "");
    
    if (numericValue.length <= 1) {
      const newOTP = [...otp];
      newOTP[index] = numericValue;
      setOTP(newOTP);
      
      // Clear error when user starts typing
      if (error) setError("");
      
      // Auto-focus next input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Auto-submit if all fields are filled
      if (index === 5 && numericValue && newOTP.every(digit => digit !== "")) {
        handleVerifyOTP(newOTP.join(""));
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input if current is empty and backspace is pressed
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join("");
    
    if (otpToVerify.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate API response
      const isValidOTP = otpToVerify === "123456"; // For demo purposes
      
      if (isValidOTP) {
        // Navigate to society verification/profile setup
        router.push({
          pathname: "/auth/society-verification",
          params: {
            phoneNumber,
            societyCode
          }
        });
      } else {
        setError("Invalid OTP. Please try again.");
        // Clear OTP inputs
        setOTP(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
      
    } catch (error) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset timer
      setTimeLeft(30);
      setCanResend(false);
      setError("");
      
      Alert.alert("OTP Sent", "A new OTP has been sent to your mobile number.");
      
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("+91")) {
      const number = phone.substring(3);
      return `+91 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
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
            We've sent a 6-digit verification code to
          </Text>
          <Text className="text-text-primary font-semibold">
            {formatPhoneNumber(phoneNumber || "")}
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
                  error ? "border-error" : "border-divider"
                } text-text-primary`}
                value={digit}
                onChangeText={(value) => handleOTPChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
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
          disabled={isLoading || otp.some(digit => !digit)}
          className="mb-6"
        >
          Verify OTP
        </Button>

        {/* Resend Section */}
        <View className="items-center">
          <Text className="text-text-secondary mb-4">
            Didn't receive the code?
          </Text>
          
          {canResend ? (
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={isResending}
              className="flex-row items-center"
            >
              <RefreshCw 
                size={16} 
                color="#6366f1" 
                className={isResending ? "animate-spin mr-2" : "mr-2"}
              />
              <Text className="text-primary font-semibold">
                {isResending ? "Resending..." : "Resend OTP"}
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
            For demonstration purposes, use OTP: <Text className="font-mono font-bold">123456</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}