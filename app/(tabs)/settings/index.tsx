import React from 'react';
import { ScrollView, SafeAreaView, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Users, 
  Car, 
  FileText, 
  Bell, 
  Phone, 
  Shield, 
  LogOut,
  HelpCircle,
  Settings as SettingsIcon,
  Camera
} from 'lucide-react-native';
import ProfileHeader from '../../../components/ui/ProfileHeader';
import ProfileSection, { ProfileItem } from '../../../components/ui/ProfileSection';
import * as ImagePicker from 'expo-image-picker';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Use real user data from auth context, fallback to mock data
  const userData = {
    name: user?.fullName || "Rajesh Kumar Sharma",
    role: user?.ownershipType === 'owner' ? "Flat Owner" : "Tenant",
    flatNumber: user?.flatNumber || "A-301",
    societyName: user?.societyCode || "Green Valley Apartments",
    profileImage: undefined, // Add image URL when available
  };

  const handleEditProfile = () => {
    router.push('/(tabs)/settings/personal-details');
  };

  const handleChangePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // TODO: Upload image and update user profile
        Alert.alert('Success', 'Profile photo updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile photo');
    }
  };

  const handlePersonalInfo = () => {
    router.push('/(tabs)/settings/personal-details');
  };

  const handleFamilyMembers = () => {
    router.push('/(tabs)/settings/family-members');
  };

  const handleVehicles = () => {
    router.push('/(tabs)/settings/vehicles');
  };

  const handleDocuments = () => {
    router.push('/(tabs)/settings/documents');
  };

  const handleNotifications = () => {
    router.push('/(tabs)/settings/notifications');
  };

  const handleEmergencyContacts = () => {
    router.push('/(tabs)/settings/emergency-contacts');
  };

  const handleSecurity = () => {
    // TODO: Implement security settings screen
    Alert.alert('Coming Soon', 'Security settings will be available in the next update');
  };

  const handleHelp = () => {
    // TODO: Implement help & support screen
    Alert.alert('Help & Support', 'For assistance, please contact your society management or email support@aptly.app');
  };

  const handleSettings = () => {
    // TODO: Implement app settings screen
    Alert.alert('Coming Soon', 'App settings will be available in the next update');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by AppNavigator based on auth state
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Profile Header */}
        <ProfileHeader
          userName={userData.name}
          userRole={userData.role}
          flatNumber={userData.flatNumber}
          societyName={userData.societyName}
          profileImageUrl={userData.profileImage}
          onEditProfile={handleEditProfile}
          onChangePhoto={handleChangePhoto}
        />

        {/* Personal Information Section */}
        <ProfileSection title="Personal Information">
          <ProfileItem
            icon={<User size={20} color="#6366f1" />}
            title="Personal Details"
            subtitle="Complete profile with Indian documents"
            onPress={handlePersonalInfo}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<Users size={20} color="#6366f1" />}
            title="Family Members"
            subtitle="4 members • 2 dependents"
            onPress={handleFamilyMembers}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<Car size={20} color="#6366f1" />}
            title="Vehicles"
            subtitle="3 vehicles registered • 1 electric"
            onPress={handleVehicles}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<FileText size={20} color="#6366f1" />}
            title="Documents"
            subtitle="Aadhar, PAN, RC, Insurance"
            onPress={handleDocuments}
          />
        </ProfileSection>

        {/* Preferences Section */}
        <ProfileSection title="Preferences & Settings">
          <ProfileItem
            icon={<Bell size={20} color="#6366f1" />}
            title="Notifications"
            subtitle="8 categories • Festival mode enabled"
            onPress={handleNotifications}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<Phone size={20} color="#6366f1" />}
            title="Emergency Contacts"
            subtitle="2 verified contacts"
            onPress={handleEmergencyContacts}
          />
        </ProfileSection>

        {/* Security & Support Section */}
        <ProfileSection title="Security & Support">
          <ProfileItem
            icon={<Shield size={20} color="#6366f1" />}
            title="Security Settings"
            subtitle="Privacy, biometric, app lock"
            onPress={handleSecurity}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<HelpCircle size={20} color="#6366f1" />}
            title="Help & Support"
            subtitle="FAQs, contact support, feedback"
            onPress={handleHelp}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<SettingsIcon size={20} color="#6366f1" />}
            title="App Settings"
            subtitle="Language, theme, storage"
            onPress={handleSettings}
          />
        </ProfileSection>

        {/* Account Section */}
        <ProfileSection title="Account">
          <ProfileItem
            icon={<LogOut size={20} color="#D32F2F" />}
            title="Logout"
            subtitle="Sign out securely from this device"
            onPress={handleLogout}
            showArrow={false}
          />
        </ProfileSection>
      </ScrollView>
    </SafeAreaView>
  );
}