// Admin Authentication Service - Extends base auth for admin roles

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminUser, AdminRole, AdminSession, Society, Permission, AuditLog } from '@/types/admin';
import { UserProfile } from '@/types/storage';

export interface AdminAuthResponse {
  success: boolean;
  adminUser?: AdminUser;
  session?: AdminSession;
  error?: string;
  requiresVerification?: boolean;
}

export interface RoleAssignmentRequest {
  targetUserId: string;
  role: AdminRole;
  societyId: string;
  assignedBy: string;
  validUntil?: string;
  permissions?: Permission[];
}

export class AdminAuthService {
  private static instance: AdminAuthService;
  private currentSession: AdminSession | null = null;

  public static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService();
    }
    return AdminAuthService.instance;
  }

  // Check if user has admin privileges
  async checkAdminStatus(userId: string): Promise<{
    isAdmin: boolean;
    adminUser?: AdminUser;
    societies: Society[];
  }> {
    try {
      // TODO: Replace with actual API call
      const response = await this.mockAPICall(`/admin/check-status/${userId}`);
      
      return {
        isAdmin: response.isAdmin,
        adminUser: response.adminUser,
        societies: response.societies || []
      };
    } catch (error) {
      console.error('Failed to check admin status:', error);
      return { isAdmin: false, societies: [] };
    }
  }

  // Admin login with role verification
  async adminLogin(phoneNumber: string, otp: string): Promise<AdminAuthResponse> {
    try {
      // Verify OTP first
      const otpVerified = await this.verifyOTP(phoneNumber, otp);
      if (!otpVerified) {
        return { success: false, error: 'Invalid OTP' };
      }

      // Check admin status
      const userProfile = await this.getUserByPhone(phoneNumber);
      if (!userProfile) {
        return { success: false, error: 'User not found' };
      }

      const adminStatus = await this.checkAdminStatus(userProfile.id);
      if (!adminStatus.isAdmin) {
        return { success: false, error: 'User does not have admin privileges' };
      }

      // Create admin session
      const session = await this.createAdminSession(adminStatus.adminUser!, adminStatus.societies);
      
      // Store session
      await this.storeSession(session);
      this.currentSession = session;

      // Log admin login
      await this.logAuditEvent('admin_login', {
        userId: adminStatus.adminUser!.id,
        role: adminStatus.adminUser!.role,
        sessionId: session.sessionId
      });

      return {
        success: true,
        adminUser: adminStatus.adminUser,
        session: session
      };

    } catch (error) {
      console.error('Admin login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Create admin session with permissions
  private async createAdminSession(
    adminUser: AdminUser, 
    societies: Society[]
  ): Promise<AdminSession> {
    const deviceInfo = await this.getDeviceInfo();
    const permissions = await this.loadPermissionsForUser(adminUser);

    const session: AdminSession = {
      sessionId: this.generateSessionId(),
      userId: adminUser.id,
      currentMode: 'admin',
      activeSocietyId: societies[0]?.id,
      adminRole: adminUser.role,
      permissions: permissions,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: await this.getDeviceIP(),
      deviceInfo: deviceInfo
    };

    return session;
  }

  // Load permissions for admin user
  private async loadPermissionsForUser(adminUser: AdminUser): Promise<Permission[]> {
    try {
      // TODO: Replace with actual API call
      const response = await this.mockAPICall(`/admin/permissions/${adminUser.id}`);
      return response.permissions || this.getDefaultPermissionsForRole(adminUser.role);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      return this.getDefaultPermissionsForRole(adminUser.role);
    }
  }

  // Get default permissions based on role
  private getDefaultPermissionsForRole(role: AdminRole): Permission[] {
    const rolePermissions: Record<AdminRole, Permission[]> = {
      super_admin: [
        { id: '1', resource: '*', action: '*', scope: 'global' }
      ],
      community_manager: [
        { id: '2', resource: 'residents', action: 'create', scope: 'society' },
        { id: '3', resource: 'residents', action: 'read', scope: 'society' },
        { id: '4', resource: 'residents', action: 'update', scope: 'society' },
        { id: '5', resource: 'residents', action: 'delete', scope: 'society' },
        { id: '6', resource: 'billing', action: 'create', scope: 'society' },
        { id: '7', resource: 'billing', action: 'read', scope: 'society' },
        { id: '8', resource: 'billing', action: 'update', scope: 'society' },
        { id: '9', resource: 'maintenance', action: 'approve', scope: 'society' },
        { id: '10', resource: 'visitors', action: 'bulk_approve', scope: 'society' },
        { id: '11', resource: 'communication', action: 'broadcast', scope: 'society' },
        { id: '12', resource: 'emergency', action: 'declare', scope: 'society' },
        { id: '13', resource: 'team_management', action: 'assign', scope: 'society' }
      ],
      financial_manager: [
        { id: '14', resource: 'billing', action: 'create', scope: 'society' },
        { id: '15', resource: 'billing', action: 'read', scope: 'society' },
        { id: '16', resource: 'billing', action: 'update', scope: 'society' },
        { id: '17', resource: 'billing', action: 'generate', scope: 'society' },
        { id: '18', resource: 'residents', action: 'read', scope: 'society', conditions: [
          { field: 'data_type', operator: 'equals', value: 'billing_info_only' }
        ]},
        { id: '19', resource: 'communication', action: 'billing_notices', scope: 'society' }
      ],
      security_admin: [
        { id: '20', resource: 'visitors', action: 'create', scope: 'society' },
        { id: '21', resource: 'visitors', action: 'read', scope: 'society' },
        { id: '22', resource: 'visitors', action: 'update', scope: 'society' },
        { id: '23', resource: 'visitors', action: 'approve', scope: 'society' },
        { id: '24', resource: 'visitors', action: 'reject', scope: 'society' },
        { id: '25', resource: 'visitors', action: 'bulk_actions', scope: 'society' },
        { id: '26', resource: 'security', action: 'incidents', scope: 'society' },
        { id: '27', resource: 'residents', action: 'read', scope: 'society', conditions: [
          { field: 'data_type', operator: 'equals', value: 'contact_info_only' }
        ]},
        { id: '28', resource: 'communication', action: 'security_alerts', scope: 'society' }
      ],
      maintenance_admin: [
        { id: '29', resource: 'maintenance', action: 'create', scope: 'society' },
        { id: '30', resource: 'maintenance', action: 'read', scope: 'society' },
        { id: '31', resource: 'maintenance', action: 'update', scope: 'society' },
        { id: '32', resource: 'maintenance', action: 'assign', scope: 'society' },
        { id: '33', resource: 'vendors', action: 'create', scope: 'society' },
        { id: '34', resource: 'vendors', action: 'read', scope: 'society' },
        { id: '35', resource: 'vendors', action: 'update', scope: 'society' },
        { id: '36', resource: 'residents', action: 'read', scope: 'society', conditions: [
          { field: 'data_type', operator: 'equals', value: 'contact_info_only' }
        ]},
        { id: '37', resource: 'communication', action: 'maintenance_updates', scope: 'society' }
      ]
    };

    return rolePermissions[role] || [];
  }

  // Role assignment by authorized users
  async assignRole(request: RoleAssignmentRequest): Promise<{
    success: boolean;
    error?: string;
    auditLogId?: string;
  }> {
    try {
      // Validate permission to assign role
      const canAssign = await this.canAssignRole(request.assignedBy, request.role, request.societyId);
      if (!canAssign.allowed) {
        return { success: false, error: canAssign.reason };
      }

      // TODO: Replace with actual API call
      const response = await this.mockAPICall('/admin/assign-role', {
        method: 'POST',
        body: request
      });

      if (response.success) {
        // Log role assignment
        const auditLog = await this.logAuditEvent('role_assigned', {
          targetUserId: request.targetUserId,
          role: request.role,
          societyId: request.societyId,
          assignedBy: request.assignedBy,
          validUntil: request.validUntil
        });

        return { success: true, auditLogId: auditLog.id };
      } else {
        return { success: false, error: response.error };
      }

    } catch (error) {
      console.error('Role assignment failed:', error);
      return { success: false, error: 'Assignment failed. Please try again.' };
    }
  }

  // Check if user can assign specific role
  private async canAssignRole(
    assignerId: string, 
    targetRole: AdminRole, 
    societyId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const assignerAdmin = await this.getAdminUser(assignerId);
      if (!assignerAdmin) {
        return { allowed: false, reason: 'Assigner not found or not admin' };
      }

      // Role hierarchy validation
      const roleHierarchy: Record<AdminRole, AdminRole[]> = {
        super_admin: ['community_manager', 'financial_manager', 'security_admin', 'maintenance_admin'],
        community_manager: ['financial_manager', 'security_admin', 'maintenance_admin'],
        financial_manager: [],
        security_admin: [],
        maintenance_admin: []
      };

      const canAssign = roleHierarchy[assignerAdmin.role].includes(targetRole);
      if (!canAssign) {
        return { 
          allowed: false, 
          reason: `${assignerAdmin.role} cannot assign ${targetRole} role` 
        };
      }

      // Society access validation
      if (assignerAdmin.role !== 'super_admin') {
        const hasAccess = assignerAdmin.societies.some(s => s.societyId === societyId && s.isActive);
        if (!hasAccess) {
          return { allowed: false, reason: 'No access to target society' };
        }
      }

      return { allowed: true };

    } catch (error) {
      console.error('Role assignment validation failed:', error);
      return { allowed: false, reason: 'Validation failed' };
    }
  }

  // Revoke admin role
  async revokeRole(
    adminId: string,
    targetUserId: string,
    role: AdminRole,
    societyId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate permission to revoke
      const canRevoke = await this.canAssignRole(adminId, role, societyId);
      if (!canRevoke.allowed) {
        return { success: false, error: canRevoke.reason };
      }

      // TODO: Replace with actual API call
      const response = await this.mockAPICall('/admin/revoke-role', {
        method: 'POST',
        body: { targetUserId, role, societyId, reason }
      });

      if (response.success) {
        // Log role revocation
        await this.logAuditEvent('role_revoked', {
          targetUserId,
          role,
          societyId,
          revokedBy: adminId,
          reason
        });

        return { success: true };
      } else {
        return { success: false, error: response.error };
      }

    } catch (error) {
      console.error('Role revocation failed:', error);
      return { success: false, error: 'Revocation failed. Please try again.' };
    }
  }

  // Session management
  async validateSession(sessionId: string): Promise<{ 
    valid: boolean; 
    session?: AdminSession; 
    error?: string 
  }> {
    try {
      const storedSession = await this.getStoredSession(sessionId);
      if (!storedSession) {
        return { valid: false, error: 'Session not found' };
      }

      // Check session expiry (24 hours for admin sessions)
      const sessionAge = Date.now() - new Date(storedSession.startTime).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxAge) {
        await this.invalidateSession(sessionId);
        return { valid: false, error: 'Session expired' };
      }

      // Update last activity
      storedSession.lastActivity = new Date().toISOString();
      await this.storeSession(storedSession);

      return { valid: true, session: storedSession };

    } catch (error) {
      console.error('Session validation failed:', error);
      return { valid: false, error: 'Session validation failed' };
    }
  }

  async switchToAdminMode(sessionId: string): Promise<AdminSession> {
    const validation = await this.validateSession(sessionId);
    if (!validation.valid || !validation.session) {
      throw new Error('Invalid session');
    }

    const updatedSession = {
      ...validation.session,
      currentMode: 'admin' as const,
      lastActivity: new Date().toISOString()
    };

    await this.storeSession(updatedSession);
    this.currentSession = updatedSession;

    return updatedSession;
  }

  async switchSociety(sessionId: string, societyId: string): Promise<AdminSession> {
    const validation = await this.validateSession(sessionId);
    if (!validation.valid || !validation.session) {
      throw new Error('Invalid session');
    }

    // Validate society access
    const adminUser = await this.getAdminUser(validation.session.userId);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const hasAccess = adminUser.societies.some(s => s.societyId === societyId && s.isActive);
    if (!hasAccess) {
      throw new Error('Access denied to society');
    }

    const updatedSession = {
      ...validation.session,
      activeSocietyId: societyId,
      lastActivity: new Date().toISOString()
    };

    await this.storeSession(updatedSession);
    this.currentSession = updatedSession;

    // Reload permissions for new society
    const permissions = await this.loadPermissionsForUser(adminUser);
    updatedSession.permissions = permissions;

    return updatedSession;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`admin_session_${sessionId}`);
      if (this.currentSession?.sessionId === sessionId) {
        this.currentSession = null;
      }
    } catch (error) {
      console.error('Failed to invalidate session:', error);
    }
  }

  // Audit logging
  async logAuditEvent(eventType: string, details: any): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      category: this.categorizeEvent(eventType),
      eventType,
      actor: {
        userId: this.currentSession?.userId || 'system',
        role: this.currentSession?.adminRole || 'super_admin',
        name: 'Admin User', // TODO: Get actual name
        ipAddress: this.currentSession?.ipAddress || '0.0.0.0',
        deviceInfo: this.currentSession?.deviceInfo || {
          platform: 'unknown',
          version: '0.0.0',
          appVersion: '1.0.0'
        }
      },
      target: {
        resourceType: details.resourceType || 'unknown',
        resourceId: details.resourceId || '',
        affectedUsers: details.affectedUsers || [],
        societyId: details.societyId
      },
      details: {
        action: eventType,
        oldValue: details.oldValue,
        newValue: details.newValue,
        reason: details.reason,
        approvalRequired: details.approvalRequired,
        approvedBy: details.approvedBy,
        escalatedFrom: details.escalatedFrom,
        metadata: details
      },
      severity: this.getEventSeverity(eventType),
      societyId: details.societyId || this.currentSession?.activeSocietyId || '',
      sessionId: this.currentSession?.sessionId || '',
      retentionUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };

    try {
      // TODO: Replace with actual audit API call
      await this.mockAPICall('/admin/audit-log', {
        method: 'POST',
        body: auditLog
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }

    return auditLog;
  }

  // Helper methods
  private async storeSession(session: AdminSession): Promise<void> {
    await AsyncStorage.setItem(`admin_session_${session.sessionId}`, JSON.stringify(session));
  }

  private async getStoredSession(sessionId: string): Promise<AdminSession | null> {
    try {
      const stored = await AsyncStorage.getItem(`admin_session_${sessionId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private generateSessionId(): string {
    return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private categorizeEvent(eventType: string): any {
    const categories = {
      'admin_login': 'admin_actions',
      'role_assigned': 'admin_actions',
      'role_revoked': 'admin_actions',
      'mode_switched': 'admin_actions',
      'society_switched': 'admin_actions',
      'bill_generated': 'billing_finance',
      'maintenance_approved': 'maintenance_management',
      'visitor_approved': 'security_management',
      'resident_added': 'resident_management',
      'emergency_declared': 'emergency_response'
    };
    return (categories as any)[eventType] || 'admin_actions';
  }

  private getEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap = {
      'emergency_declared': 'critical',
      'role_assigned': 'high',
      'role_revoked': 'high',
      'admin_login': 'medium',
      'mode_switched': 'low',
      'society_switched': 'low'
    };
    return (severityMap as any)[eventType] || 'medium';
  }

  private async getDeviceInfo(): Promise<any> {
    // TODO: Implement actual device info detection
    return {
      platform: 'ios',
      version: '17.0',
      appVersion: '1.0.0'
    };
  }

  private async getDeviceIP(): Promise<string> {
    // TODO: Implement actual IP detection
    return '192.168.1.1';
  }

  private async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
    // TODO: Implement actual OTP verification
    return otp === '123456'; // Mock verification
  }

  private async getUserByPhone(phoneNumber: string): Promise<UserProfile | null> {
    // TODO: Implement actual user lookup
    return {
      id: 'user123',
      fullName: 'Admin User',
      phoneNumber,
      email: 'admin@example.com',
      societyId: 'society1',
      flatNumber: 'A-101',
      ownershipType: 'owner',
      familySize: 3,
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private async getAdminUser(userId: string): Promise<AdminUser | null> {
    try {
      const response = await this.mockAPICall(`/admin/user/${userId}`);
      return response.adminUser || null;
    } catch {
      return null;
    }
  }

  // Mock API call - replace with actual API implementation
  private async mockAPICall(endpoint: string, options?: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          isAdmin: true,
          adminUser: {
            id: 'admin123',
            name: 'Admin User',
            email: 'admin@example.com',
            phoneNumber: '+919876543210',
            role: 'community_manager',
            societies: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            permissions: [],
            emergencyContact: true
          },
          societies: [],
          permissions: []
        });
      }, 500);
    });
  }
}

export default AdminAuthService.getInstance();