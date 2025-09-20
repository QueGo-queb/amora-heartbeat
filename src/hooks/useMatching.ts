import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  age: number;
  gender: string;
  country: string;
  region?: string;
  city?: string;
  language: string;
  bio?: string;
  seeking_gender: string;
  seeking_age_min?: number;
  seeking_age_max?: number;
  seeking_country?: string;
  seeking_languages?: string[];
}

interface MatchingCriteria {
  userId: string;
  userProfile: UserProfile;
}

export const useMatching = (criteria?: MatchingCriteria) => {
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findMatches = async (userCriteria: MatchingCriteria) => {
    setLoading(true);
    setError(null);

    try {
      const { userProfile } = userCriteria;
      
      // Build the query to find potential matches
      let query = supabase
        .from('users')
        .select('*')
        .neq('id', userProfile.id); // Exclude the current user

      // Filter by seeking gender preferences
      if (userProfile.seeking_gender && userProfile.seeking_gender !== 'any') {
        query = query.eq('gender', userProfile.seeking_gender as any);
      }

      // Filter by age range preferences
      if (userProfile.seeking_age_min) {
        query = query.gte('age', userProfile.seeking_age_min);
      }
      if (userProfile.seeking_age_max) {
        query = query.lte('age', userProfile.seeking_age_max);
      }

      // Filter by country preferences
      if (userProfile.seeking_country) {
        query = query.eq('country', userProfile.seeking_country);
      }

      const { data: potentialMatches, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // Additional filtering for mutual interest
      const mutualMatches = potentialMatches?.filter(match => {
        // Check if the potential match is also looking for the current user's gender
        if (match.seeking_gender && match.seeking_gender !== 'any' && 
            match.seeking_gender !== userProfile.gender) {
          return false;
        }

        // Check if the potential match's age preferences match the current user's age
        if (match.seeking_age_min && userProfile.age < match.seeking_age_min) {
          return false;
        }
        if (match.seeking_age_max && userProfile.age > match.seeking_age_max) {
          return false;
        }

        // Check if the potential match's country preferences match
        if (match.seeking_country && match.seeking_country !== userProfile.country) {
          return false;
        }

        // Check language compatibility
        if (userProfile.seeking_languages && userProfile.seeking_languages.length > 0) {
          const hasLanguageMatch = userProfile.seeking_languages.includes(match.language);
          if (!hasLanguageMatch) {
            return false;
          }
        }

        return true;
      }) || [];

      setMatches(mutualMatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while finding matches');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION: Sérialiser l'objet criteria pour éviter les re-renders
  useEffect(() => {
    if (criteria) {
      findMatches(criteria);
    }
  }, [JSON.stringify(criteria)]); // ✅ Sérialiser l'objet criteria

  return {
    matches,
    loading,
    error,
    findMatches
  };
};

export default useMatching;