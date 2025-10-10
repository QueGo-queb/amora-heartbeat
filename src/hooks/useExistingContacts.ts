/**
 * Hook pour récupérer les contacts avec lesquels l'utilisateur a déjà échangé des messages
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Contact {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  email: string;
  last_message?: {
    content: string;
    created_at: string;
    is_from_me: boolean;
  };
  unread_count: number;
  last_activity: string;
  is_online?: boolean;
}

export function useExistingContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadContacts = useCallback(async () => {
    if (!user?.id) {
      setContacts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // ✅ RÉCUPÉRER TOUS LES CONTACTS AVEC LESQUELS L'UTILISATEUR A ÉCHANGÉ
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('messages')
        .select(`
          sender_id,
          receiver_id,
          content,
          created_at
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      if (!conversationsData || conversationsData.length === 0) {
        setContacts([]);
        setLoading(false);
        return;
      }

      // ✅ EXTRAIRE LES IDs DES CONTACTS UNIQUES
      const contactIds = new Set<string>();
      const lastMessages = new Map<string, any>();

      conversationsData.forEach(message => {
        const contactId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        contactIds.add(contactId);

        // Garder seulement le dernier message par contact
        if (!lastMessages.has(contactId)) {
          lastMessages.set(contactId, {
            content: message.content,
            created_at: message.created_at,
            is_from_me: message.sender_id === user.id
          });
        }
      });

      // ✅ RÉCUPÉRER LES PROFILS DES CONTACTS
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url, email, last_login')
        .in('user_id', Array.from(contactIds));

      if (profilesError) {
        console.warn('Erreur récupération profils:', profilesError);
      }

      // ✅ COMPTER LES MESSAGES NON LUS PAR CONTACT
      const unreadCounts = new Map<string, number>();
      
      for (const contactId of contactIds) {
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', contactId)
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        if (!countError) {
          unreadCounts.set(contactId, count || 0);
        }
      }

      // ✅ COMBINER LES DONNÉES
      const contactsList: Contact[] = Array.from(contactIds)
        .map(contactId => {
          const profile = profilesData?.find(p => p.user_id === contactId);
          const lastMessage = lastMessages.get(contactId);
          const unreadCount = unreadCounts.get(contactId) || 0;

          if (!profile) return null;

          return {
            id: profile.id,
            user_id: profile.user_id,
            full_name: profile.full_name || 'Utilisateur',
            avatar_url: profile.avatar_url,
            email: profile.email,
            last_message: lastMessage,
            unread_count: unreadCount,
            last_activity: lastMessage?.created_at || profile.last_login || '',
            // ✅ CORRIGÉ: Statut en ligne basé sur la dernière activité (< 5 minutes)
            is_online: profile.last_login 
              ? (Date.now() - new Date(profile.last_login).getTime()) < 5 * 60 * 1000
              : false
          };
        })
        .filter(Boolean) as Contact[];

      // ✅ TRIER PAR ACTIVITÉ RÉCENTE
      contactsList.sort((a, b) => 
        new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
      );

      setContacts(contactsList);

    } catch (error) {
      console.error('Erreur chargement contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ✅ MARQUER LES MESSAGES D'UN CONTACT COMME LUS
  const markContactAsRead = useCallback(async (contactUserId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('sender_id', contactUserId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.warn('Erreur marquage messages lus:', error);
      }

      // Mettre à jour l'état local
      setContacts(prev => 
        prev.map(contact => 
          contact.user_id === contactUserId 
            ? { ...contact, unread_count: 0 }
            : contact
        )
      );

    } catch (error) {
      console.error('Erreur marquage contact lu:', error);
    }
  }, [user?.id]);

  // ✅ ÉCOUTER LES NOUVEAUX MESSAGES EN TEMPS RÉEL
  useEffect(() => {
    if (!user?.id) return;

    loadContacts();

    // Écouter les nouveaux messages
    const channel = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          console.log('📨 Nouveau message reçu, rechargement des contacts');
          loadContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadContacts]);

  return {
    contacts,
    loading,
    refresh: loadContacts,
    markContactAsRead
  };
}
