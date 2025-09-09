import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Award, Filter, Grid, List } from 'lucide-react';
import { BadgeCard } from './BadgeCard';
import { useBadges } from '@/hooks/useBadges';
import { cn } from '@/lib/utils';

interface BadgeCollectionProps {
  userId?: string;
  showControls?: boolean;
  compact?: boolean;
}

const categoryLabels = {
  all: 'Tous',
  general: 'Général',
  social: 'Social', 
  activity: 'Activité',
  achievement: 'Réussites',
  special: 'Spéciaux',
  premium: 'Premium'
};

const rarityLabels = {
  all: 'Toutes',
  common: 'Commune',
  uncommon: 'Peu commune',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire'
};

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  userId,
  showControls = false,
  compact = false
}) => {
  const { 
    userBadges, 
    allBadgeTypes, 
    loading, 
    fetchUserBadges,
    getBadgesByCategory,
    getBadgesByRarity,
    getDisplayedBadges
  } = useBadges();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    if (userId) {
      fetchUserBadges(userId);
    }
  }, [userId, fetchUserBadges]);

  // Filtrer les badges
  const filteredBadges = React.useMemo(() => {
    let badges = userBadges;

    // Filtre par catégorie
    if (filterCategory !== 'all') {
      badges = getBadgesByCategory(filterCategory);
    }

    // Filtre par rareté
    if (filterRarity !== 'all') {
      badges = badges.filter(badge => badge.badge_type.rarity === filterRarity);
    }

    // Filtre par recherche
    if (searchQuery) {
      badges = badges.filter(badge => 
        badge.badge_type.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.badge_type.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return badges;
  }, [userBadges, filterCategory, filterRarity, searchQuery, getBadgesByCategory]);

  // Grouper par catégorie pour les onglets
  const badgesByCategory = React.useMemo(() => {
    const categories: Record<string, typeof userBadges> = {};
    
    userBadges.forEach(badge => {
      const category = badge.badge_type.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(badge);
    });

    return categories;
  }, [userBadges]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    const displayedBadges = getDisplayedBadges(6);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Badges</span>
            <Badge variant="secondary">{displayedBadges.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayedBadges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {displayedBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  userBadge={badge}
                  size="sm"
                  variant="minimal"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun badge obtenu</p>
              <p className="text-sm">Participez à la communauté pour en obtenir !</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Collection de badges</span>
            <Badge variant="secondary">{userBadges.length} / {allBadgeTypes.length}</Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {userBadges.length > 0 
            ? `Vous avez obtenu ${userBadges.length} badge${userBadges.length > 1 ? 's' : ''}`
            : 'Commencez à participer pour obtenir vos premiers badges'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un badge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterRarity} onValueChange={setFilterRarity}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Rareté" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(rarityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Liste des badges */}
        {userBadges.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucun badge obtenu</h3>
            <p className="mb-4">Participez à la communauté pour obtenir vos premiers badges !</p>
            <div className="text-sm space-y-1">
              <p>• Complétez votre profil</p>
              <p>• Créez votre premier post</p>
              <p>• Participez à des événements</p>
              <p>• Interagissez avec la communauté</p>
            </div>
          </div>
        ) : filteredBadges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun badge ne correspond à vos critères</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
                setFilterRarity('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
              <TabsTrigger value="all">
                Tous ({filteredBadges.length})
              </TabsTrigger>
              {Object.entries(badgesByCategory).map(([category, badges]) => (
                <TabsTrigger key={category} value={category}>
                  {categoryLabels[category as keyof typeof categoryLabels]} ({badges.length})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                  : "space-y-2"
              )}>
                {filteredBadges.map(badge => (
                  <BadgeCard
                    key={badge.id}
                    userBadge={badge}
                    showControls={showControls}
                    size={viewMode === 'grid' ? 'md' : 'sm'}
                    variant={viewMode === 'grid' ? 'card' : 'inline'}
                  />
                ))}
              </div>
            </TabsContent>

            {Object.entries(badgesByCategory).map(([category, badges]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                    : "space-y-2"
                )}>
                  {badges.map(badge => (
                    <BadgeCard
                      key={badge.id}
                      userBadge={badge}
                      showControls={showControls}
                      size={viewMode === 'grid' ? 'md' : 'sm'}
                      variant={viewMode === 'grid' ? 'card' : 'inline'}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};