import { PermissionChecker, checkPermission } from '../../utils/permissions';
import { AdminUser } from '../../types/admin';

describe('Permission System', () => {
  const mockUser: AdminUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'community_manager',
    permissions: ['read_posts', 'write_posts', 'manage_residents'],
    societies: ['society-1'],
    createdAt: new Date(),
    isActive: true
  };

  const mockSuperAdmin: AdminUser = {
    id: 'admin-123',
    email: 'admin@example.com',
    role: 'super_admin',
    permissions: ['*'], // All permissions
    societies: [],
    createdAt: new Date(),
    isActive: true
  };

  describe('PermissionChecker', () => {
    let permissionChecker: PermissionChecker;

    beforeEach(() => {
      permissionChecker = new PermissionChecker();
    });

    describe('hasPermission', () => {
      test('should return true when user has specific permission', () => {
        expect(permissionChecker.hasPermission(mockUser, 'read_posts')).toBe(true);
        expect(permissionChecker.hasPermission(mockUser, 'write_posts')).toBe(true);
        expect(permissionChecker.hasPermission(mockUser, 'manage_residents')).toBe(true);
      });

      test('should return false when user lacks permission', () => {
        expect(permissionChecker.hasPermission(mockUser, 'delete_posts')).toBe(false);
        expect(permissionChecker.hasPermission(mockUser, 'admin_access')).toBe(false);
      });

      test('should return false for null or undefined user', () => {
        expect(permissionChecker.hasPermission(null as any, 'read_posts')).toBe(false);
        expect(permissionChecker.hasPermission(undefined as any, 'read_posts')).toBe(false);
      });

      test('should return false when user has no permissions array', () => {
        const userWithoutPermissions = { ...mockUser, permissions: undefined } as any;
        expect(permissionChecker.hasPermission(userWithoutPermissions, 'read_posts')).toBe(false);
      });

      test('should handle wildcard permissions for super admin', () => {
        expect(permissionChecker.hasPermission(mockSuperAdmin, '*')).toBe(true);
      });

      test('should handle permission with resource parameter', () => {
        expect(permissionChecker.hasPermission(mockUser, 'read_posts', 'community')).toBe(true);
        expect(permissionChecker.hasPermission(mockUser, 'delete_posts', 'community')).toBe(false);
      });
    });

    describe('canAccess', () => {
      test('should check access permissions', () => {
        expect(permissionChecker.canAccess(mockUser, 'read', 'posts')).toBe(false);
        expect(permissionChecker.canAccess(mockUser, 'read_posts', 'community')).toBe(true);
      });

      test('should return false for unauthorized access', () => {
        expect(permissionChecker.canAccess(mockUser, 'delete_all', 'system')).toBe(false);
      });
    });

    describe('filterByPermissions', () => {
      const mockItems = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ];

      test('should return all items when user has permission', () => {
        const filtered = permissionChecker.filterByPermissions(mockUser, mockItems, 'read_posts');
        expect(filtered).toEqual(mockItems);
        expect(filtered.length).toBe(3);
      });

      test('should return empty array when user lacks permission', () => {
        const filtered = permissionChecker.filterByPermissions(mockUser, mockItems, 'delete_posts');
        expect(filtered).toEqual([]);
        expect(filtered.length).toBe(0);
      });

      test('should handle empty items array', () => {
        const filtered = permissionChecker.filterByPermissions(mockUser, [], 'read_posts');
        expect(filtered).toEqual([]);
      });

      test('should preserve item types', () => {
        interface CustomItem {
          id: number;
          title: string;
          isActive: boolean;
        }

        const customItems: CustomItem[] = [
          { id: 1, title: 'Test', isActive: true },
          { id: 2, title: 'Test 2', isActive: false }
        ];

        const filtered = permissionChecker.filterByPermissions(mockUser, customItems, 'read_posts');
        expect(filtered).toEqual(customItems);
        expect(filtered[0]).toHaveProperty('title');
        expect(filtered[0]).toHaveProperty('isActive');
      });
    });
  });

  describe('checkPermission function', () => {
    test('should create checker and check permission', () => {
      expect(checkPermission(mockUser, 'read_posts')).toBe(true);
      expect(checkPermission(mockUser, 'delete_posts')).toBe(false);
    });

    test('should handle null user', () => {
      expect(checkPermission(null as any, 'read_posts')).toBe(false);
    });

    test('should be consistent with PermissionChecker instance', () => {
      const checker = new PermissionChecker();
      const permission = 'manage_residents';
      
      expect(checkPermission(mockUser, permission)).toBe(
        checker.hasPermission(mockUser, permission)
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty permissions array', () => {
      const userWithEmptyPermissions = { ...mockUser, permissions: [] };
      const checker = new PermissionChecker();
      
      expect(checker.hasPermission(userWithEmptyPermissions, 'read_posts')).toBe(false);
    });

    test('should handle malformed permission strings', () => {
      const checker = new PermissionChecker();
      
      expect(checker.hasPermission(mockUser, '')).toBe(false);
      expect(checker.hasPermission(mockUser, ' ')).toBe(false);
    });

    test('should be case sensitive for permissions', () => {
      const checker = new PermissionChecker();
      
      expect(checker.hasPermission(mockUser, 'READ_POSTS')).toBe(false); // Different case
      expect(checker.hasPermission(mockUser, 'read_posts')).toBe(true);   // Exact case
    });

    test('should handle special characters in permissions', () => {
      const userWithSpecialPermissions = {
        ...mockUser,
        permissions: ['read-posts', 'write.posts', 'manage_residents']
      };
      const checker = new PermissionChecker();
      
      expect(checker.hasPermission(userWithSpecialPermissions, 'read-posts')).toBe(true);
      expect(checker.hasPermission(userWithSpecialPermissions, 'write.posts')).toBe(true);
    });
  });
});