import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  Settings,
  Eye,
  MessageCircle,
  Heart,
  Clock
} from 'lucide-react';
import { useTravelMode, TravelSession } from '@/hooks/useTravelMode';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TravelModeCardProps {
  session?: TravelSession;
  compact?: boolean;
  onActivate?: () => void;
  onManage?: () => void;
  onDeactivate?: () => void;
}

const travelTypeLabels = {
  leisure: 'Loisirs',
  business: 'Affaires',
  relocation: 'Déménagement',
  study: 'Études',
  other: 'Autre'
};

const travelTypeIcons = {
  leisure: '🏖️',
  business: '💼',
  relocation: '📦',
  study: '🎓',
  other: '✈️'
};

export const TravelModeCard: React.FC<TravelModeCardProps> = ({
  session,
  compact = false,
  onActivate,
  onManage,
  onDeactivate
}) => {
  const { isTravelModeActive, daysUntilTravel, daysRemaining } = useTravelMode();

  if (!session && !isTravelModeActive) {
    // Carte d'activation du mode voyage
    return (
      <Card className={cn("relative overflow-hidden", compact && "max-w-sm")}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-blue-600" />
            <span>Mode Voyage</span>
          </CardTitle>
          <CardDescription>
            Rencontrez des personnes dans votre prochaine destination
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              🌍 Connectez-vous avec des locaux et d'autres voyageurs
            </p>
            <p className="text-sm text-muted-foreground">
              📍 Découvrez votre destination avant d'arriver
            </p>
            <p className="text-sm text-muted-foreground">
              🤝 Organisez des rencontres et activités
            </p>
          </div>
          
          <Button onClick={onActivate} className="w-full">
            <Plane className="h-4 w-4 mr-2" />
            Activer le mode voyage
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!session) return null;

  const progressPercentage = daysRemaining ? Math.max(0, (daysRemaining / 30) * 100) : 0;
  const isUpcoming = daysUntilTravel && daysUntilTravel > 0;
  const isActive = session.status === 'active';

  if (compact) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50" />
        <CardContent className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {session.destination_city}, {session.destination_country}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {travelTypeLabels[session.travel_type]} • {daysRemaining} jours restants
                </p>
              </div>
            </div>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Actif" : session.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Fond dégradé selon le statut */}
      <div className={cn(
        "absolute inset-0 opacity-50",
        isActive ? "bg-gradient-to-br from-green-50 to-emerald-50" : "bg-gradient-to-br from-gray-50 to-slate-50"
      )} />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-white rounded-full shadow-sm">
                <MapPin className={cn("h-5 w-5", isActive ? "text-green-600" : "text-gray-600")} />
              </div>
              <div>
                <span className="text-lg">{session.destination_city}</span>
                <p className="text-sm text-muted-foreground font-normal">
                  {session.destination_country}
                </p>
              </div>
            </CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Actif" : session.status}
            </Badge>
            <span className="text-2xl">
              {travelTypeIcons[session.travel_type]}
            </span>
          </div>
        </div>
        
        <CardDescription>
          {travelTypeLabels[session.travel_type]} • {format(new Date(session.travel_start_date), 'PPP', { locale: fr })}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Dates de voyage */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Départ</span>
            </div>
            <p className="font-medium">
              {format(new Date(session.travel_start_date), 'dd MMM yyyy', { locale: fr })}
            </p>
            {isUpcoming && (
              <p className="text-xs text-blue-600">
                Dans {daysUntilTravel} jour{daysUntilTravel > 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Retour</span>
            </div>
            <p className="font-medium">
              {format(new Date(session.travel_end_date), 'dd MMM yyyy', { locale: fr })}
            </p>
            {daysRemaining && daysRemaining > 0 && (
              <p className="text-xs text-green-600">
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Progression */}
        {isActive && daysRemaining && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Session active</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold">{session.profile_views}</p>
            <p className="text-xs text-muted-foreground">Vues</p>
          </div>
          
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <Heart className="h-4 w-4 text-pink-500" />
            </div>
            <p className="text-lg font-semibold">{session.matches_made}</p>
            <p className="text-xs text-muted-foreground">Matchs</p>
          </div>
          
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold">{session.conversations_started}</p>
            <p className="text-xs text-muted-foreground">Conversations</p>
          </div>
        </div>

        {/* Activités recherchées */}
        {session.looking_for_activities && session.looking_for_activities.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Activités recherchées</p>
            <div className="flex flex-wrap gap-1">
              {session.looking_for_activities.slice(0, 4).map(activity => (
                <Badge key={activity} variant="outline" className="text-xs">
                  {activity}
                </Badge>
              ))}
              {session.looking_for_activities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{session.looking_for_activities.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {isActive ? (
            <>
              <Button variant="outline" size="sm" className="flex-1" onClick={onManage}>
                <Settings className="h-4 w-4 mr-2" />
                Gérer
              </Button>
              <Button variant="outline" size="sm" onClick={onDeactivate}>
                Désactiver
              </Button>
            </>
          ) : (
            <Button size="sm" className="w-full" onClick={onActivate}>
              <Plane className="h-4 w-4 mr-2" />
              Réactiver
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};