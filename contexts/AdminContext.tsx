import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  AdminUser,
  AdminRole,
  AppMode,
  AdminSession,
  Society,
  Permission,
} from '@/types/admin';
import { UserProfile } from '@/types/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdminContextType {
  // Current state
  currentMode: AppMode;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  activeSociety: Society | null;
  availableSocieties: Society[];
  permissions: Permission[];

  // Mode switching
  switchToAdminMode: () => Promise<boolean>;
  switchToResidentMode: () => void;
  switchSociety: (societyId: string) => Promise<void>;

  // Admin operations
  checkPermission: (
    resource: string,
    action: string,
    societyId?: string,
  ) => boolean;
  getEscalationPath: (issue: string) => AdminRole[];
  canSwitchMode: () => boolean;

  // Session management
  adminSession: AdminSession | null;
  refreshPermissions: () => Promise<void>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
  user: UserProfile | null;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({
  children,
  user,
}) => {
  const [currentMode, setCurrentMode] = useState<AppMode>('resident');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeSociety, setActiveSociety] = useState<Society | null>(null);
  const [availableSocieties, setAvailableSocieties] = useState<Society[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);

  // Check if current user has admin roles
  const isAdmin = adminUser !== null;

  useEffect(() => {
    initializeAdminContext();
  }, [user]);

  const initializeAdminContext = async () => {
    if (!user) {
      resetAdminContext();
      return;
    }

    try {
      // Check if user has admin roles
      const adminData = await checkUserAdminStatus(user.id);

      if (adminData.isAdmin) {
        setAdminUser(adminData.adminUser);
        setAvailableSocieties(adminData.societies);

        // Set default active society
        const defaultSociety =
          adminData.societies.find((s) => s.id === user.societyId) ||
          adminData.societies[0];
        setActiveSociety(defaultSociety);

        // Load permissions for default society
        await loadPermissionsForSociety(adminData.adminUser, defaultSociety.id);

        // Check if should auto-switch to admin mode
        const savedMode = await AsyncStorage.getItem(
          `${user.id}_preferred_mode`,
        );
        if (savedMode === 'admin' && canSwitchToAdmin(adminData.adminUser)) {
          await switchToAdminMode();
        }
      }
    } catch (error) {
      console.error('Failed to initialize admin context:', error);
      resetAdminContext();
    }
  };

  const resetAdminContext = () => {
    setCurrentMode('resident');
    setAdminUser(null);
    setActiveSociety(null);
    setAvailableSocieties([]);
    setPermissions([]);
    setAdminSession(null);
  };

  const checkUserAdminStatus = async (
    userId: string,
  ): Promise<{
    isAdmin: boolean;
    adminUser?: AdminUser;
    societies: Society[];
  }> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate API response
        if (userId === 'admin_user_id') {
          resolve({
            isAdmin: true,
            adminUser: {
              id: userId,
              name: user?.name || 'Admin User',
              email: user?.email || '',
              phoneNumber: user?.phoneNumber || '',
              role: 'community_manager',
              societies: [
                {
                  societyId: 'society_1',
                  societyName: 'Green Valley Apartments',
                  role: 'community_manager',
                  assignedBy: 'super_admin',
                  assignedAt: new Date().toISOString(),
                  isActive: true,
                  permissions: [],
                },
              ],
              isActive: true,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              permissions: [],
              emergencyContact: true,
            },
            societies: [
              {
                id: 'society_1',
                name: 'Green Valley Apartments',
                code: 'GVA001',
                address: '123 Green Valley Road, Mumbai',
                totalFlats: 120,
                activeResidents: 95,
                adminCount: 3,
                status: 'active',
                createdAt: new Date().toISOString(),
                settings: {
                  billingCycle: 'monthly',
                  gstEnabled: true,
                  emergencyContacts: [],
                  policies: [],
                  features: [],
                },
              },
            ],
          });
        } else {
          resolve({ isAdmin: false, societies: [] });
        }
      }, 500);
    });
  };

  const canSwitchToAdmin = (admin: AdminUser): boolean => {
    return admin.isActive && admin.societies.some((s) => s.isActive);
  };

  const switchToAdminMode = async (): Promise<boolean> => {
    if (!adminUser || !canSwitchToAdmin(adminUser)) {
      return false;
    }

    try {
      // Create admin session
      const session: AdminSession = {
        sessionId: generateSessionId(),
        userId: adminUser.id,
        currentMode: 'admin',
        activeSocietyId: activeSociety?.id,
        adminRole: adminUser.role,
        permissions: permissions,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        ipAddress: await getDeviceIP(),
        deviceInfo: {
          platform: 'ios', // Replace with actual detection
          version: '17.0',
          appVersion: '1.0.0',
        },
      };

      setAdminSession(session);
      setCurrentMode('admin');

      // Save preference
      await AsyncStorage.setItem(`${adminUser.id}_preferred_mode`, 'admin');

      // Log admin mode activation
      await logAuditEvent('mode_switched', {
        from: 'resident',
        to: 'admin',
        societyId: activeSociety?.id,
      });

      return true;
    } catch (error) {
      console.error('Failed to switch to admin mode:', error);
      return false;
    }
  };

  const switchToResidentMode = () => {
    setCurrentMode('resident');
    setAdminSession(null);

    // Save preference
    if (adminUser) {
      AsyncStorage.setItem(`${adminUser.id}_preferred_mode`, 'resident');
    }

    // Log mode switch
    logAuditEvent('mode_switched', {
      from: 'admin',
      to: 'resident',
      societyId: activeSociety?.id,
    });
  };

  const switchSociety = async (societyId: string): Promise<void> => {
    if (!adminUser || currentMode !== 'admin') {
      throw new Error('Cannot switch society in resident mode');
    }

    const society = availableSocieties.find((s) => s.id === societyId);
    if (!society) {
      throw new Error('Society not accessible');
    }

    // Check if user has access to this society
    const hasAccess = adminUser.societies.some(
      (s) => s.societyId === societyId && s.isActive,
    );
    if (!hasAccess) {
      throw new Error('Access denied to society');
    }

    try {
      setActiveSociety(society);

      // Update session
      if (adminSession) {
        const updatedSession = {
          ...adminSession,
          activeSocietyId: societyId,
          lastActivity: new Date().toISOString(),
        };
        setAdminSession(updatedSession);
      }

      // Reload permissions for new society
      await loadPermissionsForSociety(adminUser, societyId);

      // Log society switch
      await logAuditEvent('society_switched', {
        previousSociety: activeSociety?.id,
        newSociety: societyId,
      });
    } catch (error) {
      console.error('Failed to switch society:', error);
      throw error;
    }
  };

  const loadPermissionsForSociety = async (
    admin: AdminUser,
    societyId: string,
  ): Promise<void> => {
    try {
      // Mock permission loading - replace with actual API call
      const societyPermissions = await fetchPermissionsForRole(
        admin.role,
        societyId,
      );
      setPermissions(societyPermissions);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setPermissions([]);
    }
  };

  const fetchPermissionsForRole = async (
    role: AdminRole,
    societyId: string,
  ): Promise<Permission[]> => {
    // Mock implementation - replace with actual API call
    const rolePermissions: Record<AdminRole, Permission[]> = {
      super_admin: [{ id: '1', resource: '*', action: '*', scope: 'global' }],
      community_manager: [
        { id: '2', resource: 'residents', action: 'create', scope: 'society' },
        { id: '3', resource: 'residents', action: 'read', scope: 'society' },
        { id: '4', resource: 'residents', action: 'update', scope: 'society' },
        { id: '5', resource: 'residents', action: 'delete', scope: 'society' },
        { id: '6', resource: 'billing', action: 'create', scope: 'society' },
        { id: '7', resource: 'billing', action: 'read', scope: 'society' },
        { id: '8', resource: 'billing', action: 'update', scope: 'society' },
        {
          id: '9',
          resource: 'maintenance',
          action: 'approve',
          scope: 'society',
        },
        {
          id: '10',
          resource: 'emergency',
          action: 'declare',
          scope: 'society',
        },
      ],
      financial_manager: [
        { id: '11', resource: 'billing', action: 'create', scope: 'society' },
        { id: '12', resource: 'billing', action: 'read', scope: 'society' },
        { id: '13', resource: 'billing', action: 'update', scope: 'society' },
        { id: '14', resource: 'billing', action: 'generate', scope: 'society' },
      ],
      security_admin: [
        { id: '15', resource: 'visitors', action: 'create', scope: 'society' },
        { id: '16', resource: 'visitors', action: 'read', scope: 'society' },
        { id: '17', resource: 'visitors', action: 'approve', scope: 'society' },
        {
          id: '18',
          resource: 'visitors',
          action: 'bulk_actions',
          scope: 'society',
        },
      ],
      maintenance_admin: [
        {
          id: '19',
          resource: 'maintenance',
          action: 'create',
          scope: 'society',
        },
        { id: '20', resource: 'maintenance', action: 'read', scope: 'society' },
        {
          id: '21',
          resource: 'maintenance',
          action: 'update',
          scope: 'society',
        },
        {
          id: '22',
          resource: 'maintenance',
          action: 'assign',
          scope: 'society',
        },
      ],
    };

    return rolePermissions[role] || [];
  };

  const checkPermission = (
    resource: string,
    action: string,
    societyId?: string,
  ): boolean => {
    if (currentMode !== 'admin' || !adminUser) {
      return false;
    }

    // Super admin has all permissions
    if (adminUser.role === 'super_admin') {
      return true;
    }

    // Check specific permissions
    return permissions.some((permission) => {
      const resourceMatch =
        permission.resource === resource || permission.resource === '*';
      const actionMatch =
        permission.action === action || permission.action === '*';
      const scopeMatch =
        permission.scope === 'global' ||
        (permission.scope === 'society' && societyId === activeSociety?.id);

      return resourceMatch && actionMatch && scopeMatch;
    });
  };

  const getEscalationPath = (issue: string): AdminRole[] => {
    if (!adminUser) return [];

    const escalationPaths: Record<AdminRole, AdminRole[]> = {
      financial_manager: ['community_manager', 'super_admin'],
      security_admin: ['community_manager', 'super_admin'],
      maintenance_admin: ['community_manager', 'super_admin'],
      community_manager: ['super_admin'],
      super_admin: [],
    };

    return escalationPaths[adminUser.role] || [];
  };

  const canSwitchMode = (): boolean => {
    return isAdmin && currentMode === 'resident'
      ? canSwitchToAdmin(adminUser!)
      : true;
  };

  const refreshPermissions = async (): Promise<void> => {
    if (adminUser && activeSociety) {
      await loadPermissionsForSociety(adminUser, activeSociety.id);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (adminSession) {
        await logAuditEvent('admin_logout', {
          sessionId: adminSession.sessionId,
          duration: Date.now() - new Date(adminSession.startTime).getTime(),
        });
      }

      resetAdminContext();
      await AsyncStorage.removeItem(`${user?.id}_preferred_mode`);
    } catch (error) {
      console.error('Failed to logout admin:', error);
    }
  };

  // Utility functions
  const generateSessionId = (): string => {
    return `admin_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getDeviceIP = async (): Promise<string> => {
    // Mock implementation - replace with actual IP detection
    return '192.168.1.1';
  };

  const logAuditEvent = async (
    eventType: string,
    details: any,
  ): Promise<void> => {
    // Mock audit logging - replace with actual audit service
    console.log('Audit Event:', {
      eventType,
      userId: adminUser?.id,
      societyId: activeSociety?.id,
      timestamp: new Date().toISOString(),
      details,
    });
  };

  const value: AdminContextType = {
    currentMode,
    isAdmin,
    adminUser,
    activeSociety,
    availableSocieties,
    permissions,
    switchToAdminMode,
    switchToResidentMode,
    switchSociety,
    checkPermission,
    getEscalationPath,
    canSwitchMode,
    adminSession,
    refreshPermissions,
    logout,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;
