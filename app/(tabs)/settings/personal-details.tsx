import { StandardHeader } from '@/components/design-system';
import { Save } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { showErrorAlert, showSuccessAlert } from '../../../utils/alert';

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
    <View
      className="flex-1 bg-background"
      testID="settings.personal-details.screen">
      <StandardHeader
        title="Personal Details"
        showBack
        rightAction={
          isEditing
            ? {
                icon: <Save size={20} color="#ffffff" />,
                onPress: handleSave,
                label: 'Save',
              }
            : {
                icon: <Text className="text-blue-600 font-medium">Edit</Text>,
                onPress: () => setIsEditing(true),
                label: 'Edit',
              }
        }
        testID="settings.personal-details.header">
        {isEditing && (
          <View
            className="flex-row justify-end mt-2"
            testID="settings.personal-details.cancel-section">
            <Button
              variant="outline"
              size="sm"
              onPress={handleCancel}
              testID="settings.personal-details.cancel-button">
              Cancel
            </Button>
          </View>
        )}
      </StandardHeader>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        testID="settings.personal-details.keyboard-avoiding-view">
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          testID="settings.personal-details.scroll">
          {/* Basic Information */}
          <Card
            className="mb-6"
            testID="settings.personal-details.basic-info-card">
            <Text
              className="text-text-primary text-lg font-semibold mb-4"
              testID="settings.personal-details.basic-info-title">
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
              testID="settings.personal-details.full-name-input"
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
              testID="settings.personal-details.email-input"
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
              testID="settings.personal-details.phone-input"
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
              testID="settings.personal-details.alternate-phone-input"
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
              testID="settings.personal-details.occupation-input"
            />
          </Card>

          {/* Identity Documents */}
          <Card
            className="mb-6"
            testID="settings.personal-details.identity-documents-card">
            <Text
              className="text-text-primary text-lg font-semibold mb-4"
              testID="settings.personal-details.identity-documents-title">
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
              testID="settings.personal-details.aadhar-input"
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
              testID="settings.personal-details.pan-input"
            />
          </Card>

          {/* Address Information */}
          <Card
            className="mb-6"
            testID="settings.personal-details.address-card">
            <Text
              className="text-text-primary text-lg font-semibold mb-4"
              testID="settings.personal-details.address-title">
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
              testID="settings.personal-details.address-input"
            />
          </Card>

          {/* Emergency Contact */}
          <Card
            className="mb-6"
            testID="settings.personal-details.emergency-contact-card">
            <Text
              className="text-text-primary text-lg font-semibold mb-4"
              testID="settings.personal-details.emergency-contact-title">
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
              testID="settings.personal-details.emergency-contact-name-input"
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
              testID="settings.personal-details.emergency-contact-phone-input"
            />
          </Card>

          {/* Note */}
          {!isEditing && (
            <View
              className="bg-primary/10 rounded-lg p-4"
              testID="settings.personal-details.note">
              <Text
                className="text-text-secondary text-sm text-center"
                testID="settings.personal-details.note-text">
                * Required fields. Tap "Edit" to modify your information.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
