import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/lib/sentry';

export interface AISuggestion {
  id: string;
  user_id: string;
  suggested_user_id: string;
  suggestion_type: 'compatibility' | 'similar_interests' | 'activity_based' | 'location_based' | 'behavior_pattern';
  suggestion_reason: string;
  compatibility_score: number;
  confidence_level: 'low' | 'medium' | 'high';
  interest_similarity: number;
  behavior_similarity: number;
  activity_compatibility: number;
  location_proximity: number;
  age_compatibility: number;
  matching_factors: Record<string, any>;
  ai_explanation: string;
  presented_at?: string;
  clicked_at?: string;
  liked_at?: string;
  rejected_at?: string;
  user_feedback?: 'good_match' | 'bad_match' | 'irrelevant' | 'already_know';
  is_active: boolean;
  expires_at: string;
  created_at: string;
  
  // Relations
  suggested_user?: {
    id: string;
    full_name: string;
    email: string;
    age: number;
    bio?: string;
    avatar_url?: string;
    city?: string;
    interests?: string[];
  };
}

export interface AIPreferences {
  user_id: string;
  auto_moderation_enabled: boolean;
  moderation_sensitivity: 'low' | 'medium' | 'high';
  ai_suggestions_enabled: boolean;
  suggestion_frequency: 'never' | 'weekly' | 'daily' | 'real_time';
  max_suggestions_per_day: number;
  want_compatibility_suggestions: boolean;
  want_interest_suggestions: boolean;
  want_activity_suggestions: boolean;
  want_location_suggestions: boolean;
  allow_behavior_analysis: boolean;
  allow_interaction_tracking: boolean;
  share_anonymous_data: boolean;
}

export const useAISuggestions = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [preferences, setPreferences] = useState<AIPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Récupérer les suggestions IA pour l'utilisateur
  const fetchSuggestions = useCallback(async (limit = 10) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_suggestions')
        .select(`
          *,
          suggested_user:users!ai_suggestions_suggested_user_id_fkey(
            id, full_name, email, age, bio, city
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('compatibility_score', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      setSuggestions(data || []);

      trackEvent('ai_suggestions_fetched', {
        user_id: user.id,
        suggestion_count: data?.length || 0
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des suggestions';
      setError(message);
      trackError(err, { context: 'useAISuggestions.fetchSuggestions' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Récupérer les préférences IA
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('ai_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      setPreferences(data);

    } catch (err) {
      trackError(err, { context: 'useAISuggestions.fetchPreferences' });
    }
  }, [user]);

  // Mettre à jour les préférences IA
  const updatePreferences = useCallback(async (newPreferences: Partial<AIPreferences>) => {
    if (!user) return false;

    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('ai_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      setPreferences(prev => ({ ...prev, ...newPreferences } as AIPreferences));

      trackEvent('ai_preferences_updated', {
        user_id: user.id,
        updated_fields: Object.keys(newPreferences)
      });

      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences IA ont été sauvegardées",
      });

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(message);
      trackError(err, { context: 'useAISuggestions.updatePreferences' });
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

  // Marquer une suggestion comme présentée
  const markSuggestionPresented = useCallback(async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ 
          presented_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', suggestionId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId 
          ? { ...s, presented_at: new Date().toISOString() }
          : s
      ));

    } catch (err) {
      trackError(err, { context: 'useAISuggestions.markSuggestionPresented', suggestionId });
    }
  }, [user?.id]);

  // Enregistrer une interaction avec une suggestion
  const recordSuggestionInteraction = useCallback(async (
    suggestionId: string, 
    interactionType: 'clicked' | 'liked' | 'rejected',
    feedback?: 'good_match' | 'bad_match' | 'irrelevant' | 'already_know'
  ) => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      switch (interactionType) {
        case 'clicked':
          updateData.clicked_at = new Date().toISOString();
          break;
        case 'liked':
          updateData.liked_at = new Date().toISOString();
          break;
        case 'rejected':
          updateData.rejected_at = new Date().toISOString();
          break;
      }

      if (feedback) {
        updateData.user_feedback = feedback;
      }

      const { error } = await supabase
        .from('ai_suggestions')
        .update(updateData)
        .eq('id', suggestionId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId 
          ? { ...s, ...updateData }
          : s
      ));

      trackEvent('ai_suggestion_interaction', {
        suggestion_id: suggestionId,
        interaction_type: interactionType,
        feedback,
        user_id: user?.id
      });

      // Si c'est un rejet, on peut retirer la suggestion de la liste
      if (interactionType === 'rejected') {
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      }

    } catch (err) {
      trackError(err, { 
        context: 'useAISuggestions.recordSuggestionInteraction', 
        suggestionId, 
        interactionType 
      });
    }
  }, [user?.id]);

  // Générer de nouvelles suggestions (appel au système IA)
  const generateNewSuggestions = useCallback(async () => {
    if (!user || !preferences?.ai_suggestions_enabled) return;

    try {
      setLoading(true);

      // Ici on appellerait une fonction Edge de Supabase ou un service externe
      // qui utilise l'IA pour générer des suggestions basées sur le profil utilisateur
      
      // Pour l'instant, simulons avec une fonction côté client
      const newSuggestions = await generateSuggestionsForUser(user.id, preferences);

      if (newSuggestions.length > 0) {
        const { error } = await supabase
          .from('ai_suggestions')
          .insert(newSuggestions);

        if (error) throw error;

        // Recharger les suggestions
        await fetchSuggestions();

        toast({
          title: "Nouvelles suggestions disponibles",
          description: `${newSuggestions.length} nouveaux profils suggérés`,
        });
      }

    } catch (err) {
      trackError(err, { context: 'useAISuggestions.generateNewSuggestions' });
    } finally {
      setLoading(false);
    }
  }, [user, preferences, fetchSuggestions, toast]);

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      fetchSuggestions();
      fetchPreferences();
    }
  }, [user, fetchSuggestions, fetchPreferences]);

  return {
    // État
    suggestions,
    preferences,
    loading,
    error,
    
    // Actions
    fetchSuggestions,
    updatePreferences,
    markSuggestionPresented,
    recordSuggestionInteraction,
    generateNewSuggestions,
    
    // Utilitaires
    hasSuggestions: suggestions.length > 0,
    activeSuggestionsCount: suggestions.filter(s => s.is_active).length,
  };
};

// Fonction simulée pour générer des suggestions
// En production, ceci serait fait côté serveur avec de vraies données IA
async function generateSuggestionsForUser(userId: string, preferences: AIPreferences): Promise<Partial<AISuggestion>[]> {
  // Simulation d'un algorithme de suggestion basique
  const mockSuggestions: Partial<AISuggestion>[] = [];

  // Ici on ferait des requêtes pour trouver des utilisateurs compatibles
  // basées sur les intérêts, l'âge, la localisation, le comportement, etc.

  return mockSuggestions;
}
