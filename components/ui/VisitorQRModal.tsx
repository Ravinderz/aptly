import { Image } from "expo-image";
import { Download, Share2, X } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Modal,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Visitor {
  id: string;
  name: string;
  date: string;
  time: string;
  status: "Pending" | "Approved" | "Pre-approved" | "Rejected" | "Completed";
  category: "Personal" | "Delivery" | "Service" | "Official";
  phone?: string;
  purpose?: string;
}

interface VisitorQRModalProps {
  visible: boolean;
  visitor: Visitor | null;
  onClose: () => void;
}

export default function VisitorQRModal({ visible, visitor, onClose }: VisitorQRModalProps) {
  if (!visitor) return null;

  const getLetters = (str: string) => {
    const parts = str ? str.split(" ") : ["A", "A"];
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
      console.error("Error sharing QR code:", error);
      Alert.alert("Error", "Failed to share QR code");
    }
  };

  const handleDownloadQR = () => {
    // TODO: Implement QR code download functionality
    Alert.alert("Download", "QR code download functionality coming soon!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pre-approved":
      case "Approved":
        return "bg-success/10 text-success";
      case "Pending":
        return "bg-warning/10 text-warning";
      case "Rejected":
        return "bg-error/10 text-error";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-surface rounded-2xl w-full max-w-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-divider">
            <View className="flex-row items-center flex-1">
              <View className="bg-primary rounded-full w-12 h-12 items-center justify-center mr-3">
                <Text className="text-white font-bold text-body-medium">
                  {getLetters(visitor.name)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-headline-medium font-semibold text-text-primary">
                  {visitor.name}
                </Text>
                {visitor.category && (
                  <Text className="text-label-medium text-text-secondary">
                    {visitor.category}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2"
              activeOpacity={0.7}
            >
              <X size={20} className="text-text-secondary" />
            </TouchableOpacity>
          </View>

          {/* QR Code */}
          <View className="items-center py-6">
            <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <Image
                style={{ width: 180, height: 180 }}
                source={require("../../assets/images/QR_Code.png")}
                contentFit="cover"
                transition={300}
              />
            </View>
            
            {/* Visit Details */}
            <View className="items-center mb-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-body-large font-medium text-text-primary mr-2">
                  {visitor.date}
                </Text>
                <Text className="text-body-large font-medium text-text-primary">
                  {visitor.time}
                </Text>
              </View>
              
              <View className={`px-3 py-1 rounded-full ${getStatusColor(visitor.status)}`}>
                <Text className={`text-body-medium font-medium ${getStatusColor(visitor.status).split(' ')[1]}`}>
                  {visitor.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row p-4 gap-3">
            <TouchableOpacity
              onPress={handleShareQR}
              className="flex-1 bg-primary py-3 px-4 rounded-xl flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Share2 size={16} color="white" strokeWidth={2} />
              <Text className="text-white font-semibold ml-2">Share QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleDownloadQR}
              className="flex-1 bg-surface border border-divider py-3 px-4 rounded-xl flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Download size={16} className="text-primary" strokeWidth={2} />
              <Text className="text-primary font-semibold ml-2">Download</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View className="p-4 pt-0">
            <View className="bg-primary/5 rounded-lg p-3">
              <Text className="text-primary text-body-medium font-medium mb-1">
                📱 Instructions
              </Text>
              <Text className="text-text-secondary text-label-large leading-4">
                Show this QR code at the gate for quick entry. The security guard will scan it for verification.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}