/**
 * Society Details Form - User details and profile form
 * 
 * Collects user information for society onboarding:
 * 1. Personal details
 * 2. Residence information  
 * 3. Emergency contacts
 * 4. Family members (optional)
 */
import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { Button } from '@/components/ui/Button';
import LucideIcons from '@/components/ui/LucideIcons';
import {
  ResponsiveContainer,
  ResponsiveText,
} from '@/components/ui/ResponsiveContainer';
import { useFormValidation } from '@/hooks/useFormValidation';
import { responsive } from '@/utils/responsive';
import { showErrorAlert, showSuccessAlert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { 
  useSocietyOnboardingStore,
  useSocietyOnboardingActions, 
  useSocietyOnboardingData,
  useSocietySelection
} from '@/stores/slices/societyOnboardingStore';

// Form validation schemas
const personalDetailsSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().optional(),
});

const residenceDetailsSchema = z.object({
  flatNumber: z.string()
    .min(1, 'Flat number is required')
    .max(10, 'Flat number is too long'),
  block: z.string().max(5, 'Block is too long').optional().or(z.literal('')),
  floor: z.string().max(5, 'Floor is too long').optional().or(z.literal('')),
  ownershipType: z.enum(['owner', 'tenant', 'family_member']),
  moveInDate: z.string().min(1, 'Move-in date is required'),
});

const emergencyContactSchema = z.object({
  name: z.string().min(2, 'Contact name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long'),
  email: z.string().email().optional().or(z.literal('')),
});

type PersonalDetailsForm = z.infer<typeof personalDetailsSchema>;
type ResidenceDetailsForm = z.infer<typeof residenceDetailsSchema>;
type EmergencyContactForm = z.infer<typeof emergencyContactSchema>;

export default function SocietyDetailsForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'personal' | 'residence' | 'emergency'>('personal');
  const [showAddContact, setShowAddContact] = useState(false);

  // Store hooks
  const { phoneNumber } = useSocietyOnboardingStore((state) => ({
    phoneNumber: state.userProfile.phoneNumber,
  }));
  const { 
    updateUserProfile, 
    updateResidenceDetails,
    addEmergencyContact,
    updateEmergencyContact,
    removeEmergencyContact,
    goToStep 
  } = useSocietyOnboardingActions();
  const { userProfile, residenceDetails, emergencyContacts } = useSocietyOnboardingData();

  // Check if phoneNumber is available, if not redirect back
  React.useEffect(() => {
    if (!phoneNumber) {
      router.replace('/auth/phone-registration');
    }
  }, [phoneNumber, router]);
  const { selectedSociety } = useSocietySelection();

  // Personal details form
  const personalForm = useFormValidation<PersonalDetailsForm>(
    personalDetailsSchema,
    {
      fullName: userProfile.fullName || '',
      email: userProfile.email || '',
      dateOfBirth: userProfile.dateOfBirth || '',
    },
    { validateOnChange: true, validateOnBlur: true, debounceMs: 300 }
  );

  // Residence details form
  const residenceForm = useFormValidation<ResidenceDetailsForm>(
    residenceDetailsSchema,
    {
      flatNumber: residenceDetails.flatNumber || '',
      block: residenceDetails.block || '',
      floor: residenceDetails.floor || '',
      ownershipType: residenceDetails.ownershipType || 'owner',
      moveInDate: residenceDetails.moveInDate || '',
    },
    { validateOnChange: true, validateOnBlur: true, debounceMs: 300 }
  );

  // Emergency contact form
  const contactForm = useFormValidation<EmergencyContactForm>(
    emergencyContactSchema,
    {
      name: '',
      relationship: '',
      phoneNumber: '',
      email: '',
    },
    { validateOnChange: true, validateOnBlur: true, debounceMs: 300 }
  );

  // Initialize phone number if available
  useEffect(() => {
    if (phoneNumber && !userProfile.phoneNumber) {
      updateUserProfile({ phoneNumber });
    }
  }, [phoneNumber, userProfile.phoneNumber, updateUserProfile]);

  const handlePersonalDetailsSubmit = (data: PersonalDetailsForm) => {
    updateUserProfile(data);
    setCurrentStep('residence');
  };

  const handleResidenceDetailsSubmit = (data: ResidenceDetailsForm) => {
    updateResidenceDetails(data);
    setCurrentStep('emergency');
  };

  const handleEmergencyContactSubmit = (data: EmergencyContactForm) => {
    addEmergencyContact({
      ...data,
      isPrimary: emergencyContacts.length === 0,
    });
    contactForm.reset();
    setShowAddContact(false);

    // Auto-advance if this is the first contact
    if (emergencyContacts.length === 0) {
      showSuccessAlert('Contact Added', 'Emergency contact has been added successfully');
    }
  };

  const handleContinueToReview = () => {
    if (emergencyContacts.length === 0) {
      showErrorAlert('Required', 'Please add at least one emergency contact');
      return;
    }

    // Navigate to completion/review
    router.push({
      pathname: '/auth/society-completion',
      params: { phoneNumber },
    });
  };

  const renderPersonalDetails = () => (
    <View>
      <Text className="text-text-primary font-semibold text-xl mb-6">
        Personal Information
      </Text>

      <ValidatedInput
        label="Full Name"
        {...personalForm.getFieldProps('fullName')}
        placeholder="Enter your full name"
        autoCapitalize="words"
        containerStyle={{ marginBottom: 16 }}
        required
      />

      <ValidatedInput
        label="Email Address"
        {...personalForm.getFieldProps('email')}
        placeholder="Enter your email (optional)"
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={{ marginBottom: 16 }}
      />

      <ValidatedInput
        label="Date of Birth"
        {...personalForm.getFieldProps('dateOfBirth')}
        placeholder="DD/MM/YYYY (optional)"
        containerStyle={{ marginBottom: 24 }}
      />

      <Button
        onPress={() => personalForm.handleSubmit(handlePersonalDetailsSubmit)}
        disabled={!personalForm.isValid}
        className="mb-4">
        Continue to Residence Details
      </Button>
    </View>
  );

  const renderResidenceDetails = () => (
    <View>
      <TouchableOpacity
        onPress={() => setCurrentStep('personal')}
        className="flex-row items-center mb-4">
        <LucideIcons name="arrow-left" size={20} color="#6366f1" />
        <Text className="text-primary font-medium ml-2">Back to Personal Details</Text>
      </TouchableOpacity>

      <Text className="text-text-primary font-semibold text-xl mb-2">
        Residence Information
      </Text>
      <Text className="text-text-secondary mb-6">
        Details about your residence in {selectedSociety?.name}
      </Text>

      <ValidatedInput
        label="Flat/Unit Number"
        {...residenceForm.getFieldProps('flatNumber')}
        placeholder="e.g., A-101, B-203, 1501"
        autoCapitalize="characters"
        containerStyle={{ marginBottom: 16 }}
        required
      />

      <View className="flex-row space-x-4 mb-4">
        <View className="flex-1">
          <ValidatedInput
            label="Block/Wing"
            {...residenceForm.getFieldProps('block')}
            placeholder="e.g., A, B, Tower 1"
            autoCapitalize="characters"
            containerStyle={{ marginBottom: 16 }}
          />
        </View>
        <View className="flex-1">
          <ValidatedInput
            label="Floor"
            {...residenceForm.getFieldProps('floor')}
            placeholder="e.g., 1, 15, G"
            containerStyle={{ marginBottom: 16 }}
          />
        </View>
      </View>

      {/* Ownership Type Selector */}
      <Text className="text-text-primary font-medium mb-3">Ownership Type</Text>
      <View className="flex-row mb-6">
        {[
          { value: 'owner', label: 'Owner' },
          { value: 'tenant', label: 'Tenant' },
          { value: 'family_member', label: 'Family Member' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => residenceForm.setValue('ownershipType', option.value as any)}
            className={`flex-1 mr-2 p-3 rounded-lg border ${
              residenceForm.fields.ownershipType.value === option.value
                ? 'bg-primary/10 border-primary'
                : 'bg-surface border-divider'
            }`}>
            <Text className={`text-center font-medium ${
              residenceForm.fields.ownershipType.value === option.value
                ? 'text-primary'
                : 'text-text-primary'
            }`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ValidatedInput
        label="Move-in Date"
        {...residenceForm.getFieldProps('moveInDate')}
        placeholder="DD/MM/YYYY"
        containerStyle={{ marginBottom: 24 }}
        required
      />

      <Button
        onPress={() => residenceForm.handleSubmit(handleResidenceDetailsSubmit)}
        disabled={!residenceForm.isValid}
        className="mb-4">
        Continue to Emergency Contacts
      </Button>
    </View>
  );

  const renderEmergencyContacts = () => (
    <View>
      <TouchableOpacity
        onPress={() => setCurrentStep('residence')}
        className="flex-row items-center mb-4">
        <LucideIcons name="arrow-left" size={20} color="#6366f1" />
        <Text className="text-primary font-medium ml-2">Back to Residence Details</Text>
      </TouchableOpacity>

      <Text className="text-text-primary font-semibold text-xl mb-2">
        Emergency Contacts
      </Text>
      <Text className="text-text-secondary mb-6">
        Add at least one emergency contact for safety purposes
      </Text>

      {/* Existing Contacts */}
      {emergencyContacts.map((contact, index) => (
        <View key={index} className="bg-surface border border-divider rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-text-primary font-semibold">{contact.name}</Text>
            <TouchableOpacity
              onPress={() => removeEmergencyContact(index)}
              className="p-2">
              <LucideIcons name="trash-2" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
          <Text className="text-text-secondary text-sm mb-1">
            {contact.relationship} • {contact.phoneNumber}
          </Text>
          {contact.email && (
            <Text className="text-text-secondary text-sm">{contact.email}</Text>
          )}
          {contact.isPrimary && (
            <View className="bg-primary/10 px-2 py-1 rounded mt-2 self-start">
              <Text className="text-primary text-xs font-medium">Primary Contact</Text>
            </View>
          )}
        </View>
      ))}

      {/* Add Contact Form */}
      {showAddContact && (
        <View className="bg-primary/5 rounded-xl p-4 mb-4">
          <Text className="text-text-primary font-semibold mb-4">Add Emergency Contact</Text>

          <ValidatedInput
            label="Contact Name"
            {...contactForm.getFieldProps('name')}
            placeholder="Enter contact's full name"
            autoCapitalize="words"
            containerStyle={{ marginBottom: 16 }}
            required
          />

          <ValidatedInput
            label="Relationship"
            {...contactForm.getFieldProps('relationship')}
            placeholder="e.g., Spouse, Parent, Sibling"
            autoCapitalize="words"
            containerStyle={{ marginBottom: 16 }}
            required
          />

          <ValidatedInput
            label="Phone Number"
            {...contactForm.getFieldProps('phoneNumber')}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            containerStyle={{ marginBottom: 16 }}
            required
          />

          <ValidatedInput
            label="Email Address"
            {...contactForm.getFieldProps('email')}
            placeholder="Enter email (optional)"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={{ marginBottom: 16 }}
          />

          <View className="flex-row space-x-3">
            <Button
              variant="secondary"
              onPress={() => setShowAddContact(false)}
              className="flex-1">
              Cancel
            </Button>
            <Button
              onPress={() => contactForm.handleSubmit(handleEmergencyContactSubmit)}
              disabled={!contactForm.isValid}
              className="flex-1">
              Add Contact
            </Button>
          </View>
        </View>
      )}

      {/* Add Contact Button */}
      {!showAddContact && (
        <TouchableOpacity
          onPress={() => setShowAddContact(true)}
          className="bg-surface border border-dashed border-primary rounded-xl p-4 mb-6 items-center">
          <LucideIcons name="plus" size={24} color="#6366f1" />
          <Text className="text-primary font-medium mt-2">Add Emergency Contact</Text>
        </TouchableOpacity>
      )}

      {/* Continue Button */}
      <Button
        onPress={handleContinueToReview}
        disabled={emergencyContacts.length === 0}
        className="mb-4">
        Continue to Review
      </Button>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Header */}
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <LucideIcons name="arrow-left" size={24} color="#212121" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary">
            Complete Your Profile
          </Text>
        </View>

        {/* Progress Indicator */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center">
            {['personal', 'residence', 'emergency'].map((step, index) => (
              <React.Fragment key={step}>
                <View className={`w-8 h-8 rounded-full items-center justify-center ${
                  currentStep === step 
                    ? 'bg-primary' 
                    : ['personal', 'residence', 'emergency'].indexOf(currentStep) > index
                      ? 'bg-primary/20'
                      : 'bg-gray-200'
                }`}>
                  <Text className={`text-sm font-bold ${
                    currentStep === step ? 'text-white' : 'text-gray-500'
                  }`}>
                    {index + 1}
                  </Text>
                </View>
                {index < 2 && (
                  <View className={`flex-1 h-1 mx-2 ${
                    ['personal', 'residence', 'emergency'].indexOf(currentStep) > index
                      ? 'bg-primary/20'
                      : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          {currentStep === 'personal' && renderPersonalDetails()}
          {currentStep === 'residence' && renderResidenceDetails()}
          {currentStep === 'emergency' && renderEmergencyContacts()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}