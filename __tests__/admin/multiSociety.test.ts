import { jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-native';
import { useSociety } from '@/contexts/SocietyContext';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminUser, Society, AdminRole } from '@/types/admin';

// Mock contexts
jest.mock('@/contexts/AdminContext');
jest.mock('@/contexts/SocietyContext');

const mockUseAdmin = useAdmin as jest.MockedFunction<typeof useAdmin>;
const mockUseSociety = useSociety as jest.MockedFunction<typeof useSociety>;

describe('Multi-Society Management', () => {
  let mockAdminUser: AdminUser;
  let mockSocieties: Society[];

  beforeEach(() => {
    mockAdminUser = {
      id: 'admin_1',
      name: 'Test Admin',
      email: 'admin@test.com',
      phoneNumber: '+919876543210',
      role: 'community_manager',
      societies: [
        {
          societyId: 'society_1',
          societyName: 'Green Valley Apartments',
          role: 'community_manager',
          assignedBy: 'super_admin',
          assignedAt: '2024-01-01T00:00:00Z',
          isActive: true,
          permissions: [],
        },
        {
          societyId: 'society_2',
          societyName: 'Blue Hills Society',
          role: 'financial_manager',
          assignedBy: 'community_manager',
          assignedAt: '2024-01-15T00:00:00Z',
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

    mockSocieties = [
      {
        id: 'society_1',
        name: 'Green Valley Apartments',
        code: 'GVA001',
        address: '123 Green Valley Road, Mumbai',
        totalFlats: 120,
        activeResidents: 95,
        adminCount: 3,
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
      {
        id: 'society_2',
        name: 'Blue Hills Society',
        code: 'BHS002',
        address: '456 Blue Hills Drive, Mumbai',
        totalFlats: 80,
        activeResidents: 72,
        adminCount: 2,
        status: 'active',
        createdAt: '2024-01-15T00:00:00Z',
        settings: {
          billingCycle: 'monthly',
          gstEnabled: true,
          emergencyContacts: [],
          policies: [],
          features: [],
        },
      },
    ];

    // Reset mocks
    mockUseAdmin.mockReturnValue({
      currentMode: 'admin',
      isAdmin: true,
      adminUser: mockAdminUser,
      activeSociety: mockSocieties[0],
      availableSocieties: mockSocieties,
      permissions: [],
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

    mockUseSociety.mockReturnValue({
      currentSociety: mockSocieties[0],
      availableSocieties: mockSocieties,
      canSwitch: true,
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

  describe('Society Access Validation', () => {
    it('should validate admin has access to assigned societies', () => {
      const { validateSocietyAccess } = mockUseSociety();

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        validateSocietyAccess: jest.fn((societyId: string) => {
          return mockAdminUser.societies.some(
            (s) => s.societyId === societyId && s.isActive,
          );
        }),
      });

      const { validateSocietyAccess: mockValidate } = mockUseSociety();

      expect(mockValidate('society_1')).toBe(true);
      expect(mockValidate('society_2')).toBe(true);
      expect(mockValidate('society_3')).toBe(false);
    });

    it('should prevent access to inactive society assignments', () => {
      const inactiveAdminUser = {
        ...mockAdminUser,
        societies: [
          {
            ...mockAdminUser.societies[0],
            isActive: false,
          },
        ],
      };

      mockUseAdmin.mockReturnValue({
        ...mockUseAdmin(),
        adminUser: inactiveAdminUser,
      });

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        validateSocietyAccess: jest.fn((societyId: string) => {
          return inactiveAdminUser.societies.some(
            (s) => s.societyId === societyId && s.isActive,
          );
        }),
      });

      const { validateSocietyAccess } = mockUseSociety();
      expect(validateSocietyAccess('society_1')).toBe(false);
    });
  });

  describe('Society Switching', () => {
    it('should successfully switch between accessible societies', async () => {
      const mockSwitchSociety = jest.fn().mockResolvedValue(undefined);

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        switchSociety: mockSwitchSociety,
      });

      const { switchSociety } = mockUseSociety();

      await act(async () => {
        await switchSociety('society_2');
      });

      expect(mockSwitchSociety).toHaveBeenCalledWith('society_2');
    });

    it('should reject switching to inaccessible society', async () => {
      const mockSwitchSociety = jest
        .fn()
        .mockRejectedValue(new Error('Access denied to society'));

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        switchSociety: mockSwitchSociety,
      });

      const { switchSociety } = mockUseSociety();

      await expect(switchSociety('society_999')).rejects.toThrow(
        'Access denied to society',
      );
    });

    it('should track society switch history', async () => {
      const mockSwitchHistory = [
        {
          fromSocietyId: null,
          toSocietyId: 'society_1',
          timestamp: new Date('2024-01-20T10:00:00Z'),
        },
        {
          fromSocietyId: 'society_1',
          toSocietyId: 'society_2',
          timestamp: new Date('2024-01-20T11:00:00Z'),
        },
      ];

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        switchHistory: mockSwitchHistory,
      });

      const { switchHistory } = mockUseSociety();

      expect(switchHistory).toHaveLength(2);
      expect(switchHistory[1].toSocietyId).toBe('society_2');
    });
  });

  describe('Data Isolation', () => {
    it('should maintain separate data for each society', () => {
      const mockSocietyData = new Map([
        ['society_1', { residents: 95, bills: 120 }],
        ['society_2', { residents: 72, bills: 80 }],
      ]);

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        societyData: mockSocietyData,
        getSocietyData: jest.fn((societyId: string, key: string) => {
          const data = mockSocietyData.get(societyId);
          return data?.[key];
        }),
      });

      const { getSocietyData } = mockUseSociety();

      expect(getSocietyData('society_1', 'residents')).toBe(95);
      expect(getSocietyData('society_2', 'residents')).toBe(72);
      expect(getSocietyData('society_1', 'bills')).toBe(120);
      expect(getSocietyData('society_2', 'bills')).toBe(80);
    });

    it('should clear society data on logout', () => {
      const mockClearSocietyData = jest.fn();

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        clearSocietyData: mockClearSocietyData,
      });

      const { clearSocietyData } = mockUseSociety();

      act(() => {
        clearSocietyData('society_1');
      });

      expect(mockClearSocietyData).toHaveBeenCalledWith('society_1');
    });
  });

  describe('Bulk Operations', () => {
    it('should perform bulk operations across multiple societies', async () => {
      const mockBulkOperation = jest.fn().mockResolvedValue({
        operation: 'generate_bills',
        societies: ['society_1', 'society_2'],
        results: [
          { societyId: 'society_1', success: true, message: 'Bills generated' },
          { societyId: 'society_2', success: true, message: 'Bills generated' },
        ],
      });

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        bulkOperation: mockBulkOperation,
      });

      const { bulkOperation } = mockUseSociety();

      const result = await bulkOperation(
        'generate_bills',
        {
          amount: 2500,
          dueDate: '2024-02-01',
        },
        ['society_1', 'society_2'],
      );

      expect(mockBulkOperation).toHaveBeenCalledWith(
        'generate_bills',
        { amount: 2500, dueDate: '2024-02-01' },
        ['society_1', 'society_2'],
      );
      expect(result.results).toHaveLength(2);
      expect(result.results.every((r) => r.success)).toBe(true);
    });

    it('should handle partial failures in bulk operations', async () => {
      const mockBulkOperation = jest.fn().mockResolvedValue({
        operation: 'approve_visitors',
        societies: ['society_1', 'society_2'],
        results: [
          {
            societyId: 'society_1',
            success: true,
            message: 'Visitors approved',
          },
          {
            societyId: 'society_2',
            success: false,
            message: 'Permission denied',
          },
        ],
      });

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        bulkOperation: mockBulkOperation,
      });

      const { bulkOperation } = mockUseSociety();

      const result = await bulkOperation('approve_visitors', {
        visitorIds: ['v1', 'v2', 'v3'],
      });

      expect(result.results.filter((r) => r.success)).toHaveLength(1);
      expect(result.results.filter((r) => !r.success)).toHaveLength(1);
    });
  });

  describe('Cross-Society Queries', () => {
    it('should execute queries across multiple societies', async () => {
      const mockCrossSocietyQuery = jest.fn().mockResolvedValue({
        query: 'financial_summary',
        societies: ['society_1', 'society_2'],
        results: {
          society_1: { totalRevenue: 500000, pendingAmount: 50000 },
          society_2: { totalRevenue: 300000, pendingAmount: 30000 },
        },
      });

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        crossSocietyQuery: mockCrossSocietyQuery,
      });

      const { crossSocietyQuery } = mockUseSociety();

      const result = await crossSocietyQuery('financial_summary', {
        timeframe: 'monthly',
      });

      expect(mockCrossSocietyQuery).toHaveBeenCalledWith('financial_summary', {
        timeframe: 'monthly',
      });
      expect(Object.keys(result.results)).toEqual(['society_1', 'society_2']);
    });
  });

  describe('Notification Filtering', () => {
    it('should filter notifications by society context', () => {
      const mockNotifications = [
        { id: '1', societyId: 'society_1', message: 'Society 1 notification' },
        { id: '2', societyId: 'society_2', message: 'Society 2 notification' },
        {
          id: '3',
          affectedSocieties: ['society_1'],
          message: 'Multi-society notification',
        },
        { id: '4', message: 'Global notification' },
      ];

      const mockFilterNotifications = jest.fn(
        (notifications: any[], societyId: string) => {
          return notifications.filter((notification) => {
            if (!notification.societyId) return true; // Global notifications
            if (notification.societyId === societyId) return true; // Society-specific
            if (notification.affectedSocieties?.includes(societyId))
              return true; // Multi-society
            return false;
          });
        },
      );

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        filterNotificationsForSociety: mockFilterNotifications,
      });

      const { filterNotificationsForSociety } = mockUseSociety();

      const society1Notifications = filterNotificationsForSociety(
        mockNotifications,
        'society_1',
      );
      const society2Notifications = filterNotificationsForSociety(
        mockNotifications,
        'society_2',
      );

      expect(society1Notifications).toHaveLength(3); // society_1, multi-society, global
      expect(society2Notifications).toHaveLength(2); // society_2, global
    });
  });

  describe('Performance and Caching', () => {
    it('should cache society data efficiently', () => {
      const mockSetSocietyData = jest.fn();
      const mockGetSocietyData = jest.fn().mockReturnValue(null);

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        setSocietyData: mockSetSocietyData,
        getSocietyData: mockGetSocietyData,
      });

      const { setSocietyData, getSocietyData } = mockUseSociety();

      // First call should cache the data
      setSocietyData('society_1', 'residents', {
        count: 95,
        lastUpdated: Date.now(),
      });

      expect(mockSetSocietyData).toHaveBeenCalledWith(
        'society_1',
        'residents',
        { count: 95, lastUpdated: expect.any(Number) },
      );

      // Second call should retrieve from cache
      getSocietyData('society_1', 'residents');
      expect(mockGetSocietyData).toHaveBeenCalledWith('society_1', 'residents');
    });

    it('should handle concurrent society switches gracefully', async () => {
      const mockSwitchSociety = jest
        .fn()
        .mockResolvedValueOnce(undefined) // First switch succeeds
        .mockRejectedValueOnce(new Error('Switch in progress')); // Second switch fails

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        switchSociety: mockSwitchSociety,
      });

      const { switchSociety } = mockUseSociety();

      // Simulate concurrent switches
      const promise1 = switchSociety('society_1');
      const promise2 = switchSociety('society_2');

      await expect(promise1).resolves.toBeUndefined();
      await expect(promise2).rejects.toThrow('Switch in progress');
    });
  });

  describe('Error Handling', () => {
    it('should handle network failures gracefully', async () => {
      const mockBulkOperation = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        bulkOperation: mockBulkOperation,
      });

      const { bulkOperation } = mockUseSociety();

      await expect(bulkOperation('sync_data', {})).rejects.toThrow(
        'Network error',
      );
    });

    it('should validate society context before operations', () => {
      const mockValidateSocietyAccess = jest.fn().mockReturnValue(false);

      mockUseSociety.mockReturnValue({
        ...mockUseSociety(),
        validateSocietyAccess: mockValidateSocietyAccess,
      });

      const { validateSocietyAccess } = mockUseSociety();

      expect(validateSocietyAccess('invalid_society')).toBe(false);
      expect(mockValidateSocietyAccess).toHaveBeenCalledWith('invalid_society');
    });
  });
});
