import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Event, useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/events/EventCard';
import { CreateEventForm } from '@/components/events/CreateEventForm';
import { EventDetails } from '@/components/events/EventDetails';
import { SkipLinks } from '@/components/a11y/SkipLinks';

export const EventsPage: React.FC = () => {
  const { events, loading, fetchEvents } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | Event['event_type']>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filtrer les événements
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || event.event_type === filterType;
    return matchesSearch && matchesType;
  });

  // Séparer les événements par statut
  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.start_time) > new Date() && event.status === 'scheduled'
  );
  
  const liveEvents = filteredEvents.filter(event => 
    event.status === 'live'
  );
  
  const myEvents = filteredEvents.filter(event => 
    event.my_participation && event.my_participation.status !== 'cancelled'
  );

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCreateEvent = () => {
    setShowCreateDialog(false);
    fetchEvents({ upcoming: true }); // Recharger la liste
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <SkipLinks />
      
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Événements communautaires</h1>
          <p className="text-muted-foreground">
            Découvrez et participez aux événements organisés par la communauté AMORA
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="mt-4 md:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Créer un événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouvel événement</DialogTitle>
              <DialogDescription>
                Organisez un événement pour rassembler la communauté
              </DialogDescription>
            </DialogHeader>
            <CreateEventForm onSuccess={handleCreateEvent} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type d'événement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="speed_dating">Speed Dating</SelectItem>
            <SelectItem value="group_chat">Discussion de groupe</SelectItem>
            <SelectItem value="virtual_date">Rendez-vous virtuel</SelectItem>
            <SelectItem value="workshop">Atelier</SelectItem>
            <SelectItem value="meetup">Rencontre</SelectItem>
            <SelectItem value="game_night">Soirée jeux</SelectItem>
            <SelectItem value="discussion">Discussion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>À venir ({upcomingEvents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>En cours ({liveEvents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="my-events" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Mes événements ({myEvents.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEventClick={handleEventClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun événement à venir</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== 'all' 
                  ? "Aucun événement ne correspond à vos critères" 
                  : "Soyez le premier à créer un événement !"}
              </p>
              {!searchQuery && filterType === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le premier événement
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          {liveEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEventClick={handleEventClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-12 w-12 mx-auto text-muted-foreground mb-4 relative">
                <div className="h-full w-full border-2 border-gray-300 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 bg-gray-300 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun événement en cours</h3>
              <p className="text-muted-foreground">
                Revenez bientôt pour participer aux événements live !
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-events" className="space-y-6">
          {myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEventClick={handleEventClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune participation</h3>
              <p className="text-muted-foreground mb-4">
                Vous n'êtes inscrit à aucun événement pour le moment
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog détails d'événement */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <EventDetails 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
