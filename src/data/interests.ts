export interface Interest {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface InterestCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const interestCategories: InterestCategory[] = [
  { id: 'sports', name: 'Sports', icon: '⚽', color: 'bg-blue-100 text-blue-700' },
  { id: 'culture', name: 'Culture', icon: '🎭', color: 'bg-purple-100 text-purple-700' },
  { id: 'societe', name: 'Société', icon: '🌍', color: 'bg-green-100 text-green-700' },
  { id: 'divertissement', name: 'Divertissement', icon: '🎮', color: 'bg-pink-100 text-pink-700' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '✨', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'savoirs', name: 'Savoirs', icon: '📚', color: 'bg-indigo-100 text-indigo-700' }
];

export const allInterests: Interest[] = [
  // ===== SPORTS =====
  { id: 'football', name: 'Football', icon: '⚽', category: 'sports' },
  { id: 'basketball', name: 'Basketball', icon: '🏀', category: 'sports' },
  { id: 'hockey', name: 'Hockey', icon: '🏒', category: 'sports' },
  { id: 'fitness', name: 'Fitness', icon: '🏋️', category: 'sports' },
  { id: 'running', name: 'Course à pied', icon: '🏃', category: 'sports' },
  { id: 'swimming', name: 'Natation', icon: '🏊', category: 'sports' },
  { id: 'cycling', name: 'Cyclisme', icon: '🚴', category: 'sports' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', category: 'sports' },
  { id: 'gymnastics', name: 'Gymnastique', icon: '🤸', category: 'sports' },
  { id: 'yoga', name: 'Yoga', icon: '🧘‍♂️', category: 'sports' },
  { id: 'climbing', name: 'Escalade', icon: '🧗', category: 'sports' },
  { id: 'skiing', name: 'Ski', icon: '⛷️', category: 'sports' },
  { id: 'walking', name: 'Marche', icon: '🚶', category: 'sports' },

  // ===== CULTURE =====
  { id: 'music', name: 'Musique', icon: '🎵', category: 'culture' },
  { id: 'books', name: 'Lecture', icon: '📚', category: 'culture' },
  { id: 'theater', name: 'Théâtre', icon: '🎭', category: 'culture' },
  { id: 'cinema', name: 'Cinéma', icon: '🎬', category: 'culture' },
  { id: 'tv-series', name: 'Séries TV', icon: '📺', category: 'culture' },
  { id: 'painting', name: 'Peinture', icon: '🎨', category: 'culture' },
  { id: 'photography', name: 'Photographie', icon: '📸', category: 'culture' },
  { id: 'dancing', name: 'Danse', icon: '💃', category: 'culture' },
  { id: 'singing', name: 'Chant', icon: '🎤', category: 'culture' },
  { id: 'instruments', name: 'Instruments', icon: '🎸', category: 'culture' },
  { id: 'museums', name: 'Musées', icon: '🏛️', category: 'culture' },
  { id: 'opera', name: 'Opéra', icon: '🎼', category: 'culture' },
  { id: 'spotify', name: 'Spotify', icon: '🎧', category: 'culture' },

  // ===== SOCIÉTÉ =====
  { id: 'politics', name: 'Politique', icon: '🏛️', category: 'societe' },
  { id: 'economy', name: 'Économie', icon: '💼', category: 'societe' },
  { id: 'environment', name: 'Environnement', icon: '🌱', category: 'societe' },
  { id: 'human-rights', name: 'Droits humains', icon: '⚖️', category: 'societe' },
  { id: 'volunteer', name: 'Bénévolat', icon: '🤝', category: 'societe' },
  { id: 'social-causes', name: 'Causes sociales', icon: '✊', category: 'societe' },
  { id: 'journalism', name: 'Journalisme', icon: '📰', category: 'societe' },
  { id: 'activism', name: 'Militantisme', icon: '📢', category: 'societe' },

  // ===== DIVERTISSEMENT =====
  { id: 'video-games', name: 'Jeux vidéo', icon: '🎮', category: 'divertissement' },
  { id: 'board-games', name: 'Jeux de société', icon: '🎲', category: 'divertissement' },
  { id: 'parties', name: 'Fêtes', icon: '🎉', category: 'divertissement' },
  { id: 'comedy', name: 'Humour', icon: '😂', category: 'divertissement' },
  { id: 'streaming', name: 'Streaming', icon: '📱', category: 'divertissement' },
  { id: 'social-media', name: 'Réseaux sociaux', icon: '📲', category: 'divertissement' },
  { id: 'podcasts', name: 'Podcasts', icon: '🎧', category: 'divertissement' },
  { id: 'memes', name: 'Memes', icon: '😄', category: 'divertissement' },
  { id: 'nightlife', name: 'Vie nocturne', icon: '🌙', category: 'divertissement' },
  { id: 'instagram', name: 'Instagram', icon: '📷', category: 'divertissement' },
  { id: 'message', name: 'Messages', icon: '✉️', category: 'divertissement' },

  // ===== LIFESTYLE =====
  { id: 'travel', name: 'Voyage', icon: '✈️', category: 'lifestyle' },
  { id: 'cooking', name: 'Cuisine', icon: '🍳', category: 'lifestyle' },
  { id: 'coffee', name: 'Café', icon: '☕', category: 'lifestyle' },
  { id: 'wine', name: 'Vin', icon: '🍷', category: 'lifestyle' },
  { id: 'fashion', name: 'Mode', icon: '👗', category: 'lifestyle' },
  { id: 'beauty', name: 'Beauté', icon: '💄', category: 'lifestyle' },
  { id: 'wellness', name: 'Bien-être', icon: '🧘‍♀️', category: 'lifestyle' },
  { id: 'meditation', name: 'Méditation', icon: '🧘', category: 'lifestyle' },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗', category: 'lifestyle' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', category: 'lifestyle' },
  { id: 'home-decor', name: 'Décoration', icon: '🏠', category: 'lifestyle' },
  { id: 'pets', name: 'Animaux', icon: '🐕', category: 'lifestyle' },
  { id: 'gardening', name: 'Jardinage', icon: '🌺', category: 'lifestyle' },
  { id: 'sushi', name: 'Sushi', icon: '🍣', category: 'lifestyle' },
  { id: 'self-care', name: 'Soins personnels', icon: '🛁', category: 'lifestyle' },

  // ===== SAVOIRS =====
  { id: 'technology', name: 'Technologie', icon: '💻', category: 'savoirs' },
  { id: 'startups', name: 'Startups', icon: '🚀', category: 'savoirs' },
  { id: 'science', name: 'Science', icon: '🔬', category: 'savoirs' },
  { id: 'philosophy', name: 'Philosophie', icon: '🤔', category: 'savoirs' },
  { id: 'psychology', name: 'Psychologie', icon: '🧠', category: 'savoirs' },
  { id: 'history', name: 'Histoire', icon: '📜', category: 'savoirs' },
  { id: 'languages', name: 'Langues', icon: '🌍', category: 'savoirs' },
  { id: 'education', name: 'Éducation', icon: '🎓', category: 'savoirs' },
  { id: 'spirituality', name: 'Spiritualité', icon: '🕯️', category: 'savoirs' },
  { id: 'astronomy', name: 'Astronomie', icon: '⭐', category: 'savoirs' },
  { id: 'ai', name: 'Intelligence Artificielle', icon: '🤖', category: 'savoirs' },
  { id: 'blockchain', name: 'Blockchain', icon: '⛓️', category: 'savoirs' },
  { id: 'church', name: 'Église', icon: '⛪', category: 'savoirs' }
];

// Fonction utilitaire pour obtenir les intérêts par catégorie
export const getInterestsByCategory = (categoryId: string): Interest[] => {
  return allInterests.filter(interest => interest.category === categoryId);
};

// Fonction pour obtenir une catégorie par ID
export const getCategoryById = (categoryId: string): InterestCategory | undefined => {
  return interestCategories.find(cat => cat.id === categoryId);
};

// Fonction pour obtenir un intérêt par ID
export const getInterestById = (interestId: string): Interest | undefined => {
  return allInterests.find(interest => interest.id === interestId);
};

// Fonction pour migrer les anciens intérêts vers les nouveaux IDs
export const migrateOldInterests = (oldInterests: string[]): string[] => {
  const migrationMap: Record<string, string> = {
    'Music': 'music',
    'Books': 'books',
    'Parties': 'parties',
    'Self Care': 'self-care',
    'Message': 'message',
    'Hot Yoga': 'yoga',
    'Gymnastics': 'gymnastics',
    'Hockey': 'hockey',
    'Football': 'football',
    'Meditation': 'meditation',
    'Spotify': 'spotify',
    'Sushi': 'sushi',
    'Painting': 'painting',
    'Basketball': 'basketball',
    'Theater': 'theater',
    'Playing Music Instrument': 'instruments',
    'Aquarium': 'pets',
    'Fitness': 'fitness',
    'Travel': 'travel',
    'Coffee': 'coffee',
    'Instagram': 'instagram',
    'Walking': 'walking',
    'Running': 'running',
    'Church': 'church',
    'Cooking': 'cooking',
    'Singing': 'singing'
  };

  return oldInterests.map(interest => migrationMap[interest] || interest.toLowerCase().replace(/\s+/g, '-'));
};
