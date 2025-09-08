// src/data/testUsers.ts - VERSION VIDE
export interface TestUser {
  id: string;
  name: string;
  age: number;
  avatar: string;
  interests: string[];
  bio: string;
  location: string;
  posts: TestPost[];
}

export interface TestPost {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  image?: string;
}

// DONNÉES VIDES POUR LA PRODUCTION
export const testUsers: TestUser[] = [];

// Fonction utilitaire pour filtrer les utilisateurs par intérêts communs
export function filterUsersByInterests(
  userInterests: string[], 
  allUsers: TestUser[], 
  minCommonInterests: number = 1
): TestUser[] {
  return allUsers.filter(user => {
    const commonInterests = user.interests.filter(interest => 
      userInterests.includes(interest)
    );
    return commonInterests.length >= minCommonInterests;
  });
}

// Fonction pour calculer le score de compatibilité
export function calculateCompatibilityScore(
  userInterests: string[], 
  otherUser: TestUser
): number {
  const commonInterests = otherUser.interests.filter(interest => 
    userInterests.includes(interest)
  );
  
  // Score basé sur le nombre d'intérêts communs
  const baseScore = commonInterests.length * 25;
  
  // Bonus pour les intérêts rares
  const rareInterests = ['Méditation', 'Art', 'Photographie'];
  const rareBonus = commonInterests.filter(interest => 
    rareInterests.includes(interest)
  ).length * 10;
  
  return baseScore + rareBonus;
}

// Utilisateur par défaut vide pour éviter les erreurs
export const currentUser: TestUser | null = null;
