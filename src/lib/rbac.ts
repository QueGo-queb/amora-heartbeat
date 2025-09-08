import { supabase } from '@/integrations/supabase/client';
import type { UserRole, PermissionType, UserWithRoles, RoleWithPermissions } from '../../types/rbac';

export class RBACService {
  
  /**
   * Récupérer les rôles et permissions d'un utilisateur
   */
  static async getUserRoles(userId: string): Promise<UserWithRoles | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          role:roles(
            *,
            role_permissions(
              permission:permissions(*)
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()');

      if (error) throw error;

      if (!data || data.length === 0) {
        return null;
      }

      // Extraire toutes les permissions uniques
      const permissions = new Set<PermissionType>();
      const roles = data.map(ur => {
        if (ur.role?.role_permissions) {
          ur.role.role_permissions.forEach((rp: any) => {
            if (rp.permission?.name) {
              permissions.add(rp.permission.name as PermissionType);
            }
          });
        }
        return ur;
      });

      // Récupérer les infos utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      return {
        ...userData,
        roles,
        permissions: Array.from(permissions),
      };
    } catch (error) {
      console.error('Erreur récupération rôles utilisateur:', error);
      return null;
    }
  }

  /**
   * Vérifier si un utilisateur a une permission spécifique
   */
  static async hasPermission(userId: string, permission: PermissionType): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('user_has_permission', {
        user_id: userId,
        permission_name: permission
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      return false;
    }
  }

  /**
   * Vérifier si un utilisateur a un rôle spécifique
   */
  static async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .eq('role.name', role)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Erreur vérification rôle:', error);
      return false;
    }
  }

  /**
   * Assigner un rôle à un utilisateur
   */
  static async assignRole(
    userId: string, 
    roleName: UserRole, 
    assignedBy: string,
    expiresAt?: string
  ): Promise<boolean> {
    try {
      // Récupérer l'ID du rôle
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .eq('is_active', true)
        .single();

      if (roleError || !roleData) throw roleError || new Error('Rôle non trouvé');

      // Assigner le rôle
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleData.id,
          assigned_by: assignedBy,
          expires_at: expiresAt,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur assignation rôle:', error);
      return false;
    }
  }

  /**
   * Révoquer un rôle d'un utilisateur
   */
  static async revokeRole(userId: string, roleName: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('role.name', roleName);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur révocation rôle:', error);
      return false;
    }
  }

  /**
   * Récupérer tous les rôles disponibles
   */
  static async getAllRoles(): Promise<RoleWithPermissions[]> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions(
            permission:permissions(*)
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return data.map(role => ({
        ...role,
        permissions: role.role_permissions.map((rp: any) => rp.permission),
      }));
    } catch (error) {
      console.error('Erreur récupération rôles:', error);
      return [];
    }
  }
}
