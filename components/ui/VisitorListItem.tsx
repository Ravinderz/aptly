import { CalendarDays, Check, Clock, List, X } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import UserAvatar from "./UserAvatar";

interface VisitorListItemProps {
  name: string;
  date: string;
  time: string;
  status: string;
  type?: "past" | "upcoming";
  category?: string;
  onViewQR?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  handleClick?: any;
}

const VisitorListItem: React.FC<VisitorListItemProps> = ({
  name,
  date,
  time,
  status,
  type,
  category,
  onViewQR,
  onApprove,
  onReject,
  handleClick,
}) => {
  const getLetters = (str: string) => {
    const parts = str.split(" ");
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return `${str.charAt(0)}${str.charAt(0)}`.toUpperCase();
  };

  return (
    <View className="bg-surface border border-divider rounded-xl p-4 mb-4">
      <View className="flex-row justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-3">
            <UserAvatar name={name} />
            <View className="ml-3 flex-1">
              <Text className="text-headline-medium font-semibold text-text-primary">{name}</Text>
              {category && (
                <Text className="text-label-medium text-text-secondary">{category}</Text>
              )}
            </View>
          </View>
          <View className="flex-row items-center ml-1">
            <Clock size={16} className="text-text-secondary" strokeWidth={1.5} />
            <Text className="text-body-medium text-text-secondary ml-2">
              {date}, {time}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <View
            className={`px-3 py-1 rounded-full ${
              status === "Rejected"
                ? "bg-error/10"
                : status === "Approved" || status === "Pre-Approved" || status === "Pre-approved"
                ? "bg-success/10"
                : "bg-primary/10"
            }`}
          >
            <Text
              className={`text-label-large font-medium ${
                status === "Rejected"
                  ? "text-error"
                  : status === "Approved" || status === "Pre-Approved" || status === "Pre-approved"
                  ? "text-success"
                  : "text-primary"
              }`}
            >
              {status}
            </Text>
          </View>
        </View>
      </View>
      {type !== "past" && (
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            className="flex-1 py-3 bg-primary rounded-xl flex-row items-center justify-center"
            onPress={onViewQR || handleClick}
          >
            {status === "Approved" || status === "Pre-approved" ? (
              <CalendarDays size={14} color="#fff" strokeWidth={2} />
            ) : (
              <Check size={14} color="#fff" strokeWidth={2} />
            )}
            <Text className="text-body-medium font-semibold text-white ml-2">
              {status === "Approved" || status === "Pre-approved"
                ? "Reschedule"
                : "Approve"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl border border-divider flex-row items-center justify-center"
            onPress={
              status === "Approved" || status === "Pre-approved" 
                ? onViewQR || handleClick 
                : onReject || handleClick
            }
          >
            {status === "Approved" || status === "Pre-approved" ? (
              <List size={16} className="text-text-secondary" strokeWidth={2} />
            ) : (
              <X size={16} className="text-text-secondary" strokeWidth={2} />
            )}
            <Text className="text-body-medium font-semibold text-text-secondary ml-2">
              {status === "Approved" || status === "Pre-approved"
                ? "View QR"
                : "Deny"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default VisitorListItem;
