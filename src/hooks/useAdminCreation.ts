import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminCreation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createAdmin = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    
    try {
      console.log(' Starting admin creation process...');
      
      // 1. Vérifier que l'utilisateur actuel est admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Vérifier si l'utilisateur est dans la liste des admins autorisés
      const adminEmails = ['clodenerc@yahoo.fr'];
      if (!adminEmails.includes(user.email || '')) {
        throw new Error('Accès refusé: Seuls les administrateurs autorisés peuvent créer des utilisateurs');
      }

      console.log('✅ Admin access verified');

      // 2. ✅ AMÉLIORÉ - Créer l'utilisateur avec l'API standard
      console.log(' Creating auth user...');
      const { data: newUser, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || 'Administrateur',
            role: 'admin'
          }
        }
      });

      if (signupError) {
        console.error('❌ Auth signup error:', signupError);
        throw signupError;
      }

      if (!newUser.user) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      console.log('✅ Auth user created:', newUser.user.id);

      // 3. ✅ AMÉLIORÉ - Créer le profil manuellement
      console.log('🚀 Creating profile...');
      const profileData = {
        user_id: newUser.user.id,
        email: email,
        full_name: fullName || 'Administrateur',
        is_active: true,
        role: 'admin', // ✅ AJOUT - Marquer comme admin
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        
        // Si le profil existe déjà, ne pas faire échouer
        if (profileError.message?.includes('duplicate key') || 
            profileError.message?.includes('already exists')) {
          console.log('⚠️ Profile already exists, continuing...');
        } else {
          throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
        }
      } else {
        console.log('✅ Profile created successfully');
      }

      // 4. ✅ AMÉLIORÉ - Ajouter à la table admin_users si elle existe
      try {
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert({
            user_id: newUser.user.id,
            email: email,
            role: 'admin',
            created_by: user.id,
            created_at: new Date().toISOString()
          });

        if (adminError) {
          console.warn('⚠️ Admin table error (non-critical):', adminError);
          // Ne pas faire échouer si la table n'existe pas
        } else {
          console.log('✅ Admin record created successfully');
        }
      } catch (adminTableError) {
        console.warn('⚠️ Admin table not available (non-critical):', adminTableError);
      }

      console.log('✅ Admin creation completed successfully');

      return { success: true, user: newUser.user };

    } catch (error: any) {
      console.error('❌ Admin creation error:', error);
      
      let errorMessage = "Une erreur est survenue lors de la création de l'administrateur.";
      
      // ✅ AMÉLIORÉ - Gestion d'erreur plus spécifique
      if (error.message?.includes('Database error saving new user')) {
        errorMessage = "Erreur de base de données. Vérifiez la configuration Supabase.";
      } else if (error.message?.includes('already registered') || 
                 error.message?.includes('already exists')) {
        errorMessage = "Cet email est déjà utilisé par un autre utilisateur.";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Format d'email invalide.";
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = "Le mot de passe doit contenir au moins 6 caractères.";
      } else if (error.message?.includes('Accès refusé')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Utilisateur non connecté')) {
        errorMessage = "Vous devez être connecté pour créer un administrateur.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    createAdmin,
    loading
  };
};
