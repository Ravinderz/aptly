import HighlightCard from '@/components/ui/HighlightCard';
import { StackHeader } from '@/components/ui/headers';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Car,
  Home,
  MessageCircle,
  Phone,
  Shield,
  Snowflake,
  TreePine,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Service categories with icons and descriptions
const serviceCategories = [
  {
    id: 'plumbing',
    title: 'Plumbing Services',
    description: 'Bathroom, Kitchen, Water Systems',
    icon: <Wrench size={20} color="#6366f1" />,
    vendorCount: 12,
    avgRating: 4.3,
  },
  {
    id: 'electrical',
    title: 'Electrical Services',
    description: 'Wiring, Lighting, Power Issues',
    icon: <Zap size={20} color="#6366f1" />,
    vendorCount: 8,
    avgRating: 4.5,
  },
  {
    id: 'home-services',
    title: 'Home Services',
    description: 'Cleaning, Pest Control, Repairs',
    icon: <Home size={20} color="#6366f1" />,
    vendorCount: 15,
    avgRating: 4.2,
  },
  {
    id: 'ac-appliances',
    title: 'AC & Appliances',
    description: 'AC Service, Appliance Repair',
    icon: <Snowflake size={20} color="#6366f1" />,
    vendorCount: 6,
    avgRating: 4.4,
  },
  {
    id: 'delivery',
    title: 'Delivery & Logistics',
    description: 'Gas, Grocery, Moving Services',
    icon: <Truck size={20} color="#6366f1" />,
    vendorCount: 20,
    avgRating: 4.1,
  },
  {
    id: 'security',
    title: 'Security Services',
    description: 'CCTV, Locks, Safety Systems',
    icon: <Shield size={20} color="#6366f1" />,
    vendorCount: 4,
    avgRating: 4.6,
  },
  {
    id: 'gardening',
    title: 'Gardening & Landscaping',
    description: 'Plant Care, Garden Maintenance',
    icon: <TreePine size={20} color="#6366f1" />,
    vendorCount: 7,
    avgRating: 4.3,
  },
  {
    id: 'vehicle',
    title: 'Vehicle Services',
    description: 'Car Wash, Mechanic, Fuel',
    icon: <Car size={20} color="#6366f1" />,
    vendorCount: 9,
    avgRating: 4.0,
  },
];

// Emergency contacts
const emergencyContacts = [
  {
    title: 'Society Electrician',
    name: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    status: 'Available',
    specialization: '24/7 Electrical Emergency',
  },
  {
    title: 'Society Plumber',
    name: 'Suresh Sharma',
    phone: '+91 97654 32109',
    status: 'Available',
    specialization: 'Water Systems & Leakage',
  },
  {
    title: 'Security Control Room',
    name: 'Security Desk',
    phone: '+91 96543 21098',
    status: 'Online',
    specialization: 'Emergency Response',
  },
  {
    title: 'Management Office',
    name: 'Green Valley Office',
    phone: '+91 95432 10987',
    status: 'Office Hours',
    specialization: '9 AM - 6 PM',
  },
];

interface ServiceCategoryCardProps {
  category: (typeof serviceCategories)[0];
  onPress: () => void;
  testID?: string;
}

const ServiceCategoryCard: React.FC<ServiceCategoryCardProps> = ({
  category,
  onPress,
  testID,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-surface rounded-xl p-5 mb-4 border border-divider shadow-sm shadow-black/5"
    activeOpacity={0.7}
    testID={testID}>
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="bg-primary/10 rounded-full w-16 h-16 items-center justify-center mr-4">
          {category.icon}
        </View>
        <View className="flex-1">
          <Text className="text-headline-medium font-semibold text-text-primary mb-2">
            {category.title}
          </Text>
          <Text className="text-body-medium text-text-secondary mb-3">
            {category.description}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-label-large text-primary font-semibold mr-4">
              {category.vendorCount} vendors
            </Text>
            <View className="flex-row items-center">
              <Text className="text-label-large text-secondary font-semibold mr-1">
                ⭐ {category.avgRating}
              </Text>
              <Text className="text-label-large text-text-secondary">
                avg rating
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="ml-3">
        <Text className="text-text-secondary">→</Text>
      </View>
    </View>
  </TouchableOpacity>
);

interface EmergencyContactCardProps {
  contact: (typeof emergencyContacts)[0];
  testID?: string;
}

const EmergencyContactCard: React.FC<EmergencyContactCardProps> = ({
  contact,
  testID,
}) => {
  const handleCall = () => {
    Linking.openURL(`tel:${contact.phone}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(
      `whatsapp://send?phone=${contact.phone.replace(/\s/g, '')}`,
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
      case 'Online':
        return 'text-secondary';
      case 'Office Hours':
        return 'text-warning';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <View
      className="bg-surface rounded-xl p-5 mb-4 border border-divider"
      testID={testID}>
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-headline-medium font-semibold text-text-primary mb-1">
            {contact.title}
          </Text>
          <Text className="text-body-medium text-text-secondary mb-1">
            {contact.name}
          </Text>
          <Text
            className={`text-body-medium font-medium ${getStatusColor(contact.status)}`}>
            ● {contact.status}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleCall}
            className="bg-primary rounded-full w-12 h-12 items-center justify-center"
            testID={testID ? `${testID}.call-button` : undefined}>
            <Phone size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleWhatsApp}
            className="bg-secondary rounded-full w-12 h-12 items-center justify-center"
            testID={testID ? `${testID}.whatsapp-button` : undefined}>
            <MessageCircle size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-body-medium text-text-secondary">
        {contact.specialization}
      </Text>
    </View>
  );
};

export default function VendorDirectory() {
  const router = useRouter();
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/services/vendors/${categoryId}`);
  };

  const displayedCategories = showAllCategories
    ? serviceCategories
    : serviceCategories.slice(0, 4);

  return (
    <View className="flex-1 bg-background" testID="services.vendors.screen">
      <StackHeader
        title="Vendor Directory"
        subtitle="Find trusted service providers"
        showBackButton={true}
        testID="services.vendors.header"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        testID="services.vendors.scroll">
        {/* Emergency Contacts Section */}
        <View
          className="px-6 mb-8"
          testID="services.vendors.emergency-contacts">
          <View
            className="flex-row items-center mb-4"
            testID="services.vendors.emergency-contacts.header">
            <AlertTriangle size={24} color="#D32F2F" />
            <Text
              className="text-headline-large font-semibold text-text-primary ml-2"
              testID="services.vendors.emergency-contacts.title">
              Emergency Contacts
            </Text>
          </View>
          {emergencyContacts.map((contact, index) => (
            <EmergencyContactCard
              key={index}
              contact={contact}
              testID={`services.vendors.emergency-contact.${index}`}
            />
          ))}
        </View>

        {/* Vendor Safety Notice */}
        <View className="px-6 mb-6">
          <HighlightCard
            title="Verified Vendors Only"
            variant="success"
            size="sm">
            <Text className="text-text-secondary leading-5">
              All vendors are verified with background checks. Always confirm
              rates before work begins.
            </Text>
          </HighlightCard>
        </View>

        {/* Service Categories Section */}
        <View className="px-6" testID="services.vendors.categories">
          <Text
            className="text-headline-large font-semibold text-text-primary mb-4"
            testID="services.vendors.categories.title">
            Service Categories
          </Text>

          {displayedCategories.map((category) => (
            <ServiceCategoryCard
              key={category.id}
              category={category}
              onPress={() => handleCategoryPress(category.id)}
              testID={`services.vendors.category.${category.id}`}
            />
          ))}

          {!showAllCategories && serviceCategories.length > 4 && (
            <TouchableOpacity
              onPress={() => setShowAllCategories(true)}
              className="bg-primary/10 rounded-xl p-4 items-center"
              testID="services.vendors.view-all-button">
              <Text className="text-primary font-semibold text-body-large">
                View All Categories ({serviceCategories.length - 4} more)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
