export type UserRoleType = 'user' | 'premium' | 'moderator' | 'admin' | 'super_admin';

export type PermissionType = 
  | 'read_users'
  | 'write_users'
  | 'delete_users'
  | 'read_posts'
  | 'write_posts'
  | 'delete_posts'
  | 'moderate_content'
  | 'manage_payments'
  | 'view_analytics'
  | 'manage_ads'
  | 'manage_promotions'
  | 'manage_system'
  | 'super_admin_access';

export interface UserRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: PermissionType;
  display_name: string;
  description: string;
  created_at: string;
}

export interface RoleWithPermissions extends UserRole {
  permissions: Permission[];
}

export interface UserWithRoles {
  id: string;
  roles: RoleWithPermissions[];
  permissions: PermissionType[];
}
