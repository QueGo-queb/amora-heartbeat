/**
 * Hook pour gérer les notifications utilisateur
 * Récupère et met à jour en temps réel le nombre de notifications non lues
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'message' | 'match' | 'premium' | 'system';
  title: string;
  content?: string;
  data?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  // Récupérer les notifications
  const fetchNotifications = useCallback(async () => {
    if (authLoading) return;

    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Récupérer les notifications récentes (30 derniers jours)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // ✅ FALLBACK: Si table notifications n'existe pas
        if (error.message?.includes('relation "notifications" does not exist')) {
          console.log('📝 Table notifications non trouvée, utilisation du fallback');
          setNotifications([]);
          setUnreadCount(0);
          setLoading(false);
          return;
        }
        throw error;
      }

      const notificationsList = data || [];
      setNotifications(notificationsList);
      
      // Compter les non lues
      const unread = notificationsList.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
      console.log(`🔔 Notifications: ${notificationsList.length} total, ${unread} non lues`);

    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      console.error('Erreur marquage notification lue:', error);
    }
  }, [user?.id]);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      
      setUnreadCount(0);

    } catch (error) {
      console.error('Erreur marquage toutes notifications lues:', error);
    }
  }, [user?.id]);

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    if (authLoading || !user?.id) {
      setLoading(!authLoading);
      return;
    }

    fetchNotifications();

    // ✅ Écouter les nouvelles notifications en temps réel
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Nouvelle notification reçue !');
          const newNotification = payload.new as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, authLoading, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}