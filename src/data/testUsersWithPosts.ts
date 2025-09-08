// src/data/testUsersWithPosts.ts
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
  author_id: string;
  author_name: string;
  author_avatar: string;
}

// DONNÉES VIDES POUR LA PRODUCTION
export const testUsers: TestUser[] = [];

export function filterUsersByInterests(
  userInterests: string[], 
  allUsers: TestUser[], 
  minCommonInterests: number = 1
): TestUser[] {
  return [];
}

export function calculateCompatibilityScore(
  userInterests: string[], 
  otherUser: TestUser
): number {
  return 0;
}
