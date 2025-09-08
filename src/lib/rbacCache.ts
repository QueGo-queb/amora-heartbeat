import { CacheService } from './cache';
import { RBACService } from './rbac';
import type { UserWithRoles, PermissionType, UserRole } from '../../types/rbac';

export class RBACCacheService {
  private static ROLES_TTL = 1800; // 30 minutes
  private static PERMISSIONS_TTL = 3600; // 1 heure

  /**
   * Cache des rôles utilisateur
   */
  static async getUserRoles(userId: string): Promise<UserWithRoles | null> {
    return await CacheService.getOrSet(
      `rbac:user:${userId}:roles`,
      () => RBACService.getUserRoles(userId),
      this.ROLES_TTL
    );
  }

  /**
   * Cache de vérification de permission
   */
  static async hasPermission(userId: string, permission: PermissionType): Promise<boolean> {
    return await CacheService.getOrSet(
      `rbac:user:${userId}:permission:${permission}`,
      () => RBACService.hasPermission(userId, permission),
      this.PERMISSIONS_TTL
    );
  }

  /**
   * Cache de vérification de rôle
   */
  static async hasRole(userId: string, role: UserRole): Promise<boolean> {
    return await CacheService.getOrSet(
      `rbac:user:${userId}:role:${role}`,
      () => RBACService.hasRole(userId, role),
      this.PERMISSIONS_TTL
    );
  }

  /**
   * Invalidation du cache RBAC
   */
  static async invalidateUserRBAC(userId: string): Promise<void> {
    await CacheService.deletePattern(`rbac:user:${userId}:*`);
  }

  /**
   * Invalidation globale RBAC (quand les permissions changent)
   */
  static async invalidateAllRBAC(): Promise<void> {
    await CacheService.deletePattern('rbac:*');
  }
}
