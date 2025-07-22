import { Check, Clock, X } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import UserAvatar from "./UserAvatar";

interface VisitorListCardProps {
  name?: string;
  date?: string;
  time?: string;
  status?: "Pending" | "Approved" | "Pre-approved" | "Expected";
  category?: string;
  purpose?: string;
  phone?: string;
  onApprove?: () => void;
  onDeny?: () => void;
  onPress?: () => void;
}

const VisitorListCard: React.FC<VisitorListCardProps> = ({
  name = "Amazon Delivery",
  date = "Today",
  time = "2:30 PM",
  status = "Expected",
  category = "Delivery",
  purpose = "Package delivery",
  phone,
  onApprove,
  onDeny,
  onPress,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Expected":
        return {
          bgClass: "bg-blue-50",
          borderClass: "border-blue-200",
          textClass: "text-blue-600",
          dotClass: "bg-blue-500",
        };
      case "Approved":
      case "Pre-approved":
        return {
          bgClass: "bg-green-50",
          borderClass: "border-green-200",
          textClass: "text-green-600",
          dotClass: "bg-green-500",
        };
      case "Pending":
      default:
        return {
          bgClass: "bg-orange-50",
          borderClass: "border-orange-200",
          textClass: "text-orange-600",
          dotClass: "bg-orange-500",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <TouchableOpacity 
      className="bg-surface border border-divider rounded-xl p-4 mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Main Content */}
      <View className="flex-row">
        {/* Avatar and Info */}
        <View className="flex-1">
          <View className="flex-row items-start">
            <UserAvatar name={name} size={44} />
            <View className="ml-3 flex-1">
              {/* Name and Category */}
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-body-large font-semibold text-text-primary flex-1" numberOfLines={1}>
                  {name}
                </Text>
              </View>
              
              {/* Category and Purpose */}
              <View className="mb-2">
                {category && (
                  <Text className="text-label-medium font-medium text-text-secondary capitalize">
                    {category} Visit
                  </Text>
                )}
                {purpose && (
                  <Text className="text-label-medium text-text-secondary" numberOfLines={1}>
                    {purpose}
                  </Text>
                )}
              </View>

              {/* Date and Time */}
              <View className="flex-row items-center">
                <Clock size={16} className="text-text-secondary" strokeWidth={1.5} />
                <Text className="text-body-medium text-text-secondary ml-2">
                  {date} • {time}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View className="items-end ml-3">
          <View className={`px-3 py-1.5 rounded-full border ${statusConfig.bgClass} ${statusConfig.borderClass}`}>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${statusConfig.dotClass}`} />
              <Text className={`text-label-medium font-medium ${statusConfig.textClass}`}>
                {status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {(status === "Pending" || status === "Expected") && (
        <View className="flex-row mt-4 pt-3 border-t border-divider/50 gap-2">
          <TouchableOpacity
            className="flex-1 py-3 bg-green-600 rounded-lg flex-row items-center justify-center"
            onPress={onApprove}
            activeOpacity={0.8}
          >
            <Check size={16} color="white" strokeWidth={2} />
            <Text className="text-label-large font-semibold text-white ml-2">
              {status === "Expected" ? "Pre-approve" : "Approve"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 py-3 bg-surface border border-divider rounded-lg flex-row items-center justify-center"
            onPress={onDeny}
            activeOpacity={0.7}
          >
            <X size={16} className="text-red-600" strokeWidth={2} />
            <Text className="text-label-large font-medium text-red-600 ml-2">
              Deny
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default VisitorListCard;
