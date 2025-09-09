import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/lib/sentry';

export interface Event {
  id: string;
  created_by: string; // Utiliser created_by au lieu de organizer_id
  title: string;
  description?: string;
  event_type: 'speed_dating' | 'group_chat' | 'virtual_date' | 'workshop' | 'meetup' | 'game_night' | 'discussion';
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  start_time: string;
  end_time?: string;
  timezone: string;
  max_participants: number;
  min_participants: number;
  age_min?: number;
  age_max?: number;
  gender_restriction?: 'none' | 'women_only' | 'men_only' | 'non_binary_inclusive';
  cover_image_url?: string;
  virtual_room_url?: string;
  tags?: string[];
  is_public: boolean;
  requires_approval: boolean;
  participants_count: number;
  waitlist_count: number;
  created_at: string;
  updated_at?: string;
  
  // Relations
  organizer?: {
    id: string;
    email: string;
    full_name?: string;
  };
  my_participation?: EventParticipation;
}

export interface EventParticipation {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'waitlisted' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';
  registration_type: 'normal' | 'vip' | 'organizer' | 'moderator';
  registered_at: string;
  rating?: number;
  feedback?: string;
  would_recommend?: boolean;
}

interface CreateEventData {
  title: string;
  description?: string;
  event_type: Event['event_type'];
  start_time: string;
  end_time: string;
  max_participants?: number;
  min_participants?: number;
  age_min?: number;
  age_max?: number;
  gender_restriction?: Event['gender_restriction'];
  cover_image_url?: string;
  virtual_room_url?: string;
  tags?: string[];
  is_public?: boolean;
  requires_approval?: boolean;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Récupérer les événements
  const fetchEvents = useCallback(async (filters?: {
    upcoming?: boolean;
    myEvents?: boolean;
    myParticipations?: boolean;
    eventType?: Event['event_type'];
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:created_by(id, email, full_name),
          my_participation:event_participants!left(*)
        `);

      // Filtrer les participations pour l'utilisateur connecté
      if (user) {
        query = query.eq('event_participants.user_id', user.id);
      }

      // Filtres
      if (filters?.upcoming) {
        query = query.gte('start_time', new Date().toISOString());
      }

      if (filters?.myEvents && user) {
        query = query.eq('created_by', user.id);
      }

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      // Ordre par date
      query = query.order('start_time', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setEvents(data || []);
      
      trackEvent('events_fetched', {
        count: data?.length || 0,
        filters: JSON.stringify(filters)
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des événements';
      setError(message);
      trackError(err, { context: 'useEvents.fetchEvents', filters });
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Créer un événement
  const createEvent = useCallback(async (eventData: CreateEventData): Promise<Event | null> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un événement",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);

      const { data, error: createError } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user.id, // Utiliser created_by
        })
        .select(`
          *,
          organizer:created_by(id, email, full_name)
        `)
        .single();

      if (createError) {
        throw createError;
      }

      // Ajouter à la liste locale
      setEvents(prev => [data, ...prev]);

      trackEvent('event_created', {
        event_id: data.id,
        event_type: data.event_type,
        max_participants: data.max_participants
      });

      toast({
        title: "Événement créé !",
        description: `"${data.title}" a été créé avec succès`,
      });

      return data;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de l\'événement';
      setError(message);
      trackError(err, { context: 'useEvents.createEvent', eventData });
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // S'inscrire à un événement
  const registerForEvent = useCallback(async (eventId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour vous inscrire",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);

      const { error: registerError } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'registered'
        });

      if (registerError) {
        throw registerError;
      }

      // Mettre à jour l'événement local
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              participants_count: event.participants_count + 1,
              my_participation: {
                id: 'temp',
                event_id: eventId,
                user_id: user.id,
                status: 'registered',
                registration_type: 'normal',
                registered_at: new Date().toISOString()
              }
            }
          : event
      ));

      trackEvent('event_registration', {
        event_id: eventId,
        user_id: user.id
      });

      toast({
        title: "Inscription confirmée !",
        description: "Vous êtes maintenant inscrit à cet événement",
      });

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setError(message);
      trackError(err, { context: 'useEvents.registerForEvent', eventId });
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Se désinscrire d'un événement
  const unregisterFromEvent = useCallback(async (eventId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);

      const { error: unregisterError } = await supabase
        .from('event_participants')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (unregisterError) {
        throw unregisterError;
      }

      // Mettre à jour l'événement local
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              participants_count: Math.max(0, event.participants_count - 1),
              my_participation: undefined
            }
          : event
      ));

      trackEvent('event_unregistration', {
        event_id: eventId,
        user_id: user.id
      });

      toast({
        title: "Désinscription confirmée",
        description: "Vous n'êtes plus inscrit à cet événement",
      });

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la désinscription';
      setError(message);
      trackError(err, { context: 'useEvents.unregisterFromEvent', eventId });
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Charger les événements au montage
  useEffect(() => {
    if (user) {
      fetchEvents({ upcoming: true });
    }
  }, [user, fetchEvents]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    registerForEvent,
    unregisterFromEvent,
  };
};
