import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, trackError } from '@/lib/sentry';

export interface BadgeType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon_name: string;
  color_hex: string;
  background_hex: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'general' | 'social' | 'activity' | 'achievement' | 'special' | 'premium';
  requirement_type?: string;
  requirement_threshold?: number;
  is_active: boolean;
  sort_order: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type_id: string;
  awarded_at: string;
  award_reason?: string;
  is_displayed: boolean;
  display_order: number;
  badge_type: BadgeType;
}

export interface ReputationScore {
  user_id: string;
  total_score: number;
  social_score: number;
  activity_score: number;
  quality_score: number;
  community_score: number;
  current_level: number;
  next_level_threshold: number;
  positive_actions_count: number;
  negative_actions_count: number;
  score_multiplier: number;
  last_updated: string;
}

export interface ReputationAction {
  id: string;
  user_id: string;
  action_type: string;
  score_change: number;
  category: 'social' | 'activity' | 'quality' | 'community';
  reason?: string;
  created_at: string;
}

const rarityOrder = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5
};

const rarityColors = {
  common: '#6B7280',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B'
};

export const useBadges = () => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadgeTypes, setAllBadgeTypes] = useState<BadgeType[]>([]);
  const [reputationScore, setReputationScore] = useState<ReputationScore | null>(null);
  const [recentActions, setRecentActions] = useState<ReputationAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Récupérer les badges d'un utilisateur
  const fetchUserBadges = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge_type:badge_types(*)
        `)
        .eq('user_id', targetUserId)
        .eq('is_displayed', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setUserBadges(data || []);

      trackEvent('badges_fetched', {
        user_id: targetUserId,
        badge_count: data?.length || 0
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des badges';
      setError(message);
      trackError(err, { context: 'useBadges.fetchUserBadges', userId: targetUserId });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Récupérer tous les types de badges disponibles
  const fetchAllBadgeTypes = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('badge_types')
        .select('*')
        .eq('is_active', true)
        .eq('is_visible', true)
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;

      setAllBadgeTypes(data || []);

    } catch (err) {
      trackError(err, { context: 'useBadges.fetchAllBadgeTypes' });
    }
  }, []);

  // Récupérer le score de réputation d'un utilisateur
  const fetchReputationScore = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('reputation_scores')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      setReputationScore(data);

    } catch (err) {
      trackError(err, { context: 'useBadges.fetchReputationScore', userId: targetUserId });
    }
  }, [user?.id]);

  // Récupérer les actions de réputation récentes
  const fetchRecentActions = useCallback(async (limit = 10) => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('reputation_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      setRecentActions(data || []);

    } catch (err) {
      trackError(err, { context: 'useBadges.fetchRecentActions' });
    }
  }, [user?.id]);

  // Mettre à jour l'affichage d'un badge
  const updateBadgeDisplay = useCallback(async (badgeId: string, isDisplayed: boolean, displayOrder?: number) => {
    if (!user) return false;

    try {
      setLoading(true);

      const updateData: any = { is_displayed: isDisplayed };
      if (displayOrder !== undefined) {
        updateData.display_order = displayOrder;
      }

      const { error: updateError } = await supabase
        .from('user_badges')
        .update(updateData)
        .eq('id', badgeId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setUserBadges(prev => prev.map(badge => 
        badge.id === badgeId 
          ? { ...badge, is_displayed: isDisplayed, display_order: displayOrder || badge.display_order }
          : badge
      ));

      trackEvent('badge_display_updated', {
        badge_id: badgeId,
        is_displayed: isDisplayed,
        user_id: user.id
      });

      toast({
        title: isDisplayed ? "Badge affiché" : "Badge masqué",
        description: isDisplayed ? "Le badge apparaît maintenant sur votre profil" : "Le badge est maintenant masqué",
      });

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du badge';
      setError(message);
      trackError(err, { context: 'useBadges.updateBadgeDisplay', badgeId });
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

  // Ajouter une action de réputation (pour les développeurs/admins)
  const addReputationAction = useCallback(async (
    targetUserId: string,
    actionType: string,
    scoreChange: number,
    category: 'social' | 'activity' | 'quality' | 'community',
    reason?: string,
    sourceType?: string,
    sourceId?: string
  ) => {
    try {
      const { error: insertError } = await supabase
        .from('reputation_actions')
        .insert({
          user_id: targetUserId,
          action_type: actionType,
          score_change: scoreChange,
          category: category,
          reason: reason,
          source_type: sourceType,
          source_id: sourceId,
          related_user_id: user?.id
        });

      if (insertError) throw insertError;

      trackEvent('reputation_action_added', {
        target_user_id: targetUserId,
        action_type: actionType,
        score_change: scoreChange,
        category: category
      });

      // Recharger les données si c'est pour l'utilisateur connecté
      if (targetUserId === user?.id) {
        await fetchReputationScore();
        await fetchRecentActions();
      }

      return true;

    } catch (err) {
      trackError(err, { context: 'useBadges.addReputationAction', targetUserId, actionType });
      return false;
    }
  }, [user?.id, fetchReputationScore, fetchRecentActions]);

  // Fonctions utilitaires
  const getBadgesByCategory = useCallback((category: string) => {
    return userBadges.filter(badge => badge.badge_type.category === category);
  }, [userBadges]);

  const getBadgesByRarity = useCallback((rarity: string) => {
    return userBadges.filter(badge => badge.badge_type.rarity === rarity);
  }, [userBadges]);

  const getDisplayedBadges = useCallback((limit?: number) => {
    const displayed = userBadges
      .filter(badge => badge.is_displayed)
      .sort((a, b) => a.display_order - b.display_order);
    
    return limit ? displayed.slice(0, limit) : displayed;
  }, [userBadges]);

  const getReputationLevel = useCallback(() => {
    if (!reputationScore) return { level: 1, progress: 0, nextLevelAt: 100 };
    
    const level = reputationScore.current_level;
    const currentScore = reputationScore.total_score;
    const nextLevelAt = reputationScore.next_level_threshold;
    const prevLevelAt = (level - 1) * 100;
    const progress = level > 1 ? ((currentScore - prevLevelAt) / (nextLevelAt - prevLevelAt)) * 100 : (currentScore / nextLevelAt) * 100;
    
    return {
      level,
      progress: Math.min(100, Math.max(0, progress)),
      nextLevelAt,
      currentScore
    };
  }, [reputationScore]);

  const getRarityColor = useCallback((rarity: string) => {
    return rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common;
  }, []);

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      fetchUserBadges();
      fetchReputationScore();
      fetchRecentActions();
    }
    fetchAllBadgeTypes();
  }, [user, fetchUserBadges, fetchReputationScore, fetchRecentActions, fetchAllBadgeTypes]);

  return {
    // État
    userBadges,
    allBadgeTypes,
    reputationScore,
    recentActions,
    loading,
    error,
    
    // Actions
    fetchUserBadges,
    fetchReputationScore,
    fetchRecentActions,
    updateBadgeDisplay,
    addReputationAction,
    
    // Utilitaires
    getBadgesByCategory,
    getBadgesByRarity,
    getDisplayedBadges,
    getReputationLevel,
    getRarityColor,
    
    // Constantes
    rarityOrder,
    rarityColors
  };
};