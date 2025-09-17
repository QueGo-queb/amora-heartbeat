
### 2. Mise à jour du client admin pour utiliser les endpoints sécurisés

```typescript:src/lib/api/admin.ts
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
```

### 3. Optimisation de la base de données

```typescript:supabase/functions/admin-api/index.ts
/**
 * ✅ ENDPOINT API ADMIN SÉCURISÉ
 * Remplace l'exposition des clés sensibles côté client
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminRequest {
  action: 'check-permissions' | 'create-user' | 'get-users' | 'toggle-suspension';
  data?: any;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Créer le client Supabase avec service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Vérifier le token utilisateur
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier les permissions admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin' || profile?.email === 'clodenerc@yahoo.fr'
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Traiter la requête
    const { action, data }: AdminRequest = await req.json()

    switch (action) {
      case 'check-permissions':
        return new Response(
          JSON.stringify({ isAdmin: true, userId: user.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create-user':
        const { email, password, full_name, role = 'user' } = data
        
        // Validation des données
        if (!email || !password || !full_name) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Créer l'utilisateur
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        })

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Créer le profil
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: newUser.user.id,
            email,
            full_name,
            role
          })

        if (profileError) {
          return new Response(
            JSON.stringify({ error: 'Failed to create profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: { id: newUser.user.id, email, full_name, role }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get-users':
        const { page = 1, limit = 20 } = data
        const offset = (page - 1) * limit

        const { data: users, error: usersError, count } = await supabaseAdmin
          .from('profiles')
          .select('id, email, full_name, role, is_suspended, created_at', { count: 'exact' })
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false })

        if (usersError) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch users' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({
            users: users || [],
            total: count || 0,
            page,
            limit
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'toggle-suspension':
        const { userId, suspended } = data

        if (!userId || typeof suspended !== 'boolean') {
          return new Response(
            JSON.stringify({ error: 'Invalid parameters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ is_suspended: suspended })
          .eq('id', userId)

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Admin API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

