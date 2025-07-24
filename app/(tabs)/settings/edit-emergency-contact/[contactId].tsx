import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LucideIcons from '@/components/ui/LucideIcons';
import { showSuccessAlert, showErrorAlert } from '@/utils/alert';
import { validateEmergencyContact } from '@/utils/validation';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import StackHeader from '@/components/ui/headers/StackHeader';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  alternatePhone?: string;
  address?: string;
  isPrimary: boolean;
}

// Mock data - in real app this would come from API/database
const mockContacts: Record<string, EmergencyContact> = {
  '1': {
    id: '1',
    name: 'Dr. Priya Kumar',
    relationship: 'Spouse',
    phoneNumber: '9876543211',
    alternatePhone: '8765432198',
    address: 'Same flat - A-301',
    isPrimary: true,
  },
  '2': {
    id: '2',
    name: 'Mr. Suresh Kumar',
    relationship: 'Father',
    phoneNumber: '9876543212',
    address: 'B-Block, Sector 15, Noida',
    isPrimary: false,
  }
};

const relationships = [
  'Spouse', 'Father', 'Mother', 'Son', 'Daughter', 
  'Brother', 'Sister', 'Friend', 'Doctor', 'Neighbor', 'Other'
];

export default function EditEmergencyContactPage() {
  const { contactId } = useLocalSearchParams<{ contactId: string }>();
  const [form, setForm] = useState<EmergencyContact | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load contact data
    if (contactId && mockContacts[contactId]) {
      setForm(mockContacts[contactId]);
    } else {
      showErrorAlert('Error', 'Contact not found');
      router.back();
    }
  }, [contactId]);

  const validateForm = (): boolean => {
    if (!form) return false;
    
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Relationship validation
    if (!form.relationship) {
      newErrors.relationship = 'Please select a relationship';
    }

    // Phone number validation
    const phoneValidation = validateEmergencyContact(form.phoneNumber);
    if (!phoneValidation.isValid) {
      newErrors.phoneNumber = phoneValidation.error || 'Invalid phone number';
    }

    // Alternate phone validation (if provided)
    if (form.alternatePhone && form.alternatePhone.trim()) {
      const altPhoneValidation = validateEmergencyContact(form.alternatePhone);
      if (!altPhoneValidation.isValid) {
        newErrors.alternatePhone = altPhoneValidation.error || 'Invalid alternate phone number';
      }
      if (form.alternatePhone === form.phoneNumber) {
        newErrors.alternatePhone = 'Alternate phone must be different from primary phone';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!form || !validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      
      // In a real app, this would update via API/database
      console.log('Updating emergency contact:', form);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccessAlert('Contact Updated', 'Emergency contact has been updated successfully');
      router.back();
    } catch (error) {
      showErrorAlert('Error', 'Failed to update emergency contact. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateForm = (field: keyof EmergencyContact, value: string | boolean) => {
    if (!form) return;
    
    setForm(prev => prev ? { ...prev, [field]: value } : null);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderFormField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    error?: string,
    keyboardType: 'default' | 'phone-pad' = 'default',
    required = false
  ) => (
    <View className="mb-4">
      <Text className="text-body-medium font-medium text-text-primary mb-2">
        {label} {required && <Text className="text-error">*</Text>}
      </Text>
      <TextInput
        className={`bg-background rounded-lg p-3 text-text-primary border ${
          error ? 'border-error' : 'border-divider'
        }`}
        placeholder={placeholder}
        placeholderTextColor="#757575"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={!isSaving}
      />
      {error && (
        <Text className="text-error text-body-small mt-1">
          {error}
        </Text>
      )}
    </View>
  );

  if (!form) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-headline-large text-text-secondary">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StackHeader
        title="Edit Emergency Contact"
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card className="mb-4">
            <View className="p-4">
              <Text className="text-headline-small font-semibold text-text-primary mb-4">
                Contact Information
              </Text>

              {renderFormField(
                'Full Name',
                form.name,
                (text) => updateForm('name', text),
                'Enter full name',
                errors.name,
                'default',
                true
              )}

              {/* Relationship Selection */}
              <View className="mb-4">
                <Text className="text-body-medium font-medium text-text-primary mb-2">
                  Relationship <Text className="text-error">*</Text>
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {relationships.map((relationship) => (
                    <TouchableOpacity
                      key={relationship}
                      onPress={() => updateForm('relationship', relationship)}
                      className={`px-3 py-2 rounded-full border ${
                        form.relationship === relationship
                          ? 'border-primary bg-primary/10'
                          : 'border-divider bg-background'
                      }`}
                    >
                      <Text className={`text-body-small font-medium ${
                        form.relationship === relationship ? 'text-primary' : 'text-text-secondary'
                      }`}>
                        {relationship}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.relationship && (
                  <Text className="text-error text-body-small mt-1">
                    {errors.relationship}
                  </Text>
                )}
              </View>

              {renderFormField(
                'Phone Number',
                form.phoneNumber,
                (text) => updateForm('phoneNumber', text.replace(/[^0-9]/g, '')),
                'Enter 10-digit mobile number',
                errors.phoneNumber,
                'phone-pad',
                true
              )}

              {renderFormField(
                'Alternate Phone',
                form.alternatePhone || '',
                (text) => updateForm('alternatePhone', text.replace(/[^0-9]/g, '')),
                'Enter alternate phone number (optional)',
                errors.alternatePhone,
                'phone-pad'
              )}

              {renderFormField(
                'Address',
                form.address || '',
                (text) => updateForm('address', text),
                'Enter address (optional)',
                errors.address
              )}
            </View>
          </Card>

          {/* Primary Contact Option */}
          <Card className="mb-4">
            <View className="p-4">
              <TouchableOpacity
                className="flex-row items-center justify-between"
                onPress={() => updateForm('isPrimary', !form.isPrimary)}
              >
                <View className="flex-1 mr-4">
                  <Text className="text-body-medium font-medium text-text-primary">
                    Set as Primary Contact
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Primary contact will be called first in emergencies
                  </Text>
                </View>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  form.isPrimary ? 'border-primary bg-primary' : 'border-divider'
                }`}>
                  {form.isPrimary && (
                    <LucideIcons name="checkmark" size={14} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Warning for Primary Contact */}
          {form.isPrimary && (
            <Card className="mb-4 bg-warning/5 border-warning/20">
              <View className="p-4">
                <View className="flex-row items-start">
                  <LucideIcons name="warning-outline" size={20} color="#FF9800" />
                  <View className="flex-1 ml-3">
                    <Text className="text-warning font-medium text-body-medium mb-1">
                      Primary Contact
                    </Text>
                    <Text className="text-text-secondary text-body-small leading-5">
                      This is currently your primary emergency contact. If you uncheck this, you'll need to set another contact as primary.
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Action Buttons */}
          <View className="space-y-3">
            <Button
              variant="primary"
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Updating Contact..." : "Update Emergency Contact"}
            </Button>
            
            <Button
              variant="secondary"
              onPress={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}