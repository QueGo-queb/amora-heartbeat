import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Phone, User, Search, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  full_name: string;
  avatar_url?: string;
  age?: number;
  location?: string;
  last_seen?: string;
  is_online?: boolean;
  is_available_for_call?: boolean;
}

const VideoChat = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les contacts disponibles pour les appels vidéo
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Récupérer les matches et contacts avec qui on peut faire des appels vidéo
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          id,
          matched_user:profiles!matches_matched_user_id_fkey(
            id,
            full_name,
            avatar_url,
            age,
            location,
            last_seen,
            is_online,
            is_available_for_call
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) {
        console.error('Erreur lors du chargement des contacts:', error);
        // En cas d'erreur, utiliser des données de démonstration
        setContacts(getDemoContacts());
        return;
      }

      // Transformer les données
      const contactsList = matches?.map(match => ({
        id: match.matched_user.id,
        full_name: match.matched_user.full_name || 'Utilisateur',
        avatar_url: match.matched_user.avatar_url,
        age: match.matched_user.age,
        location: match.matched_user.location,
        last_seen: match.matched_user.last_seen,
        is_online: match.matched_user.is_online || false,
        is_available_for_call: match.matched_user.is_available_for_call || true
      })) || [];

      // Si aucun contact trouvé, utiliser des données de démonstration
      if (contactsList.length === 0) {
        setContacts(getDemoContacts());
      } else {
        setContacts(contactsList);
      }

    } catch (error) {
      console.error('Erreur:', error);
      setContacts(getDemoContacts());
    } finally {
      setLoading(false);
    }
  };

  // Contacts de démonstration
  const getDemoContacts = (): Contact[] => [
    {
      id: '1',
      full_name: 'Sophie Martin',
      avatar_url: '/placeholder.svg',
      age: 28,
      location: 'Paris, France',
      last_seen: 'Il y a 5 minutes',
      is_online: true,
      is_available_for_call: true
    },
    {
      id: '2',
      full_name: 'Marie Dubois',
      avatar_url: '/placeholder.svg',
      age: 25,
      location: 'Lyon, France',
      last_seen: 'Il y a 1 heure',
      is_online: false,
      is_available_for_call: true
    },
    {
      id: '3',
      full_name: 'Julie Moreau',
      avatar_url: '/placeholder.svg',
      age: 30,
      location: 'Marseille, France',
      last_seen: 'En ligne',
      is_online: true,
      is_available_for_call: false
    },
    {
      id: '4',
      full_name: 'Anna Rodriguez',
      avatar_url: '/placeholder.svg',
      age: 27,
      location: 'Barcelona, Spain',
      last_seen: 'Il y a 30 minutes',
      is_online: false,
      is_available_for_call: true
    }
  ];

  const handleStartCall = (contact: Contact) => {
    if (!contact.is_available_for_call) {
      toast({
        title: "Indisponible",
        description: `${contact.full_name} n'est pas disponible pour les appels vidéo pour le moment`,
        variant: "destructive",
      });
      return;
    }

    setSelectedContact(contact);
    setIsInCall(true);
    
    toast({
      title: "Appel démarré",
      description: `Connexion avec ${contact.full_name}...`,
    });
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setSelectedContact(null);
    
    toast({
      title: "Appel terminé",
      description: "L'appel vidéo a été terminé",
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat vidéo</h1>
            <p className="text-sm text-gray-600">
              {isInCall ? `En appel avec ${selectedContact?.full_name}` : 'Sélectionnez un contact pour appeler'}
            </p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {!isInCall ? (
          <div className="max-w-4xl mx-auto">
            {/* Barre de recherche */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Liste des contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                // Skeleton de chargement
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredContacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={contact.avatar_url} />
                            <AvatarFallback>
                              {contact.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {contact.is_online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {contact.full_name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {contact.age && <span>{contact.age} ans</span>}
                            {contact.location && (
                              <>
                                <span>•</span>
                                <span className="truncate">{contact.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{contact.last_seen}</span>
                        </div>
                        <Badge 
                          variant={contact.is_available_for_call ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {contact.is_available_for_call ? "Disponible" : "Occupé"}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStartCall(contact)}
                          disabled={!contact.is_available_for_call}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Appel vidéo
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleStartCall(contact)}
                          disabled={!contact.is_available_for_call}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Appel audio
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Message si aucun contact trouvé */}
            {!loading && filteredContacts.length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun contact trouvé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 
                      'Aucun contact ne correspond à votre recherche' : 
                      'Vous n\'avez pas encore de matches pour les appels vidéo'
                    }
                  </p>
                  <Button onClick={() => navigate('/matching')}>
                    Trouver des matches
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Interface d'appel vidéo
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Interface d'appel vidéo */}
                <div className="relative bg-black h-96 md:h-[500px]">
                  {/* Vidéo principale */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Avatar className="w-32 h-32 mx-auto mb-4">
                        <AvatarImage src={selectedContact?.avatar_url} />
                        <AvatarFallback>
                          {selectedContact?.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold">{selectedContact?.full_name}</h3>
                      <p className="text-gray-300">En appel vidéo...</p>
                    </div>
                  </div>
                  
                  {/* Vidéo de l'utilisateur (petite fenêtre) */}
                  <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>Vous</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                {/* Contrôles */}
                <div className="bg-white p-4 flex items-center justify-center gap-4">
                  <Button
                    variant={isAudioOn ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setIsAudioOn(!isAudioOn)}
                  >
                    {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant={isVideoOn ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleEndCall}
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoChat;
