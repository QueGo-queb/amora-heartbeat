import React from 'react';
import { useRoles } from '@/hooks/useRoles';
import type { PermissionType, UserRole } from '../../../types/rbac';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: PermissionType;
  role?: UserRole;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  role,
  requireAdmin = false,
  requireModerator = false,
  fallback = null,
  loading = null,
}) => {
  const { hasPermission, hasRole, isAdmin, isModerator, loading: rolesLoading } = useRoles();

  if (rolesLoading) {
    return loading ? <>{loading}</> : null;
  }

  let hasAccess = true;

  // Vérifications des permissions/rôles
  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  if (role && !hasRole(role)) {
    hasAccess = false;
  }

  if (requireAdmin && !isAdmin()) {
    hasAccess = false;
  }

  if (requireModerator && !isModerator()) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};
