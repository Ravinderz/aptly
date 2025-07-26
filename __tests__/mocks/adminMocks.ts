import { AdminUser, AdminRole, Permission, Society, AdminSession } from '../../types/admin';

export const createMockAdminUser = (overrides?: Partial<AdminUser>): AdminUser => ({
  id: 'admin-123',
  email: 'admin@test.com',
  fullName: 'Test Admin',
  role: 'super_admin',
  societies: ['society-1'],
  permissions: ['read', 'write', 'delete'],
  isActive: true,
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockSociety = (overrides?: Partial<Society>): Society => ({
  id: 'society-1',
  name: 'Test Society',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  pincode: '123456',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockSession = (overrides?: Partial<AdminSession>): AdminSession => ({
  id: 'session-123',
  adminId: 'admin-123',
  societyId: 'society-1',
  token: 'mock-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockAdminRole = (overrides?: Partial<AdminRole>): AdminRole => ({
  id: 'role-1',
  name: 'Test Role',
  description: 'Test role description',
  permissions: ['read', 'write'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockPermission = (overrides?: Partial<Permission>): Permission => ({
  id: 'permission-1',
  name: 'test_permission',
  description: 'Test permission',
  resource: 'test_resource',
  action: 'read',
  ...overrides,
});