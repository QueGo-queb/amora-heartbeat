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

export const testUsers: TestUser[] = [
  {
    id: "user_001",
    name: "Alice Dubois",
    age: 28,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    interests: ["Music", "Books", "Meditation", "Gymnastics", "Coffee"],
    bio: "Passionnée de littérature et de yoga. J'aime découvrir de nouveaux endroits et rencontrer des gens authentiques.",
    location: "Montréal, QC",
    posts: [
      {
        id: "post_001",
        content: "J'adore lire des romans fantastiques le soir avec une tasse de thé ! ✨",
        created_at: "2024-01-15T10:30:00Z",
        likes_count: 24,
        comments_count: 8
      },
      {
        id: "post_002",
        content: "Session de yoga ce matin au lever du soleil. La paix intérieure commence par là 🧘‍♀️🌅",
        created_at: "2024-01-14T07:15:00Z",
        likes_count: 31,
        comments_count: 12
      }
    ]
  },
  {
    id: "user_002",
    name: "Marco Rossi",
    age: 32,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    interests: ["Football", "Travel", "Cooking", "Fitness", "Instagram"],
    bio: "Chef cuisinier passionné de football. J'aime voyager et découvrir de nouvelles saveurs du monde.",
    location: "Toronto, ON",
    posts: [
      {
        id: "post_003",
        content: "Match de foot ce weekend ! Qui vient supporter l'équipe locale ? ⚽🔥",
        created_at: "2024-01-15T14:20:00Z",
        likes_count: 45,
        comments_count: 15
      },
      {
        id: "post_004",
        content: "Nouvelle recette de pasta carbonara testée ce soir. Un succès ! 🍝👨‍🍳",
        created_at: "2024-01-13T19:45:00Z",
        likes_count: 28,
        comments_count: 9
      }
    ]
  },
  {
    id: "user_003",
    name: "Sophie Chen",
    age: 26,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    interests: ["Painting", "Spotify", "Walking", "Self Care", "Books"],
    bio: "Artiste peintre et amoureuse de la nature. Je trouve l'inspiration dans les promenades en forêt.",
    location: "Vancouver, BC",
    posts: [
      {
        id: "post_005",
        content: "Nouvelle toile terminée ! L'inspiration est venue d'une promenade au parc Stanley 🎨🌲",
        created_at: "2024-01-15T16:00:00Z",
        likes_count: 52,
        comments_count: 18
      },
      {
        id: "post_006",
        content: "Playlist du jour : indie folk pour accompagner ma session de peinture 🎧🎨",
        created_at: "2024-01-12T11:30:00Z",
        likes_count: 19,
        comments_count: 6
      }
    ]
  },
  {
    id: "user_004",
    name: "David Johnson",
    age: 30,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    interests: ["Hockey", "Running", "Church", "Fitness", "Travel"],
    bio: "Hockeyeur amateur et coureur passionné. La foi et le sport me donnent de l'énergie.",
    location: "Edmonton, AB",
    posts: [
      {
        id: "post_007",
        content: "10km ce matin dans le parc de la rivière. L'air frais fait du bien ! 🏃‍♂️💨",
        created_at: "2024-01-15T06:30:00Z",
        likes_count: 38,
        comments_count: 11
      },
      {
        id: "post_008",
        content: "Match de hockey ce soir ! L'équipe est en forme cette saison 🏒🥅",
        created_at: "2024-01-14T20:15:00Z",
        likes_count: 67,
        comments_count: 23
      }
    ]
  },
  {
    id: "user_005",
    name: "Emma Wilson",
    age: 29,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    interests: ["Parties", "Hot Yoga", "Sushi", "Theater", "Instagram"],
    bio: "Organisatrice d'événements et passionnée de culture japonaise. La vie est une fête !",
    location: "Calgary, AB",
    posts: [
      {
        id: "post_009",
        content: "Soirée sushi ce weekend ! Qui veut découvrir de nouveaux restaurants japonais ? 🍣🎭",
        created_at: "2024-01-15T18:00:00Z",
        likes_count: 41,
        comments_count: 14
      },
      {
        id: "post_010",
        content: "Nouvelle pièce de théâtre ce soir. L'art nous fait vivre des émotions uniques ! ✨",
        created_at: "2024-01-13T21:00:00Z",
        likes_count: 33,
        comments_count: 10
      }
    ]
  },
  {
    id: "user_006",
    name: "Lucas Silva",
    age: 31,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    interests: ["Playing Music Instrument", "Aquarium", "Basketball", "Cooking", "Singing"],
    bio: "Guitariste et passionné de basketball. J'aime cuisiner et chanter en famille.",
    location: "Winnipeg, MB",
    posts: [
      {
        id: "post_011",
        content: "Nouvelle chanson composée ce weekend ! La musique est une langue universelle 🎸🎵",
        created_at: "2024-01-15T22:00:00Z",
        likes_count: 58,
        comments_count: 20
      },
      {
        id: "post_012",
        content: "Match de basket ce soir ! L'équipe est motivée pour la victoire 🏀🔥",
        created_at: "2024-01-14T19:30:00Z",
        likes_count: 44,
        comments_count: 16
      }
    ]
  },
  {
    id: "user_007",
    name: "Isabella Rodriguez",
    age: 27,
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    interests: ["Message", "Fitness", "Travel", "Coffee", "Walking"],
    bio: "Professeure de fitness et voyageuse. J'aime partager ma passion pour un mode de vie sain.",
    location: "Halifax, NS",
    posts: [
      {
        id: "post_013",
        content: "Nouveau cours de fitness ce matin ! L'énergie du groupe est incroyable ✨",
        created_at: "2024-01-15T08:00:00Z",
        likes_count: 36,
        comments_count: 13
      },
      {
        id: "post_014",
        content: "Café du matin avec vue sur l'océan. La vie est belle ! ☕🌊",
        created_at: "2024-01-12T07:00:00Z",
        likes_count: 29,
        comments_count: 8
      }
    ]
  },
  {
    id: "user_008",
    name: "Thomas Anderson",
    age: 33,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    interests: ["Books", "Meditation", "Gymnastics", "Spotify", "Self Care"],
    bio: "Développeur et passionné de développement personnel. L'équilibre corps-esprit est essentiel.",
    location: "Ottawa, ON",
    posts: [
      {
        id: "post_015",
        content: "Nouveau livre de développement personnel commencé. La croissance personnelle n'a pas de limite 📚🧘‍♂️",
        created_at: "2024-01-15T12:00:00Z",
        likes_count: 25,
        comments_count: 7
      },
      {
        id: "post_016",
        content: "Session de gymnastique ce matin. Le corps a besoin de mouvement ! 🤸‍♂️💪",
        created_at: "2024-01-14T06:00:00Z",
        likes_count: 31,
        comments_count: 9
      }
    ]
  },
  {
    id: "user_009",
    name: "Maria Garcia",
    age: 25,
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b2a0ea76?w=150&h=150&fit=crop&crop=face",
    interests: ["Parties", "Instagram", "Sushi", "Theater", "Hot Yoga"],
    bio: "Influenceuse lifestyle et passionnée de culture asiatique. J'aime partager ma vie créative.",
    location: "Quebec City, QC",
    posts: [
      {
        id: "post_017",
        content: "Nouvelle photo Instagram ! La vie est une aventure à partager ✨",
        created_at: "2024-01-15T15:00:00Z",
        likes_count: 89,
        comments_count: 31
      },
      {
        id: "post_018",
        content: "Cours de yoga chaud ce soir. La chaleur libère les tensions ! 🧘‍♀️🔥",
        created_at: "2024-01-13T18:00:00Z",
        likes_count: 42,
        comments_count: 15
      }
    ]
  },
  {
    id: "user_010",
    name: "James Thompson",
    age: 34,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    interests: ["Football", "Fitness", "Travel", "Coffee", "Running"],
    bio: "Entraîneur sportif et voyageur. Le sport et l'aventure me font vivre intensément.",
    location: "Regina, SK",
    posts: [
      {
        id: "post_019",
        content: "Entraînement football ce matin ! L'équipe progresse bien ⚽💪",
        created_at: "2024-01-15T07:00:00Z",
        likes_count: 47,
        comments_count: 18
      },
      {
        id: "post_020",
        content: "Nouveau café testé ce weekend. Les bonnes adresses se partagent ! ☕🌟",
        created_at: "2024-01-12T10:00:00Z",
        likes_count: 23,
        comments_count: 6
      }
    ]
  }
];

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
  const commonInterests = user.interests.filter(interest => 
    userInterests.includes(interest)
  );
  
  // Score basé sur le nombre d'intérêts communs
  const baseScore = commonInterests.length * 25;
  
  // Bonus pour les intérêts rares
  const rareInterests = ['Aquarium', 'Theater', 'Playing Music Instrument'];
  const rareBonus = commonInterests.filter(interest => 
    rareInterests.includes(interest)
  ).length * 10;
  
  return baseScore + rareBonus;
}
