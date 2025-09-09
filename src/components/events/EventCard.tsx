import React from 'react';
import { format, isAfter, isBefore, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Heart,
  MessageCircle,
  Gamepad2,
  BookOpen,
  Video,
  Coffee
} from 'lucide-react';
import { Event, useEvents } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  compact?: boolean;
  showOrganizer?: boolean;
  onEventClick?: (event: Event) => void;
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

export const EventCard: React.FC<EventCardProps> = ({
  event,
  compact = false,
  showOrganizer = true,
  onEventClick,
}) => {
  const { registerForEvent, unregisterFromEvent, loading } = useEvents();
  
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const now = new Date();
  
  const isLive = isAfter(now, startDate) && isBefore(now, endDate);
  const isUpcoming = isAfter(startDate, now);
  const isPast = isAfter(now, endDate);
  const isRegistered = !!event.my_participation && event.my_participation.status !== 'cancelled';
  const isFull = event.participants_count >= event.max_participants;
  
  const IconComponent = eventTypeIcons[event.event_type];
  
  const handleRegisterClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isRegistered) {
      await unregisterFromEvent(event.id);
    } else {
      await registerForEvent(event.id);
    }
  };

  const handleCardClick = () => {
    onEventClick?.(event);
  };

  if (compact) {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isLive && "ring-2 ring-green-500 ring-opacity-50"
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-lg",
                isLive ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
              )}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{event.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {format(startDate, 'PPp', { locale: fr })}
                </p>
              </div>
            </div>
            <Badge className={cn("text-xs", statusColors[event.status])}>
              {statusLabels[event.status]}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg",
        isLive && "ring-2 ring-green-500 ring-opacity-50",
        isPast && "opacity-75"
      )}
      onClick={handleCardClick}
    >
      {event.cover_image_url && (
        <div className="relative">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-4 right-4">
            <Badge className={cn("text-xs", statusColors[event.status])}>
              {statusLabels[event.status]}
            </Badge>
          </div>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5 text-blue-600" />
            <Badge variant="secondary" className="text-xs">
              {eventTypeLabels[event.event_type]}
            </Badge>
          </div>
          {!event.cover_image_url && (
            <Badge className={cn("text-xs", statusColors[event.status])}>
              {statusLabels[event.status]}
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-xl">{event.title}</CardTitle>
        {event.description && (
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informations temporelles */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{format(startDate, 'PPP', { locale: fr })}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>
              {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
            </span>
          </div>
        </div>

        {/* Informations sur les participants */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {event.participants_count} / {event.max_participants} participants
            </span>
            {isFull && <Badge variant="destructive" className="text-xs">Complet</Badge>}
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Organisateur */}
        {showOrganizer && event.organizer && (
          <>
            <Separator />
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.organizer.avatar_url} />
                <AvatarFallback className="text-xs">
                  {event.organizer.full_name?.[0] || event.organizer.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Organisé par {event.organizer.full_name || event.organizer.email}
              </span>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center space-x-2">
          {event.virtual_room_url && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Video className="h-3 w-3" />
              <span>Événement virtuel</span>
            </div>
          )}
        </div>

        {isUpcoming && !isPast && (
          <Button
            onClick={handleRegisterClick}
            disabled={loading || (isFull && !isRegistered)}
            variant={isRegistered ? "outline" : "default"}
            size="sm"
          >
            {loading && "..."}
            {!loading && isRegistered && "Se désinscrire"}
            {!loading && !isRegistered && (isFull ? "Complet" : "S'inscrire")}
          </Button>
        )}

        {isLive && isRegistered && (
          <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
            <a href={event.virtual_room_url} target="_blank" rel="noopener noreferrer">
              <Video className="h-4 w-4 mr-2" />
              Rejoindre
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
