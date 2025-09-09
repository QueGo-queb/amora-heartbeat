import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Users, 
  Plane,
  Heart,
  MessageCircle,
  Info,
  Navigation,
  Clock,
  Star
} from 'lucide-react';
import { TravelMatch } from '@/hooks/useTravelMode';
import { cn } from '@/lib/utils';

interface TravelMatchesProps {
  matches: TravelMatch[];
  onMatchClick?: (match: TravelMatch) => void;
  onLikeMatch?: (match: TravelMatch) => void;
  onMessageMatch?: (match: TravelMatch) => void;
  loading?: boolean;
}

export const TravelMatches: React.FC<TravelMatchesProps> = ({
  matches,
  onMatchClick,
  onLikeMatch,
  onMessageMatch,
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Aucun match trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Nous cherchons des personnes compatibles dans votre destination.
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>💡 Complétez votre profil pour plus de visibilité</p>
            <p>🎯 Ajustez vos préférences de recherche</p>
            <p>⏰ Revenez plus tard, de nouveaux profils sont ajoutés régulièrement</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Séparer les voyageurs et les locaux
  const travelers = matches.filter(match => match.is_traveler);
  const locals = matches.filter(match => !match.is_traveler);

  const MatchCard: React.FC<{ match: TravelMatch }> = ({ match }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onMatchClick?.(match)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://avatar.vercel.sh/${match.id}`} />
            <AvatarFallback>
              {match.full_name[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold truncate">{match.full_name}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{match.age} ans</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{match.city}, {match.country}</span>
                  </div>
                  {match.distance_km && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Navigation className="h-3 w-3" />
                        <span>{Math.round(match.distance_km)} km</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={match.is_traveler ? "default" : "secondary"}>
                  {match.is_traveler ? (
                    <div className="flex items-center space-x-1">
                      <Plane className="h-3 w-3" />
                      <span>Voyageur</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>Local</span>
                    </div>
                  )}
                </Badge>
                {match.compatibility_score > 0.8 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium">
                      {Math.round(match.compatibility_score * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Type de voyage pour les voyageurs */}
            {match.is_traveler && match.travel_type && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {match.travel_type === 'leisure' ? '🏖️ Loisirs' :
                   match.travel_type === 'business' ? '💼 Affaires' :
                   match.travel_type === 'study' ? '🎓 Études' :
                   match.travel_type === 'relocation' ? '📦 Déménagement' :
                   '✈️ Autre'}
                </Badge>
              </div>
            )}

            {/* Activités communes */}
            {match.common_activities.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {match.common_activities.slice(0, 3).map(activity => (
                    <Badge key={activity} variant="outline" className="text-xs">
                      {activity}
                    </Badge>
                  ))}
                  {match.common_activities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{match.common_activities.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onLikeMatch?.(match);
                }}
              >
                <Heart className="h-4 w-4 mr-1" />
                Liker
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessageMatch?.(match);
                }}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Voyageurs */}
      {travelers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Autres voyageurs</h3>
            <Badge variant="secondary">{travelers.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {travelers.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {travelers.length > 0 && locals.length > 0 && <Separator />}

      {/* Locaux */}
      {locals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Habitants locaux</h3>
            <Badge variant="secondary">{locals.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locals.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};