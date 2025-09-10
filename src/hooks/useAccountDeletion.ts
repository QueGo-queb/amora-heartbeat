import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function useAccountDeletion() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const deleteAccount = async (password: string, reason?: string) => {
    try {
      setLoading(true);
      console.log('🗑️ Starting account deletion process...');

      // 1. Vérifier le mot de passe avant suppression
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }

      // 2. Tentative de reconnexion pour vérifier le mot de passe
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
      });

      if (signInError) {
        throw new Error('Mot de passe incorrect');
      }

      // 3. Marquer le compte comme supprimé (soft delete)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          deleted_at: new Date().toISOString(),
          deletion_reason: reason || 'Non spécifiée',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Error marking profile as deleted:', profileError);
        throw new Error('Impossible de supprimer le profil');
      }

      // 4. Anonymiser les données sensibles
      const { error: anonymizeError } = await supabase
        .from('profiles')
        .update({
          full_name: 'Utilisateur supprimé',
          bio: null,
          avatar_url: null,
          interests: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (anonymizeError) {
        console.error('⚠️ Warning: Could not anonymize profile data:', anonymizeError);
      }

      // 5. Supprimer les posts de l'utilisateur (optionnel - selon politique)
      const { error: postsError } = await supabase
        .from('posts')
        .delete()
        .eq('user_id', user.id);

      if (postsError) {
        console.error('⚠️ Warning: Could not delete posts:', postsError);
      }

      // 6. Déconnecter l'utilisateur
      await supabase.auth.signOut();

      console.log('✅ Account deletion completed successfully');

      toast({
        title: "✅ Compte supprimé",
        description: "Votre compte a été supprimé définitivement. Nous sommes désolés de vous voir partir.",
      });

      // 7. Rediriger vers la page d'accueil
      navigate('/');
      
      return true;
    } catch (error: any) {
      console.error('💥 Error during account deletion:', error);
      
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de supprimer le compte",
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
}