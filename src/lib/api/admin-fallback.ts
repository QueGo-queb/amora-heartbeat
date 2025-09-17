/**
 * ✅ SYSTÈME DE FALLBACK POUR LES FONCTIONS ADMIN
 * Utilise les fonctions existantes en attendant le déploiement des endpoints sécurisés
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

// ✅ FALLBACK: Utilise les fonctions existantes avec validation côté client
export const adminAPIFallback = {
  // Vérifier si l'utilisateur est admin
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', userId)
        .single();

      if (error || !profile) return false;

      return profile.role === 'admin' || profile.email === 'clodenerc@yahoo.fr';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Obtenir la liste des utilisateurs (lecture seule pour l'instant)
  async getUsers(page: number = 1, limit: number = 20): Promise<UsersResponse> {
    try {
      const offset = (page - 1) * limit;

      const { data: users, error, count } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, is_suspended, created_at', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch users');
      }

      return {
        users: users || [],
        total: count || 0,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching users:', error);
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
  },

  // ⚠️ FONCTIONS RESTREINTES - Nécessitent les endpoints sécurisés
  async createUser(userData: CreateUserData): Promise<AdminUser> {
    throw new Error('User creation requires secure endpoints. Please deploy Supabase functions first.');
  },

  async toggleUserSuspension(userId: string, suspended: boolean): Promise<void> {
    throw new Error('User suspension requires secure endpoints. Please deploy Supabase functions first.');
  }
};
