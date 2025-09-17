/**
 * ✅ CLIENT ADMIN SÉCURISÉ - Utilise les endpoints API au lieu des clés directes
 */

import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'moderator';
  is_suspended: boolean;
  created_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role?: 'user' | 'admin' | 'moderator';
}

export interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

// Fonction utilitaire pour obtenir le token d'authentification
const getAuthToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

// Fonction utilitaire pour faire des requêtes API sécurisées
const makeSecureRequest = async (endpoint: string, data: any) => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Request failed');
  }

  return response.json();
};

// ✅ NOUVELLES FONCTIONS API SÉCURISÉES
export const adminAPI = {
  // Vérifier si l'utilisateur est admin
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const result = await makeSecureRequest('admin-api', {
        action: 'check-permissions',
        data: { userId }
      });
      return result.isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Créer un utilisateur (admin seulement)
  async createUser(userData: CreateUserData): Promise<AdminUser> {
    try {
      const result = await makeSecureRequest('admin-api', {
        action: 'create-user',
        data: userData
      });
      return result.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Obtenir la liste des utilisateurs
  async getUsers(page: number = 1, limit: number = 20): Promise<UsersResponse> {
    try {
      const result = await makeSecureRequest('admin-api', {
        action: 'get-users',
        data: { page, limit }
      });
      return result;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Suspendre/réactiver un utilisateur
  async toggleUserSuspension(userId: string, suspended: boolean): Promise<void> {
    try {
      await makeSecureRequest('admin-api', {
        action: 'toggle-suspension',
        data: { userId, suspended }
      });
    } catch (error) {
      console.error('Error toggling user suspension:', error);
      throw error;
    }
  },

  // Obtenir les statistiques admin
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    totalPosts: number;
    totalMessages: number;
  }> {
    try {
      // Utiliser des requêtes directes pour les stats (pas de données sensibles)
      const [usersResult, postsResult, messagesResult] = await Promise.all([
        supabase.from('profiles').select('id, is_suspended', { count: 'exact' }),
        supabase.from('posts').select('id', { count: 'exact' }),
        supabase.from('messages').select('id', { count: 'exact' })
      ]);

      const totalUsers = usersResult.count || 0;
      const activeUsers = usersResult.data?.filter(u => !u.is_suspended).length || 0;
      const suspendedUsers = totalUsers - activeUsers;

      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalPosts: postsResult.count || 0,
        totalMessages: messagesResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }
};
