/**
 * Society Completion - Success and completion screen
 * 
 * Shows completion status and next steps:
 * 1. Review submitted information
 * 2. Show approval status
 * 3. Guide to main app
 */
import { Button } from '@/components/ui/Button';
import LucideIcons from '@/components/ui/LucideIcons';
import {
  ResponsiveContainer,
  ResponsiveText,
} from '@/components/ui/ResponsiveContainer';
import { responsive } from '@/utils/responsive';
import { showErrorAlert } from '@/utils/alert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { 
  useSocietyOnboardingStore,
  useSocietyOnboardingActions, 
  useSocietyOnboardingData,
  useSocietySelection,
  useSocietyOnboardingSubmission
} from '@/stores/slices/societyOnboardingStore';

export default function SocietyCompletion() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [isReviewing, setIsReviewing] = useState(false);

  // Store hooks
  const { 
    submitJoinRequest, 
    retrySubmission, 
    resetFlow,
    updateConsentAgreements 
  } = useSocietyOnboardingActions();
  const { userProfile, residenceDetails, emergencyContacts, consentAgreements } = useSocietyOnboardingData();
  const { selectedSociety } = useSocietySelection();
  const { loading, error, response } = useSocietyOnboardingSubmission();

  // Check if submission is already completed
  const isCompleted = response?.success && response.data;
  const isApproved = isCompleted && response.data?.association?.status === 'approved';
  const isPending = isCompleted && response.data?.association?.status === 'pending';

  // Auto-update consent agreements
  useEffect(() => {
    updateConsentAgreements({
      termsAndConditions: true,
      privacyPolicy: true,
      societyRules: true,
      dataSharing: true,
    });
  }, [updateConsentAgreements]);

  const handleSubmitRequest = async () => {
    if (!selectedSociety) {
      showErrorAlert('Error', 'Please select a society first');
      return;
    }

    try {
      await submitJoinRequest();
    } catch (error: any) {
      showErrorAlert('Error', error.message || 'Submission failed');
    }
  };

  const handleRetrySubmission = async () => {
    try {
      await retrySubmission();
    } catch (error: any) {
      showErrorAlert('Error', error.message || 'Retry failed');
    }
  };

  const handleContinueToApp = () => {
    // Clear onboarding flow and navigate to main app
    resetFlow();
    router.replace('/(tabs)');
  };

  const handleBackToOnboarding = () => {
    router.back();
  };

  const renderReviewSection = () => (
    <View className="mb-6">
      <Text className="text-text-primary font-semibold text-lg mb-4">Review Your Information</Text>

      {/* Society Information */}
      <View className="bg-surface rounded-xl p-4 mb-4">
        <Text className="text-text-primary font-semibold mb-2">Selected Society</Text>
        <Text className="text-text-primary font-medium">{selectedSociety?.name}</Text>
        <Text className="text-text-secondary text-sm">
          {selectedSociety?.address.city}, {selectedSociety?.address.state}
        </Text>
        <Text className="text-text-secondary text-sm mt-1">
          Code: {selectedSociety?.code}
        </Text>
      </View>

      {/* Personal Information */}
      <View className="bg-surface rounded-xl p-4 mb-4">
        <Text className="text-text-primary font-semibold mb-2">Personal Information</Text>
        <Text className="text-text-secondary text-sm mb-1">Name: {userProfile.fullName}</Text>
        <Text className="text-text-secondary text-sm mb-1">Phone: {userProfile.phoneNumber}</Text>
        {userProfile.email && (
          <Text className="text-text-secondary text-sm">Email: {userProfile.email}</Text>
        )}
      </View>

      {/* Residence Information */}
      <View className="bg-surface rounded-xl p-4 mb-4">
        <Text className="text-text-primary font-semibold mb-2">Residence Details</Text>
        <Text className="text-text-secondary text-sm mb-1">
          Flat: {residenceDetails.flatNumber}
          {residenceDetails.block && `, Block: ${residenceDetails.block}`}
        </Text>
        <Text className="text-text-secondary text-sm mb-1">
          Type: {residenceDetails.ownershipType.charAt(0).toUpperCase() + residenceDetails.ownershipType.slice(1)}
        </Text>
        <Text className="text-text-secondary text-sm">
          Move-in Date: {residenceDetails.moveInDate}
        </Text>
      </View>

      {/* Emergency Contacts */}
      <View className="bg-surface rounded-xl p-4 mb-4">
        <Text className="text-text-primary font-semibold mb-2">Emergency Contacts</Text>
        {emergencyContacts.map((contact, index) => (
          <View key={index} className="mb-2">
            <Text className="text-text-secondary text-sm">
              {contact.name} ({contact.relationship}) - {contact.phoneNumber}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderErrorState = () => (
    <View className="items-center py-8">
      <View className="bg-error/10 rounded-full w-16 h-16 items-center justify-center mb-4">
        <LucideIcons name="alert-circle" size={32} color="#EF4444" />
      </View>
      <Text className="text-error font-semibold text-lg mb-2">Submission Failed</Text>
      <Text className="text-text-secondary text-center mb-6 px-4">{error}</Text>
      
      <View className="flex-row space-x-3 w-full px-4">
        <Button
          variant="secondary"
          onPress={handleBackToOnboarding}
          className="flex-1">
          Edit Details
        </Button>
        <Button
          onPress={handleRetrySubmission}
          loading={loading}
          className="flex-1">
          Try Again
        </Button>
      </View>
    </View>
  );

  const renderPendingState = () => (
    <View className="items-center py-8">
      <View className="bg-warning/10 rounded-full w-16 h-16 items-center justify-center mb-4">
        <LucideIcons name="clock" size={32} color="#F59E0B" />
      </View>
      <ResponsiveText
        variant="display"
        size="small"
        className="font-bold mb-2 text-center">
        Application Submitted
      </ResponsiveText>
      <Text className="text-text-secondary text-center mb-6 px-4">
        Your application is under review by the society management. 
        You'll be notified once it's approved.
      </Text>

      <View className="bg-warning/5 rounded-xl p-4 mb-6 w-full">
        <Text className="text-warning font-semibold mb-2">What's Next?</Text>
        <Text className="text-text-secondary text-sm leading-5">
          • Society management will review your application{'\n'}
          • You may be contacted for additional information{'\n'}
          • Approval typically takes 1-3 business days{'\n'}
          • You'll receive a notification once approved
        </Text>
      </View>

      <Button
        onPress={handleContinueToApp}
        className="w-full">
        Continue to App
      </Button>
    </View>
  );

  const renderSuccessState = () => (
    <View className="items-center py-8">
      <View className="bg-success/10 rounded-full w-16 h-16 items-center justify-center mb-4">
        <LucideIcons name="check-circle" size={32} color="#10B981" />
      </View>
      <ResponsiveText
        variant="display"
        size="small"
        className="font-bold mb-2 text-center">
        Welcome to {selectedSociety?.name}!
      </ResponsiveText>
      <Text className="text-text-secondary text-center mb-6 px-4">
        Your application has been approved. You can now access all society features and services.
      </Text>

      <View className="bg-success/5 rounded-xl p-4 mb-6 w-full">
        <Text className="text-success font-semibold mb-2">You can now:</Text>
        <Text className="text-text-secondary text-sm leading-5">
          • Book visitor entries and manage guest access{'\n'}
          • View and create community posts{'\n'}
          • Access society services and amenities{'\n'}
          • Receive important notices and updates{'\n'}
          • Connect with your neighbors
        </Text>
      </View>

      <Button
        onPress={handleContinueToApp}
        className="w-full">
        Explore Your Society
      </Button>
    </View>
  );

  const renderInitialState = () => (
    <ScrollView className="flex-1">
      <View className="items-center mb-8">
        <View
          className="bg-primary/10 rounded-full items-center justify-center mb-4"
          style={{
            width: responsive.spacing(64),
            height: responsive.spacing(64),
          }}>
          <LucideIcons
            name="check-circle"
            size={responsive.spacing(32)}
            color="#6366f1"
          />
        </View>
        <ResponsiveText
          variant="display"
          size="small"
          className="font-bold mb-2 text-center">
          Review & Submit
        </ResponsiveText>
        <ResponsiveText
          variant="body"
          size="medium"
          className="text-text-secondary text-center">
          Please review your information before submitting your society join request
        </ResponsiveText>
      </View>

      {renderReviewSection()}

      {/* Consent Agreements */}
      <View className="bg-primary/5 rounded-xl p-4 mb-6">
        <Text className="text-primary font-semibold mb-2">Terms & Agreements</Text>
        <Text className="text-text-secondary text-sm leading-5">
          By submitting this request, you agree to:{'\n'}
          • Terms and Conditions of the app{'\n'}
          • Privacy Policy and data usage{'\n'}
          • Society rules and regulations{'\n'}
          • Sharing your information with society management
        </Text>
      </View>

      <Button
        onPress={handleSubmitRequest}
        loading={loading}
        className="mb-4">
        Submit Join Request
      </Button>

      <TouchableOpacity
        onPress={handleBackToOnboarding}
        className="items-center py-4">
        <Text className="text-primary font-medium">Edit Information</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <LucideIcons name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">
          {isCompleted 
            ? (isApproved ? 'Welcome!' : 'Application Submitted') 
            : 'Complete Registration'}
        </Text>
      </View>

      <ResponsiveContainer
        type="scroll"
        padding="lg"
        keyboardAware={false}
        preventOverflow={true}>
        
        {error && !isCompleted && renderErrorState()}
        {isCompleted && isPending && renderPendingState()}
        {isCompleted && isApproved && renderSuccessState()}
        {!isCompleted && !error && renderInitialState()}
      </ResponsiveContainer>
    </SafeAreaView>
  );
}