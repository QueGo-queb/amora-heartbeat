import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminCreation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createAdmin = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    
    try {
      // 1. Vérifier que l'utilisateur actuel est admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Vérifier si l'utilisateur est dans la liste des admins autorisés
      const adminEmails = ['clodenerc@yahoo.fr'];
      if (!adminEmails.includes(user.email || '')) {
        throw new Error('Accès refusé: Seuls les administrateurs autorisés peuvent créer des utilisateurs');
      }

      // 2. Créer l'utilisateur avec l'API standard (sans trigger)
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
        console.error('Erreur création auth:', signupError);
        throw signupError;
      }

      if (!newUser.user) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      // 3. Créer le profil manuellement (sans dépendre du trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: newUser.user.id,
          email: email,
          full_name: fullName || 'Administrateur',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Erreur création profil:', profileError);
        
        // Si le profil existe déjà, ne pas faire échouer
        if (profileError.message?.includes('duplicate key')) {
          console.log('Profil existe déjà, continuer...');
        } else {
          throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
        }
      }

      // 4. Ajouter à la table admin_users si elle existe
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: newUser.user.id,
          email: email,
          role: 'admin',
          created_by: user.id
        });

      if (adminError) {
        console.error('Erreur ajout admin:', adminError);
        // Ne pas faire échouer si la table n'existe pas
      }

      toast({
        title: "Admin créé",
        description: `L'administrateur ${email} a été créé avec succès. Il recevra un email de confirmation.`,
        variant: "default",
      });

      return { success: true, user: newUser.user };

    } catch (error: any) {
      console.error('Erreur création admin:', error);
      
      let errorMessage = "Une erreur est survenue lors de la création de l'administrateur.";
      
      if (error.message?.includes('Database error saving new user')) {
        errorMessage = "Erreur de base de données. Le trigger de création de profil a été désactivé.";
      } else if (error.message?.includes('already registered')) {
        errorMessage = "Cet email est déjà utilisé.";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Format d'email invalide.";
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = "Le mot de passe doit contenir au moins 6 caractères.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur de création",
        description: errorMessage,
        variant: "destructive",
      });

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
