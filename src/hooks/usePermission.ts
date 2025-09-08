import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RBACService } from '@/lib/rbac';
import type { PermissionType } from '../../types/rbac'; // Chemin corrigé

export const usePermission = (permission: PermissionType) => {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, [user?.id, permission]);

  const checkPermission = async () => {
    if (!user?.id) {
      setHasPermission(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await RBACService.hasPermission(user.id, permission);
      setHasPermission(result);
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    hasPermission,
    loading,
    refetch: checkPermission,
  };
};
