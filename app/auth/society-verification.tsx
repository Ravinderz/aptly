import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Building, MapPin, Users, CheckCircle } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { Button } from "@/components/ui/Button";

interface Society {
  id: string;
  name: string;
  address: string;
  totalFlats: number;
  registeredResidents: number;
  code: string;
  amenities: string[];
}

export default function SocietyVerification() {
  const router = useRouter();
  const { phoneNumber, societyCode } = useLocalSearchParams<{
    phoneNumber: string;
    societyCode: string;
  }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [society, setSociety] = useState<Society | null>(null);
  const [error, setError] = useState("");
  
  // Responsive sizing
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = height < 700;

  useEffect(() => {
    fetchSocietyDetails();
  }, []);

  const fetchSocietyDetails = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock society data
      const mockSociety: Society = {
        id: "SOC001",
        name: "Greenwood Residency",
        address: "Plot No. 42, Sector 15, Dwarka, New Delhi - 110075",
        totalFlats: 120,
        registeredResidents: 95,
        code: societyCode || "GWR2024",
        amenities: ["Swimming Pool", "Gym", "Children's Play Area", "24/7 Security", "Power Backup", "Clubhouse"]
      };
      
      // Simulate API response
      if (societyCode === "INVALID") {
        setError("Society code not found. Please check with your society management.");
      } else {
        setSociety(mockSociety);
      }
      
    } catch (error) {
      setError("Failed to verify society details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (society) {
      router.push({
        pathname: "/auth/profile-setup",
        params: {
          phoneNumber,
          societyCode,
          societyId: society.id,
          societyName: society.name
        }
      });
    }
  };

  const handleRetry = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-headline-large font-bold text-text-primary">Society Verification</Text>
        </View>
        
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-text-primary font-semibold mt-4 mb-2">
            Verifying Society Details
          </Text>
          <Text className="text-text-secondary text-center">
            Please wait while we verify your society code: {societyCode}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !society) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-headline-large font-bold text-text-primary">Society Verification</Text>
        </View>
        
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-error/10 rounded-full w-20 h-20 items-center justify-center mb-6">
            <Building size={32} color="#D32F2F" />
          </View>
          
          <Text className="text-headline-large font-bold text-text-primary mb-4 text-center">
            Society Not Found
          </Text>
          
          <Text className="text-text-secondary text-center mb-8 leading-6">
            {error || "We couldn't find a society with the provided code. Please check your society code and try again."}
          </Text>
          
          <Button onPress={handleRetry} className="mb-4">
            Try Different Code
          </Button>
          
          <View className="bg-primary/5 rounded-xl p-4 mt-4">
            <Text className="text-primary font-semibold mb-2">Need Help?</Text>
            <Text className="text-text-secondary text-body-medium leading-5">
              Contact your society management or housing committee to get the correct society code.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <Text className="text-headline-large font-bold text-text-primary">Society Verification</Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingHorizontal: 24, 
          paddingVertical: isSmallScreen ? 16 : 32 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View className={`items-center ${isSmallScreen ? 'mb-6' : 'mb-8'}`}>
          <View className="bg-success/10 rounded-full w-20 h-20 items-center justify-center mb-4">
            <CheckCircle size={32} color="#4CAF50" />
          </View>
          <Text className="text-display-small font-bold text-text-primary mb-2 text-center">
            Society Verified!
          </Text>
          <Text className="text-text-secondary text-center leading-6">
            We found your society. Please review the details below.
          </Text>
        </View>

        {/* Society Details Card */}
        <View className="bg-surface rounded-2xl p-6 border border-divider mb-6">
          {/* Society Name and Code */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-headline-large font-bold text-text-primary mb-1">
                {society.name}
              </Text>
              <Text className="text-text-secondary text-body-medium">
                Society Code: {society.code}
              </Text>
            </View>
            <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center">
              <Building size={24} color="#6366f1" />
            </View>
          </View>

          {/* Address */}
          <View className="flex-row items-start mb-4">
            <MapPin size={16} color="#757575" className="mt-1 mr-3" />
            <Text className="flex-1 text-text-secondary leading-5">
              {society.address}
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mb-4">
            <View className="items-center">
              <Text className="text-display-small font-bold text-text-primary">{society.totalFlats}</Text>
              <Text className="text-text-secondary text-body-medium">Total Flats</Text>
            </View>
            <View className="items-center">
              <Text className="text-display-small font-bold text-success">{society.registeredResidents}</Text>
              <Text className="text-text-secondary text-body-medium">Registered</Text>
            </View>
            <View className="items-center">
              <Text className="text-display-small font-bold text-primary">
                {Math.round((society.registeredResidents / society.totalFlats) * 100)}%
              </Text>
              <Text className="text-text-secondary text-body-medium">Active</Text>
            </View>
          </View>

          {/* Amenities */}
          <View>
            <Text className="text-text-primary font-semibold mb-3">Available Amenities</Text>
            <View className="flex-row flex-wrap gap-2">
              {society.amenities.map((amenity, index) => (
                <View key={index} className="bg-primary/10 rounded-full px-3 py-1">
                  <Text className="text-primary text-body-medium font-medium">{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Verification Status */}
        <View className="bg-success/5 rounded-xl p-4 mb-6 border border-success/20">
          <View className="flex-row items-center mb-2">
            <CheckCircle size={16} color="#4CAF50" />
            <Text className="text-success font-semibold ml-2">Verification Successful</Text>
          </View>
          <Text className="text-text-secondary text-body-medium leading-5">
            Your phone number and society code have been verified. You can now proceed to set up your profile.
          </Text>
        </View>

        {/* Proceed Button */}
        <Button onPress={handleProceed} className="mb-4">
          Continue to Profile Setup
        </Button>

        {/* Wrong Society */}
        <TouchableOpacity 
          onPress={handleRetry}
          className="items-center py-3"
        >
          <Text className="text-text-secondary">
            Wrong society? <Text className="text-primary font-semibold">Try different code</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}