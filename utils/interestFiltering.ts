import { TestUser } from '@/data/testUsers';

export interface UserWithCommonInterests {
  user: TestUser;
  commonInterests: string[];
  matchScore: number;
  allPosts: any[];
}

/**
 * Filtre les utilisateurs selon les intérêts communs avec l'utilisateur connecté
 * @param allUsers - Tous les utilisateurs disponibles
 * @param currentUserInterests - Intérêts de l'utilisateur connecté
 * @param minCommonInterests - Nombre minimum d'intérêts communs requis (défaut: 1)
 * @returns Utilisateurs filtrés avec score de compatibilité
 */
export function filterUsersByCommonInterests(
  allUsers: TestUser[],
  currentUserInterests: string[],
  minCommonInterests: number = 1
): UserWithCommonInterests[] {
  return allUsers
    .map(user => {
      // Trouver les intérêts communs
      const commonInterests = user.interests.filter(interest =>
        currentUserInterests.includes(interest)
      );

      // Calculer le score de compatibilité
      const matchScore = calculateMatchScore(commonInterests, user.interests);

      return {
        user,
        commonInterests,
        matchScore,
        allPosts: user.posts
      };
    })
    .filter(result => result.commonInterests.length >= minCommonInterests)
    .sort((a, b) => b.matchScore - a.matchScore); // Tri par score décroissant
}

/**
 * Calcule le score de compatibilité entre deux utilisateurs
 * @param commonInterests - Intérêts communs
 * @param totalInterests - Tous les intérêts de l'autre utilisateur
 * @returns Score de compatibilité (0-100)
 */
function calculateMatchScore(commonInterests: string[], totalInterests: string[]): number {
  if (totalInterests.length === 0) return 0;
  
  // Score basé sur le pourcentage d'intérêts communs
  const commonPercentage = (commonInterests.length / totalInterests.length) * 100;
  
  // Bonus pour plus d'intérêts communs
  const commonBonus = commonInterests.length * 10;
  
  // Score final (max 100)
  return Math.min(commonPercentage + commonBonus, 100);
}

/**
 * Récupère tous les posts des utilisateurs avec intérêts communs
 * @param filteredUsers - Utilisateurs filtrés par intérêts communs
 * @returns Tous les posts triés par date
 */
export function getAllPostsFromFilteredUsers(
  filteredUsers: UserWithCommonInterests[]
): any[] {
  const allPosts = filteredUsers.flatMap(result => 
    result.allPosts.map(post => ({
      ...post,
      user: result.user,
      commonInterests: result.commonInterests,
      matchScore: result.matchScore
    }))
  );

  // Trier par date décroissante (plus récent en premier)
  return allPosts.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Filtre les posts par score de pertinence minimum
 * @param posts - Posts avec informations utilisateur
 * @param minScore - Score minimum requis (défaut: 20)
 * @returns Posts filtrés par pertinence
 */
export function filterPostsByRelevance(
  posts: any[],
  minScore: number = 20
): any[] {
  return posts.filter(post => post.matchScore >= minScore);
}

export function filterByInterests(posts: any[], userInterests: string[]) {
  return posts.filter(post => {
    // Simple interest matching logic
    return true; // Placeholder
  });
}

// Copie du fichier utils/interestFiltering.ts existant
export interface InterestFilter {
  category: string;
  interests: string[];
  weight: number;
}

export interface UserInterests {
  primary: string[];
  secondary: string[];
  excluded: string[];
}

export function filterUsersByInterests(
  users: any[],
  currentUserInterests: string[],
  threshold: number = 0.3
): any[] {
  return users.filter(user => {
    const userInterests = user.interests || [];
    const commonInterests = userInterests.filter((interest: string) => 
      currentUserInterests.includes(interest)
    );
    
    const matchPercentage = commonInterests.length / Math.max(currentUserInterests.length, 1);
    return matchPercentage >= threshold;
  });
}

export function calculateInterestScore(
  userA: string[],
  userB: string[]
): number {
  const intersection = userA.filter(interest => userB.includes(interest));
  const union = [...new Set([...userA, ...userB])];
  
  return union.length > 0 ? intersection.length / union.length : 0;
}

export function getInterestRecommendations(
  userInterests: string[],
  allUsers: any[]
): string[] {
  const allInterests = allUsers.flatMap(user => user.interests || []);
  const interestCounts = allInterests.reduce((acc, interest) => {
    acc[interest] = (acc[interest] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(interestCounts)
    .filter(([interest]) => !userInterests.includes(interest))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([interest]) => interest);
}

export const INTEREST_CATEGORIES = {
  SPORTS: ['football', 'basketball', 'tennis', 'natation', 'course'],
  ARTS: ['peinture', 'musique', 'danse', 'théâtre', 'cinéma'],
  TECHNOLOGY: ['programmation', 'gaming', 'robotique', 'IA'],
  TRAVEL: ['voyages', 'aventure', 'camping', 'randonnée'],
  FOOD: ['cuisine', 'pâtisserie', 'vin', 'gastronomie']
};