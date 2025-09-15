import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useAccountDeletion = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();

  const deleteAccount = async (password: string) => {
    setLoading(true);
    
    try {
      // 1. Vérifier le mot de passe
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // 2. Re-authentifier avec le mot de passe
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
      });

      if (reAuthError) {
        throw new Error('Mot de passe incorrect');
      }

      // 3. Supprimer les fichiers du storage (avatars, etc.)
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .single();

      if (profile?.avatar_url) {
        const fileName = profile.avatar_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([fileName]);
        }
      }

      // 4. Supprimer l'utilisateur (le trigger s'occupera du reste)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        throw deleteError;
      }

      // 5. Déconnexion
      await signOut();

      toast({
        title: "Compte supprimé",
        description: "Votre compte et toutes vos données ont été supprimés avec succès.",
        variant: "default",
      });

      return true;

    } catch (error: any) {
      console.error('Erreur lors de la suppression du compte:', error);
      
      toast({
        title: "Erreur de suppression",
        description: error.message || "Une erreur est survenue lors de la suppression de votre compte.",
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteAccount,
    loading
  };
};