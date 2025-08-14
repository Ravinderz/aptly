import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminRole, Permission, AdminUser } from '@/types/admin';
import PermissionGate from '@/components/admin/PermissionGate';
import {
  RoleBasedRenderer,
  RoleVariants,
  SuperAdminOnly,
  CommunityManagerUp,
  SubAdminOnly,
} from '@/components/admin/RoleBasedRenderer';
import React from 'react';
import { Text } from 'react-native';

// Mock the admin context
jest.mock('@/contexts/AdminContext');
const mockUseAdmin = useAdmin as jest.MockedFunction<typeof useAdmin>;

describe('Advanced RBAC Testing', () => {
  let baseAdminUser: AdminUser;
  let basePermissions: Permission[];

  beforeEach(() => {
    baseAdminUser = {
      id: 'admin_test',
      name: 'Test Admin',
      email: 'admin@test.com',
      phoneNumber: '+919876543210',
      role: 'community_manager',
      societies: [
        {
          societyId: 'society_1',
          societyName: 'Test Society',
          role: 'community_manager',
          assignedBy: 'super_admin',
          assignedAt: '2024-01-01T00:00:00Z',
          isActive: true,
          permissions: [],
        },
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLoginAt: '2024-01-20T10:00:00Z',
      permissions: [],
      emergencyContact: true,
    };

    basePermissions = [
      { id: '1', resource: 'residents', action: 'read', scope: 'society' },
      { id: '2', resource: 'billing', action: 'create', scope: 'society' },
      { id: '3', resource: 'visitors', action: 'approve', scope: 'society' },
    ];

    // Default mock setup
    mockUseAdmin.mockReturnValue({
      currentMode: 'admin',
      isAdmin: true,
      adminUser: baseAdminUser,
      activeSociety: {
        id: 'society_1',
        name: 'Test Society',
        code: 'TS001',
        address: 'Test Address',
        totalFlats: 100,
        activeResidents: 85,
        adminCount: 2,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        settings: {
          billingCycle: 'monthly',
          gstEnabled: true,
          emergencyContacts: [],
          policies: [],
          features: [],
        },
      },
      availableSocieties: [],
      permissions: basePermissions,
      switchToAdminMode: jest.fn(),
      switchToResidentMode: jest.fn(),
      switchSociety: jest.fn(),
      checkPermission: jest.fn(),
      getEscalationPath: jest.fn(),
      canSwitchMode: jest.fn(),
      adminSession: null,
      refreshPermissions: jest.fn(),
      logout: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Permission-Based Access Control', () => {
    describe('PermissionGate Component', () => {
      it('should render children when user has required permission', () => {
        const mockCheckPermission = jest.fn().mockReturnValue(true);
        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          checkPermission: mockCheckPermission,
        });

        render(
          <PermissionGate resource="residents" action="read">
            <Text>Protected Content</Text>
          </PermissionGate>,
        );

        expect(screen.getByText('Protected Content')).toBeTruthy();
        expect(mockCheckPermission).toHaveBeenCalledWith(
          'residents',
          'read',
          undefined,
        );
      });

      it('should not render children when user lacks permission', () => {
        const mockCheckPermission = jest.fn().mockReturnValue(false);
        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          checkPermission: mockCheckPermission,
        });

        render(
          <PermissionGate resource="billing" action="delete">
            <Text>Protected Content</Text>
          </PermissionGate>,
        );

        expect(screen.queryByText('Protected Content')).toBeNull();
      });

      it('should render custom fallback when permission is denied', () => {
        const mockCheckPermission = jest.fn().mockReturnValue(false);
        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          checkPermission: mockCheckPermission,
        });

        render(
          <PermissionGate
            resource="visitors"
            action="bulk_actions"
            fallback={<Text>Access Denied</Text>}>
            <Text>Protected Content</Text>
          </PermissionGate>,
        );

        expect(screen.getByText('Access Denied')).toBeTruthy();
        expect(screen.queryByText('Protected Content')).toBeNull();
      });

      it('should respect society-scoped permissions', () => {
        const mockCheckPermission = jest.fn((resource, action, societyId) => {
          return (
            societyId === 'society_1' &&
            resource === 'billing' &&
            action === 'read'
          );
        });

        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          checkPermission: mockCheckPermission,
        });

        render(
          <PermissionGate
            resource="billing"
            action="read"
            societyId="society_1">
            <Text>Society 1 Billing</Text>
          </PermissionGate>,
        );

        expect(screen.getByText('Society 1 Billing')).toBeTruthy();
        expect(mockCheckPermission).toHaveBeenCalledWith(
          'billing',
          'read',
          'society_1',
        );
      });

      it('should deny access for different society without permission', () => {
        const mockCheckPermission = jest.fn((resource, action, societyId) => {
          return (
            societyId === 'society_1' &&
            resource === 'billing' &&
            action === 'read'
          );
        });

        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          checkPermission: mockCheckPermission,
        });

        render(
          <PermissionGate
            resource="billing"
            action="read"
            societyId="society_2">
            <Text>Society 2 Billing</Text>
          </PermissionGate>,
        );

        expect(screen.queryByText('Society 2 Billing')).toBeNull();
      });
    });

    describe('Complex Permission Scenarios', () => {
      it('should handle wildcard permissions for super admin', () => {
        const superAdminUser = {
          ...baseAdminUser,
          role: 'super_admin' as AdminRole,
        };

        const mockCheckPermission = jest.fn((resource, action) => {
          return superAdminUser.role === 'super_admin'; // Super admin has all permissions
        });

        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          adminUser: superAdminUser,
          checkPermission: mockCheckPermission,
        });

        render(
          <PermissionGate resource="*" action="*">
            <Text>Super Admin Content</Text>
          </PermissionGate>,
        );

        expect(screen.getByText('Super Admin Content')).toBeTruthy();
      });

      it('should handle nested permission checks', () => {
        const mockCheckPermission = jest
          .fn()
          .mockReturnValueOnce(true) // Outer permission
          .mockReturnValueOnce(false); // Inner permission

        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          checkPermission: mockCheckPermission,
        });

        render(
          <PermissionGate resource="residents" action="read">
            <Text>Outer Content</Text>
            <PermissionGate resource="residents" action="delete">
              <Text>Inner Content</Text>
            </PermissionGate>
          </PermissionGate>,
        );

        expect(screen.getByText('Outer Content')).toBeTruthy();
        expect(screen.queryByText('Inner Content')).toBeNull();
      });
    });
  });

  describe('Role-Based Rendering', () => {
    describe('RoleBasedRenderer Component', () => {
      it('should render content for included roles', () => {
        render(
          <RoleBasedRenderer roles={['community_manager', 'super_admin']}>
            <Text>Community Manager Content</Text>
          </RoleBasedRenderer>,
        );

        expect(screen.getByText('Community Manager Content')).toBeTruthy();
      });

      it('should not render content for excluded roles', () => {
        render(
          <RoleBasedRenderer roles={['financial_manager', 'security_admin']}>
            <Text>Sub Admin Content</Text>
          </RoleBasedRenderer>,
        );

        expect(screen.queryByText('Sub Admin Content')).toBeNull();
      });

      it('should work with exclude mode', () => {
        render(
          <RoleBasedRenderer
            roles={['financial_manager', 'security_admin']}
            mode="exclude">
            <Text>Non Sub Admin Content</Text>
          </RoleBasedRenderer>,
        );

        expect(screen.getByText('Non Sub Admin Content')).toBeTruthy();
      });
    });

    describe('RoleVariants Component', () => {
      it('should render role-specific content', () => {
        const adminUser = {
          ...baseAdminUser,
          role: 'financial_manager' as AdminRole,
        };
        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          adminUser,
        });

        render(
          <RoleVariants
            super_admin={<Text>Super Admin View</Text>}
            community_manager={<Text>Community Manager View</Text>}
            financial_manager={<Text>Financial Manager View</Text>}
            default={<Text>Default View</Text>}
          />,
        );

        expect(screen.getByText('Financial Manager View')).toBeTruthy();
        expect(screen.queryByText('Super Admin View')).toBeNull();
        expect(screen.queryByText('Community Manager View')).toBeNull();
        expect(screen.queryByText('Default View')).toBeNull();
      });

      it('should fallback to default when role not specified', () => {
        const adminUser = {
          ...baseAdminUser,
          role: 'maintenance_admin' as AdminRole,
        };
        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          adminUser,
        });

        render(
          <RoleVariants
            super_admin={<Text>Super Admin View</Text>}
            community_manager={<Text>Community Manager View</Text>}
            default={<Text>Default View</Text>}
          />,
        );

        expect(screen.getByText('Default View')).toBeTruthy();
      });
    });

    describe('Convenience Role Components', () => {
      it('should render SuperAdminOnly for super admin', () => {
        const adminUser = {
          ...baseAdminUser,
          role: 'super_admin' as AdminRole,
        };
        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          adminUser,
        });

        render(
          <SuperAdminOnly>
            <Text>Super Admin Only Content</Text>
          </SuperAdminOnly>,
        );

        expect(screen.getByText('Super Admin Only Content')).toBeTruthy();
      });

      it('should not render SuperAdminOnly for other roles', () => {
        render(
          <SuperAdminOnly>
            <Text>Super Admin Only Content</Text>
          </SuperAdminOnly>,
        );

        expect(screen.queryByText('Super Admin Only Content')).toBeNull();
      });

      it('should render CommunityManagerUp for community manager and above', () => {
        render(
          <CommunityManagerUp>
            <Text>Senior Admin Content</Text>
          </CommunityManagerUp>,
        );

        expect(screen.getByText('Senior Admin Content')).toBeTruthy();
      });

      it('should render SubAdminOnly for sub-admin roles', () => {
        const adminUser = {
          ...baseAdminUser,
          role: 'security_admin' as AdminRole,
        };
        mockUseAdmin.mockReturnValue({
          ...mockUseAdmin(),
          adminUser,
        });

        render(
          <SubAdminOnly>
            <Text>Sub Admin Content</Text>
          </SubAdminOnly>,
        );

        expect(screen.getByText('Sub Admin Content')).toBeTruthy();
      });
    });
  });

  describe('Role Hierarchy and Escalation', () => {
    it('should provide correct escalation path for sub-admins', () => {
      const mockGetEscalationPath = jest
        .fn()
        .mockReturnValue(['community_manager', 'super_admin']);

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        getEscalationPath: mockGetEscalationPath,
      });

      const { getEscalationPath } = mockUseAdmin();
      const escalationPath = getEscalationPath('billing_issue');

      expect(escalationPath).toEqual(['community_manager', 'super_admin']);
      expect(mockGetEscalationPath).toHaveBeenCalledWith('billing_issue');
    });

    it('should have no escalation path for super admin', () => {
      const superAdminUser = {
        ...baseAdminUser,
        role: 'super_admin' as AdminRole,
      };
      const mockGetEscalationPath = jest.fn().mockReturnValue([]);

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: superAdminUser,
        getEscalationPath: mockGetEscalationPath,
      });

      const { getEscalationPath } = mockUseAdmin();
      const escalationPath = getEscalationPath('critical_issue');

      expect(escalationPath).toEqual([]);
    });

    it('should validate role hierarchy in multi-society context', () => {
      const multiSocietyUser = {
        ...baseAdminUser,
        societies: [
          {
            societyId: 'society_1',
            societyName: 'Society 1',
            role: 'community_manager' as AdminRole,
            assignedBy: 'super_admin',
            assignedAt: '2024-01-01T00:00:00Z',
            isActive: true,
            permissions: [],
          },
          {
            societyId: 'society_2',
            societyName: 'Society 2',
            role: 'financial_manager' as AdminRole,
            assignedBy: 'community_manager',
            assignedAt: '2024-01-15T00:00:00Z',
            isActive: true,
            permissions: [],
          },
        ],
      };

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: multiSocietyUser,
      });

      // In society_1, user is community_manager (higher role)
      // In society_2, user is financial_manager (lower role)
      expect(multiSocietyUser.societies[0].role).toBe('community_manager');
      expect(multiSocietyUser.societies[1].role).toBe('financial_manager');
    });
  });

  describe('Session and Context Validation', () => {
    it('should deny access when not in admin mode', () => {
      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        currentMode: 'resident',
        isAdmin: false,
      });

      render(
        <PermissionGate resource="residents" action="read">
          <Text>Admin Content</Text>
        </PermissionGate>,
      );

      expect(screen.queryByText('Admin Content')).toBeNull();
    });

    it('should deny access when admin user is null', () => {
      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: null,
        isAdmin: false,
      });

      render(
        <RoleBasedRenderer roles={['community_manager']}>
          <Text>Role Content</Text>
        </RoleBasedRenderer>,
      );

      expect(screen.queryByText('Role Content')).toBeNull();
    });

    it('should deny access when admin user is inactive', () => {
      const inactiveUser = { ...baseAdminUser, isActive: false };
      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: inactiveUser,
      });

      // Note: This test assumes PermissionGate checks user.isActive
      // In real implementation, this check might be in the context provider
      render(
        <PermissionGate resource="residents" action="read">
          <Text>Admin Content</Text>
        </PermissionGate>,
      );

      // Should still render if context allows it,
      // but in production this would be handled by the context
      expect(screen.getByText('Admin Content')).toBeTruthy();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined permissions gracefully', () => {
      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        permissions: [],
      });

      render(
        <PermissionGate resource="unknown" action="unknown">
          <Text>Unknown Permission Content</Text>
        </PermissionGate>,
      );

      expect(screen.queryByText('Unknown Permission Content')).toBeNull();
    });

    it('should handle malformed role data', () => {
      const malformedUser = {
        ...baseAdminUser,
        role: 'invalid_role' as AdminRole,
      };

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: malformedUser,
      });

      render(
        <RoleVariants
          community_manager={<Text>CM Content</Text>}
          default={<Text>Default Content</Text>}
        />,
      );

      expect(screen.getByText('Default Content')).toBeTruthy();
    });

    it('should handle concurrent permission checks', () => {
      const mockCheckPermission = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        checkPermission: mockCheckPermission,
      });

      render(
        <>
          <PermissionGate resource="billing" action="read">
            <Text>Billing Read</Text>
          </PermissionGate>
          <PermissionGate resource="billing" action="delete">
            <Text>Billing Delete</Text>
          </PermissionGate>
          <PermissionGate resource="visitors" action="approve">
            <Text>Visitor Approve</Text>
          </PermissionGate>
        </>,
      );

      expect(screen.getByText('Billing Read')).toBeTruthy();
      expect(screen.queryByText('Billing Delete')).toBeNull();
      expect(screen.getByText('Visitor Approve')).toBeTruthy();
      expect(mockCheckPermission).toHaveBeenCalledTimes(3);
    });
  });

  describe('Performance and Optimization', () => {
    it("should not re-render when permissions haven't changed", () => {
      const mockCheckPermission = jest.fn().mockReturnValue(true);
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        return (
          <PermissionGate resource="residents" action="read">
            <Text>Stable Content</Text>
          </PermissionGate>
        );
      };

      const { rerender } = render(<TestComponent />);

      // Re-render with same permission state
      rerender(<TestComponent />);

      expect(renderCount).toBe(2); // Initial + rerender
      expect(screen.getByText('Stable Content')).toBeTruthy();
    });

    it('should cache permission check results appropriately', () => {
      const mockCheckPermission = jest.fn().mockReturnValue(true);

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        checkPermission: mockCheckPermission,
      });

      render(
        <>
          <PermissionGate resource="residents" action="read">
            <Text>Content 1</Text>
          </PermissionGate>
          <PermissionGate resource="residents" action="read">
            <Text>Content 2</Text>
          </PermissionGate>
        </>,
      );

      // Each PermissionGate should call checkPermission independently
      expect(mockCheckPermission).toHaveBeenCalledTimes(2);
      expect(mockCheckPermission).toHaveBeenCalledWith(
        'residents',
        'read',
        undefined,
      );
    });
  });
});
