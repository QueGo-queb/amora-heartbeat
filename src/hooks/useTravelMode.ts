import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/lib/sentry';

export interface TravelSession {
  id: string;
  user_id: string;
  destination_country: string;
  destination_city: string;
  destination_region?: string;
  travel_start_date: string;
  travel_end_date: string;
  virtual_start_date: string;
  virtual_end_date: string;
  travel_type: 'leisure' | 'business' | 'relocation' | 'study' | 'other';
  travel_purpose?: string;
  accommodation_type?: 'hotel' | 'airbnb' | 'friend' | 'family' | 'unknown';
  search_radius_km: number;
  show_to_locals: boolean;
  show_to_travelers: boolean;
  show_to_residents: boolean;
  looking_for_activities: string[];
  available_for_meetup: boolean;
  preferred_meeting_types: string[];
  languages_spoken: string[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  visibility: 'public' | 'matches_only' | 'private';
  profile_views: number;
  matches_made: number;
  conversations_started: number;
  meetups_planned: number;
  created_at: string;
  updated_at: string;
}

export interface TravelPreferences {
  user_id: string;
  auto_enable_on_travel: boolean;
  max_sessions_per_month: number;
  default_search_radius_km: number;
  default_session_duration_days: number;
  notify_local_matches: boolean;
  notify_fellow_travelers: boolean;
  notify_travel_tips: boolean;
  share_travel_plans: boolean;
  verify_travelers_only: boolean;
  require_photo_verification: boolean;
  preferred_travel_types: string[];
  interested_in_business_travel: boolean;
  interested_in_relocation_help: boolean;
  successful_meetups_count: number;
  travel_experience_level: 'beginner' | 'intermediate' | 'expert' | 'local_expert';
}

export interface LocationCache {
  id: string;
  country: string;
  city: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country_code?: string;
  language_codes?: string[];
  currency_code?: string;
  user_count: number;
  traveler_count: number;
  popular_activities: string[];
}

export interface TravelMatch {
  id: string;
  full_name: string;
  age: number;
  city: string;
  country: string;
  distance_km?: number;
  is_traveler: boolean;
  travel_type?: string;
  common_activities: string[];
  compatibility_score: number;
  last_active: string;
}

export const useTravelMode = () => {
  const [currentSession, setCurrentSession] = useState<TravelSession | null>(null);
  const [preferences, setPreferences] = useState<TravelPreferences | null>(null);
  const [availableLocations, setAvailableLocations] = useState<LocationCache[]>([]);
  const [travelMatches, setTravelMatches] = useState<TravelMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Vérifier si l'utilisateur est en mode voyage
  const isTravelModeActive = currentSession?.status === 'active';

  // Récupérer la session de voyage actuelle
  const fetchCurrentSession = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('travel_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      setCurrentSession(data);

    } catch (err) {
      trackError(err, { context: 'useTravelMode.fetchCurrentSession' });
    }
  }, [user]);

  // Récupérer les préférences de voyage
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('travel_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      setPreferences(data);

    } catch (err) {
      trackError(err, { context: 'useTravelMode.fetchPreferences' });
    }
  }, [user]);

  // Récupérer les villes disponibles
  const fetchAvailableLocations = useCallback(async (searchQuery?: string) => {
    try {
      let query = supabase
        .from('location_cache')
        .select('*')
        .order('user_count', { ascending: false });

      if (searchQuery) {
        query = query.textSearch('search_terms', searchQuery);
      }

      const { data, error: fetchError } = await query.limit(50);

      if (fetchError) throw fetchError;

      setAvailableLocations(data || []);

    } catch (err) {
      trackError(err, { context: 'useTravelMode.fetchAvailableLocations' });
    }
  }, []);

  // Activer le mode voyage
  const activateTravelMode = useCallback(async (sessionData: {
    destination_country: string;
    destination_city: string;
    travel_start_date: string;
    travel_end_date: string;
    travel_type?: string;
    travel_purpose?: string;
    search_radius_km?: number;
    looking_for_activities?: string[];
    preferred_meeting_types?: string[];
  }) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      // Appeler la fonction PostgreSQL pour activer le mode voyage
      const { data, error: activateError } = await supabase.rpc('activate_travel_mode', {
        p_user_id: user.id,
        p_destination_country: sessionData.destination_country,
        p_destination_city: sessionData.destination_city,
        p_travel_start_date: sessionData.travel_start_date,
        p_travel_end_date: sessionData.travel_end_date,
        p_travel_type: sessionData.travel_type || 'leisure',
        p_search_radius_km: sessionData.search_radius_km || 50
      });

      if (activateError) throw activateError;

      // Mettre à jour les détails de la session si fournis
      if (sessionData.travel_purpose || sessionData.looking_for_activities || sessionData.preferred_meeting_types) {
        const { error: updateError } = await supabase
          .from('travel_sessions')
          .update({
            travel_purpose: sessionData.travel_purpose,
            looking_for_activities: sessionData.looking_for_activities || [],
            preferred_meeting_types: sessionData.preferred_meeting_types || []
          })
          .eq('id', data);

        if (updateError) throw updateError;
      }

      // Recharger la session
      await fetchCurrentSession();

      trackEvent('travel_mode_activated', {
        user_id: user.id,
        destination: `${sessionData.destination_city}, ${sessionData.destination_country}`,
        travel_type: sessionData.travel_type,
        search_radius: sessionData.search_radius_km
      });

      toast({
        title: "Mode voyage activé !",
        description: `Vous explorez maintenant ${sessionData.destination_city}, ${sessionData.destination_country}`,
      });

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'activation du mode voyage';
      setError(message);
      trackError(err, { context: 'useTravelMode.activateTravelMode', sessionData });
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCurrentSession, toast]);

  // Désactiver le mode voyage
  const deactivateTravelMode = useCallback(async () => {
    if (!user) return false;

    try {
      setLoading(true);

      const { error: deactivateError } = await supabase.rpc('deactivate_travel_mode', {
        p_user_id: user.id
      });

      if (deactivateError) throw deactivateError;

      setCurrentSession(null);

      trackEvent('travel_mode_deactivated', {
        user_id: user.id,
        session_id: currentSession?.id
      });

      toast({
        title: "Mode voyage désactivé",
        description: "Vous êtes revenu à votre localisation normale",
      });

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la désactivation';
      setError(message);
      trackError(err, { context: 'useTravelMode.deactivateTravelMode' });
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, currentSession, toast]);

  // Mettre à jour les préférences
  const updatePreferences = useCallback(async (newPreferences: Partial<TravelPreferences>) => {
    if (!user) return false;

    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('travel_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      setPreferences(prev => ({ ...prev, ...newPreferences } as TravelPreferences));

      trackEvent('travel_preferences_updated', {
        user_id: user.id,
        updated_fields: Object.keys(newPreferences)
      });

      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences de voyage ont été sauvegardées",
      });

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(message);
      trackError(err, { context: 'useTravelMode.updatePreferences' });
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

  // Rechercher des matchs de voyage
  const searchTravelMatches = useCallback(async () => {
    if (!user || !currentSession) return;

    try {
      setLoading(true);

      // Ici on ferait une requête complexe pour trouver des matchs
      // basés sur la géolocalisation, les intérêts, etc.
      // Pour l'instant, simulons avec une requête simple

      const { data: travelers, error: travelersError } = await supabase
        .from('active_travelers')
        .select('*')
        .neq('user_id', user.id)
        .eq('destination_country', currentSession.destination_country)
        .limit(10);

      if (travelersError) throw travelersError;

      const { data: locals, error: localsError } = await supabase
        .from('locals_available_for_travelers')
        .select('*')
        .eq('country', currentSession.destination_country)
        .limit(10);

      if (localsError) throw localsError;

      // Combiner et transformer les résultats
      const matches: TravelMatch[] = [
        ...(travelers || []).map(t => ({
          id: t.user_id,
          full_name: t.full_name,
          age: t.age,
          city: t.destination_city,
          country: t.destination_country,
          is_traveler: true,
          travel_type: t.travel_type,
          common_activities: [],
          compatibility_score: 0.8,
          last_active: new Date().toISOString()
        })),
        ...(locals || []).map(l => ({
          id: l.user_id,
          full_name: l.full_name,
          age: l.age,
          city: l.city,
          country: l.country,
          is_traveler: false,
          common_activities: [],
          compatibility_score: 0.7,
          last_active: new Date().toISOString()
        }))
      ];

      setTravelMatches(matches);

      trackEvent('travel_matches_searched', {
        user_id: user.id,
        destination: `${currentSession.destination_city}, ${currentSession.destination_country}`,
        matches_found: matches.length
      });

    } catch (err) {
      trackError(err, { context: 'useTravelMode.searchTravelMatches' });
    } finally {
      setLoading(false);
    }
  }, [user, currentSession]);

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      fetchCurrentSession();
      fetchPreferences();
      fetchAvailableLocations();
    }
  }, [user, fetchCurrentSession, fetchPreferences, fetchAvailableLocations]);

  // Rechercher des matchs quand une session est active
  useEffect(() => {
    if (currentSession && currentSession.status === 'active') {
      searchTravelMatches();
    }
  }, [currentSession, searchTravelMatches]);

  return {
    // État
    currentSession,
    preferences,
    availableLocations,
    travelMatches,
    loading,
    error,
    isTravelModeActive,
    
    // Actions
    activateTravelMode,
    deactivateTravelMode,
    updatePreferences,
    searchTravelMatches,
    fetchAvailableLocations,
    
    // Utilitaires
    daysUntilTravel: currentSession 
      ? Math.ceil((new Date(currentSession.travel_start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null,
    daysRemaining: currentSession 
      ? Math.ceil((new Date(currentSession.virtual_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null,
  };
};
