import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, TrendingUp, Users } from 'lucide-react';
import { BadgeCollection } from '@/components/badges/BadgeCollection';
import { ReputationScore } from '@/components/badges/ReputationScore';
import { useBadges } from '@/hooks/useBadges';
import { useAuth } from '@/hooks/useAuth';
import { SkipLinks } from '@/components/a11y/SkipLinks';

export const BadgesPage: React.FC = () => {
  const { userBadges, reputationScore, recentActions, getDisplayedBadges } = useBadges();
  const { user } = useAuth();

  const displayedBadges = getDisplayedBadges(3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <SkipLinks />
      
      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center space-x-2">
          <Award className="h-8 w-8 text-primary" />
          <span>Badges & Réputation</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez vos badges obtenus et suivez votre progression dans la communauté AMORA
        </p>
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Badges obtenus */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges obtenus</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              {displayedBadges.length} affichés sur votre profil
            </p>
            {displayedBadges.length > 0 && (
              <div className="flex space-x-1 mt-2">
                {displayedBadges.slice(0, 3).map(badge => (
                  <div
                    key={badge.id}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ 
                      backgroundColor: badge.badge_type.background_hex,
                      color: badge.badge_type.color_hex 
                    }}
                  >
                    ⭐
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Niveau de réputation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niveau</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reputationScore?.current_level || 1}
            </div>
            <p className="text-xs text-muted-foreground">
              {reputationScore?.total_score || 0} points de réputation
            </p>
          </CardContent>
        </Card>

        {/* Actions récentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité récente</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentActions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Actions cette semaine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Mes badges</span>
          </TabsTrigger>
          <TabsTrigger value="reputation" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Réputation</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Classement</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-6">
          <BadgeCollection showControls={true} />
        </TabsContent>

        <TabsContent value="reputation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReputationScore showDetails={true} />
            
            {/* Historique des actions */}
            <Card>
              <CardHeader>
                <CardTitle>Historique récent</CardTitle>
                <CardDescription>
                  Vos dernières actions qui ont affecté votre réputation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActions.length > 0 ? (
                  <div className="space-y-3">
                    {recentActions.slice(0, 10).map(action => (
                      <div key={action.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize">
                            {action.action_type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {action.reason || 'Action automatique'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={action.score_change > 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {action.score_change > 0 ? '+' : ''}{action.score_change}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(action.created_at).toLocaleDateString('fr')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune action récente</p>
                    <p className="text-sm">Participez à la communauté pour gagner de la réputation !</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Classement de la communauté</span>
              </CardTitle>
              <CardDescription>
                Les membres les plus actifs et respectés de AMORA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Classement bientôt disponible</h3>
                <p className="mb-4">
                  Le système de classement sera activé prochainement pour permettre une compétition saine entre les membres.
                </p>
                <div className="text-sm space-y-1">
                  <p>🏆 Top contributeurs</p>
                  <p>📈 Progression mensuelle</p>
                  <p>🎯 Défis communautaires</p>
                  <p>🏅 Récompenses spéciales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};