import { ImagePlus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image as RNImage,
  Dimensions,
} from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import {
  showErrorAlert,
  showDeleteConfirmAlert,
  showConfirmAlert,
} from '@/utils/alert';

interface ImagePickerProps {
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  selectedImage?: string;
  disabled?: boolean;
}

const { width } = Dimensions.get('window');

const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  onImageRemoved,
  selectedImage,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);

  const requestPermission = async () => {
    const { status } =
      await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showErrorAlert(
        'Permission Required',
        'Please grant camera roll permissions to upload images.',
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (disabled || uploading) return;

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    showConfirmAlert(
      'Select Image Source',
      'Would you like to take a new photo or choose from your photo library?',
      () => openCamera(), // Primary action - Camera
      () => {
        // Secondary action - Photo Library
        openImageLibrary();
      },
      'Camera',
      'Photo Library',
    );
  };

  const openImageLibrary = async () => {
    try {
      setUploading(true);
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showErrorAlert('Error', 'Failed to select image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showErrorAlert(
          'Permission Required',
          'Camera permission is required to take photos.',
        );
        return;
      }

      setUploading(true);
      const result = await ExpoImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showErrorAlert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    showDeleteConfirmAlert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      onImageRemoved,
    );
  };

  if (selectedImage) {
    return (
      <View className="mt-3 rounded-2xl overflow-hidden bg-surface border border-divider">
        <RNImage
          source={{ uri: selectedImage }}
          style={{
            width: '100%',
            height: 200,
            resizeMode: 'cover',
          }}
        />
        <TouchableOpacity
          onPress={removeImage}
          className="absolute top-3 right-3 bg-black/50 rounded-full w-8 h-8 items-center justify-center"
          disabled={disabled}>
          <X size={16} color="white" />
        </TouchableOpacity>
        <View className="absolute bottom-3 left-3 bg-black/50 rounded-full px-3 py-1">
          <Text className="text-white text-label-large font-medium">
            Tap X to remove
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={pickImage}
      disabled={disabled || uploading}
      className={`mt-3 border-2 border-dashed rounded-2xl p-8 items-center justify-center ${
        disabled || uploading
          ? 'border-divider bg-surface/50'
          : 'border-primary/30 bg-primary/5'
      }`}
      activeOpacity={0.7}>
      {uploading ? (
        <>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-text-secondary mt-3 text-center">
            Processing image...
          </Text>
        </>
      ) : (
        <>
          <View className="bg-primary/10 rounded-full w-16 h-16 items-center justify-center mb-4">
            <ImagePlus size={28} color="#6366f1" />
          </View>
          <Text className="text-text-primary font-semibold text-headline-medium mb-2">
            Add Photo
          </Text>
          <Text className="text-text-secondary text-center leading-5">
            Share a photo with your community.{'\n'}
            Tap to choose from library or camera.
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default ImagePicker;
