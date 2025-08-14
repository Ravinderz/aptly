import React from 'react';
import { View, Text } from 'react-native';
import { Users, Calendar, Clock, MapPin } from 'lucide-react-native';
import { Card } from './ui/Card';
import SectionHeading from './ui/SectionHeading';

export const SocietyOverview: React.FC = () => {
  // Mock data for resident-focused information
  const societyInfo = {
    name: 'Green Valley Apartments',
    totalFlats: 120,
    nextEvent: 'Society Meeting',
    eventDate: 'Jan 25, 2025',
    maintenanceWindow: '10 AM - 2 PM',
    emergencyContact: '+91 98765 43210',
  };

  return (
    <View className="mb-6">
      <SectionHeading
        heading="Society Info"
        handleViewAll={() => console.log('View society details')}
      />

      <Card>
        {/* Society Basic Info */}
        <View className="mb-4">
          <Text className="text-headline-medium text-text-primary mb-1">
            {societyInfo.name}
          </Text>
          <View className="flex-row items-center">
            <MapPin size={16} className="text-text-secondary" />
            <Text className="text-text-secondary text-body-medium ml-1">
              {societyInfo.totalFlats} flats • Sector 12, Noida
            </Text>
          </View>
        </View>

        <View className="h-px bg-divider mb-4" />

        {/* Next Event */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mr-3">
              <Calendar size={16} className="text-primary" />
            </View>
            <View>
              <Text className="text-text-primary font-medium">
                {societyInfo.nextEvent}
              </Text>
              <Text className="text-text-secondary text-body-medium">
                {societyInfo.eventDate}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-px bg-divider mb-4" />

        {/* Maintenance Hours */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-lg bg-secondary/10 items-center justify-center mr-3">
              <Clock size={16} className="text-secondary" />
            </View>
            <View>
              <Text className="text-text-primary font-medium">
                Maintenance Hours
              </Text>
              <Text className="text-text-secondary text-body-medium">
                {societyInfo.maintenanceWindow}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-px bg-divider mb-4" />

        {/* Emergency Contact */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-lg bg-error/10 items-center justify-center mr-3">
              <Users size={16} className="text-error" />
            </View>
            <View>
              <Text className="text-text-primary font-medium">
                Emergency Contact
              </Text>
              <Text className="text-text-secondary text-body-medium">
                {societyInfo.emergencyContact}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
};

export default SocietyOverview;
