import { Image } from 'expo-image';
import { Download, Share2, X } from 'lucide-react-native';
import React from 'react';
import { Modal, Share, Text, TouchableOpacity, View } from 'react-native';
import { useAlert } from './AlertCard';

interface Visitor {
  id: string;
  name: string;
  date: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Pre-approved' | 'Rejected' | 'Completed';
  category: 'Personal' | 'Delivery' | 'Service' | 'Official';
  phone?: string;
  purpose?: string;
}

interface VisitorQRModalProps {
  visible: boolean;
  visitor: Visitor | null;
  onClose: () => void;
}

export default function VisitorQRModal({
  visible,
  visitor,
  onClose,
}: VisitorQRModalProps) {
  const { showAlert, AlertComponent } = useAlert();

  if (!visitor) return null;

  const getLetters = (str: string) => {
    const parts = str ? str.split(' ') : ['A', 'A'];
    if (parts?.length > 1) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return `${str.charAt(0)}${str.charAt(1) || str.charAt(0)}`.toUpperCase();
  };

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `QR Code for ${visitor.name} - Visit scheduled for ${visitor.date} at ${visitor.time}`,
        title: `Visitor QR - ${visitor.name}`,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      showAlert({
        type: 'error',
        title: 'Share Failed',
        message: 'Unable to share QR code. Please try again.',
        primaryAction: {
          label: 'OK',
          onPress: () => {},
        },
      });
    }
  };

  const handleDownloadQR = () => {
    showAlert({
      type: 'info',
      title: 'Coming Soon',
      message:
        'QR code download functionality will be available in the next update!',
      primaryAction: {
        label: 'OK',
        onPress: () => {},
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pre-approved':
      case 'Approved':
        return 'bg-success/10 text-success';
      case 'Pending':
        return 'bg-warning/10 text-warning';
      case 'Rejected':
        return 'bg-error/10 text-error';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}>
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        <View className="bg-surface rounded-3xl w-full max-w-sm">
          {/* Header */}
          <View className="relative p-6 border-b border-divider/50">
            <View className="flex-row items-center">
              <View className="bg-primary rounded-full w-14 h-14 items-center justify-center mr-4">
                <Text className="text-white font-bold text-body-large">
                  {getLetters(visitor.name)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-headline-medium font-bold text-text-primary mb-1">
                  {visitor.name}
                </Text>
                <View className="flex-row items-center">
                  {visitor.category && (
                    <Text className="text-label-medium font-medium text-text-secondary capitalize mr-2">
                      {visitor.category} Visit
                    </Text>
                  )}
                  <View
                    className={`px-2 py-1 rounded-full ${getStatusColor(visitor.status)}`}>
                    <Text
                      className={`text-label-small font-medium ${getStatusColor(visitor.status).split(' ')[1]}`}>
                      {visitor.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 p-2 bg-surface/80 rounded-full"
              activeOpacity={0.7}>
              <X size={20} className="text-text-secondary" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* QR Code Section */}
          <View className="items-center py-8">
            <View className="bg-white p-6 rounded-2xl mb-6">
              <Image
                style={{ width: 200, height: 200 }}
                source={require('../../assets/images/QR_Code.png')}
                contentFit="cover"
              />
            </View>

            {/* Visit Details */}
            <View className="items-center">
              <View className="bg-primary/5 px-4 py-2 rounded-full mb-3">
                <Text className="text-primary text-body-large font-bold">
                  {visitor.date} • {visitor.time}
                </Text>
              </View>

              {visitor.purpose && (
                <Text className="text-text-secondary text-center px-4 text-body-medium">
                  {visitor.purpose}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-6 pb-6">
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={handleShareQR}
                className="flex-1 bg-primary py-4 px-4 rounded-2xl flex-row items-center justify-center"
                activeOpacity={0.8}>
                <Share2 size={18} color="white" strokeWidth={2} />
                <Text className="text-white font-bold ml-2 text-body-medium">
                  Share QR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDownloadQR}
                className="flex-1 bg-surface border-2 border-primary/20 py-4 px-4 rounded-2xl flex-row items-center justify-center"
                activeOpacity={0.8}>
                <Download size={18} className="text-primary" strokeWidth={2} />
                <Text className="text-primary font-bold ml-2 text-body-medium">
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
              <View className="flex-row items-start">
                <View className="bg-primary/20 p-2 rounded-full mr-3">
                  <Text className="text-primary text-body-medium">📱</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-primary text-body-medium font-bold mb-2">
                    Gate Entry Instructions
                  </Text>
                  <Text className="text-text-secondary text-label-large leading-5">
                    Show this QR code to the security guard for quick
                    verification and contactless entry.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Custom Alert Component */}
      {AlertComponent}
    </Modal>
  );
}
