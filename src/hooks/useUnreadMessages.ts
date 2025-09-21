/**
 * Hook pour gérer le compteur de messages non lus
 * Récupère et met à jour en temps réel le nombre de messages non lus
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  // Récupérer le nombre de messages non lus
  const fetchUnreadCount = useCallback(async () => {
    // ✅ CORRECTION: Attendre que l'authentification soit résolue
    if (authLoading) {
      return; // Ne pas faire de requête si l'auth est en cours
    }

    if (!user?.id) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // ✅ Essayer d'abord avec is_read (si la migration est appliquée)
      let { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      // ✅ FALLBACK: Si la colonne is_read n'existe pas encore
      if (error && (
        error.message?.includes('column "is_read" does not exist') || 
        error.message?.includes('is_read') ||
        error.code === 'PGRST116' || // Code erreur Supabase pour colonne manquante
        error.details?.includes('is_read')
      )) {
        console.log('📝 Colonne is_read non trouvée, utilisation du fallback (comptage simple)');
        
        // Compter tous les messages reçus (temporaire)
        const fallback = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id);

        count = fallback.count;
        error = fallback.error;
      }

      if (error) {
        // ✅ AMÉLIORATION: Gestion des erreurs plus robuste
        if (error.message?.includes('relation "messages" does not exist')) {
          console.log('�� Table messages non trouvée, compteur à 0');
          setUnreadCount(0);
          return;
        }
        
        console.error('Erreur lors du comptage des messages:', error);
        setUnreadCount(0);
        return;
      }

      // ✅ AMÉLIORATION: Limiter le nombre affiché pour éviter des chiffres trop élevés
      const limitedCount = Math.min(count || 0, 99); // Max 99 messages affichés
      setUnreadCount(limitedCount);
      console.log(`�� Messages reçus: ${count || 0} (affiché: ${limitedCount})`);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages non lus:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  // Marquer les messages comme lus
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || authLoading) return;

    try {
      // ✅ Essayer d'abord avec la colonne is_read
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error && (error.message?.includes('column "is_read" does not exist') || 
                    error.message?.includes('is_read'))) {
        console.log('📝 Colonne is_read non trouvée, remise à zéro du compteur');
        // Pour l'instant, on remet juste le compteur à 0
        setUnreadCount(0);
        return;
      }

      if (error) {
        console.error('Erreur lors du marquage des messages comme lus:', error);
        return;
      }

      // Succès : remettre le compteur à 0
      setUnreadCount(0);
      console.log('✅ Tous les messages marqués comme lus');
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
    }
  }, [user?.id, authLoading]);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    // ✅ CORRECTION: Attendre que l'auth soit résolue et que l'utilisateur existe
    if (authLoading || !user?.id) {
      setLoading(!authLoading); // Si auth finie mais pas d'user, pas de loading
      return;
    }

    fetchUnreadCount();

    // ✅ Écouter les nouveaux messages en temps réel
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          console.log('📨 Nouveau message reçu !');
          // Nouveau message reçu, incrémenter le compteur
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, authLoading, fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    refresh: fetchUnreadCount,
    markAllAsRead
  };
}
