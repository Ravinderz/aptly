import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Users,
  DollarSign,
  Shield,
  Wrench,
  Bell,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { useAdmin } from '@/contexts/AdminContext';
import { adminTheme, adminStyles } from '@/utils/adminTheme';
import { AdminRole } from '@/types/admin';

interface DashboardStats {
  totalResidents: number;
  activeResidents: number;
  pendingRequests: number;
  emergencyAlerts: number;
  monthlyCollection: number;
  collectionRate: number;
  maintenanceRequests: {
    pending: number;
    completed: number;
    overdue: number;
  };
  visitorApprovals: {
    pending: number;
    today: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  color: string;
  permission?: string;
}

export const AdminDashboard: React.FC = () => {
  const { adminUser, activeSociety, checkPermission, currentMode } = useAdmin();

  // Mock dashboard stats - replace with actual API call
  const stats: DashboardStats = {
    totalResidents: activeSociety?.totalFlats || 120,
    activeResidents: activeSociety?.activeResidents || 95,
    pendingRequests: 12,
    emergencyAlerts: 0,
    monthlyCollection: 284750,
    collectionRate: 87.5,
    maintenanceRequests: {
      pending: 8,
      completed: 23,
      overdue: 3,
    },
    visitorApprovals: {
      pending: 15,
      today: 42,
    },
  };

  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [];

    // Common actions for all admin roles
    baseActions.push({
      id: 'notices',
      title: 'Send Notice',
      icon: <Bell size={20} color={adminTheme.textOnPrimary} />,
      onPress: () => console.log('Navigate to send notice'),
      color: adminTheme.primary,
      permission: 'communication',
    });

    // Role-specific actions
    if (
      adminUser?.role === 'community_manager' ||
      adminUser?.role === 'super_admin'
    ) {
      baseActions.push(
        {
          id: 'residents',
          title: 'Manage Residents',
          icon: <Users size={20} color={adminTheme.textOnPrimary} />,
          onPress: () => console.log('Navigate to resident management'),
          color: adminTheme.primary,
          permission: 'residents',
        },
        {
          id: 'emergency',
          title: 'Emergency Alert',
          icon: <AlertTriangle size={20} color={adminTheme.textOnPrimary} />,
          onPress: () => console.log('Declare emergency'),
          color: adminTheme.error,
          permission: 'emergency',
        },
      );
    }

    if (
      adminUser?.role === 'financial_manager' ||
      adminUser?.role === 'community_manager' ||
      adminUser?.role === 'super_admin'
    ) {
      baseActions.push({
        id: 'billing',
        title: 'Generate Bills',
        icon: <DollarSign size={20} color={adminTheme.textOnPrimary} />,
        onPress: () => console.log('Navigate to billing'),
        color: adminTheme.secondary,
        permission: 'billing',
      });
    }

    if (
      adminUser?.role === 'security_admin' ||
      adminUser?.role === 'community_manager' ||
      adminUser?.role === 'super_admin'
    ) {
      baseActions.push({
        id: 'visitors',
        title: 'Visitor Approvals',
        icon: <Shield size={20} color={adminTheme.textOnPrimary} />,
        onPress: () => console.log('Navigate to visitor approvals'),
        color: adminTheme.info,
        permission: 'visitors',
      });
    }

    if (
      adminUser?.role === 'maintenance_admin' ||
      adminUser?.role === 'community_manager' ||
      adminUser?.role === 'super_admin'
    ) {
      baseActions.push({
        id: 'maintenance',
        title: 'Maintenance',
        icon: <Wrench size={20} color={adminTheme.textOnPrimary} />,
        onPress: () => console.log('Navigate to maintenance'),
        color: adminTheme.warning,
        permission: 'maintenance',
      });
    }

    // Filter actions based on permissions
    return baseActions.filter(
      (action) =>
        !action.permission || checkPermission(action.permission, 'read'),
    );
  };

  const getRoleDisplayName = (role: AdminRole): string => {
    const roleNames = {
      super_admin: 'Super Administrator',
      community_manager: 'Community Manager',
      financial_manager: 'Financial Manager',
      security_admin: 'Security Administrator',
      maintenance_admin: 'Maintenance Administrator',
    };
    return roleNames[role] || role;
  };

  if (currentMode !== 'admin') {
    return null;
  }

  return (
    <ScrollView style={adminStyles.container}>
      {/* Header Section */}
      <View
        style={[adminStyles.adminCard, { marginTop: 8, marginHorizontal: 16 }]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View>
            <Text style={[adminStyles.adminHeading, { fontSize: 20 }]}>
              Welcome back, {adminUser?.name}
            </Text>
            <Text
              style={[
                adminStyles.adminCaption,
                { color: adminTheme.secondary },
              ]}>
              {getRoleDisplayName(adminUser?.role || 'community_manager')}
            </Text>
            <Text style={[adminStyles.adminCaption, { marginTop: 2 }]}>
              Managing {activeSociety?.name}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: adminTheme.secondary,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              alignItems: 'center',
            }}>
            <Text
              style={[
                adminStyles.adminCaption,
                {
                  color: adminTheme.textOnSecondary,
                  fontWeight: '700',
                },
              ]}>
              ADMIN MODE
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats Grid */}
      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <Text style={[adminStyles.adminSubheading, { marginBottom: 12 }]}>
          Society Overview
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={[adminStyles.adminCard, { flex: 1, minWidth: '47%' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Users size={24} color={adminTheme.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[adminStyles.adminHeading, { fontSize: 20 }]}>
                  {stats.activeResidents}
                </Text>
                <Text style={adminStyles.adminCaption}>Active Residents</Text>
                <Text
                  style={[
                    adminStyles.adminCaption,
                    { color: adminTheme.textTertiary },
                  ]}>
                  of {stats.totalResidents} total
                </Text>
              </View>
            </View>
          </View>

          <View style={[adminStyles.adminCard, { flex: 1, minWidth: '47%' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <DollarSign size={24} color={adminTheme.secondary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[adminStyles.adminHeading, { fontSize: 20 }]}>
                  {stats.collectionRate}%
                </Text>
                <Text style={adminStyles.adminCaption}>Collection Rate</Text>
                <Text
                  style={[
                    adminStyles.adminCaption,
                    { color: adminTheme.textTertiary },
                  ]}>
                  ₹{(stats.monthlyCollection / 1000).toFixed(0)}k this month
                </Text>
              </View>
            </View>
          </View>

          <View style={[adminStyles.adminCard, { flex: 1, minWidth: '47%' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={24} color={adminTheme.warning} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[adminStyles.adminHeading, { fontSize: 20 }]}>
                  {stats.pendingRequests}
                </Text>
                <Text style={adminStyles.adminCaption}>Pending Tasks</Text>
                <Text
                  style={[
                    adminStyles.adminCaption,
                    { color: adminTheme.textTertiary },
                  ]}>
                  Requires attention
                </Text>
              </View>
            </View>
          </View>

          <View style={[adminStyles.adminCard, { flex: 1, minWidth: '47%' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AlertTriangle
                size={24}
                color={
                  stats.emergencyAlerts > 0
                    ? adminTheme.error
                    : adminTheme.success
                }
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[adminStyles.adminHeading, { fontSize: 20 }]}>
                  {stats.emergencyAlerts}
                </Text>
                <Text style={adminStyles.adminCaption}>Emergency Alerts</Text>
                <Text
                  style={[
                    adminStyles.adminCaption,
                    {
                      color:
                        stats.emergencyAlerts > 0
                          ? adminTheme.error
                          : adminTheme.success,
                    },
                  ]}>
                  {stats.emergencyAlerts > 0 ? 'Active alerts' : 'All clear'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text style={[adminStyles.adminSubheading, { marginBottom: 12 }]}>
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {getQuickActions().map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                adminStyles.adminCard,
                {
                  flex: 1,
                  minWidth: '47%',
                  backgroundColor: action.color,
                  paddingVertical: 20,
                },
              ]}
              onPress={action.onPress}
              activeOpacity={0.8}>
              <View style={{ alignItems: 'center' }}>
                {action.icon}
                <Text
                  style={[
                    adminStyles.adminLabel,
                    {
                      color: adminTheme.textOnPrimary,
                      marginTop: 8,
                      textAlign: 'center',
                    },
                  ]}>
                  {action.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Maintenance Overview - visible to maintenance admins and CMs */}
      {(adminUser?.role === 'maintenance_admin' ||
        adminUser?.role === 'community_manager' ||
        adminUser?.role === 'super_admin') && (
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={[adminStyles.adminSubheading, { marginBottom: 12 }]}>
            Maintenance Status
          </Text>
          <View style={adminStyles.adminCard}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text
                  style={[
                    adminStyles.adminHeading,
                    { color: adminTheme.warning, fontSize: 18 },
                  ]}>
                  {stats.maintenanceRequests.pending}
                </Text>
                <Text
                  style={[adminStyles.adminCaption, { textAlign: 'center' }]}>
                  Pending
                </Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text
                  style={[
                    adminStyles.adminHeading,
                    { color: adminTheme.success, fontSize: 18 },
                  ]}>
                  {stats.maintenanceRequests.completed}
                </Text>
                <Text
                  style={[adminStyles.adminCaption, { textAlign: 'center' }]}>
                  Completed
                </Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text
                  style={[
                    adminStyles.adminHeading,
                    { color: adminTheme.error, fontSize: 18 },
                  ]}>
                  {stats.maintenanceRequests.overdue}
                </Text>
                <Text
                  style={[adminStyles.adminCaption, { textAlign: 'center' }]}>
                  Overdue
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View
              style={{
                backgroundColor: adminTheme.surfaceElevated,
                height: 8,
                borderRadius: 4,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  backgroundColor: adminTheme.success,
                  height: '100%',
                  width: `${(stats.maintenanceRequests.completed / (stats.maintenanceRequests.completed + stats.maintenanceRequests.pending + stats.maintenanceRequests.overdue)) * 100}%`,
                }}
              />
            </View>
          </View>
        </View>
      )}

      {/* Visitor Overview - visible to security admins and CMs */}
      {(adminUser?.role === 'security_admin' ||
        adminUser?.role === 'community_manager' ||
        adminUser?.role === 'super_admin') && (
        <View
          style={{ paddingHorizontal: 16, marginTop: 24, marginBottom: 24 }}>
          <Text style={[adminStyles.adminSubheading, { marginBottom: 12 }]}>
            Visitor Management
          </Text>
          <View style={adminStyles.adminCard}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View>
                <Text
                  style={[
                    adminStyles.adminHeading,
                    { color: adminTheme.warning },
                  ]}>
                  {stats.visitorApprovals.pending}
                </Text>
                <Text style={adminStyles.adminCaption}>Pending Approvals</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={[
                    adminStyles.adminBody,
                    { color: adminTheme.textSecondary },
                  ]}>
                  {stats.visitorApprovals.today} approved today
                </Text>
                <TouchableOpacity
                  style={[
                    adminStyles.adminSecondaryButton,
                    { marginTop: 8, paddingHorizontal: 12, paddingVertical: 6 },
                  ]}
                  onPress={() => console.log('Navigate to visitor approvals')}>
                  <Text
                    style={[
                      adminStyles.adminLabel,
                      { color: adminTheme.primary },
                    ]}>
                    Review All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default AdminDashboard;
