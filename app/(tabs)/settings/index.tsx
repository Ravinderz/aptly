import React from 'react';
import { ScrollView, SafeAreaView, View } from 'react-native';
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
  Settings as SettingsIcon
} from 'lucide-react-native';
import ProfileHeader from '../../../components/ui/ProfileHeader';
import ProfileSection, { ProfileItem } from '../../../components/ui/ProfileSection';

export default function Profile() {
  // Mock user data - replace with actual user context/state
  const userData = {
    name: "Rajesh Kumar",
    role: "Flat Owner",
    flatNumber: "A-301",
    societyName: "Green Valley Apartments",
    profileImage: undefined, // Add image URL when available
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Edit profile pressed');
  };

  const handleChangePhoto = () => {
    // Handle photo selection/camera
    console.log('Change photo pressed');
  };

  const handlePersonalInfo = () => {
    // Navigate to personal information screen
    console.log('Personal info pressed');
  };

  const handleFamilyMembers = () => {
    // Navigate to family members screen
    console.log('Family members pressed');
  };

  const handleVehicles = () => {
    // Navigate to vehicle registration screen
    console.log('Vehicles pressed');
  };

  const handleDocuments = () => {
    // Navigate to document vault screen
    console.log('Documents pressed');
  };

  const handleNotifications = () => {
    // Navigate to notification preferences screen
    console.log('Notifications pressed');
  };

  const handleEmergencyContacts = () => {
    // Navigate to emergency contacts screen
    console.log('Emergency contacts pressed');
  };

  const handleSecurity = () => {
    // Navigate to security settings screen
    console.log('Security pressed');
  };

  const handleHelp = () => {
    // Navigate to help & support screen
    console.log('Help pressed');
  };

  const handleSettings = () => {
    // Navigate to app settings screen
    console.log('Settings pressed');
  };

  const handleLogout = () => {
    // Handle logout functionality
    console.log('Logout pressed');
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
            subtitle="Name, phone, email, address"
            onPress={handlePersonalInfo}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<Users size={20} color="#6366f1" />}
            title="Family Members"
            subtitle="3 members registered"
            onPress={handleFamilyMembers}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<Car size={20} color="#6366f1" />}
            title="Vehicles"
            subtitle="2 vehicles registered"
            onPress={handleVehicles}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<FileText size={20} color="#6366f1" />}
            title="Documents"
            subtitle="Aadhar, PAN, Lease agreement"
            onPress={handleDocuments}
          />
        </ProfileSection>

        {/* Preferences Section */}
        <ProfileSection title="Preferences">
          <ProfileItem
            icon={<Bell size={20} color="#6366f1" />}
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={handleNotifications}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<Phone size={20} color="#6366f1" />}
            title="Emergency Contacts"
            subtitle="2 contacts added"
            onPress={handleEmergencyContacts}
          />
        </ProfileSection>

        {/* Security & Support Section */}
        <ProfileSection title="Security & Support">
          <ProfileItem
            icon={<Shield size={20} color="#6366f1" />}
            title="Security"
            subtitle="Biometric, PIN, privacy settings"
            onPress={handleSecurity}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<HelpCircle size={20} color="#6366f1" />}
            title="Help & Support"
            subtitle="FAQs, contact support"
            onPress={handleHelp}
          />
          <View className="h-px bg-divider mx-4" />
          <ProfileItem
            icon={<SettingsIcon size={20} color="#6366f1" />}
            title="App Settings"
            subtitle="Language, theme, data usage"
            onPress={handleSettings}
          />
        </ProfileSection>

        {/* Logout Section */}
        <ProfileSection title="Account">
          <ProfileItem
            icon={<LogOut size={20} color="#D32F2F" />}
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            showArrow={false}
          />
        </ProfileSection>
      </ScrollView>
    </SafeAreaView>
  );
}