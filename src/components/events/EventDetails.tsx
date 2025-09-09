import React, { useState } from 'react';
import { format, isAfter, isBefore, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Link,
  Share2,
  Heart,
  MessageCircle,
  Gamepad2,
  BookOpen,
  Video,
  Coffee,
  ExternalLink,
  UserCheck,
  UserMinus,
  Edit,
  Trash2,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Event, useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface EventDetailsProps {
  event: Event;
  onClose?: () => void;
}

const eventTypeIcons = {
  speed_dating: Heart,
  group_chat: MessageCircle,
  virtual_date: Video,
  workshop: BookOpen,
  meetup: Coffee,
  game_night: Gamepad2,
  discussion: MessageCircle,
};

const eventTypeLabels = {
  speed_dating: 'Speed Dating',
  group_chat: 'Discussion de groupe',
  virtual_date: 'Rendez-vous virtuel',
  workshop: 'Atelier',
  meetup: 'Rencontre',
  game_night: 'Soirée jeux',
  discussion: 'Discussion',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  live: 'bg-green-100 text-green-800 animate-pulse',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  draft: 'Brouillon',
  scheduled: 'Programmé',
  live: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose }) => {
  const { registerForEvent, unregisterFromEvent, loading } = useEvents();
  const { user } = useAuth();
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : new Date(startDate.getTime() + 60 * 60 * 1000);
  const now = new Date();
  
  const isLive = isAfter(now, startDate) && isBefore(now, endDate);
  const isUpcoming = isAfter(startDate, now);
  const isPast = isAfter(now, endDate);
  const isRegistered = !!event.my_participation && event.my_participation.status !== 'cancelled';
  const isFull = event.participants_count >= event.max_participants;
  const isOrganizer = user?.id === event.created_by;
  
  const IconComponent = eventTypeIcons[event.event_type];
  
  // Calcul du temps restant
  const getTimeUntilEvent = () => {
    if (isPast) return null;
    if (isLive) return 'En cours maintenant';
    
    const days = differenceInDays(startDate, now);
    const hours = differenceInHours(startDate, now);
    const minutes = differenceInMinutes(startDate, now);
    
    if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Dans ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Dans ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'Commence bientôt';
  };

  const handleRegisterClick = async () => {
    if (isRegistered) {
      await unregisterFromEvent(event.id);
    } else {
      await registerForEvent(event.id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec image de couverture */}
      {event.cover_image_url && (
        <div className="relative">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <Badge className={cn("text-xs", statusColors[event.status])}>
              {statusLabels[event.status]}
            </Badge>
            {isLive && (
              <Badge className="bg-red-500 text-white animate-pulse">
                🔴 LIVE
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Titre et informations principales */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-6 w-6 text-blue-600" />
              <Badge variant="secondary">
                {eventTypeLabels[event.event_type]}
              </Badge>
              {!event.cover_image_url && (
                <Badge className={cn("text-xs", statusColors[event.status])}>
                  {statusLabels[event.status]}
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold">{event.title}</h1>
            
            {event.description && (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
              <Share2 className="h-4 w-4" />
            </Button>
            {isOrganizer && (
              <>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            {!isOrganizer && (
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Informations temporelles */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, 'PPPP', { locale: fr })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Horaire</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Participants</p>
                  <p className="text-sm text-muted-foreground">
                    {event.participants_count} / {event.max_participants}
                    {isFull && <span className="text-red-500 ml-1">(Complet)</span>}
                  </p>
                </div>
              </div>
            </div>

            {getTimeUntilEvent() && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium text-center">
                  {getTimeUntilEvent()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions principales */}
        <div className="flex space-x-4">
          {isUpcoming && !isOrganizer && (
            <Button
              onClick={handleRegisterClick}
              disabled={loading || (isFull && !isRegistered)}
              size="lg"
              className="flex-1"
              variant={isRegistered ? "outline" : "default"}
            >
              {loading && "..."}
              {!loading && isRegistered && (
                <>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Se désinscrire
                </>
              )}
              {!loading && !isRegistered && (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  {isFull ? "Liste d'attente" : "S'inscrire"}
                </>
              )}
            </Button>
          )}

          {isLive && (isRegistered || isOrganizer) && event.virtual_room_url && (
            <Button asChild size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
              <a href={event.virtual_room_url} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4 mr-2" />
                Rejoindre l'événement
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          )}

          {isOrganizer && (
            <Button size="lg" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Gérer l'événement
            </Button>
          )}
        </div>
      </div>

      {/* Contenu détaillé */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="participants">Participants ({event.participants_count})</TabsTrigger>
          <TabsTrigger value="organizer">Organisateur</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations détaillées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Restrictions */}
              {(event.age_min || event.age_max || event.gender_restriction !== 'none') && (
                <div>
                  <h4 className="font-medium mb-2">Restrictions</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {(event.age_min || event.age_max) && (
                      <p>
                        Âge : {event.age_min || 18} - {event.age_max || 99} ans
                      </p>
                    )}
                    {event.gender_restriction && event.gender_restriction !== 'none' && (
                      <p>
                        Genre : {
                          event.gender_restriction === 'women_only' ? 'Femmes uniquement' :
                          event.gender_restriction === 'men_only' ? 'Hommes uniquement' :
                          'Inclusif non-binaire'
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Salle virtuelle */}
              {event.virtual_room_url && (
                <div>
                  <h4 className="font-medium mb-2">Salle virtuelle</h4>
                  <div className="flex items-center space-x-2">
                    <Link className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">
                      Lien partagé après inscription
                    </span>
                  </div>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Paramètres */}
              <div>
                <h4 className="font-medium mb-2">Paramètres</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>👥 Min {event.min_participants} - Max {event.max_participants} participants</p>
                  <p>🌍 {event.is_public ? 'Public' : 'Privé'}</p>
                  <p>✅ {event.requires_approval ? 'Inscription avec approbation' : 'Inscription libre'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des participants</CardTitle>
              <CardDescription>
                {event.participants_count} participant{event.participants_count > 1 ? 's' : ''} inscrit{event.participants_count > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Ici on afficherait la vraie liste des participants */}
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Liste des participants disponible après inscription</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organisateur</CardTitle>
            </CardHeader>
            <CardContent>
              {event.organizer ? (
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={event.organizer.avatar_url} />
                    <AvatarFallback>
                      {event.organizer.full_name?.[0] || event.organizer.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {event.organizer.full_name || event.organizer.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Organisateur de l'événement
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Informations de l'organisateur non disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de partage */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager cet événement</DialogTitle>
            <DialogDescription>
              Invitez vos amis à participer à "{event.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={handleShare} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Partager le lien
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
