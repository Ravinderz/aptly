import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Home, 
  Users, 
  DollarSign, 
  Shield, 
  Settings, 
  BarChart3,
  Bell,
  FileText,
  UserCheck,
  Building2,
  AlertTriangle,
  Activity,
  CreditCard,
  Eye,
  Vote,
  Gavel
} from 'lucide-react-native';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminRole } from '@/types/admin';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  route: string;
  requiredPermissions: {
    resource: string;
    action: string;
  }[];
  requiredRoles?: AdminRole[];
  badge?: number;
  color?: string;
  description?: string;
  category: 'primary' | 'management' | 'analytics' | 'governance';
}

interface DynamicNavigationProps {
  onNavigate: (route: string) => void;
  currentRoute?: string;
  layout?: 'grid' | 'list';
  showCategories?: boolean;
  compactMode?: boolean;
}

const DynamicNavigation: React.FC<DynamicNavigationProps> = ({
  onNavigate,
  currentRoute,
  layout = 'grid',
  showCategories = true,
  compactMode = false
}) => {
  const { checkPermission, adminUser, currentMode } = useAdmin();

  const allNavigationItems: NavigationItem[] = [
    // Primary Dashboard
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      route: '/admin/dashboard',
      requiredPermissions: [],
      category: 'primary',
      color: '#6366f1',
      description: 'Main admin dashboard'
    },
    
    // Resident Management
    {
      id: 'residents',
      title: 'Residents',
      icon: Users,
      route: '/admin/residents',
      requiredPermissions: [{ resource: 'residents', action: 'read' }],
      category: 'management',
      color: '#4CAF50',
      description: 'Manage society residents'
    },
    
    // Financial Management
    {
      id: 'billing',
      title: 'Billing',
      icon: DollarSign,
      route: '/admin/billing',
      requiredPermissions: [{ resource: 'billing', action: 'read' }],
      category: 'management',
      color: '#2196F3',
      description: 'Financial management'
    },
    {
      id: 'financial_reports',
      title: 'Financial Reports',
      icon: BarChart3,
      route: '/admin/financial-reports',
      requiredPermissions: [{ resource: 'billing', action: 'export' }],
      requiredRoles: ['financial_manager', 'community_manager', 'super_admin'],
      category: 'analytics',
      color: '#2196F3',
      description: 'Financial analytics and reports'
    },
    {
      id: 'payment_tracking',
      title: 'Payment Tracking',
      icon: CreditCard,
      route: '/admin/payment-tracking',
      requiredPermissions: [{ resource: 'billing', action: 'read' }],
      requiredRoles: ['financial_manager', 'community_manager', 'super_admin'],
      category: 'management',
      color: '#4CAF50',
      description: 'Track and reconcile payments'
    },
    
    // Security & Visitor Management
    {
      id: 'visitors',
      title: 'Visitors',
      icon: Shield,
      route: '/admin/visitors',
      requiredPermissions: [{ resource: 'visitors', action: 'read' }],
      category: 'management',
      color: '#FF9800',
      description: 'Visitor management and security'
    },
    {
      id: 'security_incidents',
      title: 'Security Incidents',
      icon: AlertTriangle,
      route: '/admin/security-incidents',
      requiredPermissions: [{ resource: 'visitors', action: 'approve' }],
      requiredRoles: ['security_admin', 'community_manager', 'super_admin'],
      category: 'management',
      color: '#F44336',
      description: 'Security incident management',
      badge: 2
    },
    {
      id: 'access_logs',
      title: 'Access Logs',
      icon: Activity,
      route: '/admin/access-logs',
      requiredPermissions: [{ resource: 'visitors', action: 'read' }],
      requiredRoles: ['security_admin', 'community_manager', 'super_admin'],
      category: 'analytics',
      color: '#9C27B0',
      description: 'View access and activity logs'
    },
    
    // Maintenance Management
    {
      id: 'maintenance',
      title: 'Maintenance',
      icon: Settings,
      route: '/admin/maintenance',
      requiredPermissions: [{ resource: 'maintenance', action: 'read' }],
      category: 'management',
      color: '#607D8B',
      description: 'Maintenance request management'
    },
    
    // Communication & Notices
    {
      id: 'notices',
      title: 'Notices',
      icon: Bell,
      route: '/admin/notices',
      requiredPermissions: [{ resource: 'notices', action: 'create' }],
      category: 'management',
      color: '#FF5722',
      description: 'Society notices and announcements'
    },
    
    // Analytics & Reports
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      route: '/admin/analytics',
      requiredPermissions: [{ resource: 'analytics', action: 'read' }],
      category: 'analytics',
      color: '#3F51B5',
      description: 'Society performance analytics'
    },
    {
      id: 'audit_logs',
      title: 'Audit Logs',
      icon: Eye,
      route: '/admin/audit-logs',
      requiredPermissions: [{ resource: 'audit_logs', action: 'read' }],
      requiredRoles: ['community_manager', 'super_admin'],
      category: 'analytics',
      color: '#795548',
      description: 'System audit and activity logs'
    },
    
    // Team Management
    {
      id: 'team_management',
      title: 'Team Management',
      icon: UserCheck,
      route: '/admin/team',
      requiredPermissions: [{ resource: 'team_management', action: 'read' }],
      requiredRoles: ['community_manager', 'super_admin'],
      category: 'management',
      color: '#8BC34A',
      description: 'Manage admin team and roles'
    },
    
    // Governance & Voting
    {
      id: 'voting',
      title: 'Voting',
      icon: Vote,
      route: '/admin/voting',
      requiredPermissions: [{ resource: 'voting', action: 'create' }],
      requiredRoles: ['community_manager', 'super_admin'],
      category: 'governance',
      color: '#E91E63',
      description: 'Democratic voting and governance'
    },
    {
      id: 'policies',
      title: 'Policies',
      icon: Gavel,
      route: '/admin/policies',
      requiredPermissions: [{ resource: 'settings', action: 'update' }],
      requiredRoles: ['community_manager', 'super_admin'],
      category: 'governance',
      color: '#9C27B0',
      description: 'Society policies and regulations'
    },
    
    // Multi-Society (Super Admin only)
    {
      id: 'multi_society',
      title: 'Multi-Society',
      icon: Building2,
      route: '/admin/multi-society',
      requiredPermissions: [{ resource: '*', action: '*' }],
      requiredRoles: ['super_admin'],
      category: 'management',
      color: '#FF9800',
      description: 'Multi-society management'
    },
    
    // System Settings
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      route: '/admin/settings',
      requiredPermissions: [{ resource: 'settings', action: 'read' }],
      category: 'management',
      color: '#607D8B',
      description: 'System and society settings'
    }
  ];

  // Filter navigation items based on permissions and roles
  const getAccessibleItems = (): NavigationItem[] => {
    if (currentMode !== 'admin' || !adminUser) {
      return [];
    }

    return allNavigationItems.filter(item => {
      // Check role requirements
      if (item.requiredRoles && item.requiredRoles.length > 0) {
        const hasRequiredRole = item.requiredRoles.includes(adminUser.role);
        if (!hasRequiredRole) return false;
      }

      // Check permission requirements
      if (item.requiredPermissions.length > 0) {
        const hasAllPermissions = item.requiredPermissions.every(({ resource, action }) =>
          checkPermission(resource, action)
        );
        if (!hasAllPermissions) return false;
      }

      return true;
    });
  };

  const accessibleItems = getAccessibleItems();

  // Group items by category
  const groupedItems = accessibleItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, NavigationItem[]>);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'primary': return 'Dashboard';
      case 'management': return 'Management';
      case 'analytics': return 'Analytics & Reports';
      case 'governance': return 'Governance';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const getCategoryOrder = (category: string) => {
    switch (category) {
      case 'primary': return 0;
      case 'management': return 1;
      case 'analytics': return 2;
      case 'governance': return 3;
      default: return 999;
    }
  };

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => 
    getCategoryOrder(a) - getCategoryOrder(b)
  );

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = currentRoute === item.route;
    const Icon = item.icon;

    if (layout === 'list') {
      return (
        <TouchableOpacity
          key={item.id}
          onPress={() => onNavigate(item.route)}
          className={`flex-row items-center p-4 mb-2 rounded-xl border ${
            isActive 
              ? 'bg-primary/10 border-primary' 
              : 'bg-surface border-divider'
          }`}
          activeOpacity={0.7}
        >
          <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
            isActive ? 'bg-primary' : 'bg-background'
          }`}>
            <Icon 
              size={20} 
              color={isActive ? 'white' : (item.color || '#6366f1')} 
            />
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className={`text-body-large font-semibold ${
                isActive ? 'text-primary' : 'text-text-primary'
              }`}>
                {item.title}
              </Text>
              {item.badge && (
                <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center ml-2">
                  <Text className="text-white text-xs font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </Text>
                </View>
              )}
            </View>
            {!compactMode && item.description && (
              <Text className="text-label-medium text-text-secondary">
                {item.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    // Grid layout
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onNavigate(item.route)}
        className={`p-4 rounded-xl border items-center ${
          compactMode ? 'min-h-[80px]' : 'min-h-[100px]'
        } ${
          isActive 
            ? 'bg-primary/10 border-primary' 
            : 'bg-surface border-divider'
        }`}
        activeOpacity={0.7}
      >
        <View className={`w-10 h-10 rounded-lg items-center justify-center mb-2 ${
          isActive ? 'bg-primary' : 'bg-background'
        }`}>
          <Icon 
            size={20} 
            color={isActive ? 'white' : (item.color || '#6366f1')} 
          />
          {item.badge && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {item.badge > 9 ? '9+' : item.badge}
              </Text>
            </View>
          )}
        </View>
        
        <Text className={`text-label-large font-medium text-center ${
          isActive ? 'text-primary' : 'text-text-primary'
        }`} numberOfLines={compactMode ? 1 : 2}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  if (accessibleItems.length === 0) {
    return (
      <View className="p-6 items-center">
        <Shield size={48} className="text-text-secondary mb-4" />
        <Text className="text-headline-medium font-semibold text-text-primary text-center mb-2">
          No Accessible Features
        </Text>
        <Text className="text-body-medium text-text-secondary text-center">
          Your current role doesn't have access to any admin features.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1"
      showsVerticalScrollIndicator={false}
    >
      {showCategories ? (
        <View className="p-6">
          {sortedCategories.map(category => (
            <View key={category} className="mb-6">
              <Text className="text-headline-medium font-semibold text-text-primary mb-4">
                {getCategoryTitle(category)}
              </Text>
              
              <View className={
                layout === 'grid' 
                  ? `flex-row flex-wrap -mx-2`
                  : 'space-y-2'
              }>
                {groupedItems[category].map(item => (
                  <View 
                    key={item.id} 
                    className={layout === 'grid' ? 'w-1/2 px-2 mb-4' : ''}
                  >
                    {renderNavigationItem(item)}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={`p-6 ${
          layout === 'grid' 
            ? 'flex-row flex-wrap -mx-2'
            : 'space-y-2'
        }`}>
          {accessibleItems.map(item => (
            <View 
              key={item.id} 
              className={layout === 'grid' ? 'w-1/2 px-2 mb-4' : ''}
            >
              {renderNavigationItem(item)}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default DynamicNavigation;