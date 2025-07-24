import { Button } from "@/components/ui/Button";
import HighlightCard from "@/components/ui/HighlightCard";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Building, Shield, Smartphone, Users, Zap } from "lucide-react-native";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Welcome() {
  const router = useRouter();
  const { login } = useAuth();

  const handleDevSkip = async () => {
    try {
      // Create mock user data for development
      const mockUserProfile = {
        id: "dev-user-123",
        name: "John Developer",
        phone: "9876543210",
        email: "john@aptly.app",
        flatNumber: "A-101",
        societyId: "dev-society-123",
        societyName: "Green Valley Apartments",
        role: "resident",
        isVerified: true,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockTokens = {
        accessToken: "mock-access-token-123",
        refreshToken: "mock-refresh-token-123",
      };

      // Store mock data in AsyncStorage
      await AsyncStorage.multiSet([
        ["auth_tokens", JSON.stringify(mockTokens)],
        ["user_profile", JSON.stringify(mockUserProfile)],
      ]);

      // Update auth context
      login(mockUserProfile);

      // Navigate to home
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error setting up dev mode:", error);
    }
  };

  const features = [
    {
      icon: <Building size={32} className="text-primary" />,
      title: "Digital Society Management",
      description: "Manage your housing society digitally with ease",
    },
    {
      icon: <Shield size={32} className="text-secondary" />,
      title: "Secure & Private",
      description: "Your data is protected with bank-level security",
    },
    {
      icon: <Users size={32} className="text-warning" />,
      title: "Community Connect",
      description: "Stay connected with your society members",
    },
    {
      icon: <Smartphone size={32} className="text-error" />,
      title: "Mobile First",
      description: "Designed specifically for Indian mobile users",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Development Skip Button */}
      {__DEV__ && (
        <View className="absolute top-12 right-4 z-10">
          <TouchableOpacity
            onPress={handleDevSkip}
            className="bg-warning/90 rounded-full px-3 py-2 flex-row items-center shadow-sm"
            activeOpacity={0.8}
          >
            <Zap size={16} color="white" />
            <Text className="text-white text-label-large font-bold ml-1">
              DEV SKIP
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="items-center px-6 py-12">
          <View className="bg-primary/10 rounded-full w-24 h-24 items-center justify-center mb-6">
            <Building size={48} className="text-primary" />
          </View>

          <Text className="text-display-large text-text-primary mb-4 text-center">
            Welcome to Aptly
          </Text>

          <Text className="text-body-large text-text-secondary text-center leading-7 mb-8">
            India&apos;s most trusted housing society management app. Simplify
            maintenance, billing, and community management.
          </Text>

          {/* Indian Context Badge */}
          <View className="bg-success/10 rounded-full px-4 py-2 mb-8">
            <Text className="text-success font-semibold">
              🇮🇳 Made for Indian Societies
            </Text>
          </View>
        </View>

        {/* Features Grid */}
        <View className="px-6 mb-8">
          <Text className="text-headline-large text-text-primary mb-6 text-center">
            Why Choose Aptly?
          </Text>

          <View className="space-y-4">
            {features.map((feature, index) => (
              <View
                key={index}
                className="bg-surface rounded-2xl p-6 border border-divider"
              >
                <View className="flex-row items-center mb-3">
                  <View className="bg-background rounded-full w-16 h-16 items-center justify-center mr-4">
                    {feature.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="text-headline-medium text-text-primary mb-1">
                      {feature.title}
                    </Text>
                    <Text className="text-text-secondary leading-5">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Trusted By Section */}
        <View className="px-6 mb-8">
          <View className="bg-primary/5 rounded-2xl p-6">
            <Text className="text-primary font-bold text-headline-medium mb-3 text-center">
              Trusted by 10,000+ Residents
            </Text>
            <View className="flex-row justify-between items-center">
              <View className="items-center">
                <Text className="text-display-medium text-text-primary">
                  500+
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  Societies
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-display-medium text-text-primary">
                  50K+
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  Residents
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-display-medium text-text-primary">
                  4.8★
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  Rating
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View className="px-6 pb-8">
          <Button
            onPress={() => router.push("/auth/phone-registration")}
            className="mb-4"
          >
            Get Started
          </Button>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/auth/phone-registration",
                params: { mode: "signin" },
              })
            }
            className="items-center py-3"
          >
            <Text className="text-text-secondary">
              Already have an account?{" "}
              <Text className="text-primary font-semibold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Notice */}
        <View className="mx-6 mb-6">
          <HighlightCard title="Demo Mode" variant="warning" size="md">
            This is a demonstration version. In production, you would connect to
            your society&apos;s actual management system.
          </HighlightCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
