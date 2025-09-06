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