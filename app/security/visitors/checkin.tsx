import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import ImagePicker from '@/components/ui/ImagePicker';
import { Input } from '@/components/ui/Input';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import type { VisitorCheckInFormData } from '@/types/security';
import { router } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Car,
  CheckCircle,
  UserCheck,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';

/**
 * Visitor Check-in Interface - Phase 2
 *
 * Features:
 * - Comprehensive visitor information collection
 * - ID verification and photo capture
 * - Vehicle registration
 * - Host verification
 * - Emergency contact information
 * - Real-time form validation
 */
const VisitorCheckIn = () => {
  const { user } = useDirectAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<VisitorCheckInFormData>({
    name: '',
    phoneNumber: '',
    purpose: '',
    hostFlatNumber: '',
    expectedDuration: 2,
    idType: 'license',
    idNumber: '',
    vehicleDetails: {
      type: 'none',
      number: '',
      make: '',
      model: '',
      color: '',
    },
    photo: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    specialInstructions: '',
  });

  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);

  const handleInputChange = (
    field: keyof VisitorCheckInFormData,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVehicleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      vehicleDetails: {
        ...prev.vehicleDetails!,
        [field]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Visitor name is required');
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Phone number is required');
      return false;
    }

    if (!formData.hostFlatNumber.trim()) {
      Alert.alert('Validation Error', 'Host flat number is required');
      return false;
    }

    if (!formData.purpose.trim()) {
      Alert.alert('Validation Error', 'Visit purpose is required');
      return false;
    }

    if (formData.expectedDuration <= 0) {
      Alert.alert(
        'Validation Error',
        'Expected duration must be greater than 0',
      );
      return false;
    }

    // Validate vehicle info if provided
    if (showVehicleForm && formData.vehicleDetails?.type !== 'none') {
      if (!formData.vehicleDetails?.number?.trim()) {
        Alert.alert('Validation Error', 'Vehicle number is required');
        return false;
      }
    }

    return true;
  };

  const handleCheckIn = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Mock API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success feedback
      Alert.alert(
        'Check-in Successful',
        `${formData.name} has been checked in successfully.`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                phoneNumber: '',
                purpose: '',
                hostFlatNumber: '',
                expectedDuration: 2,
                idType: 'license',
                idNumber: '',
                vehicleDetails: {
                  type: 'none',
                  number: '',
                  make: '',
                  model: '',
                  color: '',
                },
                photo: '',
                emergencyContactName: '',
                emergencyContactPhone: '',
                specialInstructions: '',
              });
              setShowVehicleForm(false);
              setShowEmergencyContact(false);
            },
          },
          {
            text: 'View Visitors',
            onPress: () => router.push('/security/visitors'),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to check in visitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              className="mr-2 p-2">
              <ArrowLeft size={20} color="#6b7280" />
            </Button>
            <UserCheck size={24} color="#6366f1" />
            <Text className="text-2xl font-bold text-gray-900 ml-2">
              Check-in Visitor
            </Text>
          </View>
          <Text className="text-gray-600">
            Complete visitor information and security verification
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled">
          {/* Basic Information */}
          <Card className="p-4 mb-4 bg-white">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </Text>

            <Input
              label="Visitor Name *"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter visitor's full name"
              className="mb-4"
            />

            <Input
              label="Phone Number *"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              placeholder="+91-XXXXXXXXXX"
              keyboardType="phone-pad"
              className="mb-4"
            />

            <Input
              label="Host Flat Number *"
              value={formData.hostFlatNumber}
              onChangeText={(value) =>
                handleInputChange('hostFlatNumber', value)
              }
              placeholder="e.g., A-204, B-101"
              className="mb-4"
            />

            <Input
              label="Purpose of Visit *"
              value={formData.purpose}
              onChangeText={(value) => handleInputChange('purpose', value)}
              placeholder="Meeting, delivery, social visit, etc."
              className="mb-4"
            />

            <Input
              label="Expected Duration (hours) *"
              value={formData.expectedDuration.toString()}
              onChangeText={(value) =>
                handleInputChange('expectedDuration', parseInt(value) || 1)
              }
              placeholder="2"
              keyboardType="numeric"
            />
          </Card>

          {/* ID Verification */}
          <Card className="p-4 mb-4 bg-white">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              ID Verification
            </Text>

            <Text className="text-sm text-gray-600 mb-2">ID Type</Text>
            <View className="flex-row flex-wrap mb-4">
              {[
                { key: 'license', label: 'Driving License' },
                { key: 'passport', label: 'Passport' },
                { key: 'national_id', label: 'Aadhaar Card' },
                { key: 'other', label: 'Other' },
              ].map((type) => (
                <Button
                  key={type.key}
                  variant={formData.idType === type.key ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => handleInputChange('idType', type.key)}
                  className="mr-2 mb-2">
                  {type.label}
                </Button>
              ))}
            </View>

            <Input
              label="ID Number"
              value={formData.idNumber}
              onChangeText={(value) => handleInputChange('idNumber', value)}
              placeholder="Enter ID number"
              className="mb-4"
            />

            <Text className="text-sm text-gray-600 mb-2">Visitor Photo</Text>
            <ImagePicker
              value={formData.photo}
              onChange={(value) => handleInputChange('photo', value)}
              placeholder="Take or upload visitor photo"
              icon={<Camera size={20} color="#6b7280" />}
            />
          </Card>

          {/* Vehicle Information */}
          <Card className="p-4 mb-4 bg-white">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Vehicle Information
              </Text>
              <Switch
                value={showVehicleForm}
                onValueChange={setShowVehicleForm}
              />
            </View>

            {showVehicleForm && (
              <View>
                <Text className="text-sm text-gray-600 mb-2">Vehicle Type</Text>
                <View className="flex-row flex-wrap mb-4">
                  {[
                    {
                      key: 'car',
                      label: 'Car',
                      icon: <Car size={16} color="#6b7280" />,
                    },
                    { key: 'bike', label: 'Bike' },
                    { key: 'bicycle', label: 'Bicycle' },
                  ].map((type) => (
                    <Button
                      key={type.key}
                      variant={
                        formData.vehicleDetails?.type === type.key
                          ? 'primary'
                          : 'outline'
                      }
                      size="sm"
                      onPress={() => handleVehicleChange('type', type.key)}
                      className="mr-2 mb-2">
                      <View className="flex-row items-center">
                        {type.icon}
                        <Text
                          className={`ml-1 ${formData.vehicleDetails?.type === type.key ? 'text-white' : 'text-gray-700'}`}>
                          {type.label}
                        </Text>
                      </View>
                    </Button>
                  ))}
                </View>

                {formData.vehicleDetails?.type !== 'none' && (
                  <View>
                    <Input
                      label="Vehicle Number *"
                      value={formData.vehicleDetails?.number || ''}
                      onChangeText={(value) =>
                        handleVehicleChange('number', value)
                      }
                      placeholder="KA-01-AB-1234"
                      className="mb-4"
                    />

                    <View className="flex-row mb-4">
                      <Input
                        label="Make"
                        value={formData.vehicleDetails?.make || ''}
                        onChangeText={(value) =>
                          handleVehicleChange('make', value)
                        }
                        placeholder="Honda"
                        className="flex-1 mr-2"
                      />
                      <Input
                        label="Model"
                        value={formData.vehicleDetails?.model || ''}
                        onChangeText={(value) =>
                          handleVehicleChange('model', value)
                        }
                        placeholder="City"
                        className="flex-1 ml-2"
                      />
                    </View>

                    <Input
                      label="Color"
                      value={formData.vehicleDetails?.color || ''}
                      onChangeText={(value) =>
                        handleVehicleChange('color', value)
                      }
                      placeholder="White"
                    />
                  </View>
                )}
              </View>
            )}
          </Card>

          {/* Emergency Contact */}
          <Card className="p-4 mb-4 bg-white">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Emergency Contact
              </Text>
              <Switch
                value={showEmergencyContact}
                onValueChange={setShowEmergencyContact}
              />
            </View>

            {showEmergencyContact && (
              <View>
                <Input
                  label="Contact Name"
                  value={formData.emergencyContactName || ''}
                  onChangeText={(value) =>
                    handleInputChange('emergencyContactName', value)
                  }
                  placeholder="Contact person name"
                  className="mb-4"
                />

                <Input
                  label="Contact Phone"
                  value={formData.emergencyContactPhone || ''}
                  onChangeText={(value) =>
                    handleInputChange('emergencyContactPhone', value)
                  }
                  placeholder="+91-XXXXXXXXXX"
                  keyboardType="phone-pad"
                />
              </View>
            )}
          </Card>

          {/* Special Instructions */}
          <Card className="p-4 mb-6 bg-white">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Special Instructions
            </Text>

            <Input
              label="Notes (Optional)"
              value={formData.specialInstructions || ''}
              onChangeText={(value) =>
                handleInputChange('specialInstructions', value)
              }
              placeholder="Any special instructions or notes..."
              multiline
              numberOfLines={3}
            />
          </Card>

          {/* Check-in Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleCheckIn}>
            <View className="flex-row items-center">
              <CheckCircle size={20} color="#ffffff" />
              <Text className="text-white font-semibold ml-2">
                Check-in Visitor
              </Text>
            </View>
          </Button>

          {/* Security Info */}
          <Card className="p-4 mt-4 bg-blue-50 border border-blue-200">
            <View className="flex-row items-start">
              <AlertTriangle size={16} color="#2563eb" />
              <View className="flex-1 ml-2">
                <Text className="text-blue-900 font-medium mb-1">
                  Security Verification
                </Text>
                <Text className="text-blue-700 text-sm">
                  All visitor information will be verified and logged. ID
                  verification is mandatory for security purposes. Checked in
                  by: {user?.fullName || 'Security Guard'}
                </Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

VisitorCheckIn.displayName = 'VisitorCheckIn';

export default VisitorCheckIn;
