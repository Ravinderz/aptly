import React, { useState } from 'react';
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { router } from 'expo-router';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { showErrorAlert, showSuccessAlert } from '../../../utils/alert';
import { safeGoBack } from '../../../utils/navigation';

export default function PersonalDetails() {
  const [formData, setFormData] = useState({
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    alternatePhone: '+91 87654 32109',
    occupation: 'Software Engineer',
    aadharNumber: '1234 5678 9012',
    panNumber: 'ABCDE1234F',
    address: 'A-301, Green Valley Apartments, Sector 12, Noida',
    emergencyContact: 'Priya Kumar - Wife',
    emergencyPhone: '+91 98765 43211',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Validate and save the form data
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      showErrorAlert('Error', 'Please fill in all required fields');
      return;
    }

    // Here you would typically save to your backend/context
    console.log('Saving personal details:', formData);
    setIsEditing(false);
    showSuccessAlert('Success', 'Personal details updated successfully');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-divider bg-surface">
        <View className="flex-row items-center">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => safeGoBack()}
            className="mr-2 p-2">
            <ArrowLeft size={20} color="#6366f1" />
          </Button>
          <Text className="text-text-primary text-headline-large font-semibold">
            Personal Details
          </Text>
        </View>

        {isEditing ? (
          <View className="flex-row gap-2">
            <Button variant="outline" size="sm" onPress={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onPress={handleSave}>
              <Save size={16} color="white" />
            </Button>
          </View>
        ) : (
          <Button size="sm" onPress={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled">
          {/* Basic Information */}
          <Card className="mb-6">
            <Text className="text-text-primary text-lg font-semibold mb-4">
              Basic Information
            </Text>

            <Input
              label="Full Name *"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, fullName: text }))
              }
              editable={isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              className={!isEditing ? 'bg-background' : ''}
            />

            <Input
              label="Email Address *"
              value={formData.email}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, email: text }))
              }
              editable={isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              className={!isEditing ? 'bg-background' : ''}
              keyboardType="email-address"
              containerClassName="mt-4"
            />

            <Input
              label="Phone Number *"
              value={formData.phone}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, phone: text }))
              }
              editable={isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              className={!isEditing ? 'bg-background' : ''}
              keyboardType="phone-pad"
              containerClassName="mt-4"
            />

            <Input
              label="Alternate Phone"
              value={formData.alternatePhone}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, alternatePhone: text }))
              }
              editable={isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              className={!isEditing ? 'bg-background' : ''}
              keyboardType="phone-pad"
              containerClassName="mt-4"
            />

            <Input
              label="Occupation"
              value={formData.occupation}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, occupation: text }))
              }
              editable={isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              className={!isEditing ? 'bg-background' : ''}
              containerClassName="mt-4"
            />
          </Card>

          {/* Identity Documents */}
          <Card className="mb-6">
            <Text className="text-text-primary text-lg font-semibold mb-4">
              Identity Documents
            </Text>

            <Input
              label="Aadhar Number"
              value={formData.aadharNumber}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, aadharNumber: text }))
              }
              editable={isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              className={!isEditing ? 'bg-background' : ''}
              keyboardType="numeric"
              maxLength={14}
            />

            <Input
              label="PAN Number"
              value={formData.panNumber}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  panNumber: text.toUpperCase(),
                }))
              }
              editable={isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              className={!isEditing ? 'bg-background' : ''}
              maxLength={10}
              containerClassName="mt-4"
              autoCapitalize="characters"
            />
          </Card>

          {/* Address Information */}
          <Card className="mb-6">
            <Text className="text-text-primary text-lg font-semibold mb-4">
              Address Information
            </Text>

            <Input
              label="Complete Address"
              value={formData.address}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, address: text }))
              }
              editable={isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              className={!isEditing ? 'bg-background' : ''}
              multiline
              numberOfLines={3}
            />
          </Card>

          {/* Emergency Contact */}
          <Card className="mb-6">
            <Text className="text-text-primary text-lg font-semibold mb-4">
              Emergency Contact
            </Text>

            <Input
              label="Emergency Contact Name & Relationship"
              value={formData.emergencyContact}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, emergencyContact: text }))
              }
              editable={isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              className={!isEditing ? 'bg-background' : ''}
              placeholder="Name - Relationship"
            />

            <Input
              label="Emergency Contact Phone"
              value={formData.emergencyPhone}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, emergencyPhone: text }))
              }
              editable={isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              className={!isEditing ? 'bg-background' : ''}
              keyboardType="phone-pad"
              containerClassName="mt-4"
            />
          </Card>

          {/* Note */}
          {!isEditing && (
            <View className="bg-primary/10 rounded-lg p-4">
              <Text className="text-text-secondary text-sm text-center">
                * Required fields. Tap "Edit" to modify your information.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
