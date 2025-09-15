-- ✅ TRIGGER: Suppression automatique des données utilisateur

-- 1. Fonction pour gérer la suppression d'un utilisateur
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Supprimer le profil utilisateur
  DELETE FROM profiles WHERE user_id = OLD.id;
  
  -- Supprimer les posts de l'utilisateur
  DELETE FROM posts WHERE user_id = OLD.id;
  
  -- Supprimer les messages de l'utilisateur
  DELETE FROM messages WHERE sender_id = OLD.id OR recipient_id = OLD.id;
  
  -- Supprimer les likes de l'utilisateur
  DELETE FROM post_likes WHERE user_id = OLD.id;
  
  -- Supprimer les commentaires de l'utilisateur
  DELETE FROM post_comments WHERE user_id = OLD.id;
  
  -- Supprimer les demandes de contact
  DELETE FROM post_contact_requests WHERE requester_id = OLD.id OR recipient_id = OLD.id;
  
  -- Supprimer les conversations initiées
  DELETE FROM post_initiated_conversations WHERE user_id = OLD.id;
  
  -- Supprimer les notifications de l'utilisateur
  DELETE FROM notifications WHERE user_id = OLD.id;
  
  -- Supprimer les favoris de l'utilisateur
  DELETE FROM user_favorites WHERE user_id = OLD.id;
  
  -- Supprimer les abonnements (si vous avez une table)
  DELETE FROM subscriptions WHERE user_id = OLD.id;
  
  -- Supprimer les paiements (si vous avez une table)
  DELETE FROM payments WHERE user_id = OLD.id;
  
  -- Supprimer les avatars du storage
  -- Note: Vous devrez gérer cela côté client avec Supabase Storage
  
  RAISE NOTICE 'Utilisateur % supprimé avec toutes ses données associées', OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger sur la table auth.users
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

-- 3. Vérification
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger de suppression utilisateur créé avec succès';
END $$;
