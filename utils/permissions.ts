import { AdminUser, Permission } from '../types/admin';

export class PermissionChecker {
  constructor() {}

  hasPermission(
    user: AdminUser,
    permission: string,
    resource?: string,
  ): boolean {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission as any);
  }

  canAccess(user: AdminUser, action: string, resource: string): boolean {
    return this.hasPermission(user, action, resource);
  }

  filterByPermissions<T>(user: AdminUser, items: T[], permission: string): T[] {
    if (this.hasPermission(user, permission)) {
      return items;
    }
    return [];
  }
}

export const checkPermission = (
  user: AdminUser,
  permission: string,
): boolean => {
  const checker = new PermissionChecker();
  return checker.hasPermission(user, permission);
};
