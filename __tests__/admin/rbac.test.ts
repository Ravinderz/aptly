/**
 * Comprehensive Role-Based Access Control (RBAC) Testing Suite
 * Tests all admin roles, permissions, and security boundaries
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  AdminUser,
  AdminRole,
  Permission,
  Society,
  AdminSession,
} from '../../types/admin';
import {
  createMockAdminUser,
  createMockSociety,
  createMockSession,
} from '../mocks/adminMocks';
import { PermissionChecker } from '../../utils/permissions';
import { AdminAuthService } from '../../services/admin/authService';
import { RoleManager } from '../../services/admin/roleManager';

describe('Role-Based Access Control (RBAC) Tests', () => {
  let permissionChecker: PermissionChecker;
  let authService: AdminAuthService;
  let roleManager: RoleManager;
  let testSociety: Society;

  beforeEach(() => {
    permissionChecker = new PermissionChecker();
    authService = new AdminAuthService();
    roleManager = new RoleManager();
    testSociety = createMockSociety();
  });

  afterEach(() => {
    // Clean up test data
    jest.clearAllMocks();
  });

  describe('Super Admin Role Tests', () => {
    let superAdmin: AdminUser;
    let session: AdminSession;

    beforeEach(() => {
      superAdmin = createMockAdminUser('super_admin');
      session = createMockSession(superAdmin.id, 'admin', testSociety.id);
    });

    test('Super Admin can access all societies', async () => {
      const societies = await authService.getAccessibleSocieties(superAdmin.id);
      expect(societies).toEqual('all'); // Special case for super admin
    });

    test('Super Admin can create and manage societies', async () => {
      const canCreate = permissionChecker.hasPermission(
        superAdmin,
        'societies',
        'create',
      );
      const canDelete = permissionChecker.hasPermission(
        superAdmin,
        'societies',
        'delete',
      );
      const canUpdate = permissionChecker.hasPermission(
        superAdmin,
        'societies',
        'update',
      );

      expect(canCreate).toBe(true);
      expect(canDelete).toBe(true);
      expect(canUpdate).toBe(true);
    });

    test('Super Admin can assign Community Manager roles', async () => {
      const targetUserId = 'user123';
      const result = await roleManager.assignRole(
        superAdmin.id,
        targetUserId,
        'community_manager',
        testSociety.id,
      );

      expect(result.success).toBe(true);
      expect(result.auditLogId).toBeDefined();
    });

    test('Super Admin can override emergency situations', async () => {
      const canOverride = permissionChecker.hasPermission(
        superAdmin,
        'emergency',
        'override',
      );
      expect(canOverride).toBe(true);
    });

    test('Super Admin cannot be assigned by other roles', async () => {
      const communityManager = createMockAdminUser('community_manager');

      await expect(
        roleManager.assignRole(
          communityManager.id,
          'newuser',
          'super_admin',
          testSociety.id,
        ),
      ).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('Community Manager Role Tests', () => {
    let communityManager: AdminUser;
    let session: AdminSession;

    beforeEach(() => {
      communityManager = createMockAdminUser('community_manager');
      session = createMockSession(communityManager.id, 'admin', testSociety.id);
    });

    test('Community Manager has full society access', async () => {
      const permissions = [
        'residents.create',
        'residents.read',
        'residents.update',
        'residents.delete',
        'billing.create',
        'billing.read',
        'billing.update',
        'billing.delete',
        'maintenance.create',
        'maintenance.read',
        'maintenance.update',
        'maintenance.approve',
        'visitors.read',
        'visitors.bulk_approve',
        'communication.notices',
        'communication.broadcast',
      ];

      permissions.forEach((permission) => {
        const [resource, action] = permission.split('.');
        const hasPermission = permissionChecker.hasPermission(
          communityManager,
          resource,
          action as any,
          testSociety.id,
        );
        expect(hasPermission).toBe(true);
      });
    });

    test('Community Manager can assign sub-admin roles', async () => {
      const subAdminRoles: AdminRole[] = [
        'financial_manager',
        'security_admin',
        'maintenance_admin',
      ];

      for (const role of subAdminRoles) {
        const result = await roleManager.assignRole(
          communityManager.id,
          `user_${role}`,
          role,
          testSociety.id,
        );
        expect(result.success).toBe(true);
      }
    });

    test('Community Manager cannot assign Community Manager role', async () => {
      await expect(
        roleManager.assignRole(
          communityManager.id,
          'newuser',
          'community_manager',
          testSociety.id,
        ),
      ).rejects.toThrow('Cannot assign same or higher role');
    });

    test('Community Manager retains permissions after delegation', async () => {
      // Assign financial manager
      await roleManager.assignRole(
        communityManager.id,
        'financial_user',
        'financial_manager',
        testSociety.id,
      );

      // CM should still have billing permissions
      const canManageBilling = permissionChecker.hasPermission(
        communityManager,
        'billing',
        'create',
        testSociety.id,
      );
      expect(canManageBilling).toBe(true);
    });

    test('Community Manager can only access assigned society', async () => {
      const otherSociety = createMockSociety('other_society');

      const canAccessOther = permissionChecker.hasPermission(
        communityManager,
        'residents',
        'read',
        otherSociety.id,
      );
      expect(canAccessOther).toBe(false);
    });

    test('Community Manager can handle emergencies', async () => {
      const canDeclareEmergency = permissionChecker.hasPermission(
        communityManager,
        'emergency',
        'declare',
      );
      const canManageEmergency = permissionChecker.hasPermission(
        communityManager,
        'emergency',
        'manage',
      );

      expect(canDeclareEmergency).toBe(true);
      expect(canManageEmergency).toBe(true);
    });
  });

  describe('Financial Manager Role Tests', () => {
    let financialManager: AdminUser;
    let session: AdminSession;

    beforeEach(() => {
      financialManager = createMockAdminUser('financial_manager', [
        testSociety.id,
      ]);
      session = createMockSession(financialManager.id, 'admin', testSociety.id);
    });

    test('Financial Manager has billing permissions only', async () => {
      // Should have billing permissions
      const billingPermissions = [
        'create',
        'read',
        'update',
        'generate',
        'reports',
      ];
      billingPermissions.forEach((action) => {
        const hasPermission = permissionChecker.hasPermission(
          financialManager,
          'billing',
          action as any,
          testSociety.id,
        );
        expect(hasPermission).toBe(true);
      });

      // Should NOT have other permissions
      const deniedActions = [
        ['maintenance', 'approve'],
        ['residents', 'delete'],
        ['visitors', 'bulk_approve'],
        ['communication', 'broadcast'],
      ];

      deniedActions.forEach(([resource, action]) => {
        const hasPermission = permissionChecker.hasPermission(
          financialManager,
          resource,
          action as any,
          testSociety.id,
        );
        expect(hasPermission).toBe(false);
      });
    });

    test('Financial Manager can access multiple societies', async () => {
      const society2 = createMockSociety('society2');

      // Add second society access
      await roleManager.assignRole(
        'community_manager_2',
        financialManager.id,
        'financial_manager',
        society2.id,
      );

      const societies = await authService.getAccessibleSocieties(
        financialManager.id,
      );
      expect(societies).toHaveLength(2);
      expect(societies).toContain(testSociety.id);
      expect(societies).toContain(society2.id);
    });

    test('Financial Manager has limited resident data access', async () => {
      const canReadBillingInfo = permissionChecker.hasPermission(
        financialManager,
        'residents',
        'read',
        testSociety.id,
        ['billing_info_only'],
      );
      const canReadFullProfile = permissionChecker.hasPermission(
        financialManager,
        'residents',
        'read',
        testSociety.id,
        ['full_profile'],
      );

      expect(canReadBillingInfo).toBe(true);
      expect(canReadFullProfile).toBe(false);
    });

    test('Financial Manager can send billing-related notices only', async () => {
      const canSendBillingNotice = permissionChecker.hasPermission(
        financialManager,
        'communication',
        'billing_notices',
        testSociety.id,
      );
      const canBroadcast = permissionChecker.hasPermission(
        financialManager,
        'communication',
        'broadcast',
        testSociety.id,
      );

      expect(canSendBillingNotice).toBe(true);
      expect(canBroadcast).toBe(false);
    });

    test('Financial Manager cannot delete bills', async () => {
      const canDelete = permissionChecker.hasPermission(
        financialManager,
        'billing',
        'delete',
        testSociety.id,
      );
      expect(canDelete).toBe(false);
    });
  });

  describe('Security Admin Role Tests', () => {
    let securityAdmin: AdminUser;
    let session: AdminSession;

    beforeEach(() => {
      securityAdmin = createMockAdminUser('security_admin', [testSociety.id]);
      session = createMockSession(securityAdmin.id, 'admin', testSociety.id);
    });

    test('Security Admin has visitor management permissions', async () => {
      const visitorPermissions = [
        'create',
        'read',
        'update',
        'approve',
        'reject',
        'bulk_actions',
      ];

      visitorPermissions.forEach((action) => {
        const hasPermission = permissionChecker.hasPermission(
          securityAdmin,
          'visitors',
          action as any,
          testSociety.id,
        );
        expect(hasPermission).toBe(true);
      });
    });

    test('Security Admin can manage security incidents', async () => {
      const securityPermissions = ['incidents', 'access_logs', 'emergency'];

      securityPermissions.forEach((permission) => {
        const hasPermission = permissionChecker.hasPermission(
          securityAdmin,
          'security',
          permission as any,
          testSociety.id,
        );
        expect(hasPermission).toBe(true);
      });
    });

    test('Security Admin cannot modify security policies', async () => {
      const canModifyPolicies = permissionChecker.hasPermission(
        securityAdmin,
        'security',
        'policies',
        testSociety.id,
      );
      expect(canModifyPolicies).toBe(false);
    });

    test('Security Admin has limited resident data access', async () => {
      const canReadContactInfo = permissionChecker.hasPermission(
        securityAdmin,
        'residents',
        'read',
        testSociety.id,
        ['contact_info_only'],
      );
      expect(canReadContactInfo).toBe(true);
    });

    test('Security Admin can send security alerts only', async () => {
      const canSendSecurityAlert = permissionChecker.hasPermission(
        securityAdmin,
        'communication',
        'security_alerts',
        testSociety.id,
      );
      const canBroadcast = permissionChecker.hasPermission(
        securityAdmin,
        'communication',
        'broadcast',
        testSociety.id,
      );

      expect(canSendSecurityAlert).toBe(true);
      expect(canBroadcast).toBe(false);
    });
  });

  describe('Cross-Role Permission Tests', () => {
    test('Role escalation matrix works correctly', async () => {
      const financialManager = createMockAdminUser('financial_manager');
      const communityManager = createMockAdminUser('community_manager');
      const superAdmin = createMockAdminUser('super_admin');

      // Financial Manager escalates to Community Manager
      const fmEscalation = permissionChecker.getEscalationPath(
        financialManager,
        'billing_dispute',
      );
      expect(fmEscalation).toContain('community_manager');

      // Community Manager escalates to Super Admin
      const cmEscalation = permissionChecker.getEscalationPath(
        communityManager,
        'technical_issue',
      );
      expect(cmEscalation).toContain('super_admin');

      // Super Admin has no escalation
      const saEscalation = permissionChecker.getEscalationPath(
        superAdmin,
        'any_issue',
      );
      expect(saEscalation).toEqual([]);
    });

    test('Permission inheritance works correctly', async () => {
      const communityManager = createMockAdminUser('community_manager');

      // CM should have all sub-admin permissions
      const subAdminPermissions = [
        ['billing', 'create'], // Financial Manager permission
        ['visitors', 'approve'], // Security Admin permission
        ['maintenance', 'assign'], // Maintenance Admin permission
      ];

      subAdminPermissions.forEach(([resource, action]) => {
        const hasPermission = permissionChecker.hasPermission(
          communityManager,
          resource,
          action as any,
          testSociety.id,
        );
        expect(hasPermission).toBe(true);
      });
    });

    test('Society isolation works correctly', async () => {
      const society1 = createMockSociety('society1');
      const society2 = createMockSociety('society2');

      const cm1 = createMockAdminUser('community_manager', [society1.id]);
      const cm2 = createMockAdminUser('community_manager', [society2.id]);

      // CM1 cannot access Society2 data
      const cm1CanAccessSociety2 = permissionChecker.hasPermission(
        cm1,
        'residents',
        'read',
        society2.id,
      );
      expect(cm1CanAccessSociety2).toBe(false);

      // CM2 cannot access Society1 data
      const cm2CanAccessSociety1 = permissionChecker.hasPermission(
        cm2,
        'residents',
        'read',
        society1.id,
      );
      expect(cm2CanAccessSociety1).toBe(false);
    });
  });

  describe('Session Management Tests', () => {
    test('Admin mode switching updates permissions', async () => {
      const user = createMockAdminUser('community_manager');
      let session = createMockSession(user.id, 'resident', testSociety.id);

      // In resident mode, no admin permissions
      let hasAdminPermission = permissionChecker.hasPermission(
        user,
        'residents',
        'delete',
        testSociety.id,
      );
      expect(hasAdminPermission).toBe(false);

      // Switch to admin mode
      session = await authService.switchToAdminMode(session.sessionId);
      expect(session.currentMode).toBe('admin');

      // Now should have admin permissions
      hasAdminPermission = permissionChecker.hasPermission(
        user,
        'residents',
        'delete',
        testSociety.id,
      );
      expect(hasAdminPermission).toBe(true);
    });

    test('Multi-society context switching works', async () => {
      const society1 = createMockSociety('society1');
      const society2 = createMockSociety('society2');

      const financialManager = createMockAdminUser('financial_manager', [
        society1.id,
        society2.id,
      ]);
      let session = createMockSession(
        financialManager.id,
        'admin',
        society1.id,
      );

      // Initially in society1 context
      expect(session.activeSocietyId).toBe(society1.id);

      // Switch to society2
      session = await authService.switchSociety(session.sessionId, society2.id);
      expect(session.activeSocietyId).toBe(society2.id);

      // Permissions should be updated for new society context
      const permissions = permissionChecker.getPermissionsForSociety(
        financialManager,
        society2.id,
      );
      expect(permissions).toBeDefined();
    });
  });

  describe('Audit Trail Permission Tests', () => {
    test('Audit logs are created for all admin actions', async () => {
      const communityManager = createMockAdminUser('community_manager');
      const session = createMockSession(
        communityManager.id,
        'admin',
        testSociety.id,
      );

      // Perform an admin action
      await roleManager.assignRole(
        communityManager.id,
        'newuser',
        'financial_manager',
        testSociety.id,
      );

      // Check if audit log was created
      const auditLogs = await authService.getAuditLogs({
        actorId: communityManager.id,
        societyId: testSociety.id,
        category: 'admin_actions',
      });

      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0].eventType).toBe('role_assigned');
      expect(auditLogs[0].actor.userId).toBe(communityManager.id);
    });

    test('Sensitive actions require additional approval', async () => {
      const financialManager = createMockAdminUser('financial_manager');

      // Large amount billing action should require CM approval
      await expect(
        authService.performAction(financialManager.id, 'billing', 'create', {
          amount: 100000, // Large amount
          societyId: testSociety.id,
        }),
      ).rejects.toThrow('Requires community_manager approval');
    });
  });

  describe('Error Handling and Security Tests', () => {
    test('Invalid permissions throw appropriate errors', async () => {
      const securityAdmin = createMockAdminUser('security_admin');

      await expect(
        authService.performAction(securityAdmin.id, 'billing', 'delete', {
          billId: 'bill123',
          societyId: testSociety.id,
        }),
      ).rejects.toThrow('Insufficient permissions');
    });

    test('Session hijacking protection', async () => {
      const user = createMockAdminUser('community_manager');
      const session = createMockSession(user.id, 'admin', testSociety.id);

      // Change IP address (simulate hijacking)
      const hijackedSession = { ...session, ipAddress: '192.168.1.100' };

      await expect(
        authService.validateSession(hijackedSession.sessionId),
      ).rejects.toThrow('Session security violation');
    });

    test('Role assignment validation', async () => {
      const financialManager = createMockAdminUser('financial_manager');

      // Financial Manager cannot assign any roles
      await expect(
        roleManager.assignRole(
          financialManager.id,
          'newuser',
          'security_admin',
          testSociety.id,
        ),
      ).rejects.toThrow('Role assignment not permitted');
    });

    test('Inactive admin access is denied', async () => {
      const inactiveAdmin = createMockAdminUser('community_manager');
      inactiveAdmin.isActive = false;

      const canAccess = permissionChecker.hasPermission(
        inactiveAdmin,
        'residents',
        'read',
        testSociety.id,
      );
      expect(canAccess).toBe(false);
    });
  });

  describe('Performance and Scalability Tests', () => {
    test('Permission checking is performant for large datasets', async () => {
      const startTime = Date.now();

      // Create 1000 permission checks
      const promises = Array.from({ length: 1000 }, (_, i) => {
        const user = createMockAdminUser('financial_manager');
        return permissionChecker.hasPermission(
          user,
          'billing',
          'read',
          testSociety.id,
        );
      });

      await Promise.all(promises);
      const endTime = Date.now();

      // Should complete within 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('Multi-society queries are optimized', async () => {
      const financialManager = createMockAdminUser('financial_manager');

      // Add access to 10 societies
      const societies = Array.from({ length: 10 }, (_, i) =>
        createMockSociety(`society${i}`),
      );

      societies.forEach((society) => {
        financialManager.societies.push({
          societyId: society.id,
          societyName: society.name,
          role: 'financial_manager',
          assignedBy: 'cm',
          assignedAt: new Date().toISOString(),
          isActive: true,
          permissions: [],
        });
      });

      const startTime = Date.now();
      const accessibleSocieties = await authService.getAccessibleSocieties(
        financialManager.id,
      );
      const endTime = Date.now();

      expect(accessibleSocieties).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});
