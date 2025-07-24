import { Button } from "@/components/ui/Button";
import LucideIcons from "@/components/ui/LucideIcons";
import { useAuth } from "@/contexts/AuthContext";
import BiometricService from "@/services/biometric.service";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BiometricSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const [biometricConfig, setBiometricConfig] = useState({
    hasHardware: false,
    isEnrolled: false,
    supportedTypes: [],
    isEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const config = await BiometricService.checkBiometricSupport();
    setBiometricConfig(config);
  };

  const handleEnableBiometric = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User information not available");
      return;
    }

    setIsLoading(true);

    try {
      const success = await BiometricService.enableBiometricAuth(user.id);
      
      if (success) {
        Alert.alert(
          "Success!",
          "Biometric authentication has been enabled for your account.",
          [
            {
              text: "Continue",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Setup Failed",
          "Could not enable biometric authentication. Please try again."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while setting up biometric authentication."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const getBiometricIcon = () => {
    const typeName = BiometricService.getBiometricTypeName(biometricConfig.supportedTypes);
    return typeName.includes("Face") ? (
      <LucideIcons name="shield-outline" size={64} color="#6366f1" />
    ) : (
      <LucideIcons name="fingerprint" size={64} color="#6366f1" />
    );
  };

  const getBiometricTypeName = () => {
    return BiometricService.getBiometricTypeName(biometricConfig.supportedTypes);
  };

  if (!biometricConfig.hasHardware || !biometricConfig.isEnrolled) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-error/10 rounded-full w-24 h-24 items-center justify-center mb-6">
            <LucideIcons name="close" size={48} color="#D32F2F" />
          </View>
          
          <Text className="text-headline-large text-text-primary mb-4 text-center">
            Biometric Authentication Unavailable
          </Text>
          
          <Text className="text-body-large text-text-secondary text-center mb-8 leading-6">
            {!biometricConfig.hasHardware
              ? "Your device doesn't support biometric authentication."
              : "You haven't set up biometric authentication on your device. Please enable it in your device settings first."}
          </Text>

          <Button onPress={handleSkip} className="w-full">
            Continue to App
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Skip Button */}
      <View className="absolute top-12 right-4 z-10">
        <TouchableOpacity
          onPress={handleSkip}
          className="bg-surface rounded-full p-3 shadow-sm"
          activeOpacity={0.8}
        >
          <Text className="text-text-secondary font-semibold">Skip</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center items-center px-6">
        {/* Biometric Icon */}
        <View className="bg-primary/10 rounded-full w-32 h-32 items-center justify-center mb-8">
          {getBiometricIcon()}
        </View>

        {/* Title */}
        <Text className="text-display-medium text-text-primary mb-4 text-center">
          Secure Your Account
        </Text>

        {/* Subtitle */}
        <Text className="text-body-large text-text-secondary text-center mb-8 leading-6">
          Enable {getBiometricTypeName()} authentication for quick and secure access to your Aptly account.
        </Text>

        {/* Benefits */}
        <View className="bg-surface rounded-2xl p-6 mb-8 w-full">
          <Text className="text-headline-medium text-text-primary mb-4">
            Why enable biometric login?
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <View className="bg-success/10 rounded-full w-8 h-8 items-center justify-center mr-3">
                <LucideIcons name="shield-outline" size={16} color="#4CAF50" />
              </View>
              <Text className="text-text-secondary flex-1">
                Enhanced security for your society data
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="bg-primary/10 rounded-full w-8 h-8 items-center justify-center mr-3">
                <LucideIcons name="fingerprint" size={16} color="#6366f1" />
              </View>
              <Text className="text-text-secondary flex-1">
                Quick access without typing passwords
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View className="w-full space-y-3">
          <Button 
            onPress={handleEnableBiometric}
            loading={isLoading}
            className="w-full"
          >
            Enable {getBiometricTypeName()}
          </Button>
          
          <TouchableOpacity
            onPress={handleSkip}
            className="items-center py-3"
          >
            <Text className="text-text-secondary">
              Maybe later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}