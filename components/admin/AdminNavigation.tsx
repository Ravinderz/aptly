import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  Home,
  Users,
  DollarSign,
  Shield,
  Wrench,
  Bell,
  Settings,
  BarChart3,
  FileText,
  AlertTriangle,
  UserPlus,
  Building,
  Calendar,
  MessageSquare,
  Eye,
  ChevronRight,
} from 'lucide-react-native';
import { useAdmin } from '@/contexts/AdminContext';
import { adminTheme, adminStyles } from '@/utils/adminTheme';
import { AdminRole } from '@/types/admin';

interface NavigationItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  badge?: number;
  permission?: string;
  roles?: AdminRole[];
  color?: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const AdminNavigation: React.FC<{
  onNavigate?: (screen: string) => void;
}> = ({ onNavigate }) => {
  const { adminUser, checkPermission, currentMode } = useAdmin();

  if (currentMode !== 'admin') {
    return null;
  }

  const handleNavigate = (screen: string) => {
    if (onNavigate) {
      onNavigate(screen);
    } else {
      console.log(`Navigate to: ${screen}`);
    }
  };

  const getNavigationSections = (): NavigationSection[] => {
    const sections: NavigationSection[] = [
      {
        title: 'Dashboard',
        items: [
          {
            id: 'dashboard',
            title: 'Admin Dashboard',
            subtitle: 'Overview and quick actions',
            icon: <Home size={20} color={adminTheme.primary} />,
            onPress: () => handleNavigate('admin-dashboard'),
          },
          {
            id: 'analytics',
            title: 'Analytics',
            subtitle: 'Reports and insights',
            icon: <BarChart3 size={20} color={adminTheme.info} />,
            onPress: () => handleNavigate('admin-analytics'),
            permission: 'analytics',
          },
        ],
      },
    ];

    // Resident Management (CM, Super Admin)
    if (
      adminUser?.role === 'community_manager' ||
      adminUser?.role === 'super_admin'
    ) {
      sections.push({
        title: 'Resident Management',
        items: [
          {
            id: 'residents',
            title: 'All Residents',
            subtitle: 'Manage resident profiles',
            icon: <Users size={20} color={adminTheme.primary} />,
            onPress: () => handleNavigate('residents'),
            permission: 'residents',
          },
          {
            id: 'add-resident',
            title: 'Add New Resident',
            subtitle: 'Onboard new residents',
            icon: <UserPlus size={20} color={adminTheme.success} />,
            onPress: () => handleNavigate('add-resident'),
            permission: 'residents',
          },
          {
            id: 'flat-management',
            title: 'Flat Management',
            subtitle: 'Manage flat assignments',
            icon: <Building size={20} color={adminTheme.secondary} />,
            onPress: () => handleNavigate('flat-management'),
            permission: 'residents',
          },
        ],
      });
    }

    // Financial Management
    if (
      adminUser?.role === 'financial_manager' ||
      adminUser?.role === 'community_manager' ||
      adminUser?.role === 'super_admin'
    ) {
      sections.push({
        title: 'Financial Management',
        items: [
          {
            id: 'billing',
            title: 'Billing & Invoices',
            subtitle: 'Generate and manage bills',
            icon: <DollarSign size={20} color={adminTheme.secondary} />,
            onPress: () => handleNavigate('admin-billing'),
            permission: 'billing',
            badge: 5,
          },
          {
            id: 'payments',
            title: 'Payment Tracking',
            subtitle: 'Monitor collections',
            icon: <FileText size={20} color={adminTheme.success} />,
            onPress: () => handleNavigate('payment-tracking'),
            permission: 'billing',
          },
          {
            id: 'financial-reports',
            title: 'Financial Reports',
            subtitle: 'Monthly and annual reports',
            icon: <BarChart3 size={20} color={adminTheme.info} />,
            onPress: () => handleNavigate('financial-reports'),
            permission: 'billing',
          },
        ],
      });
    }

    // Security & Visitor Management
    if (
      adminUser?.role === 'security_admin' ||
      adminUser?.role === 'community_manager' ||
      adminUser?.role === 'super_admin'
    ) {
      sections.push({
        title: 'Security Management',
        items: [
          {
            id: 'visitor-approvals',
            title: 'Visitor Approvals',
            subtitle: 'Review pending visitors',
            icon: <Shield size={20} color={adminTheme.info} />,
            onPress: () => handleNavigate('visitor-approvals'),
            permission: 'visitors',
            badge: 12,
          },
          {
            id: 'security-logs',
            title: 'Security Logs',
            subtitle: 'Access and incident logs',
            icon: <Eye size={20} color={adminTheme.slate} />,
            onPress: () => handleNavigate('security-logs'),
            permission: 'security',
          },
          {
            id: 'emergency-management',
            title: 'Emergency Management',
            subtitle: 'Handle emergencies',
            icon: <AlertTriangle size={20} color={adminTheme.error} />,
            onPress: () => handleNavigate('emergency-management'),
            permission: 'emergency',
          },
        ],
      });
    }

    // Maintenance Management
    if (
      adminUser?.role === 'maintenance_admin' ||
      adminUser?.role === 'community_manager' ||
      adminUser?.role === 'super_admin'
    ) {
      sections.push({
        title: 'Maintenance Management',
        items: [
          {
            id: 'maintenance-requests',
            title: 'Maintenance Requests',
            subtitle: 'Review and assign tasks',
            icon: <Wrench size={20} color={adminTheme.warning} />,
            onPress: () => handleNavigate('maintenance-requests'),
            permission: 'maintenance',
            badge: 8,
          },
          {
            id: 'vendor-management',
            title: 'Vendor Management',
            subtitle: 'Manage service providers',
            icon: <Users size={20} color={adminTheme.secondary} />,
            onPress: () => handleNavigate('vendor-management'),
            permission: 'vendors',
          },
          {
            id: 'maintenance-schedule',
            title: 'Maintenance Schedule',
            subtitle: 'Plan routine maintenance',
            icon: <Calendar size={20} color={adminTheme.info} />,
            onPress: () => handleNavigate('maintenance-schedule'),
            permission: 'maintenance',
          },
        ],
      });
    }

    // Communication & Notices (All admin roles)
    sections.push({
      title: 'Communication',
      items: [
        {
          id: 'notices',
          title: 'Society Notices',
          subtitle: 'Create and manage notices',
          icon: <Bell size={20} color={adminTheme.primary} />,
          onPress: () => handleNavigate('admin-notices'),
          permission: 'communication',
        },
        {
          id: 'broadcasts',
          title: 'Broadcast Messages',
          subtitle: 'Send mass notifications',
          icon: <MessageSquare size={20} color={adminTheme.info} />,
          onPress: () => handleNavigate('broadcast-messages'),
          permission: 'communication',
        },
      ],
    });

    // Super Admin Only
    if (adminUser?.role === 'super_admin') {
      sections.push({
        title: 'Super Admin',
        items: [
          {
            id: 'society-management',
            title: 'Society Management',
            subtitle: 'Manage all societies',
            icon: <Building size={20} color={adminTheme.primary} />,
            onPress: () => handleNavigate('society-management'),
          },
          {
            id: 'admin-management',
            title: 'Admin Management',
            subtitle: 'Assign and revoke roles',
            icon: <Users size={20} color={adminTheme.secondary} />,
            onPress: () => handleNavigate('admin-management'),
          },
          {
            id: 'platform-analytics',
            title: 'Platform Analytics',
            subtitle: 'Cross-society insights',
            icon: <BarChart3 size={20} color={adminTheme.success} />,
            onPress: () => handleNavigate('platform-analytics'),
          },
        ],
      });
    }

    // Settings (All admin roles)
    sections.push({
      title: 'Settings',
      items: [
        {
          id: 'admin-settings',
          title: 'Admin Settings',
          subtitle: 'Configure admin preferences',
          icon: <Settings size={20} color={adminTheme.slate} />,
          onPress: () => handleNavigate('admin-settings'),
        },
        {
          id: 'audit-logs',
          title: 'Audit Logs',
          subtitle: 'View activity history',
          icon: <FileText size={20} color={adminTheme.slate} />,
          onPress: () => handleNavigate('audit-logs'),
          permission: 'audit',
        },
      ],
    });

    // Filter items based on permissions
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            !item.permission || checkPermission(item.permission, 'read'),
        ),
      }))
      .filter((section) => section.items.length > 0);
  };

  const NavigationItemComponent: React.FC<{ item: NavigationItem }> = ({
    item,
  }) => (
    <TouchableOpacity
      style={[
        adminStyles.adminCard,
        {
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 16,
        },
      ]}
      onPress={item.onPress}
      activeOpacity={0.8}>
      <View style={{ marginRight: 12 }}>{item.icon}</View>

      <View style={{ flex: 1 }}>
        <Text style={[adminStyles.adminLabel, { fontSize: 15 }]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={[adminStyles.adminCaption, { marginTop: 2 }]}>
            {item.subtitle}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.badge !== undefined && item.badge > 0 && (
          <View
            style={{
              backgroundColor: adminTheme.error,
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
              paddingHorizontal: 6,
            }}>
            <Text
              style={[
                adminStyles.adminCaption,
                {
                  color: adminTheme.textInverse,
                  fontWeight: '700',
                  fontSize: 11,
                },
              ]}>
              {item.badge > 99 ? '99+' : item.badge}
            </Text>
          </View>
        )}

        <ChevronRight size={16} color={adminTheme.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  const sections = getNavigationSections();

  return (
    <ScrollView
      style={adminStyles.container}
      showsVerticalScrollIndicator={false}>
      <View style={{ padding: 16 }}>
        {sections.map((section, index) => (
          <View
            key={section.title}
            style={{ marginBottom: index < sections.length - 1 ? 24 : 8 }}>
            <Text
              style={[
                adminStyles.adminSubheading,
                {
                  marginBottom: 12,
                  color: adminTheme.textSecondary,
                  fontSize: 16,
                },
              ]}>
              {section.title}
            </Text>

            {section.items.map((item) => (
              <NavigationItemComponent key={item.id} item={item} />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Quick navigation bar for bottom/side navigation
export const QuickAdminNav: React.FC<{
  onNavigate?: (screen: string) => void;
}> = ({ onNavigate }) => {
  const { adminUser, checkPermission, currentMode } = useAdmin();

  if (currentMode !== 'admin') {
    return null;
  }

  const handleNavigate = (screen: string) => {
    if (onNavigate) {
      onNavigate(screen);
    } else {
      console.log(`Navigate to: ${screen}`);
    }
  };

  const getQuickNavItems = () => {
    const items = [
      {
        id: 'dashboard',
        icon: <Home size={20} color={adminTheme.textInverse} />,
        onPress: () => handleNavigate('admin-dashboard'),
      },
    ];

    if (checkPermission('residents', 'read')) {
      items.push({
        id: 'residents',
        icon: <Users size={20} color={adminTheme.textInverse} />,
        onPress: () => handleNavigate('residents'),
      });
    }

    if (checkPermission('billing', 'read')) {
      items.push({
        id: 'billing',
        icon: <DollarSign size={20} color={adminTheme.textInverse} />,
        onPress: () => handleNavigate('admin-billing'),
      });
    }

    if (checkPermission('visitors', 'read')) {
      items.push({
        id: 'visitors',
        icon: <Shield size={20} color={adminTheme.textInverse} />,
        onPress: () => handleNavigate('visitor-approvals'),
      });
    }

    if (checkPermission('maintenance', 'read')) {
      items.push({
        id: 'maintenance',
        icon: <Wrench size={20} color={adminTheme.textInverse} />,
        onPress: () => handleNavigate('maintenance-requests'),
      });
    }

    return items;
  };

  const quickNavItems = getQuickNavItems();

  return (
    <View
      style={[
        adminStyles.adminTabBar,
        {
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: 12,
        },
      ]}>
      {quickNavItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={adminStyles.adminTabItem}
          onPress={item.onPress}
          activeOpacity={0.7}>
          {item.icon}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default AdminNavigation;
