import { useState, useEffect } from 'react';
import { testUsers, currentUser } from '@/data/testUsers';
import { 
  filterUsersByCommonInterests, 
  getAllPostsFromFilteredUsers,
  filterPostsByRelevance,
  UserWithCommonInterests 
} from '../../utils/interestFiltering';

export function useTestData() {
  const [filteredUsers, setFilteredUsers] = useState<UserWithCommonInterests[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement asynchrone
    const loadData = async () => {
      setLoading(true);
      
      // Attendre un peu pour simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        // Filtrer les utilisateurs par intérêts communs
        const usersWithCommonInterests = filterUsersByCommonInterests(
          testUsers,
          currentUser.interests,
          1 // Au moins 1 intérêt commun
        );

        // Récupérer tous les posts
        const allPosts = getAllPostsFromFilteredUsers(usersWithCommonInterests);

        // Filtrer par pertinence
        const relevantPosts = filterPostsByRelevance(allPosts, 20);

        setFilteredUsers(usersWithCommonInterests);
        setFilteredPosts(relevantPosts);
      } catch (error) {
        console.error('Erreur lors du chargement des données de test:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    // Recharger les données
    setTimeout(() => {
      const usersWithCommonInterests = filterUsersByCommonInterests(
        testUsers,
        currentUser.interests,
        1
      );
      const allPosts = getAllPostsFromFilteredUsers(usersWithCommonInterests);
      const relevantPosts = filterPostsByRelevance(allPosts, 20);
      
      setFilteredUsers(usersWithCommonInterests);
      setFilteredPosts(relevantPosts);
      setLoading(false);
    }, 300);
  };

  return {
    filteredUsers,
    filteredPosts,
    loading,
    refreshData,
    currentUser
  };
}
