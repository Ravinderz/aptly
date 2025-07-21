import { useRouter } from "expo-router";
import { ArrowLeft, Phone, Shield } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { Button } from "@/components/ui/Button";
import AuthService from "@/services/auth.service";
import { showErrorAlert } from "@/utils/alert";

export default function PhoneRegistration() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [societyCode, setSocietyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{phone?: string; society?: string}>({});

  // Indian phone number validation
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove any spaces, dashes, or special characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    
    // Check if it's a valid Indian mobile number
    // Indian mobile numbers: 10 digits starting with 6, 7, 8, or 9
    const indianMobileRegex = /^[6-9]\d{9}$/;
    
    // If it starts with +91, remove it
    if (cleanPhone.startsWith("+91")) {
      return indianMobileRegex.test(cleanPhone.substring(3));
    }
    
    // If it starts with 91, remove it
    if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
      return indianMobileRegex.test(cleanPhone.substring(2));
    }
    
    // If it's 10 digits, check directly
    return indianMobileRegex.test(cleanPhone);
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove any existing formatting
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    
    // Remove +91 or 91 prefix if present
    let number = cleanPhone;
    if (cleanPhone.startsWith("+91")) {
      number = cleanPhone.substring(3);
    } else if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
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
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    
    // If already has country code, return as is
    if (cleanPhone.startsWith("+91")) {
      return cleanPhone;
    }
    
    // If starts with 91, add +
    if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
      return `+${cleanPhone}`;
    }
    
    // Add +91 prefix for Indian numbers
    return `+91${cleanPhone}`;
  };

  const validateSocietyCode = (code: string): boolean => {
    // Society code should be 6-8 alphanumeric characters
    const societyCodeRegex = /^[A-Z0-9]{6,8}$/;
    return societyCodeRegex.test(code.toUpperCase());
  };

  const handlePhoneChange = (text: string) => {
    // Only allow numbers, spaces, +, -, (, )
    const cleanText = text.replace(/[^0-9\s\-\(\)\+]/g, "");
    
    // Limit to reasonable length
    if (cleanText.length <= 15) {
      setPhoneNumber(formatPhoneNumber(cleanText));
    }
    
    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleSocietyCodeChange = (text: string) => {
    // Convert to uppercase and limit to 8 characters
    const upperText = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (upperText.length <= 8) {
      setSocietyCode(upperText);
    }
    
    // Clear society error when user starts typing
    if (errors.society) {
      setErrors(prev => ({ ...prev, society: undefined }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: {phone?: string; society?: string} = {};
    
    // Validate phone number
    if (!phoneNumber.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phone = "Please enter a valid Indian mobile number";
    }
    
    // Validate society code
    if (!societyCode.trim()) {
      newErrors.society = "Society code is required";
    } else if (!validateSocietyCode(societyCode)) {
      newErrors.society = "Society code should be 6-8 alphanumeric characters";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const fullPhoneNumber = getFullPhoneNumber(phoneNumber);
      
      const result = await AuthService.registerPhone(fullPhoneNumber, societyCode);
      
      if (result.success) {
        // Navigate to OTP verification
        router.push({
          pathname: "/auth/otp-verification",
          params: {
            phoneNumber: fullPhoneNumber,
            societyCode: societyCode
          }
        });
      } else {
        // Show specific error from auth service
        if (result.error?.includes('phone')) {
          setErrors({ phone: result.error });
        } else if (result.error?.includes('society')) {
          setErrors({ society: result.error });
        } else {
          showErrorAlert("Error", result.error || "Failed to send OTP. Please try again.");
        }
      }
      
    } catch (error) {
      console.error('Phone registration error:', error);
      showErrorAlert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary">Sign Up</Text>
        </View>

        <View className="flex-1 px-6 py-8">
          {/* Welcome Section */}
          <View className="items-center mb-8">
            <View className="bg-primary/10 rounded-full w-20 h-20 items-center justify-center mb-4">
              <Phone size={32} color="#6366f1" />
            </View>
            <Text className="text-2xl font-bold text-text-primary mb-2 text-center">
              Welcome to Aptly
            </Text>
            <Text className="text-text-secondary text-center leading-6">
              Enter your mobile number and society code to get started with your housing society management
            </Text>
          </View>

          {/* Phone Number Input */}
          <View className="mb-6">
            <Text className="text-text-primary font-semibold mb-3">Mobile Number</Text>
            <View className="flex-row items-center bg-surface rounded-xl border border-divider px-4 py-4">
              <Text className="text-text-primary font-medium mr-3">🇮🇳 +91</Text>
              <View className="h-6 w-px bg-divider mr-3" />
              <TextInput
                className="flex-1 text-text-primary text-lg"
                placeholder="Enter mobile number"
                placeholderTextColor="#757575"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={13} // Formatted: XXX XXX XXXX
                autoFocus={true}
              />
            </View>
            {errors.phone && (
              <Text className="text-error text-sm mt-2">{errors.phone}</Text>
            )}
            <Text className="text-text-secondary text-xs mt-2">
              We'll send an OTP to verify your number
            </Text>
          </View>

          {/* Society Code Input */}
          <View className="mb-8">
            <Text className="text-text-primary font-semibold mb-3">Society Code</Text>
            <View className="flex-row items-center bg-surface rounded-xl border border-divider px-4 py-4">
              <Shield size={20} color="#6366f1" className="mr-3" />
              <TextInput
                className="flex-1 text-text-primary text-lg"
                placeholder="Enter society code"
                placeholderTextColor="#757575"
                value={societyCode}
                onChangeText={handleSocietyCodeChange}
                autoCapitalize="characters"
                maxLength={8}
              />
            </View>
            {errors.society && (
              <Text className="text-error text-sm mt-2">{errors.society}</Text>
            )}
            <Text className="text-text-secondary text-xs mt-2">
              Get your society code from your housing society management
            </Text>
          </View>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            className="mb-6"
          >
            Send OTP
          </Button>

          {/* Help Section */}
          <View className="bg-primary/5 rounded-xl p-4">
            <Text className="text-primary font-semibold mb-2">Need Help?</Text>
            <Text className="text-text-secondary text-sm leading-5">
              Contact your society manager or housing committee to get your society code. 
              Make sure you're using the mobile number registered with your society.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}