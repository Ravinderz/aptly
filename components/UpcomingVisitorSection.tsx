import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import SectionHeading from './ui/SectionHeading';
import VisitorListCard from './ui/VisitorListCard';

const UpcomingVisitorSection = () => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/(tabs)/visitor');
  };

  const handleVisitorPress = () => {
    router.push('/(tabs)/visitor');
  };

  const handleApprove = (visitorName: string) => {
    console.log('Approve visitor:', visitorName);
    // TODO: Implement approve functionality
  };

  const handleDeny = (visitorName: string) => {
    console.log('Deny visitor:', visitorName);
    // TODO: Implement deny functionality
  };

  // Sample upcoming visitors data
  const upcomingVisitors = [
    {
      id: '1',
      name: 'Amazon Delivery',
      date: 'Today',
      time: '2:30 PM',
      status: 'Expected' as const,
      category: 'Delivery',
      purpose: 'Package delivery',
    },
  ];

  return (
    <View className="mb-6">
      <SectionHeading
        heading="Upcoming Visitors"
        handleViewAll={handleViewAll}
      />
      <ScrollView
        contentContainerStyle={{
          gap: 12,
          paddingVertical: 2,
        }}
        showsVerticalScrollIndicator={false}>
        {upcomingVisitors.map((visitor) => (
          <VisitorListCard
            key={visitor.id}
            name={visitor.name}
            date={visitor.date}
            time={visitor.time}
            status={visitor.status}
            category={visitor.category}
            purpose={visitor.purpose}
            onApprove={() => handleApprove(visitor.name)}
            onDeny={() => handleDeny(visitor.name)}
            onPress={handleVisitorPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default UpcomingVisitorSection;
