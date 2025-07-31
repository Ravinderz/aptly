import { showErrorAlert, showSuccessAlert } from '@/utils/alert';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Building,
  Camera,
  Car,
  Droplets,
  Mic,
  Shield,
  TreePine,
  Users,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Common area locations
const commonAreaLocations = [
  {
    id: 'building',
    title: '🏢 Building Areas',
    icon: <Building size={24} color="#6366f1" />,
    areas: [
      'Main Lobby',
      'Staircase',
      'Corridors',
      'Elevators',
      'Entrance Gates',
      'Mailbox Area',
    ],
  },
  {
    id: 'water-systems',
    title: '🌊 Water Systems',
    icon: <Droplets size={24} color="#6366f1" />,
    areas: [
      'Water Tank',
      'Pump Room',
      'Common Taps',
      'Overhead Tank',
      'Bore Well',
      'Water Meter',
    ],
  },
  {
    id: 'electrical',
    title: '⚡ Electrical Systems',
    icon: <Zap size={24} color="#6366f1" />,
    areas: [
      'Common Area Lighting',
      'Generator Room',
      'Electrical Panel',
      'Street Lights',
      'Emergency Lighting',
    ],
  },
  {
    id: 'parking',
    title: '🚗 Parking & Security',
    icon: <Car size={24} color="#6366f1" />,
    areas: [
      'Parking Area',
      'Security Gates',
      'Guard Room',
      'Barrier Gates',
      'Visitor Parking',
    ],
  },
  {
    id: 'garden',
    title: '🌱 Garden & Landscaping',
    icon: <TreePine size={24} color="#6366f1" />,
    areas: [
      'Garden',
      'Lawn Area',
      'Plant Beds',
      'Trees',
      'Irrigation System',
      'Pathways',
    ],
  },
  {
    id: 'amenities',
    title: '🏃 Amenities',
    icon: <Users size={24} color="#6366f1" />,
    areas: [
      'Gymnasium',
      'Swimming Pool',
      'Community Hall',
      'Children Play Area',
      'Clubhouse',
    ],
  },
  {
    id: 'security-systems',
    title: '🔐 Security Systems',
    icon: <Shield size={24} color="#6366f1" />,
    areas: [
      'CCTV Cameras',
      'Intercom System',
      'Access Control',
      'Security Alarm',
      'Fire Safety',
    ],
  },
];

// Issue categories
const issueCategories = [
  {
    id: 'plumbing',
    title: 'Plumbing',
    icon: '🔧',
    description: 'Leakage, Blockage, Pump Issues',
  },
  {
    id: 'electrical',
    title: 'Electrical',
    icon: '⚡',
    description: 'Lighting, Power, Wiring Issues',
  },
  {
    id: 'civil',
    title: 'Civil Works',
    icon: '🏗️',
    description: 'Cracks, Paint, Flooring',
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    icon: '🧹',
    description: 'Deep cleaning requirements',
  },
  {
    id: 'security',
    title: 'Security',
    icon: '🔐',
    description: 'Camera, Gate, Lock issues',
  },
  {
    id: 'landscaping',
    title: 'Landscaping',
    icon: '🌱',
    description: 'Garden, Tree, Plant care',
  },
  {
    id: 'other',
    title: 'Other',
    icon: '📝',
    description: 'General maintenance issues',
  },
];

// Priority levels
const priorityLevels = [
  {
    id: 'emergency',
    title: 'Emergency',
    color: 'bg-error text-white',
    description: 'Safety hazards, no water/power',
    icon: '🚨',
  },
  {
    id: 'high',
    title: 'High',
    color: 'bg-warning text-white',
    description: 'Major community impact',
    icon: '🔴',
  },
  {
    id: 'medium',
    title: 'Medium',
    color: 'bg-primary text-white',
    description: 'Moderate inconvenience',
    icon: '🟡',
  },
  {
    id: 'low',
    title: 'Low',
    color: 'bg-secondary text-white',
    description: 'Minor cosmetic issues',
    icon: '🟢',
  },
];

interface MediaFile {
  id: string;
  type: 'image' | 'audio';
  uri: string;
  name: string;
}

export default function CreateCommonAreaRequest() {
  const router = useRouter();

  // Form state
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('medium');
  const [description, setDescription] = useState<string>('');
  const [affectedResidents, setAffectedResidents] = useState<string>('');
  const [suggestedVendor, setSuggestedVendor] = useState<string>('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Get selected location details
  const selectedLocationData = commonAreaLocations.find(
    (loc) => loc.id === selectedLocation,
  );

  const validateForm = () => {
    if (!selectedLocation) {
      showErrorAlert('Error', 'Please select a location');
      return false;
    }
    if (!selectedArea) {
      showErrorAlert('Error', 'Please select a specific area');
      return false;
    }
    if (!selectedCategory) {
      showErrorAlert('Error', 'Please select an issue category');
      return false;
    }
    if (!description.trim()) {
      showErrorAlert('Error', 'Please describe the issue');
      return false;
    }
    return true;
  };

  const handleImagePicker = async () => {
    if (mediaFiles.filter((f) => f.type === 'image').length >= 5) {
      showErrorAlert('Limit Reached', 'Maximum 5 images allowed');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newFile: MediaFile = {
        id: Date.now().toString(),
        type: 'image',
        uri: result.assets[0].uri,
        name: `image_${Date.now()}.jpg`,
      };
      setMediaFiles([...mediaFiles, newFile]);
    }
  };

  const handleCamera = async () => {
    if (mediaFiles.filter((f) => f.type === 'image').length >= 5) {
      showErrorAlert('Limit Reached', 'Maximum 5 images allowed');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newFile: MediaFile = {
        id: Date.now().toString(),
        type: 'image',
        uri: result.assets[0].uri,
        name: `photo_${Date.now()}.jpg`,
      };
      setMediaFiles([...mediaFiles, newFile]);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        showErrorAlert(
          'Permission Required',
          'Audio recording permission is required',
        );
        return;
      }

      if (mediaFiles.filter((f) => f.type === 'audio').length >= 2) {
        showErrorAlert('Limit Reached', 'Maximum 2 voice notes allowed');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      showErrorAlert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      const newFile: MediaFile = {
        id: Date.now().toString(),
        type: 'audio',
        uri,
        name: `voice_note_${Date.now()}.m4a`,
      };
      setMediaFiles([...mediaFiles, newFile]);
    }
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles(mediaFiles.filter((file) => file.id !== id));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // In production, this would upload files to Supabase Storage and create the request
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const _requestData = {
        location: selectedLocation,
        area: selectedArea,
        category: selectedCategory,
        priority: selectedPriority,
        description,
        affectedResidents: parseInt(affectedResidents) || 0,
        suggestedVendor,
        mediaFiles: mediaFiles.length,
        submittedBy: 'Current User', // Would come from auth context
        flatNumber: 'A-301', // Would come from auth context
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };

      showSuccessAlert(
        'Request Submitted!',
        'Your common area maintenance request has been submitted to the society committee for review.',
        () =>
          router.replace(`/services/maintenance/common-area/demo-request-id`),
      );
    } catch (error) {
      console.error('Submit error:', error);
      showErrorAlert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-headline-large font-semibold text-text-primary">
            Common Area Request
          </Text>
          <Text className="text-body-medium text-text-secondary">
            Report issues in society common areas
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-6 py-6 space-y-8">
          {/* Location Selection */}
          <View>
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Select Location *
            </Text>
            <View className="space-y-3 mb-4">
              {commonAreaLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  onPress={() => {
                    setSelectedLocation(location.id);
                    setSelectedArea(''); // Reset area when location changes
                  }}
                  className={`flex-row items-center p-4 rounded-xl border mb-2 ${
                    selectedLocation === location.id
                      ? 'border-primary bg-primary/5'
                      : 'border-divider bg-surface'
                  }`}>
                  <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center mr-4">
                    {location.icon}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-headline-medium font-semibold ${
                        selectedLocation === location.id
                          ? 'text-primary'
                          : 'text-text-primary'
                      }`}>
                      {location.title}
                    </Text>
                    <Text className="text-body-medium text-text-secondary">
                      {location.areas.length} areas available
                    </Text>
                  </View>
                  {selectedLocation === location.id && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Specific Area Selection */}
          {selectedLocationData && (
            <View className="mb-6">
              <Text className="text-headline-medium font-semibold text-text-primary mb-4">
                Select Specific Area *
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {selectedLocationData.areas.map((area) => (
                  <TouchableOpacity
                    key={area}
                    onPress={() => setSelectedArea(area)}
                    className={`px-4 py-3 rounded-lg border ${
                      selectedArea === area
                        ? 'border-primary bg-primary/10'
                        : 'border-divider bg-surface'
                    }`}>
                    <Text
                      className={`text-body-medium font-medium ${
                        selectedArea === area
                          ? 'text-primary'
                          : 'text-text-primary'
                      }`}>
                      {area}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Issue Category */}
          <View className="mb-6">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Issue Category *
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {issueCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`flex-row items-center px-4 py-3 rounded-lg border ${
                    selectedCategory === category.id
                      ? 'border-primary bg-primary/10'
                      : 'border-divider bg-surface'
                  }`}>
                  <Text className="text-lg mr-2">{category.icon}</Text>
                  <Text
                    className={`text-body-medium font-medium ${
                      selectedCategory === category.id
                        ? 'text-primary'
                        : 'text-text-primary'
                    }`}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority Level */}
          <View className="mb-6">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Priority Level *
            </Text>
            <View className="space-y-3">
              {priorityLevels.map((priority) => (
                <TouchableOpacity
                  key={priority.id}
                  onPress={() => setSelectedPriority(priority.id)}
                  className={`flex-row items-center p-4 rounded-xl border mb-2 ${
                    selectedPriority === priority.id
                      ? 'border-primary bg-primary/5'
                      : 'border-divider bg-surface'
                  }`}>
                  <Text className="text-2xl mr-4">{priority.icon}</Text>
                  <View className="flex-1">
                    <Text
                      className={`text-headline-medium font-semibold ${
                        selectedPriority === priority.id
                          ? 'text-primary'
                          : 'text-text-primary'
                      }`}>
                      {priority.title}
                    </Text>
                    <Text className="text-body-medium text-text-secondary">
                      {priority.description}
                    </Text>
                  </View>
                  {selectedPriority === priority.id && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Issue Description *
            </Text>
            <TextInput
              className="bg-surface border border-divider rounded-xl px-4 py-4 text-body-large text-text-primary min-h-[120px]"
              placeholder="Please describe the issue in detail. Include when you first noticed it and any relevant information..."
              placeholderTextColor="#757575"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Additional Information */}
          <View className="space-y-6 mb-6">
            <Text className="text-headline-medium font-semibold text-text-primary">
              Additional Information
            </Text>

            {/* Affected Residents */}
            <View className="mb-3">
              <Text className="text-body-large font-medium text-text-primary mb-3">
                Number of Residents Affected (Optional)
              </Text>
              <TextInput
                className="bg-surface border border-divider rounded-xl px-4 py-3 text-body-large text-text-primary"
                placeholder="e.g., 10"
                placeholderTextColor="#757575"
                value={affectedResidents}
                onChangeText={setAffectedResidents}
                keyboardType="number-pad"
              />
            </View>

            {/* Suggested Vendor */}
            <View>
              <Text className="text-body-large font-medium text-text-primary mb-3">
                Suggested Vendor (Optional)
              </Text>
              <TextInput
                className="bg-surface border border-divider rounded-xl px-4 py-3 text-body-large text-text-primary"
                placeholder="If you know a reliable vendor for this work"
                placeholderTextColor="#757575"
                value={suggestedVendor}
                onChangeText={setSuggestedVendor}
              />
            </View>
          </View>

          {/* Media Upload */}
          <View>
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Add Photos & Voice Notes
            </Text>

            {/* Upload Buttons */}
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={handleCamera}
                className="flex-1 flex-row items-center justify-center bg-primary rounded-xl p-4">
                <Camera size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleImagePicker}
                className="flex-1 flex-row items-center justify-center bg-surface border border-divider rounded-xl p-4">
                <Camera size={20} color="#6366f1" />
                <Text className="text-primary font-semibold ml-2">Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                className={`flex-1 flex-row items-center justify-center rounded-xl p-4 ${
                  isRecording ? 'bg-error' : 'bg-secondary'
                }`}>
                <Mic size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  {isRecording ? 'Stop' : 'Voice'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Media Files Display */}
            {mediaFiles.length > 0 && (
              <View className="space-y-2">
                {mediaFiles.map((file) => (
                  <View
                    key={file.id}
                    className="flex-row items-center bg-surface rounded-lg p-3 border border-divider">
                    <Text className="text-lg mr-3">
                      {file.type === 'image' ? '📷' : '🎤'}
                    </Text>
                    <Text className="flex-1 text-body-medium text-text-primary">
                      {file.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeMediaFile(file.id)}
                      className="bg-error/10 rounded-full w-8 h-8 items-center justify-center">
                      <Text className="text-error">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text className="text-body-medium text-text-secondary mt-2">
              Max 5 photos and 2 voice notes (2 minutes each)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="bg-surface px-6 py-4 border-t border-divider">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-xl p-4 ${
            isSubmitting ? 'bg-primary/50' : 'bg-primary'
          }`}>
          <Text className="text-white text-center font-semibold text-headline-medium">
            {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
