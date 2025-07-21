import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Car, Bike, Truck, Palette, Hash, MapPin, Star } from 'lucide-react-native';
import { Button } from './Button';
import { Card } from './Card';
import { VehicleFormData, ValidationResult } from '../../types/storage';
import { VehicleStorage } from '../../utils/storage';
import { validateRequired, validateForm } from '../../utils/validation';
import { showAlert, showErrorAlert } from '../../utils/alert';

interface VehicleFormProps {
  initialData?: Partial<VehicleFormData>;
  isEditing?: boolean;
  editingId?: string;
  onSubmit?: (vehicle: VehicleFormData) => void;
  onCancel?: () => void;
}

const VEHICLE_TYPES = [
  { key: 'car', label: 'Car', icon: <Car size={24} color="#6366f1" /> },
  { key: 'bike', label: 'Bike/Scooter', icon: <Bike size={24} color="#6366f1" /> },
  { key: 'bicycle', label: 'Bicycle', icon: <Bike size={24} color="#6366f1" /> },
  { key: 'other', label: 'Other', icon: <Truck size={24} color="#6366f1" /> }
] as const;

const VEHICLE_COLORS = [
  'White', 'Black', 'Silver', 'Red', 'Blue', 'Grey', 'Brown', 'Green', 'Yellow', 'Orange'
];

const POPULAR_MAKES = {
  car: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota', 'Honda', 'Ford', 'Volkswagen', 'Other'],
  bike: ['Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'KTM', 'Suzuki', 'Other'],
  bicycle: ['Hero', 'Atlas', 'BSA', 'Avon', 'Firefox', 'Trek', 'Giant', 'Other'],
  other: ['Mahindra', 'Tata', 'Ashok Leyland', 'Force', 'Other']
};

export default function VehicleForm({ 
  initialData, 
  isEditing = false, 
  editingId,
  onSubmit, 
  onCancel 
}: VehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    type: initialData?.type || 'car',
    make: initialData?.make || '',
    model: initialData?.model || '',
    registrationNumber: initialData?.registrationNumber || '',
    color: initialData?.color || '',
    parkingSlot: initialData?.parkingSlot || '',
    isPrimary: initialData?.isPrimary || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMakeOptions, setShowMakeOptions] = useState(false);
  const [showColorOptions, setShowColorOptions] = useState(false);

  const validateRegistrationNumber = (regNumber: string): ValidationResult => {
    if (!regNumber.trim()) {
      return { isValid: false, error: 'Registration number is required' };
    }

    // Indian vehicle registration number pattern
    // Format: XX-00-XX-0000 or XX00XX0000
    const indianRegPattern = /^[A-Z]{2}[-]?[0-9]{1,2}[-]?[A-Z]{1,2}[-]?[0-9]{4}$/;
    const cleanRegNumber = regNumber.replace(/[\s\-]/g, '').toUpperCase();

    if (cleanRegNumber.length < 8 || cleanRegNumber.length > 10) {
      return { isValid: false, error: 'Invalid registration number format' };
    }

    if (!indianRegPattern.test(regNumber.toUpperCase())) {
      return { isValid: false, error: 'Please enter a valid Indian registration number (e.g., DL-01-AB-1234)' };
    }

    return { isValid: true };
  };

  const validateParkingSlot = (slot: string): ValidationResult => {
    if (!slot.trim()) {
      return { isValid: true }; // Optional field
    }

    if (slot.length > 10) {
      return { isValid: false, error: 'Parking slot must be less than 10 characters' };
    }

    return { isValid: true };
  };

  const handleInputChange = (field: keyof VehicleFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    const validators = {
      type: (value: string) => validateRequired(value, 'Vehicle type'),
      make: (value: string) => validateRequired(value, 'Vehicle make'),
      model: (value: string) => validateRequired(value, 'Vehicle model'),
      registrationNumber: validateRegistrationNumber,
      color: (value: string) => validateRequired(value, 'Vehicle color'),
      parkingSlot: validateParkingSlot
    };

    const validationResult = validateForm(formData, validators);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && editingId) {
        await VehicleStorage.updateVehicle(editingId, formData);
        showAlert('Success', 'Vehicle updated successfully');
      } else {
        await VehicleStorage.saveVehicle(formData);
        showAlert('Success', 'Vehicle added successfully');
      }

      if (onSubmit) {
        onSubmit(formData);
      }

      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          type: 'car',
          make: '',
          model: '',
          registrationNumber: '',
          color: '',
          parkingSlot: '',
          isPrimary: false
        });
      }

    } catch (error) {
      console.error('Error saving vehicle:', error);
      showErrorAlert('Error', 'Failed to save vehicle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatRegistrationNumber = (text: string) => {
    // Auto-format registration number as user types
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4);
    }
    if (cleaned.length > 6) {
      formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 10);
    }

    return formatted;
  };

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Card className="space-y-6">
        {/* Vehicle Type Selection */}
        <View>
          <Text className="text-text-primary font-semibold mb-3">Vehicle Type</Text>
          <View className="flex-row flex-wrap gap-3">
            {VEHICLE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                onPress={() => {
                  handleInputChange('type', type.key);
                  setFormData(prev => ({ ...prev, make: '' })); // Reset make when type changes
                }}
                className={`flex-1 min-w-[140px] flex-row items-center justify-center p-4 rounded-xl border ${
                  formData.type === type.key
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background border-divider'
                }`}
              >
                <View className="mr-2">{type.icon}</View>
                <Text
                  className={`font-medium ${
                    formData.type === type.key ? 'text-primary' : 'text-text-secondary'
                  }`}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.type && <Text className="text-error text-sm mt-2">{errors.type}</Text>}
        </View>

        {/* Vehicle Make */}
        <View>
          <Text className="text-text-primary font-semibold mb-3">Vehicle Make</Text>
          <TouchableOpacity
            onPress={() => setShowMakeOptions(!showMakeOptions)}
            className="bg-surface border border-divider rounded-xl px-4 py-4 flex-row items-center justify-between"
          >
            <Text className={formData.make ? 'text-text-primary' : 'text-text-secondary'}>
              {formData.make || 'Select vehicle make'}
            </Text>
            <Car size={20} color="#757575" />
          </TouchableOpacity>
          
          {showMakeOptions && (
            <View className="mt-2 bg-surface border border-divider rounded-xl overflow-hidden">
              {POPULAR_MAKES[formData.type].map((make) => (
                <TouchableOpacity
                  key={make}
                  onPress={() => {
                    if (make === 'Other') {
                      setShowMakeOptions(false);
                      // In real implementation, show text input for custom make
                      handleInputChange('make', 'Other');
                    } else {
                      handleInputChange('make', make);
                      setShowMakeOptions(false);
                    }
                  }}
                  className="px-4 py-3 border-b border-divider last:border-b-0"
                >
                  <Text className="text-text-primary">{make}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.make && <Text className="text-error text-sm mt-2">{errors.make}</Text>}
        </View>

        {/* Custom make input if "Other" is selected */}
        {formData.make === 'Other' && (
          <View>
            <Text className="text-text-primary font-semibold mb-3">Custom Vehicle Make</Text>
            <View className="bg-surface border border-divider rounded-xl px-4 py-4 flex-row items-center">
              <Car size={20} color="#757575" className="mr-3" />
              <TextInput
                className="flex-1 text-text-primary"
                placeholder="Enter vehicle make"
                placeholderTextColor="#757575"
                value={formData.make === 'Other' ? '' : formData.make}
                onChangeText={(text) => handleInputChange('make', text)}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        {/* Vehicle Model */}
        <View>
          <Text className="text-text-primary font-semibold mb-3">Vehicle Model</Text>
          <View className="bg-surface border border-divider rounded-xl px-4 py-4 flex-row items-center">
            <Car size={20} color="#757575" className="mr-3" />
            <TextInput
              className="flex-1 text-text-primary"
              placeholder="e.g., Swift, Activa, etc."
              placeholderTextColor="#757575"
              value={formData.model}
              onChangeText={(text) => handleInputChange('model', text)}
              autoCapitalize="words"
            />
          </View>
          {errors.model && <Text className="text-error text-sm mt-2">{errors.model}</Text>}
        </View>

        {/* Registration Number */}
        <View>
          <Text className="text-text-primary font-semibold mb-3">Registration Number</Text>
          <View className="bg-surface border border-divider rounded-xl px-4 py-4 flex-row items-center">
            <Hash size={20} color="#757575" className="mr-3" />
            <TextInput
              className="flex-1 text-text-primary font-mono"
              placeholder="e.g., DL-01-AB-1234"
              placeholderTextColor="#757575"
              value={formData.registrationNumber}
              onChangeText={(text) => {
                const formatted = formatRegistrationNumber(text);
                handleInputChange('registrationNumber', formatted);
              }}
              autoCapitalize="characters"
              maxLength={13}
            />
          </View>
          {errors.registrationNumber && (
            <Text className="text-error text-sm mt-2">{errors.registrationNumber}</Text>
          )}
        </View>

        {/* Vehicle Color */}
        <View>
          <Text className="text-text-primary font-semibold mb-3">Vehicle Color</Text>
          <TouchableOpacity
            onPress={() => setShowColorOptions(!showColorOptions)}
            className="bg-surface border border-divider rounded-xl px-4 py-4 flex-row items-center justify-between"
          >
            <Text className={formData.color ? 'text-text-primary' : 'text-text-secondary'}>
              {formData.color || 'Select vehicle color'}
            </Text>
            <Palette size={20} color="#757575" />
          </TouchableOpacity>
          
          {showColorOptions && (
            <View className="mt-2 bg-surface border border-divider rounded-xl overflow-hidden">
              <View className="flex-row flex-wrap">
                {VEHICLE_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      handleInputChange('color', color);
                      setShowColorOptions(false);
                    }}
                    className="w-1/2 px-4 py-3 border-r border-b border-divider"
                  >
                    <Text className="text-text-primary">{color}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {errors.color && <Text className="text-error text-sm mt-2">{errors.color}</Text>}
        </View>

        {/* Parking Slot (Optional) */}
        <View>
          <Text className="text-text-primary font-semibold mb-3">
            Parking Slot <Text className="text-text-secondary text-sm">(Optional)</Text>
          </Text>
          <View className="bg-surface border border-divider rounded-xl px-4 py-4 flex-row items-center">
            <MapPin size={20} color="#757575" className="mr-3" />
            <TextInput
              className="flex-1 text-text-primary"
              placeholder="e.g., A-15, B-23"
              placeholderTextColor="#757575"
              value={formData.parkingSlot}
              onChangeText={(text) => handleInputChange('parkingSlot', text)}
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>
          {errors.parkingSlot && <Text className="text-error text-sm mt-2">{errors.parkingSlot}</Text>}
        </View>

        {/* Primary Vehicle Toggle */}
        <View className="bg-background rounded-xl p-4 border border-divider">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center mb-2">
                <Star size={20} color="#FF9800" />
                <Text className="text-text-primary font-semibold ml-2">Set as Primary Vehicle</Text>
              </View>
              <Text className="text-text-secondary text-sm">
                Primary vehicle will be used for visitor entry and quick actions
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleInputChange('isPrimary', !formData.isPrimary)}
              className={`w-12 h-6 rounded-full p-1 ${
                formData.isPrimary ? 'bg-primary' : 'bg-divider'
              }`}
            >
              <View
                className={`w-4 h-4 rounded-full bg-white transition-all ${
                  formData.isPrimary ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4">
          {onCancel && (
            <Button
              variant="outline"
              className="flex-1"
              onPress={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            className="flex-1"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}