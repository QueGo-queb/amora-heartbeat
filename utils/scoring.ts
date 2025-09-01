/**
 * Système de scoring pour calculer la pertinence des posts
 * Basé sur les intérêts communs, la récence et d'autres facteurs
 */

import type { Profile, Post, PostWithScore } from '@/lib/supabaseAdmin';

export interface ScoringWeights {
  tagMatches: number;
  recencyScore: number;
  mutualInterestBoost: number;
  authorBoost: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  tagMatches: 10,
  recencyScore: 5,
  mutualInterestBoost: 5,
  authorBoost: 10
};

/**
 * Calcule l'âge à partir d'une date de naissance
 */
export function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Vérifie si deux profils sont compatibles selon les critères
 */
export function areProfilesCompatible(viewer: Profile, author: Profile): boolean {
  // Vérifier le genre recherché
  if (viewer.looking_for_gender !== 'any' && author.gender !== viewer.looking_for_gender) {
    return false;
  }
  
  // Vérifier l'âge de l'auteur
  if (author.birthdate) {
    const authorAge = calculateAge(author.birthdate);
    if (authorAge < viewer.looking_for_age_min || authorAge > viewer.looking_for_age_max) {
      return false;
    }
  }
  
  // Vérifier l'âge du viewer par rapport aux critères de l'auteur
  if (viewer.birthdate && author.looking_for_gender !== 'any') {
    const viewerAge = calculateAge(viewer.birthdate);
    if (viewerAge < author.looking_for_age_min || viewerAge > author.looking_for_age_max) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calcule le score de correspondance des tags
 */
export function calculateTagMatches(postTags: string[], userInterests: string[]): number {
  if (!postTags.length || !userInterests.length) return 0;
  
  const commonTags = postTags.filter(tag => 
    userInterests.some(interest => 
      interest.toLowerCase().includes(tag.toLowerCase()) ||
      tag.toLowerCase().includes(interest.toLowerCase())
    )
  );
  
  return commonTags.length;
}

/**
 * Calcule le score de récence (posts récents ont un score plus élevé)
 */
export function calculateRecencyScore(createdAt: string): number {
  const now = new Date();
  const postDate = new Date(createdAt);
  const hoursSincePost = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
  
  // Score maximum pour les posts de moins de 48h, décroissant ensuite
  const recencyScore = Math.max(0, 48 - hoursSincePost) / 48;
  return recencyScore * 5; // Score max de 5
}

/**
 * Calcule le boost pour les intérêts mutuels
 */
export function calculateMutualInterestBoost(postTags: string[], authorInterests: string[], userInterests: string[]): number {
  const userTagMatches = calculateTagMatches(postTags, userInterests);
  const authorTagMatches = calculateTagMatches(postTags, authorInterests);
  
  // Boost si l'auteur et l'utilisateur ont des intérêts communs
  if (userTagMatches > 0 && authorTagMatches > 0) {
    return 5;
  }
  
  return 0;
}

/**
 * Calcule le boost pour les auteurs premium
 */
export function calculateAuthorBoost(authorPlan: string): number {
  return authorPlan === 'premium' ? 10 : 0;
}

/**
 * Calcule le score de pertinence complet pour un post
 */
export function computeScore(
  post: Post, 
  viewerProfile: Profile, 
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  const { profiles: author } = post;
  
  // Vérifier la compatibilité des profils
  if (!areProfilesCompatible(viewerProfile, author)) {
    return 0;
  }
  
  // Calculer les différents scores
  const tagMatches = calculateTagMatches(post.tags, viewerProfile.interests) * weights.tagMatches;
  const recencyScore = calculateRecencyScore(post.created_at) * weights.recencyScore;
  const mutualInterestBoost = calculateMutualInterestBoost(post.tags, author.interests, viewerProfile.interests) * weights.mutualInterestBoost;
  const authorBoost = calculateAuthorBoost(author.plan) * weights.authorBoost;
  
  // Score total
  const totalScore = tagMatches + recencyScore + mutualInterestBoost + authorBoost;
  
  return Math.max(0, totalScore);
}

/**
 * Attache les scores de pertinence à une liste de posts
 */
export function attachScores(
  posts: Post[], 
  viewerProfile: Profile,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): PostWithScore[] {
  return posts
    .map(post => ({
      ...post,
      relevance_score: computeScore(post, viewerProfile, weights)
    }))
    .filter(post => post.relevance_score > 0) // Filtrer les posts non pertinents
    .sort((a, b) => {
      // Trier par score décroissant, puis par date décroissante
      if (b.relevance_score !== a.relevance_score) {
        return b.relevance_score - a.relevance_score;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}
