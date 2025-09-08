import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RBACService } from '@/lib/rbac';
import type { UserWithRoles, PermissionType, UserRole } from '../../types/rbac';

export const useRoles = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserWithRoles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les rôles au changement d'utilisateur
  useEffect(() => {
    if (user?.id) {
      loadUserRoles();
    } else {
      setUserRoles(null);
      setLoading(false);
    }
  }, [user?.id]);

  const loadUserRoles = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const roles = await RBACService.getUserRoles(user.id);
      setUserRoles(roles);
    } catch (err) {
      console.error('Erreur chargement rôles:', err);
      setError('Erreur lors du chargement des rôles');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur a une permission
  const hasPermission = (permission: PermissionType): boolean => {
    return userRoles?.permissions.includes(permission) || false;
  };

  // Vérifier si l'utilisateur a un rôle
  const hasRole = (role: UserRole): boolean => {
    return userRoles?.roles.some(r => r.role?.name === role) || false;
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = (): boolean => {
    return hasRole('admin') || hasRole('super_admin');
  };

  // Vérifier si l'utilisateur est modérateur ou plus
  const isModerator = (): boolean => {
    return hasRole('moderator') || isAdmin();
  };

  // Vérifier si l'utilisateur est premium
  const isPremium = (): boolean => {
    return hasRole('premium') || isModerator();
  };

  // Obtenir le rôle le plus élevé
  const getHighestRole = (): UserRole => {
    if (hasRole('super_admin')) return 'super_admin';
    if (hasRole('admin')) return 'admin';
    if (hasRole('moderator')) return 'moderator';
    if (hasRole('premium')) return 'premium';
    return 'user';
  };

  return {
    userRoles,
    loading,
    error,
    hasPermission,
    hasRole,
    isAdmin,
    isModerator,
    isPremium,
    getHighestRole,
    refetch: loadUserRoles,
  };
};
