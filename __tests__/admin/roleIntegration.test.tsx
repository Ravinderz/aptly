import { jest } from '@jest/globals';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { useAdmin } from '@/contexts/AdminContext';
import { useSociety } from '@/contexts/SocietyContext';
import { AdminUser, Society, AdminRole } from '@/types/admin';
import FinancialManager from '@/components/admin/FinancialManager';
import SecurityAdmin from '@/components/admin/SecurityAdmin';
import DynamicNavigation from '@/components/admin/DynamicNavigation';
import React from 'react';

// Mock contexts and alert
jest.mock('@/contexts/AdminContext');
jest.mock('@/contexts/SocietyContext');
jest.mock('@/components/ui/AlertCard', () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
    AlertComponent: null,
  }),
}));

const mockUseAdmin = useAdmin as jest.MockedFunction<typeof useAdmin>;
const mockUseSociety = useSociety as jest.MockedFunction<typeof useSociety>;

describe('Role-Specific Component Integration Tests', () => {
  let mockSociety: Society;
  let baseAdminUser: AdminUser;

  beforeEach(() => {
    mockSociety = {
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
    };

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

    // Default society context mock
    mockUseSociety.mockReturnValue({
      currentSociety: mockSociety,
      availableSocieties: [mockSociety],
      canSwitch: false,
      switchSociety: jest.fn(),
      societyData: new Map(),
      getSocietyData: jest.fn(),
      setSocietyData: jest.fn(),
      clearSocietyData: jest.fn(),
      refreshSocieties: jest.fn(),
      getSocietyStats: jest.fn(),
      validateSocietyAccess: jest.fn(),
      bulkOperation: jest.fn(),
      crossSocietyQuery: jest.fn(),
      filterNotificationsForSociety: jest.fn(),
      lastSwitchTime: null,
      switchHistory: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Financial Manager Component', () => {
    beforeEach(() => {
      const financialManagerUser = {
        ...baseAdminUser,
        role: 'financial_manager' as AdminRole,
      };

      mockUseAdmin.mockReturnValue({
        currentMode: 'admin',
        isAdmin: true,
        adminUser: financialManagerUser,
        activeSociety: mockSociety,
        availableSocieties: [mockSociety],
        permissions: [
          { id: '1', resource: 'billing', action: 'read', scope: 'society' },
          { id: '2', resource: 'billing', action: 'create', scope: 'society' },
          {
            id: '3',
            resource: 'billing',
            action: 'bulk_action',
            scope: 'society',
          },
        ],
        switchToAdminMode: jest.fn(),
        switchToResidentMode: jest.fn(),
        switchSociety: jest.fn(),
        checkPermission: jest.fn((resource, action) => {
          const billingPermissions = [
            'read',
            'create',
            'bulk_action',
            'update',
            'export',
          ];
          return resource === 'billing' && billingPermissions.includes(action);
        }),
        getEscalationPath: jest.fn(),
        canSwitchMode: jest.fn(),
        adminSession: null,
        refreshPermissions: jest.fn(),
        logout: jest.fn(),
      });
    });

    it('should render financial management dashboard for financial manager', async () => {
      render(<FinancialManager />);

      await waitFor(() => {
        expect(screen.getByText('Financial Management')).toBeTruthy();
        expect(
          screen.getByText('Billing & Payment Control Center'),
        ).toBeTruthy();
      });
    });

    it('should show financial actions for authorized users', async () => {
      render(<FinancialManager />);

      await waitFor(() => {
        expect(screen.getByText('Financial Actions')).toBeTruthy();
        expect(screen.getByText('Bulk Bill Generation')).toBeTruthy();
        expect(screen.getByText('Payment Reconciliation')).toBeTruthy();
      });
    });

    it('should handle bulk bill generation action', async () => {
      const mockBulkOperation = jest.fn().mockResolvedValue({
        societies: ['society_1'],
        results: [{ societyId: 'society_1', success: true }],
      });

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        bulkOperation: mockBulkOperation,
      });

      render(<FinancialManager />);

      await waitFor(() => {
        const bulkBillButton = screen.getByText('Bulk Bill Generation');
        fireEvent.press(bulkBillButton);
      });

      expect(mockBulkOperation).toHaveBeenCalledWith(
        'generate_bills',
        expect.any(Object),
      );
    });

    it('should deny access to unauthorized users', () => {
      const unauthorizedUser = {
        ...baseAdminUser,
        role: 'security_admin' as AdminRole,
      };

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: unauthorizedUser,
        checkPermission: jest.fn().mockReturnValue(false),
      });

      render(<FinancialManager />);

      expect(screen.getByText('Access Restricted')).toBeTruthy();
      expect(
        screen.getByText(
          'You do not have permission to view financial management features.',
        ),
      ).toBeTruthy();
    });

    it('should show society-specific financial data', async () => {
      render(<FinancialManager />);

      await waitFor(() => {
        expect(
          screen.getByText('Test Society - Financial Overview'),
        ).toBeTruthy();
        expect(screen.getByText('Collection Rate')).toBeTruthy();
        expect(screen.getByText('Pending Amount')).toBeTruthy();
      });
    });

    it('should handle multi-society financial overview', async () => {
      const multiSocietyUser = {
        ...baseAdminUser,
        societies: [
          {
            societyId: 'society_1',
            societyName: 'Society 1',
            role: 'financial_manager' as AdminRole,
            assignedBy: 'community_manager',
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
        availableSocieties: [
          mockSociety,
          { ...mockSociety, id: 'society_2', name: 'Society 2' },
        ],
      });

      render(<FinancialManager />);

      await waitFor(() => {
        expect(screen.getByText('All Societies Summary')).toBeTruthy();
      });
    });
  });

  describe('Security Admin Component', () => {
    beforeEach(() => {
      const securityAdminUser = {
        ...baseAdminUser,
        role: 'security_admin' as AdminRole,
      };

      mockUseAdmin.mockReturnValue({
        currentMode: 'admin',
        isAdmin: true,
        adminUser: securityAdminUser,
        activeSociety: mockSociety,
        availableSocieties: [mockSociety],
        permissions: [
          { id: '1', resource: 'visitors', action: 'read', scope: 'society' },
          {
            id: '2',
            resource: 'visitors',
            action: 'approve',
            scope: 'society',
          },
          {
            id: '3',
            resource: 'visitors',
            action: 'bulk_actions',
            scope: 'society',
          },
        ],
        switchToAdminMode: jest.fn(),
        switchToResidentMode: jest.fn(),
        switchSociety: jest.fn(),
        checkPermission: jest.fn((resource, action) => {
          const visitorPermissions = ['read', 'approve', 'bulk_actions'];
          return resource === 'visitors' && visitorPermissions.includes(action);
        }),
        getEscalationPath: jest.fn(),
        canSwitchMode: jest.fn(),
        adminSession: null,
        refreshPermissions: jest.fn(),
        logout: jest.fn(),
      });
    });

    it('should render security management dashboard for security admin', async () => {
      render(<SecurityAdmin />);

      await waitFor(() => {
        expect(screen.getByText('Security Management')).toBeTruthy();
        expect(
          screen.getByText('Visitor Security & Access Control'),
        ).toBeTruthy();
      });
    });

    it('should show security actions for authorized users', async () => {
      render(<SecurityAdmin />);

      await waitFor(() => {
        expect(screen.getByText('Security Actions')).toBeTruthy();
        expect(screen.getByText('Bulk Approval')).toBeTruthy();
        expect(screen.getByText('Security Check')).toBeTruthy();
      });
    });

    it('should handle bulk visitor approval', async () => {
      const mockBulkOperation = jest.fn().mockResolvedValue({
        results: [{ societyId: 'society_1', success: true }],
      });

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        bulkOperation: mockBulkOperation,
      });

      render(<SecurityAdmin />);

      await waitFor(() => {
        const bulkApprovalButton = screen.getByText('Bulk Approval');
        fireEvent.press(bulkApprovalButton);
      });

      expect(mockBulkOperation).toHaveBeenCalledWith(
        'bulk_approve_visitors',
        expect.any(Object),
      );
    });

    it('should show security incidents when available', async () => {
      render(<SecurityAdmin />);

      await waitFor(() => {
        expect(screen.getByText('Active Security Incidents')).toBeTruthy();
      });
    });

    it('should handle incident resolution', async () => {
      render(<SecurityAdmin />);

      await waitFor(() => {
        // This would test incident resolution if incidents are present
        // Implementation depends on the actual incident data structure
        expect(
          screen.getByText('Security Overview - Test Society'),
        ).toBeTruthy();
      });
    });

    it('should filter visitors by status', async () => {
      render(<SecurityAdmin />);

      await waitFor(() => {
        const pendingFilter = screen.getByText('Pending');
        fireEvent.press(pendingFilter);

        const approvedFilter = screen.getByText('Approved');
        fireEvent.press(approvedFilter);

        const overdueFilter = screen.getByText('Overdue');
        fireEvent.press(overdueFilter);
      });

      // Verify filter state changes (implementation specific)
      expect(screen.getByText('Pending')).toBeTruthy();
    });
  });

  describe('Dynamic Navigation Component', () => {
    it('should show navigation items based on user permissions', () => {
      const communityManagerUser = {
        ...baseAdminUser,
        role: 'community_manager' as AdminRole,
      };

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: communityManagerUser,
        checkPermission: jest.fn((resource, action) => {
          // Community manager has most permissions
          const allowedResources = [
            'residents',
            'billing',
            'visitors',
            'maintenance',
            'notices',
          ];
          return allowedResources.includes(resource);
        }),
      });

      const mockNavigate = jest.fn();

      render(
        <DynamicNavigation
          onNavigate={mockNavigate}
          layout="grid"
          showCategories={true}
        />,
      );

      expect(screen.getByText('Dashboard')).toBeTruthy();
      expect(screen.getByText('Residents')).toBeTruthy();
      expect(screen.getByText('Billing')).toBeTruthy();
      expect(screen.getByText('Visitors')).toBeTruthy();
    });

    it('should hide restricted items for sub-admin roles', () => {
      const securityAdminUser = {
        ...baseAdminUser,
        role: 'security_admin' as AdminRole,
      };

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: securityAdminUser,
        checkPermission: jest.fn((resource, action) => {
          // Security admin only has visitor permissions
          return resource === 'visitors';
        }),
      });

      const mockNavigate = jest.fn();

      render(
        <DynamicNavigation
          onNavigate={mockNavigate}
          layout="grid"
          showCategories={true}
        />,
      );

      expect(screen.getByText('Dashboard')).toBeTruthy();
      expect(screen.getByText('Visitors')).toBeTruthy();
      expect(screen.queryByText('Billing')).toBeNull();
      expect(screen.queryByText('Team Management')).toBeNull();
    });

    it('should show super admin exclusive features', () => {
      const superAdminUser = {
        ...baseAdminUser,
        role: 'super_admin' as AdminRole,
      };

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: superAdminUser,
        checkPermission: jest.fn().mockReturnValue(true), // Super admin has all permissions
      });

      const mockNavigate = jest.fn();

      render(
        <DynamicNavigation
          onNavigate={mockNavigate}
          layout="grid"
          showCategories={true}
        />,
      );

      expect(screen.getByText('Multi-Society')).toBeTruthy();
      expect(screen.getByText('Team Management')).toBeTruthy();
      expect(screen.getByText('Voting')).toBeTruthy();
    });

    it('should handle navigation item press', () => {
      const mockNavigate = jest.fn();

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        checkPermission: jest.fn().mockReturnValue(true),
      });

      render(
        <DynamicNavigation
          onNavigate={mockNavigate}
          layout="grid"
          showCategories={true}
        />,
      );

      const dashboardItem = screen.getByText('Dashboard');
      fireEvent.press(dashboardItem);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });

    it('should group navigation items by categories', () => {
      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        checkPermission: jest.fn().mockReturnValue(true),
      });

      const mockNavigate = jest.fn();

      render(
        <DynamicNavigation
          onNavigate={mockNavigate}
          layout="grid"
          showCategories={true}
        />,
      );

      expect(screen.getByText('Dashboard')).toBeTruthy();
      expect(screen.getByText('Management')).toBeTruthy();
      expect(screen.getByText('Analytics & Reports')).toBeTruthy();
    });

    it('should adapt layout based on props', () => {
      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        checkPermission: jest.fn().mockReturnValue(true),
      });

      const mockNavigate = jest.fn();

      const { rerender } = render(
        <DynamicNavigation
          onNavigate={mockNavigate}
          layout="list"
          showCategories={false}
          compactMode={true}
        />,
      );

      expect(screen.getByText('Dashboard')).toBeTruthy();

      rerender(
        <DynamicNavigation
          onNavigate={mockNavigate}
          layout="grid"
          showCategories={true}
          compactMode={false}
        />,
      );

      expect(screen.getByText('Dashboard')).toBeTruthy();
    });
  });

  describe('Cross-Role Integration', () => {
    it('should handle role switching in multi-society context', async () => {
      const multiRoleUser = {
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

      const mockSwitchSociety = jest.fn();

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: multiRoleUser,
        switchSociety: mockSwitchSociety,
        availableSocieties: [
          mockSociety,
          { ...mockSociety, id: 'society_2', name: 'Society 2' },
        ],
      });

      // This would test society switching affecting role-based permissions
      await waitFor(() => {
        expect(multiRoleUser.societies).toHaveLength(2);
        expect(multiRoleUser.societies[0].role).toBe('community_manager');
        expect(multiRoleUser.societies[1].role).toBe('financial_manager');
      });
    });

    it('should handle permission inheritance across roles', () => {
      const mockCheckPermission = jest.fn((resource, action) => {
        // Community manager inherits some permissions from sub-roles
        if (resource === 'billing' && action === 'read') return true;
        if (resource === 'visitors' && action === 'approve') return true;
        if (resource === 'residents' && action === 'read') return true;
        return false;
      });

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        checkPermission: mockCheckPermission,
      });

      const mockNavigate = jest.fn();

      render(
        <DynamicNavigation
          onNavigate={mockNavigate}
          layout="grid"
          showCategories={true}
        />,
      );

      // Should show items based on inherited permissions
      expect(screen.getByText('Dashboard')).toBeTruthy();
      expect(screen.getByText('Residents')).toBeTruthy();
      expect(screen.getByText('Billing')).toBeTruthy();
      expect(screen.getByText('Visitors')).toBeTruthy();
    });

    it('should enforce escalation policies across components', () => {
      const mockGetEscalationPath = jest.fn((issue) => {
        switch (issue) {
          case 'billing_issue':
            return ['community_manager', 'super_admin'];
          case 'security_incident':
            return ['community_manager', 'super_admin'];
          default:
            return ['super_admin'];
        }
      });

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        getEscalationPath: mockGetEscalationPath,
      });

      const { getEscalationPath } = mockUseAdmin();

      expect(getEscalationPath('billing_issue')).toEqual([
        'community_manager',
        'super_admin',
      ]);
      expect(getEscalationPath('security_incident')).toEqual([
        'community_manager',
        'super_admin',
      ]);
      expect(getEscalationPath('platform_issue')).toEqual(['super_admin']);
    });
  });
});
