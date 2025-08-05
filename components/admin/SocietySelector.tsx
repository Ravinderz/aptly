import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronDown,
  Check,
  Building2,
  MapPin,
  Users,
  Settings,
} from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { Society } from '@/types/admin';
import { useAlert } from '@/components/ui/AlertCard';

interface SocietySelectorProps {
  compact?: boolean;
  showStats?: boolean;
  onSocietyChange?: (society: Society) => void;
}

const SocietySelector: React.FC<SocietySelectorProps> = ({
  compact = false,
  showStats = true,
  onSocietyChange,
}) => {
  const {
    activeSociety,
    availableSocieties,
    switchSociety,
    adminUser,
    currentMode,
  } = useDirectAdmin();
  const { showAlert, AlertComponent } = useAlert();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSocietySwitch = async (societyId: string) => {
    if (societyId === activeSociety?.id) {
      setIsModalVisible(false);
      return;
    }

    setIsLoading(true);
    try {
      await switchSociety(societyId);

      const newSociety = availableSocieties.find((s) => s.id === societyId);
      if (newSociety && onSocietyChange) {
        onSocietyChange(newSociety);
      }

      setIsModalVisible(false);

      showAlert({
        type: 'success',
        title: 'Society Switched',
        message: `You are now managing ${newSociety?.name}`,
        primaryAction: {
          label: 'OK',
          onPress: () => {},
        },
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Switch Failed',
        message:
          error instanceof Error ? error.message : 'Failed to switch society',
        primaryAction: {
          label: 'OK',
          onPress: () => {},
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSocietyStatus = (society: Society) => {
    const isActive = society.status === 'active';
    const hasAccess = adminUser?.societies.some(
      (s) => s.societyId === society.id && s.isActive,
    );

    return {
      accessible: isActive && hasAccess,
      statusColor: isActive ? 'text-green-600' : 'text-red-600',
      statusText: isActive ? 'Active' : 'Inactive',
    };
  };

  const getUserRoleInSociety = (societyId: string) => {
    const societyAccess = adminUser?.societies.find(
      (s) => s.societyId === societyId,
    );
    return societyAccess?.role || 'Unknown';
  };

  const formatRole = (role: string) => {
    return role
      .replace('_', ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (currentMode !== 'admin' || availableSocieties.length <= 1) {
    return null;
  }

  const renderSocietyItem = ({ item: society }: { item: Society }) => {
    const isSelected = society.id === activeSociety?.id;
    const status = getSocietyStatus(society);
    const userRole = getUserRoleInSociety(society.id);

    return (
      <TouchableOpacity
        onPress={() =>
          status.accessible ? handleSocietySwitch(society.id) : null
        }
        disabled={!status.accessible || isLoading}
        className={`p-4 border-b border-divider/30 ${
          !status.accessible ? 'opacity-50' : ''
        } ${isSelected ? 'bg-primary/5' : ''}`}
        activeOpacity={0.7}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            {/* Society Name and Code */}
            <View className="flex-row items-center mb-2">
              <Building2 size={16} className="text-primary mr-2" />
              <Text
                className="text-body-large font-semibold text-text-primary flex-1"
                numberOfLines={1}>
                {society.name}
              </Text>
              {isSelected && (
                <View className="bg-primary rounded-full w-5 h-5 items-center justify-center ml-2">
                  <Check size={12} color="white" strokeWidth={2} />
                </View>
              )}
            </View>

            {/* Society Code and Status */}
            <View className="flex-row items-center mb-2">
              <Text className="text-label-medium text-text-secondary mr-3">
                {society.code}
              </Text>
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-1 ${
                    society.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <Text
                  className={`text-label-small font-medium ${status.statusColor}`}>
                  {status.statusText}
                </Text>
              </View>
            </View>

            {/* User Role */}
            <View className="flex-row items-center mb-2">
              <Settings size={14} className="text-text-secondary mr-2" />
              <Text className="text-label-medium text-text-secondary">
                Your Role: {formatRole(userRole)}
              </Text>
            </View>

            {/* Address */}
            <View className="flex-row items-start mb-2">
              <MapPin size={14} className="text-text-secondary mr-2 mt-0.5" />
              <Text
                className="text-label-medium text-text-secondary flex-1"
                numberOfLines={2}>
                {society.address}
              </Text>
            </View>

            {/* Society Stats */}
            {showStats && (
              <View className="flex-row items-center">
                <Users size={14} className="text-text-secondary mr-2" />
                <Text className="text-label-medium text-text-secondary">
                  {society.activeResidents}/{society.totalFlats} residents •{' '}
                  {society.adminCount} admins
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Society Selector Trigger */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className={`flex-row items-center ${
          compact ? 'py-2 px-3' : 'py-3 px-4'
        } bg-surface border border-divider rounded-xl`}
        activeOpacity={0.7}>
        <Building2 size={compact ? 16 : 20} className="text-primary mr-2" />
        <View className="flex-1 mr-2">
          <Text
            className={`${
              compact ? 'text-label-large' : 'text-body-medium'
            } font-semibold text-text-primary`}
            numberOfLines={1}>
            {activeSociety?.name || 'Select Society'}
          </Text>
          {!compact && activeSociety && (
            <Text className="text-label-medium text-text-secondary">
              {activeSociety.code} •{' '}
              {formatRole(getUserRoleInSociety(activeSociety.id))}
            </Text>
          )}
        </View>
        <ChevronDown size={16} className="text-text-secondary" />
      </TouchableOpacity>

      {/* Society Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 bg-background">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-divider bg-surface">
            <View>
              <Text className="text-headline-medium font-semibold text-text-primary">
                Select Society
              </Text>
              <Text className="text-body-medium text-text-secondary">
                Choose which society to manage
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              className="p-2 bg-background rounded-lg">
              <Text className="text-primary font-medium">Done</Text>
            </TouchableOpacity>
          </View>

          {/* Society List */}
          <View className="flex-1">
            {isLoading && (
              <View className="absolute inset-0 bg-background/80 items-center justify-center z-10">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="text-body-medium text-text-secondary mt-2">
                  Switching society...
                </Text>
              </View>
            )}

            <FlatList
              data={availableSocieties}
              keyExtractor={(item) => item.id}
              renderItem={renderSocietyItem}
              showsVerticalScrollIndicator={false}
              className="flex-1"
            />
          </View>

          {/* Footer Info */}
          <View className="p-4 bg-surface border-t border-divider">
            <Text className="text-label-medium text-text-secondary text-center">
              You have access to {availableSocieties.length}{' '}
              {availableSocieties.length === 1 ? 'society' : 'societies'}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Component */}
      {AlertComponent}
    </>
  );
};

export default SocietySelector;
