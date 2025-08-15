import { Button } from '@/components/ui/Button';
import HighlightCard from '@/components/ui/HighlightCard';
import LucideIcons from '@/components/ui/LucideIcons';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Welcome() {
  const router = useRouter();
  const { login } = useDirectAuth();

  const handleDevSkip = async () => {
    try {
      // Create mock user data for development
      const mockUserProfile = {
        id: 'dev-user-123',
        name: 'John Developer',
        phone: '9876543210',
        email: 'john@aptly.app',
        flatNumber: 'A-101',
        societyId: 'dev-society-123',
        societyName: 'Green Valley Apartments',
        role: 'resident',
        isVerified: true,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockTokens = {
        accessToken: 'mock-access-token-123',
        refreshToken: 'mock-refresh-token-123',
      };

      // Store mock data in AsyncStorage
      await AsyncStorage.multiSet([
        ['auth_tokens', JSON.stringify(mockTokens)],
        ['user_profile', JSON.stringify(mockUserProfile)],
      ]);

      // Update auth context
      login(mockUserProfile);

      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error setting up dev mode:', error);
    }
  };

  const handleAdminLogin = async () => {
    try {
      // Create mock super admin user data for development
      const mockAdminProfile = {
        id: 'super-admin-123',
        name: 'Admin Smith',
        phone: '9876543210',
        email: 'admin@aptly.app',
        role: 'super_admin',
        permissions: [
          'system.admin',
          'societies.create',
          'societies.update',
          'societies.delete',
          'societies.view_all',
          'managers.assign',
          'managers.remove',
          'managers.view_performance',
          'onboarding.review',
          'onboarding.approve',
          'reports.view_all',
        ],
        isVerified: true,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockTokens = {
        accessToken: 'mock-admin-token-123',
        refreshToken: 'mock-admin-refresh-123',
      };

      // Store mock admin data in AsyncStorage
      await AsyncStorage.multiSet([
        ['auth_tokens', JSON.stringify(mockTokens)],
        ['user_profile', JSON.stringify(mockAdminProfile)],
      ]);

      // Update auth context
      login(mockAdminProfile);

      // Navigate to admin dashboard
      router.replace('/admin/dashboard');
    } catch (error) {
      console.error('Error setting up admin mode:', error);
    }
  };

  const handleCommunityManagerLogin = async () => {
    try {
      // Create mock community manager user data for development
      const mockManagerProfile = {
        id: 'manager-123',
        name: 'Manager Johnson',
        phone: '9876543210',
        email: 'manager@aptly.app',
        role: 'community_manager',
        assignedSocieties: ['dev-society-123', 'society-456'],
        permissions: [
          'society.manage',
          'residents.view',
          'notices.create',
          'billing.manage',
          'maintenance.handle',
        ],
        isVerified: true,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockTokens = {
        accessToken: 'mock-manager-token-123',
        refreshToken: 'mock-manager-refresh-123',
      };

      // Store mock manager data in AsyncStorage
      await AsyncStorage.multiSet([
        ['auth_tokens', JSON.stringify(mockTokens)],
        ['user_profile', JSON.stringify(mockManagerProfile)],
      ]);

      // Update auth context
      login(mockManagerProfile);

      // Navigate to manager dashboard
      router.replace('/manager/dashboard');
    } catch (error) {
      console.error('Error setting up manager mode:', error);
    }
  };

  const handleSecurityGuardLogin = async () => {
    try {
      // Create mock security guard user data for development
      const mockSecurityProfile = {
        id: 'security-guard-123',
        name: 'Guard Singh',
        phone: '9876543210',
        email: 'guard@aptly.app',
        flatNumber: null, // Security guards don't have flat numbers
        societyId: 'dev-society-123',
        societyCode: 'DEV001',
        societyName: 'Green Valley Apartments',
        role: 'security_guard',
        fullName: 'Rajesh Singh',
        isVerified: true,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockTokens = {
        accessToken: 'mock-security-token-123',
        refreshToken: 'mock-security-refresh-123',
      };

      // Store mock security guard data in AsyncStorage
      await AsyncStorage.multiSet([
        ['auth_tokens', JSON.stringify(mockTokens)],
        ['user_profile', JSON.stringify(mockSecurityProfile)],
      ]);

      // Update auth context
      login(mockSecurityProfile);

      // Navigate to security dashboard
      router.replace('/security/dashboard');
    } catch (error) {
      console.error('Error setting up security guard mode:', error);
    }
  };

  const features = [
    {
      icon: <LucideIcons name="building" size={32} color="#6366f1" />,
      title: 'Digital Society Management',
      description: 'Manage your housing society digitally with ease',
    },
    {
      icon: <LucideIcons name="shield-outline" size={32} color="#6366f1" />,
      title: 'Secure & Private',
      description: 'Your data is protected with bank-level security',
    },
    {
      icon: <LucideIcons name="people" size={32} color="#6366f1" />,
      title: 'Community Connect',
      description: 'Stay connected with your society members',
    },
    {
      icon: <LucideIcons name="smartphone" size={32} color="#6366f1" />,
      title: 'Mobile First',
      description: 'Designed specifically for Indian mobile users',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Development Login Buttons */}
      {/* {__DEV__ && ( */}
      {
        <View className="absolute top-12 right-4 z-10 space-y-2">
          <TouchableOpacity
            onPress={handleAdminLogin}
            className="bg-red-500/90 rounded-full px-3 py-2 flex-row items-center shadow-sm"
            activeOpacity={0.8}>
            <LucideIcons name="shield-outline" size={16} color="white" />
            <Text className="text-white text-label-large font-bold ml-1">
              ADMIN LOGIN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCommunityManagerLogin}
            className="bg-blue-500/90 rounded-full px-3 py-2 flex-row items-center shadow-sm"
            activeOpacity={0.8}>
            <LucideIcons name="users" size={16} color="white" />
            <Text className="text-white text-label-large font-bold ml-1">
              MANAGER
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSecurityGuardLogin}
            className="bg-green-600/90 rounded-full px-3 py-2 flex-row items-center shadow-sm"
            activeOpacity={0.8}>
            <LucideIcons name="shield" size={16} color="white" />
            <Text className="text-white text-label-large font-bold ml-1">
              SECURITY
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDevSkip}
            className="bg-warning/90 rounded-full px-3 py-2 flex-row items-center shadow-sm"
            activeOpacity={0.8}>
            <LucideIcons name="zap" size={16} color="white" />
            <Text className="text-white text-label-large font-bold ml-1">
              RESIDENT
            </Text>
          </TouchableOpacity>
        </View>
      }

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="items-center px-6 py-12">
          <View className="bg-primary/10 rounded-full w-24 h-24 items-center justify-center mb-6">
            <LucideIcons name="building" size={48} color="#6366f1" />
          </View>

          <Text className="text-display-large text-text-primary mb-4 text-center">
            Welcome to Aptly
          </Text>

          <Text className="text-body-large text-text-secondary text-center leading-7 mb-8">
            India&apos;s most trusted housing society management app. Simplify
            maintenance, billing, and community management.
          </Text>

          {/* Indian Context Badge */}
          <View className="bg-success/10 rounded-full px-4 py-2 mb-8">
            <Text className="text-success font-semibold">
              🇮🇳 Made for Indian Societies
            </Text>
          </View>
        </View>

        {/* Features Grid */}
        <View className="px-6 mb-8">
          <Text className="text-headline-large text-text-primary mb-6 text-center">
            Why Choose Aptly?
          </Text>

          <View className="space-y-4">
            {features.map((feature, index) => (
              <View
                key={index}
                className="bg-surface rounded-2xl p-6 border border-divider">
                <View className="flex-row items-center mb-3">
                  <View className="bg-primary/10 rounded-full w-16 h-16 items-center justify-center mr-4">
                    {feature.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="text-headline-medium text-text-primary mb-1">
                      {feature.title}
                    </Text>
                    <Text className="text-text-secondary leading-5">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Trusted By Section */}
        <View className="px-6 mb-8">
          <View className="bg-primary/5 rounded-2xl p-6">
            <Text className="text-primary font-bold text-headline-medium mb-3 text-center">
              Trusted by 10,000+ Residents
            </Text>
            <View className="flex-row justify-between items-center">
              <View className="items-center">
                <Text className="text-display-medium text-text-primary">
                  500+
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  Societies
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-display-medium text-text-primary">
                  50K+
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  Residents
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-display-medium text-text-primary">
                  4.8★
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  Rating
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View className="px-6 pb-8">
          <Button
            onPress={() => {
              console.log(
                '🔘 Welcome: Get Started button pressed - navigating to email-registration',
              );
              router.push({
                pathname: '/auth/email-registration',
                params: { mode: 'signup' },
              });
            }}
            className="mb-4">
            Get Started
          </Button>

          <TouchableOpacity
            onPress={() => {
              console.log(
                '🔘 Welcome: Sign In button pressed - navigating to email-registration',
              );
              router.push({
                pathname: '/auth/email-registration',
                params: { mode: 'signin' },
              });
            }}
            className="items-center py-3">
            <Text className="text-text-secondary">
              Already have an account?{' '}
              <Text className="text-primary font-semibold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Notice */}
        <View className="mx-6 mb-6">
          <HighlightCard title="Demo Mode" variant="warning" size="md">
            This is a demonstration version. In production, you would connect to
            your society&apos;s actual management system.
          </HighlightCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
