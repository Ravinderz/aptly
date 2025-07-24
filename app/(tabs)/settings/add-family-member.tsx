import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { User, Calendar } from 'lucide-react-native';
import { showSuccessAlert, showErrorAlert } from '@/utils/alert';
import { validateName, validateIndianPhoneNumber, validateAadharNumber } from '@/utils/validation';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import StackHeader from '@/components/ui/headers/StackHeader';

interface FamilyMemberForm {
  name: string;
  relationship: string;
  age: string;
  phoneNumber: string;
  occupation: string;
  aadharNumber: string;
}

const relationships = [
  'Wife', 'Husband', 'Son', 'Daughter', 
  'Father', 'Mother', 'Brother', 'Sister', 
  'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 
  'Cousin', 'Other'
];

const commonOccupations = [
  'Student', 'Teacher', 'Doctor', 'Engineer', 'Business', 
  'Government Service', 'Private Job', 'Homemaker', 
  'Retired', 'Self Employed', 'Other'
];

export default function AddFamilyMemberPage() {
  const [form, setForm] = useState<FamilyMemberForm>({
    name: '',
    relationship: '',
    age: '',
    phoneNumber: '',
    occupation: '',
    aadharNumber: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    const nameValidation = validateName(form.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error || 'Invalid name';
    }

    // Relationship validation
    if (!form.relationship) {
      newErrors.relationship = 'Please select a relationship';
    }

    // Age validation
    const age = parseInt(form.age);
    if (!form.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || age < 0 || age > 120) {
      newErrors.age = 'Please enter a valid age (0-120)';
    }

    // Phone number validation (optional)
    if (form.phoneNumber.trim() && !validateIndianPhoneNumber(form.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Indian mobile number';
    }

    // Aadhar validation (optional)
    if (form.aadharNumber.trim()) {
      const aadharValidation = validateAadharNumber(form.aadharNumber);
      if (!aadharValidation.isValid) {
        newErrors.aadharNumber = aadharValidation.error || 'Invalid Aadhar number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      
      // In a real app, this would save via API/database
      const newMember = {
        id: Date.now().toString(),
        name: form.name.trim(),
        relationship: form.relationship,
        age: parseInt(form.age),
        phoneNumber: form.phoneNumber.trim() || undefined,
        occupation: form.occupation.trim() || undefined,
        aadharNumber: form.aadharNumber.trim() || undefined,
      };
      
      console.log('Adding family member:', newMember);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccessAlert('Member Added', 'Family member has been added successfully');
      router.back();
    } catch (error) {
      showErrorAlert('Error', 'Failed to add family member. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateForm = (field: keyof FamilyMemberForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
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
    keyboardType: 'default' | 'phone-pad' | 'numeric' = 'default',
    required = false,
    multiline = false
  ) => (
    <View className="mb-4">
      <Text className="text-body-medium font-medium text-text-primary mb-2">
        {label} {required && <Text className="text-error">*</Text>}
      </Text>
      <TextInput
        className={`bg-background rounded-lg p-3 text-text-primary border ${
          error ? 'border-error' : 'border-divider'
        } ${multiline ? 'min-h-[80px]' : ''}`}
        placeholder={placeholder}
        placeholderTextColor="#757575"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={!isSaving}
      />
      {error && (
        <Text className="text-error text-body-small mt-1">
          {error}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StackHeader
        title="Add Family Member"
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
          {/* Basic Information */}
          <Card className="mb-4">
            <View className="p-4">
              <Text className="text-headline-small font-semibold text-text-primary mb-4">
                Basic Information
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
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
                </ScrollView>
                {errors.relationship && (
                  <Text className="text-error text-body-small mt-1">
                    {errors.relationship}
                  </Text>
                )}
              </View>

              {renderFormField(
                'Age',
                form.age,
                (text) => updateForm('age', text.replace(/[^0-9]/g, '')),
                'Enter age',
                errors.age,
                'numeric',
                true
              )}
            </View>
          </Card>

          {/* Contact Information */}
          <Card className="mb-4">
            <View className="p-4">
              <Text className="text-headline-small font-semibold text-text-primary mb-4">
                Contact Information
              </Text>

              {renderFormField(
                'Phone Number',
                form.phoneNumber,
                (text) => updateForm('phoneNumber', text.replace(/[^0-9+\-\s()]/g, '')),
                'Enter phone number (optional)',
                errors.phoneNumber,
                'phone-pad'
              )}
            </View>
          </Card>

          {/* Additional Information */}
          <Card className="mb-4">
            <View className="p-4">
              <Text className="text-headline-small font-semibold text-text-primary mb-4">
                Additional Information
              </Text>

              {/* Occupation Selection */}
              <View className="mb-4">
                <Text className="text-body-medium font-medium text-text-primary mb-2">
                  Occupation
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {commonOccupations.map((occupation) => (
                      <TouchableOpacity
                        key={occupation}
                        onPress={() => updateForm('occupation', occupation)}
                        className={`px-3 py-2 rounded-full border ${
                          form.occupation === occupation
                            ? 'border-primary bg-primary/10'
                            : 'border-divider bg-background'
                        }`}
                      >
                        <Text className={`text-body-small font-medium ${
                          form.occupation === occupation ? 'text-primary' : 'text-text-secondary'
                        }`}>
                          {occupation}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Custom occupation input */}
              {form.occupation === 'Other' && renderFormField(
                'Custom Occupation',
                form.occupation === 'Other' ? '' : form.occupation,
                (text) => updateForm('occupation', text),
                'Enter occupation',
                undefined,
                'default'
              )}

              {renderFormField(
                'Aadhar Number',
                form.aadharNumber,
                (text) => updateForm('aadharNumber', text.replace(/[^0-9\s]/g, '').slice(0, 14)),
                'Enter Aadhar number (optional)',
                errors.aadharNumber,
                'numeric'
              )}
            </View>
          </Card>

          {/* Action Buttons */}
          <View className="space-y-3">
            <Button
              variant="primary"
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Adding Member..." : "Add Family Member"}
            </Button>
            
            <Button
              variant="secondary"
              onPress={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </View>

          {/* Info Card */}
          <Card className="mt-6 bg-secondary/10 border-secondary/20">
            <Text className="text-secondary text-body-medium font-medium mb-2">
              👨‍👩‍👧‍👦 Adding Family Members
            </Text>
            <Text className="text-text-secondary text-body-small leading-5">
              • All family members will be associated with your flat{'\n'}
              • Phone numbers help with visitor pre-approval{'\n'}
              • Aadhar numbers are kept secure and private{'\n'}
              • You can update member details anytime
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}