import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface SocietyOnboardingRequest {
  // Step 1: Society Basic Info
  societyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  totalUnits: string;
  description: string;
  
  // Step 2: Contact Details
  contactName: string;
  contactRole: string;
  contactPhone: string;
  contactEmail: string;
  alternatePhone: string;
  
  // Step 3: Subscription & Features
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  features: string[];
  
  // Step 4: Agreement
  agreesToTerms: boolean;
  agreesToPrivacy: boolean;
}

const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '₹5,000/month',
    features: [
      'Resident Management',
      'Basic Communication',
      'Maintenance Tracking',
      'Guest Management',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹10,000/month',
    features: [
      'All Basic Features',
      'Advanced Analytics',
      'Governance & Voting',
      'Financial Management',
      'Event Management',
    ],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '₹20,000/month',
    features: [
      'All Premium Features',
      'Multi-Society Management',
      'Custom Integrations',
      'Priority Support',
      'White-label Options',
    ],
  },
];

/**
 * Society Registration Form - Public form for society admins to request onboarding
 * 
 * Multi-step process:
 * 1. Society basic information
 * 2. Contact details
 * 3. Subscription plan selection
 * 4. Terms and confirmation
 */
function SocietyRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<SocietyOnboardingRequest>({
    societyName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    totalUnits: '',
    description: '',
    contactName: '',
    contactRole: '',
    contactPhone: '',
    contactEmail: '',
    alternatePhone: '',
    subscriptionPlan: 'premium',
    features: [],
    agreesToTerms: false,
    agreesToPrivacy: false,
  });

  const updateFormData = (field: keyof SocietyOnboardingRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.societyName &&
          formData.address &&
          formData.city &&
          formData.state &&
          formData.zipCode &&
          formData.totalUnits
        );
      case 2:
        return !!(
          formData.contactName &&
          formData.contactRole &&
          formData.contactPhone &&
          formData.contactEmail
        );
      case 3:
        return !!formData.subscriptionPlan;
      case 4:
        return formData.agreesToTerms && formData.agreesToPrivacy;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    } else {
      Alert.alert('Incomplete Information', 'Please fill in all required fields before proceeding.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      Alert.alert('Incomplete Form', 'Please complete all steps and agree to the terms.');
      return;
    }

    setLoading(true);
    try {
      // Submit the registration request
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Registration Submitted!',
        'Your society registration request has been submitted successfully. You will receive an email confirmation shortly, and our team will review your application within 2-3 business days.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/register/status/success'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Submission Failed', 'There was an error submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center items-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <View key={step} className="flex-row items-center">
          <View
            className={cn(
              'w-8 h-8 rounded-full items-center justify-center',
              step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
            )}
          >
            {step < currentStep ? (
              <CheckCircle size={16} color="white" />
            ) : (
              <Text
                className={cn(
                  'text-sm font-semibold',
                  step <= currentStep ? 'text-white' : 'text-gray-600'
                )}
              >
                {step}
              </Text>
            )}
          </View>
          {step < 4 && (
            <View
              className={cn(
                'w-8 h-0.5 mx-2',
                step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
              )}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Society Information
      </Text>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Society Name *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          placeholder="Enter society name"
          value={formData.societyName}
          onChangeText={(text) => updateFormData('societyName', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Address *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          placeholder="Enter complete address"
          multiline
          numberOfLines={3}
          value={formData.address}
          onChangeText={(text) => updateFormData('address', text)}
        />
      </View>

      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            City *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => updateFormData('city', text)}
          />
        </View>
        
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            State *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            placeholder="State"
            value={formData.state}
            onChangeText={(text) => updateFormData('state', text)}
          />
        </View>
      </View>

      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            ZIP Code *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            placeholder="ZIP Code"
            keyboardType="numeric"
            value={formData.zipCode}
            onChangeText={(text) => updateFormData('zipCode', text)}
          />
        </View>
        
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Total Units *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            placeholder="Number of units"
            keyboardType="numeric"
            value={formData.totalUnits}
            onChangeText={(text) => updateFormData('totalUnits', text)}
          />
        </View>
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          placeholder="Brief description of your society"
          multiline
          numberOfLines={3}
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Primary Contact Information
      </Text>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Contact Person Name *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          placeholder="Full name"
          value={formData.contactName}
          onChangeText={(text) => updateFormData('contactName', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Role/Position *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          placeholder="e.g., Society Secretary, Chairman"
          value={formData.contactRole}
          onChangeText={(text) => updateFormData('contactRole', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          placeholder="+91-XXXXXXXXXX"
          keyboardType="phone-pad"
          value={formData.contactPhone}
          onChangeText={(text) => updateFormData('contactPhone', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.contactEmail}
          onChangeText={(text) => updateFormData('contactEmail', text)}
        />
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Alternate Phone (Optional)
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          placeholder="+91-XXXXXXXXXX"
          keyboardType="phone-pad"
          value={formData.alternatePhone}
          onChangeText={(text) => updateFormData('alternatePhone', text)}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Choose Your Plan
      </Text>
      
      <View className="space-y-3">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            onPress={() => updateFormData('subscriptionPlan', plan.id)}
          >
            <Card
              className={cn(
                'p-4 border-2',
                formData.subscriptionPlan === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200',
                plan.recommended && 'border-orange-300 bg-orange-50'
              )}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <View className="flex-row items-center">
                    <Text className="text-lg font-semibold text-gray-900">
                      {plan.name}
                    </Text>
                    {plan.recommended && (
                      <View className="bg-orange-500 px-2 py-1 rounded-full ml-2">
                        <Text className="text-white text-xs font-semibold">
                          RECOMMENDED
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-gray-600 mt-1">
                    {plan.price}
                  </Text>
                </View>
                
                <View
                  className={cn(
                    'w-5 h-5 rounded-full border-2 items-center justify-center',
                    formData.subscriptionPlan === plan.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  )}
                >
                  {formData.subscriptionPlan === plan.id && (
                    <CheckCircle size={12} color="white" />
                  )}
                </View>
              </View>
              
              <View className="space-y-1">
                {plan.features.map((feature, index) => (
                  <View key={index} className="flex-row items-center">
                    <CheckCircle size={14} color="#059669" />
                    <Text className="text-sm text-gray-700 ml-2">
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Terms & Confirmation
      </Text>
      
      <Card className="p-4 bg-gray-50">
        <Text className="text-sm font-medium text-gray-900 mb-2">
          Registration Summary
        </Text>
        <Text className="text-sm text-gray-600">
          Society: {formData.societyName}
        </Text>
        <Text className="text-sm text-gray-600">
          Contact: {formData.contactName} ({formData.contactRole})
        </Text>
        <Text className="text-sm text-gray-600">
          Plan: {SUBSCRIPTION_PLANS.find(p => p.id === formData.subscriptionPlan)?.name}
        </Text>
        <Text className="text-sm text-gray-600">
          Units: {formData.totalUnits}
        </Text>
      </Card>

      <View className="space-y-3">
        <TouchableOpacity
          onPress={() => updateFormData('agreesToTerms', !formData.agreesToTerms)}
          className="flex-row items-start"
        >
          <View
            className={cn(
              'w-5 h-5 rounded border-2 items-center justify-center mr-3 mt-0.5',
              formData.agreesToTerms
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300'
            )}
          >
            {formData.agreesToTerms && (
              <CheckCircle size={12} color="white" />
            )}
          </View>
          <Text className="text-sm text-gray-700 flex-1">
            I agree to the{' '}
            <Text className="text-blue-600 underline">Terms of Service</Text>
            {' '}and understand the subscription terms.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => updateFormData('agreesToPrivacy', !formData.agreesToPrivacy)}
          className="flex-row items-start"
        >
          <View
            className={cn(
              'w-5 h-5 rounded border-2 items-center justify-center mr-3 mt-0.5',
              formData.agreesToPrivacy
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300'
            )}
          >
            {formData.agreesToPrivacy && (
              <CheckCircle size={12} color="white" />
            )}
          </View>
          <Text className="text-sm text-gray-700 flex-1">
            I agree to the{' '}
            <Text className="text-blue-600 underline">Privacy Policy</Text>
            {' '}and consent to data processing.
          </Text>
        </TouchableOpacity>
      </View>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <Text className="text-sm text-blue-800">
          <Text className="font-semibold">What happens next?</Text>
          {'\n'}• You'll receive an email confirmation immediately
          {'\n'}• Our team will review your application within 2-3 business days
          {'\n'}• Upon approval, you'll get login credentials and onboarding support
          {'\n'}• A community manager will be assigned to help you get started
        </Text>
      </Card>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {currentStep > 1 && (
              <TouchableOpacity onPress={handlePrevious} className="mr-3 p-2 -ml-2">
                <ArrowLeft size={24} color="#374151" />
              </TouchableOpacity>
            )}
            <View>
              <Text className="text-xl font-bold text-gray-900">
                Society Registration
              </Text>
              <Text className="text-sm text-gray-600">
                Step {currentStep} of 4
              </Text>
            </View>
          </View>
          <Building2 size={32} color="#0284c7" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {renderStepIndicator()}
          
          <Card className="p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </Card>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row space-x-3">
          {currentStep > 1 && (
            <Button
              onPress={handlePrevious}
              variant="outline"
              className="flex-1"
            >
              Previous
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button
              onPress={handleNext}
              variant="primary"
              className="flex-1"
              disabled={!validateStep(currentStep)}
            >
              Next
              <ArrowRight size={16} color="white" className="ml-2" />
            </Button>
          ) : (
            <Button
              onPress={handleSubmit}
              variant="primary"
              className="flex-1"
              loading={loading}
              disabled={!validateStep(4)}
            >
              Submit Registration
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

// Add proper named export with displayName for React DevTools
SocietyRegistration.displayName = 'SocietyRegistration';

export default SocietyRegistration;