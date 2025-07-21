import { useRouter } from "expo-router";
import { Building, Shield, Users, Smartphone } from "lucide-react-native";
import React from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Image } from "react-native";
import { Button } from "@/components/ui/Button";
import HighlightCard from "@/components/ui/HighlightCard";

export default function Welcome() {
  const router = useRouter();

  const features = [
    {
      icon: <Building size={32} color="#6366f1" />,
      title: "Digital Society Management",
      description: "Manage your housing society digitally with ease"
    },
    {
      icon: <Shield size={32} color="#4CAF50" />,
      title: "Secure & Private",
      description: "Your data is protected with bank-level security"
    },
    {
      icon: <Users size={32} color="#FF9800" />,
      title: "Community Connect",
      description: "Stay connected with your society members"
    },
    {
      icon: <Smartphone size={32} color="#D32F2F" />,
      title: "Mobile First",
      description: "Designed specifically for Indian mobile users"
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="items-center px-6 py-12">
          <View className="bg-primary/10 rounded-full w-24 h-24 items-center justify-center mb-6">
            <Building size={48} color="#6366f1" />
          </View>
          
          <Text className="text-3xl font-bold text-text-primary mb-4 text-center">
            Welcome to Aptly
          </Text>
          
          <Text className="text-lg text-text-secondary text-center leading-7 mb-8">
            India's most trusted housing society management app. 
            Simplify maintenance, billing, and community management.
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
          <Text className="text-xl font-bold text-text-primary mb-6 text-center">
            Why Choose Aptly?
          </Text>
          
          <View className="space-y-4">
            {features.map((feature, index) => (
              <View key={index} className="bg-surface rounded-2xl p-6 border border-divider">
                <View className="flex-row items-center mb-3">
                  <View className="bg-background rounded-full w-16 h-16 items-center justify-center mr-4">
                    {feature.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-text-primary mb-1">
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
            <Text className="text-primary font-bold text-lg mb-3 text-center">
              Trusted by 10,000+ Residents
            </Text>
            <View className="flex-row justify-between items-center">
              <View className="items-center">
                <Text className="text-2xl font-bold text-text-primary">500+</Text>
                <Text className="text-text-secondary text-sm">Societies</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-text-primary">50K+</Text>
                <Text className="text-text-secondary text-sm">Residents</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-text-primary">4.8★</Text>
                <Text className="text-text-secondary text-sm">Rating</Text>
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
            onPress={() => router.push("/auth/phone-registration")}
            className="items-center py-3"
          >
            <Text className="text-text-secondary">
              Already have an account? <Text className="text-primary font-semibold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Notice */}
        <View className="mx-6 mb-6">
          <HighlightCard
            title="Demo Mode"
            variant="warning"
            size="md"
          >
            This is a demonstration version. In production, you would connect to your 
            society's actual management system.
          </HighlightCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}