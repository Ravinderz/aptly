import {
  CalendarDays,
  Check,
  Clock,
  Eye,
  MessageSquare,
  X,
} from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import UserAvatar from './UserAvatar';

interface VisitorListItemProps {
  name: string;
  date: string;
  time: string;
  status: string;
  type?: 'past' | 'upcoming';
  category?: string;
  purpose?: string;
  phone?: string;
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
  purpose,
  phone,
  onViewQR,
  onApprove,
  onReject,
  handleClick,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Rejected':
        return {
          bgClass: 'bg-red-50',
          borderClass: 'border-red-200',
          textClass: 'text-red-600',
          dotClass: 'bg-red-500',
        };
      case 'Approved':
      case 'Pre-approved':
      case 'Pre-Approved':
        return {
          bgClass: 'bg-green-50',
          borderClass: 'border-green-200',
          textClass: 'text-green-600',
          dotClass: 'bg-green-500',
        };
      case 'Completed':
        return {
          bgClass: 'bg-gray-50',
          borderClass: 'border-gray-200',
          textClass: 'text-gray-600',
          dotClass: 'bg-gray-500',
        };
      case 'Pending':
      default:
        return {
          bgClass: 'bg-orange-50',
          borderClass: 'border-orange-200',
          textClass: 'text-orange-600',
          dotClass: 'bg-orange-500',
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <View className="bg-surface border border-divider rounded-xl p-4 mb-3">
      {/* Main Content */}
      <View className="flex-row">
        {/* Avatar and Info */}
        <View className="flex-1">
          <View className="flex-row items-start">
            <UserAvatar name={name} size={44} />
            <View className="ml-3 flex-1">
              {/* Name and Category */}
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className="text-body-large font-semibold text-text-primary flex-1"
                  numberOfLines={1}>
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
                  <Text
                    className="text-label-medium text-text-secondary"
                    numberOfLines={1}>
                    {purpose}
                  </Text>
                )}
              </View>

              {/* Date and Time */}
              <View className="flex-row items-center">
                <Clock
                  size={16}
                  className="text-text-secondary"
                  strokeWidth={1.5}
                />
                <Text className="text-body-medium text-text-secondary ml-2">
                  {date} • {time}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View className="items-end ml-3">
          <View
            className={`px-3 py-1.5 rounded-full border ${statusConfig.bgClass} ${statusConfig.borderClass}`}>
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${statusConfig.dotClass}`}
              />
              <Text
                className={`text-label-medium font-medium ${statusConfig.textClass}`}>
                {status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons - Debug version */}
      {type !== 'past' && (
        <View className="flex-row mt-4 pt-3 border-t border-divider/50">
          {/* Pending Status Actions */}
          {status === 'Pending' && (
            <>
              <TouchableOpacity
                className="flex-1 py-3 bg-green-600 rounded-lg flex-row items-center justify-center mr-2"
                onPress={onApprove}
                activeOpacity={0.8}>
                <Check size={16} color="white" strokeWidth={2} />
                <Text className="text-label-large font-semibold text-white ml-2">
                  Approve
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 bg-surface border border-divider rounded-lg flex-row items-center justify-center"
                onPress={onReject}
                activeOpacity={0.7}>
                <X size={16} className="text-red-600" strokeWidth={2} />
                <Text className="text-label-large font-medium text-red-600 ml-2">
                  Deny
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Approved Status Actions */}
          {(status === 'Approved' ||
            status === 'Pre-approved' ||
            status === 'Pre-Approved') && (
            <>
              <TouchableOpacity
                className="flex-1 py-3 bg-primary rounded-lg flex-row items-center justify-center mr-2"
                onPress={onViewQR}
                activeOpacity={0.8}>
                <Eye size={16} color="white" strokeWidth={1.5} />
                <Text className="text-label-large font-semibold text-white ml-2">
                  View QR
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 bg-surface border border-divider rounded-lg flex-row items-center justify-center"
                onPress={handleClick}
                activeOpacity={0.7}>
                <CalendarDays
                  size={16}
                  className="text-text-secondary"
                  strokeWidth={1.5}
                />
                <Text className="text-label-large font-medium text-text-secondary ml-2">
                  Reschedule
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Past Visitor Actions */}
          {type === 'past' && (
            <TouchableOpacity
              className="flex-1 py-3 bg-surface border border-divider rounded-lg flex-row items-center justify-center"
              onPress={handleClick}
              activeOpacity={0.7}>
              <Eye
                size={16}
                className="text-text-secondary"
                strokeWidth={1.5}
              />
              <Text className="text-label-large font-medium text-text-secondary ml-2">
                View Details
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Contact Quick Actions for Approved */}
      {(status === 'Approved' ||
        status === 'Pre-approved' ||
        status === 'Pre-Approved') &&
        phone && (
          <View className="mt-3 pt-3 border-t border-divider/50">
            <TouchableOpacity
              className="flex-row items-center py-2"
              onPress={() => {
                /* TODO: Call functionality */
              }}
              activeOpacity={0.7}>
              <MessageSquare
                size={16}
                className="text-primary"
                strokeWidth={1.5}
              />
              <Text className="text-label-large font-medium text-primary ml-2">
                Contact visitor at {phone}
              </Text>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );
};

export default VisitorListItem;
