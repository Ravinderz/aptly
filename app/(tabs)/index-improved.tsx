import React from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { Building2, Clock, TrendingUp } from 'lucide-react-native';

// Components
import HomeHeader from '@/components/HomeHeader';
import QuickActions from '@/components/QuickActions';
import AlertCard from '@/components/AlertCard';
import UpcomingVisitorSection from '@/components/UpcomingVisitorSection';
import WeatherWidget from '@/components/WeatherWidget';
import SocietyOverview from '@/components/SocietyOverview';
import DashboardCard from '@/components/ui/DashboardCard';
import { Card } from '@/components/ui/Card';

export default function ImprovedHomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Mock data for user-specific widgets
  const userStats = {
    pendingBills: 2,
    maintenanceRequests: 1,
    nextPayment: '₹4,500',
    dueDate: 'Jan 15'
  };

  return (
    <View className="flex-1 bg-background">
      <HomeHeader />
      
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4 space-y-6">
          {/* Welcome Section with Weather */}
          <View className="space-y-4">
            <View>
              <Text className="text-2xl font-bold text-text-primary">
                Good Morning! 👋
              </Text>
              <Text className="text-text-secondary text-sm">
                Welcome back to Green Valley Apartments
              </Text>
            </View>
            <WeatherWidget />
          </View>

          {/* Personal Dashboard */}
          <View>
            <Text className="text-lg font-semibold text-text-primary mb-3">
              Your Dashboard
            </Text>
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <DashboardCard
                  title="Pending Bills"
                  value={userStats.pendingBills}
                  subtitle="Due this month"
                  icon={<Clock size={16} color="#6366f1" />}
                  onPress={() => console.log('Navigate to bills')}
                />
              </View>
              <View className="flex-1">
                <DashboardCard
                  title="Maintenance"
                  value={userStats.maintenanceRequests}
                  subtitle="Active requests"
                  icon={<Building2 size={16} color="#6366f1" />}
                  onPress={() => console.log('Navigate to maintenance')}
                />
              </View>
            </View>
            
            {/* Next Payment Card */}
            <Card className="bg-primary/5 border-primary/20">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-text-secondary text-sm">
                    Next Payment Due
                  </Text>
                  <Text className="text-2xl font-bold text-primary mt-1">
                    {userStats.nextPayment}
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    Due on {userStats.dueDate}
                  </Text>
                </View>
                <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                  <TrendingUp size={20} color="#6366f1" />
                </View>
              </View>
            </Card>
          </View>

          {/* Quick Actions */}
          <QuickActions />

          {/* Society Overview */}
          <SocietyOverview />

          {/* Upcoming Visitors */}
          <UpcomingVisitorSection />

          {/* Notices/Alerts */}
          <AlertCard />

          {/* Recent Activity */}
          <View>
            <Text className="text-lg font-semibold text-text-primary mb-3 mx-2">
              Recent Activity
            </Text>
            <Card>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-secondary rounded-full mr-3" />
                  <View className="flex-1">
                    <Text className="text-text-primary font-medium">
                      Maintenance request completed
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      Plumbing issue - A-301 • 2 hours ago
                    </Text>
                  </View>
                </View>
                
                <View className="h-px bg-divider" />
                
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-primary rounded-full mr-3" />
                  <View className="flex-1">
                    <Text className="text-text-primary font-medium">
                      New notice posted
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      Society meeting scheduled • 4 hours ago
                    </Text>
                  </View>
                </View>
                
                <View className="h-px bg-divider" />
                
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-warning rounded-full mr-3" />
                  <View className="flex-1">
                    <Text className="text-text-primary font-medium">
                      Payment reminder
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      Monthly maintenance due • 1 day ago
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}