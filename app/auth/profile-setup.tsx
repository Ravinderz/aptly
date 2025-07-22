import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/services/auth.service";
import { showErrorAlert, showSuccessAlert } from "@/utils/alert";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileData {
  fullName: string;
  flatNumber: string;
  ownershipType: "owner" | "tenant";
  familySize: string;
  emergencyContact: string;
  role: "resident" | "committee_member" | "society_admin";
}

export default function ProfileSetup() {
  const router = useRouter();
  const { login } = useAuth();
  const { phoneNumber, societyCode, societyId, societyName } =
    useLocalSearchParams<{
      phoneNumber: string;
      societyCode: string;
      societyId: string;
      societyName: string;
    }>();

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    flatNumber: "",
    ownershipType: "owner",
    familySize: "",
    emergencyContact: "",
    role: "resident",
  });

  const [errors, setErrors] = useState<Partial<ProfileData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const ownershipTypes = [
    {
      value: "owner",
      label: "Owner",
      icon: "🏠",
      description: "I own this flat",
    },
    {
      value: "tenant",
      label: "Tenant",
      icon: "🔑",
      description: "I am renting this flat",
    },
  ];

  const roles = [
    {
      value: "resident",
      label: "Resident",
      icon: "👤",
      description: "Regular society member",
    },
    {
      value: "committee_member",
      label: "Committee Member",
      icon: "👥",
      description: "Part of society committee",
    },
    {
      value: "society_admin",
      label: "Society Admin",
      icon: "⚡",
      description: "Full administrative access",
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileData> = {};

    if (!profileData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (profileData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!profileData.flatNumber.trim()) {
      newErrors.flatNumber = "Flat number is required";
    } else if (!/^[A-Z0-9\-\/]+$/i.test(profileData.flatNumber.trim())) {
      newErrors.flatNumber = "Invalid flat number format";
    }

    if (!profileData.familySize.trim()) {
      newErrors.familySize = "Family size is required";
    } else if (
      isNaN(Number(profileData.familySize)) ||
      Number(profileData.familySize) < 1 ||
      Number(profileData.familySize) > 20
    ) {
      newErrors.familySize = "Family size must be between 1-20";
    }

    if (!profileData.emergencyContact.trim()) {
      newErrors.emergencyContact = "Emergency contact is required";
    } else {
      const cleanContact = profileData.emergencyContact.replace(
        /[\s\-\(\)]/g,
        ""
      );
      const indianMobileRegex = /^[6-9]\d{9}$/;
      if (
        !indianMobileRegex.test(cleanContact) &&
        !(
          cleanContact.startsWith("91") &&
          indianMobileRegex.test(cleanContact.substring(2))
        )
      ) {
        newErrors.emergencyContact = "Invalid Indian mobile number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Create profile data
      const completeProfileData = {
        id: `user_${Date.now()}`, // Generate temp ID for demo
        phoneNumber: phoneNumber || "",
        fullName: profileData.fullName,
        flatNumber: profileData.flatNumber,
        ownershipType: profileData.ownershipType,
        familySize: parseInt(profileData.familySize),
        emergencyContact: profileData.emergencyContact,
        role: profileData.role,
        societyId: societyId || "",
        societyCode: societyCode || "",
        isVerified: true,
        createdAt: new Date().toISOString(),
      } as UserProfile;

      // For demo purposes, we'll simulate the API call
      // In production, use: const result = await AuthService.createProfile(completeProfileData);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Log the user in with the auth context
      login(completeProfileData);

      showSuccessAlert(
        "Profile Created!",
        "Your profile has been set up successfully. Welcome to Aptly!",
        () => {
          // The auth context will handle navigation
          router.replace("/(tabs)");
        }
      );
    } catch (error) {
      console.error("Profile creation error:", error);
      showErrorAlert("Error", "Failed to create profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-text-primary">
            Profile Setup
          </Text>
          <Text className="text-text-secondary text-sm">{societyName}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Welcome Section */}
          <View className="items-center mb-8">
            <View className="bg-primary/10 rounded-full w-20 h-20 items-center justify-center mb-4">
              <User size={32} color="#6366f1" />
            </View>
            <Text className="text-2xl font-bold text-text-primary mb-2 text-center">
              Complete Your Profile
            </Text>
            <Text className="text-text-secondary text-center leading-6">
              Help us set up your account with basic information
            </Text>
          </View>

          {/* Full Name */}
          <View className="mb-6">
            <Text className="text-text-primary font-semibold mb-3">
              Full Name *
            </Text>
            <TextInput
              className="bg-surface rounded-xl border border-divider px-4 py-4 text-text-primary text-lg"
              placeholder="Enter your full name"
              placeholderTextColor="#757575"
              value={profileData.fullName}
              onChangeText={(value) => handleInputChange("fullName", value)}
              autoCapitalize="words"
            />
            {errors.fullName && (
              <Text className="text-error text-sm mt-2">{errors.fullName}</Text>
            )}
          </View>

          {/* Flat Number */}
          <View className="mb-6">
            <Text className="text-text-primary font-semibold mb-3">
              Flat Number *
            </Text>
            <TextInput
              className="bg-surface rounded-xl border border-divider px-4 py-4 text-text-primary text-lg"
              placeholder="e.g., A-201, B-15, 4/102"
              placeholderTextColor="#757575"
              value={profileData.flatNumber}
              onChangeText={(value) =>
                handleInputChange("flatNumber", value.toUpperCase())
              }
              autoCapitalize="characters"
            />
            {errors.flatNumber && (
              <Text className="text-error text-sm mt-2">
                {errors.flatNumber}
              </Text>
            )}
          </View>

          {/* Ownership Type */}
          <View className="mb-6">
            <Text className="text-text-primary font-semibold mb-3">
              Ownership Type *
            </Text>
            <View className="space-y-3">
              {ownershipTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() =>
                    setProfileData((prev) => ({
                      ...prev,
                      ownershipType: type.value as "owner" | "tenant",
                    }))
                  }
                  className={`flex-row items-center p-4 rounded-xl border ${
                    profileData.ownershipType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-divider bg-surface"
                  }`}
                >
                  <Text className="text-2xl mr-4">{type.icon}</Text>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
                        profileData.ownershipType === type.value
                          ? "text-primary"
                          : "text-text-primary"
                      }`}
                    >
                      {type.label}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {type.description}
                    </Text>
                  </View>
                  {profileData.ownershipType === type.value && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Family Size */}
          <View className="mb-6">
            <Text className="text-text-primary font-semibold mb-3">
              Family Size *
            </Text>
            <TextInput
              className="bg-surface rounded-xl border border-divider px-4 py-4 text-text-primary text-lg"
              placeholder="Number of family members"
              placeholderTextColor="#757575"
              value={profileData.familySize}
              onChangeText={(value) => handleInputChange("familySize", value)}
              keyboardType="number-pad"
              maxLength={2}
            />
            {errors.familySize && (
              <Text className="text-error text-sm mt-2">
                {errors.familySize}
              </Text>
            )}
          </View>

          {/* Emergency Contact */}
          <View className="mb-6">
            <Text className="text-text-primary font-semibold mb-3">
              Emergency Contact *
            </Text>
            <TextInput
              className="bg-surface rounded-xl border border-divider px-4 py-4 text-text-primary text-lg"
              placeholder="Emergency contact number"
              placeholderTextColor="#757575"
              value={profileData.emergencyContact}
              onChangeText={(value) =>
                handleInputChange("emergencyContact", value)
              }
              keyboardType="phone-pad"
            />
            {errors.emergencyContact && (
              <Text className="text-error text-sm mt-2">
                {errors.emergencyContact}
              </Text>
            )}
            <Text className="text-text-secondary text-xs mt-2">
              Alternative contact person in case of emergency
            </Text>
          </View>

          {/* Role Selection */}
          <View className="mb-8">
            <Text className="text-text-primary font-semibold mb-3">
              Your Role *
            </Text>
            <View className="space-y-3">
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  onPress={() =>
                    setProfileData((prev) => ({
                      ...prev,
                      role: role.value as any,
                    }))
                  }
                  className={`flex-row items-center p-4 rounded-xl border ${
                    profileData.role === role.value
                      ? "border-primary bg-primary/5"
                      : "border-divider bg-surface"
                  }`}
                >
                  <Text className="text-2xl mr-4">{role.icon}</Text>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
                        profileData.role === role.value
                          ? "text-primary"
                          : "text-text-primary"
                      }`}
                    >
                      {role.label}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {role.description}
                    </Text>
                  </View>
                  {profileData.role === role.value && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            className="mb-6"
          >
            Create Profile
          </Button>

          {/* Privacy Notice */}
          <View className="bg-primary/5 rounded-xl p-4">
            <Text className="text-primary font-semibold mb-2">
              Privacy & Security
            </Text>
            <Text className="text-text-secondary text-sm leading-5">
              Your information is securely stored and only shared with your
              society management for legitimate purposes. You can update your
              profile anytime from the settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
