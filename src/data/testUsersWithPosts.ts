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

export const testUsers: TestUser[] = [
  {
    id: "user_001",
    name: "Alice Dubois",
    age: 28,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    interests: ["Musique", "Voyage", "Fitness", "Lecture", "Cuisine"],
    bio: "Passionnée de littérature et de fitness. J'aime découvrir de nouveaux endroits et rencontrer des gens authentiques.",
    location: "Montréal, QC",
    posts: [
      {
        id: "post_001",
        content: "Je cherche une personne pour une relation sérieuse, qui aime voyager et le fitness. J'adore les randonnées en montagne et les séances de sport en plein air ! 🏔️💪",
        created_at: "2024-01-15T10:30:00Z",
        author_id: "user_001",
        author_name: "Alice Dubois",
        author_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "post_002",
        content: "J'aimerais rencontrer quelqu'un qui partage ma passion pour la musique et la lecture. Une soirée jazz avec un bon livre, ça vous tente ? 🎵📚",
        created_at: "2024-01-14T15:20:00Z",
        author_id: "user_001",
        author_name: "Alice Dubois",
        author_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "user_002",
    name: "Marco Rossi",
    age: 32,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    interests: ["Sport", "Cuisine", "Voyage", "Photographie", "Fitness"],
    bio: "Chef cuisinier passionné de football. J'aime voyager et découvrir de nouvelles saveurs du monde.",
    location: "Toronto, ON",
    posts: [
      {
        id: "post_003",
        content: "Je cherche une personne qui aime le sport et la cuisine comme moi. Qui veut partager une séance de fitness suivie d'un bon repas fait maison ? ⚽👨‍🍳",
        created_at: "2024-01-15T14:20:00Z",
        author_id: "user_002",
        author_name: "Marco Rossi",
        author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "post_004",
        content: "J'aimerais rencontrer quelqu'un qui partage ma passion pour la photographie et les voyages. Explorer le monde ensemble, ça vous dit ? 📸✈️",
        created_at: "2024-01-13T19:45:00Z",
        author_id: "user_002",
        author_name: "Marco Rossi",
        author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "user_003",
    name: "Sophie Chen",
    age: 26,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    interests: ["Art", "Yoga", "Méditation", "Nature", "Lecture"],
    bio: "Artiste peintre et amoureuse de la nature. Je trouve l'inspiration dans les promenades en forêt et la méditation.",
    location: "Vancouver, BC",
    posts: [
      {
        id: "post_005",
        content: "Je cherche une personne qui aime le yoga et la méditation. J'aimerais partager des séances de relaxation et des promenades en nature. 🧘‍♀️🌲",
        created_at: "2024-01-15T16:00:00Z",
        author_id: "user_003",
        author_name: "Sophie Chen",
        author_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "post_006",
        content: "J'aimerais rencontrer quelqu'un qui partage ma passion pour l'art et la lecture. Créer ensemble et partager nos découvertes littéraires ? 🎨📖",
        created_at: "2024-01-12T11:30:00Z",
        author_id: "user_003",
        author_name: "Sophie Chen",
        author_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "user_004",
    name: "David Johnson",
    age: 30,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    interests: ["Sport", "Fitness", "Voyage", "Photographie", "Musique"],
    bio: "Hockeyeur amateur et coureur passionné. Le sport et l'aventure me donnent de l'énergie.",
    location: "Edmonton, AB",
    posts: [
      {
        id: "post_007",
        content: "Je cherche une personne qui aime le sport et le fitness. J'aimerais partager des entraînements et des aventures sportives ! 🏃‍♂️🏒",
        created_at: "2024-01-15T06:30:00Z",
        author_id: "user_004",
        author_name: "David Johnson",
        author_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "post_008",
        content: "J'aimerais rencontrer quelqu'un qui partage ma passion pour la musique et la photographie. Créer des souvenirs ensemble ? 🎵📸",
        created_at: "2024-01-14T20:15:00Z",
        author_id: "user_004",
        author_name: "David Johnson",
        author_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "user_005",
    name: "Emma Wilson",
    age: 29,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    interests: ["Cinéma", "Voyage", "Cuisine", "Art", "Musique"],
    bio: "Organisatrice d'événements et passionnée de culture. La vie est une aventure à partager !",
    location: "Calgary, AB",
    posts: [
      {
        id: "post_009",
        content: "Je cherche une personne qui aime le cinéma et l'art. J'aimerais partager des soirées cinéma et des visites d'expositions ! 🎭🎬",
        created_at: "2024-01-15T18:00:00Z",
        author_id: "user_005",
        author_name: "Emma Wilson",
        author_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "post_010",
        content: "J'aimerais rencontrer quelqu'un qui partage ma passion pour la cuisine et la musique. Préparer un repas ensemble en écoutant de la musique ? 🍳🎵",
        created_at: "2024-01-13T21:00:00Z",
        author_id: "user_005",
        author_name: "Emma Wilson",
        author_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "user_006",
    name: "Lucas Silva",
    age: 31,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    interests: ["Musique", "Sport", "Cuisine", "Voyage", "Art"],
    bio: "Guitariste et passionné de basketball. J'aime cuisiner et partager des moments créatifs.",
    location: "Winnipeg, MB",
    posts: [
      {
        id: "post_011",
        content: "Je cherche une personne qui aime la musique et le sport. J'aimerais partager des sessions de musique et des matchs de basket ! 🎸🏀",
        created_at: "2024-01-15T22:00:00Z",
        author_id: "user_006",
        author_name: "Lucas Silva",
        author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "post_012",
        content: "J'aimerais rencontrer quelqu'un qui partage ma passion pour la cuisine et l'art. Créer ensemble des plats artistiques ? 👨‍🍳🎨",
        created_at: "2024-01-14T19:30:00Z",
        author_id: "user_006",
        author_name: "Lucas Silva",
        author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "user_007",
    name: "Isabella Rodriguez",
    age: 27,
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    interests: ["Fitness", "Voyage", "Cuisine", "Photographie", "Sport"],
    bio: "Professeure de fitness et voyageuse. J'aime partager ma passion pour un mode de vie sain.",
    location: "Halifax, NS",
    posts: [
      {
        id: "post_013",
        content: "Je cherche une personne qui aime le fitness et le voyage. J'aimerais partager des entraînements et des aventures autour du monde ! 💪✈️",
        created_at: "2024-01-15T08:00:00Z",
        author_id: "user_007",
        author_name: "Isabella Rodriguez",
        author_avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "post_014",
        content: "J'aimerais rencontrer quelqu'un qui partage ma passion pour la cuisine et la photographie. Créer des souvenirs culinaires ensemble ? 🍳📸",
        created_at: "2024-01-12T07:00:00Z",
        author_id: "user_007",
        author_name: "Isabella Rodriguez",
        author_avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "user_008",
    name: "Thomas Anderson",
    age: 33,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    interests: ["Lecture", "Méditation", "Yoga", "Nature", "Art"],
    bio: "Développeur et passionné de développement personnel. L'équilibre corps-esprit est essentiel.",
    location: "Ottawa, ON",
    posts: [
      {
        id: "post_015",
        content: "Je cherche une personne qui aime la lecture et la méditation. J'aimerais partager des moments de réflexion et de croissance personnelle. 📚🧘‍♂️",
        created_at: "2024-01-15T12:00:00Z",
        author_id: "user_008",
        author_name: "Thomas Anderson",
        author_avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "post_016",
        content: "J'aimerais rencontrer quelqu'un qui partage ma passion pour le yoga et la nature. Pratiquer ensemble en plein air ? 🧘‍♂️🌿",
        created_at: "2024-01-14T06:00:00Z",
        author_id: "user_008",
        author_name: "Thomas Anderson",
        author_avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "user_009",
    name: "Maria Garcia",
    age: 25,
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b2a0ea76?w=150&h=150&fit=crop&crop=face",
    interests: ["Voyage", "Photographie", "Cuisine", "Sport", "Musique"],
    bio: "Influenceuse lifestyle et passionnée de culture. J'aime partager ma vie créative.",
    location: "Quebec City, QC",
    posts: [
      {
        id: "post_017",
        content: "Je cherche une personne qui aime le voyage et la photographie. J'aimerais explorer le monde ensemble et capturer des moments uniques ! ✈️📸",
        created_at: "2024-01-15T15:00:00Z",
        author_id: "user_009",
        author_name: "Maria Garcia",
        author_avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b2a0ea76?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "post_018",
        content: "J'aimerais rencontrer quelqu'un qui partage ma passion pour la cuisine et le sport. Préparer des repas sains et faire du sport ensemble ? 🍳🏃‍♀️",
        created_at: "2024-01-13T18:00:00Z",
        author_id: "user_009",
        author_name: "Maria Garcia",
        author_avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b2a0ea76?w=150&h=150&fit=crop&crop=face"
      }
    ]
  },
  {
    id: "user_010",
    name: "James Thompson",
    age: 34,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    interests: ["Sport", "Fitness", "Voyage", "Cuisine", "Photographie"],
    bio: "Entraîneur sportif et voyageur. Le sport et l'aventure me fait vivre intensément.",
    location: "Regina, SK",
    posts: [
      {
        id: "post_019",
        content: "Je cherche une personne qui aime le sport et le fitness. J'aimerais partager des entraînements et des défis sportifs ! ⚽💪",
        created_at: "2024-01-15T07:00:00Z",
        author_id: "user_010",
        author_name: "James Thompson",
        author_avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "post_020",
        content: "J'aimerais rencontrer quelqu'un qui partage ma passion pour la cuisine et la photographie. Créer des expériences culinaires ensemble ? 👨‍🍳📸",
        created_at: "2024-01-12T10:00:00Z",
        author_id: "user_010",
        author_name: "James Thompson",
        author_avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
      }
    ]
  }
];

// Fonction pour filtrer les utilisateurs par intérêts communs
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
