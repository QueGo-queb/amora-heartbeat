/**
 * Page Chat en ligne - NOUVELLE VERSION
 * Affiche les contacts existants avec lesquels l'utilisateur a échangé des messages
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Users, Send, Search, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useExistingContacts } from '@/hooks/useExistingContacts';

// Ajouter le type Contact
interface Contact {
  id: string;
  name: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

const ChatLive = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { contacts, loading, markContactAsRead } = useExistingContacts();

  // ✅ FILTRER LES CONTACTS PAR RECHERCHE
  const filteredContacts = contacts.filter(contact =>
    contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ OUVRIR UNE CONVERSATION
  const openConversation = async (contact: Contact) => {
    // Marquer les messages de ce contact comme lus
    if (contact.unread_count > 0) {
      await markContactAsRead(contact.user_id);
    }

    // Rediriger vers la conversation (vous pouvez adapter l'URL)
    navigate(`/messages/${contact.user_id}`);
  };

  // ✅ FORMATER LE DERNIER MESSAGE
  const formatLastMessage = (contact: Contact) => {
    if (!contact.last_message) return 'Aucun message';

    const { content, is_from_me } = contact.last_message;
    const prefix = is_from_me ? 'Vous: ' : '';
    const truncated = content.length > 50 ? content.substring(0, 50) + '...' : content;
    
    return prefix + truncated;
  };

  // ✅ FORMATER LE TEMPS
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-green-500" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Chat en ligne</h1>
                <p className="text-sm text-gray-600">Vos conversations existantes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Barre de recherche */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* État de chargement */}
          {loading && (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement de vos contacts...</p>
              </CardContent>
            </Card>
          )}

          {/* Aucun contact */}
          {!loading && filteredContacts.length === 0 && !searchTerm && (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Aucune conversation</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Vous n'avez pas encore échangé de messages. Commencez par explorer le fil d'actualité et engager des conversations !
                </p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  Explorer le fil d'actualité
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Résultats de recherche vides */}
          {!loading && filteredContacts.length === 0 && searchTerm && (
            <Card>
              <CardContent className="py-8 text-center">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun contact trouvé</h3>
                <p className="text-gray-600">
                  Aucun contact ne correspond à "{searchTerm}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* ✅ LISTE DES CONTACTS EXISTANTS */}
          {!loading && filteredContacts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Vos contacts ({filteredContacts.length})
                </h2>
                <Badge variant="secondary">
                  {contacts.filter(c => c.unread_count > 0).length} non lus
                </Badge>
              </div>

              {filteredContacts.map((contact) => (
                <Card 
                  key={contact.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openConversation(contact)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={contact.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                            {contact.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {/* Indicateur en ligne (optionnel) */}
                        {contact.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      {/* Informations du contact */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {contact.full_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {/* Badge messages non lus */}
                            {contact.unread_count > 0 && (
                              <Badge variant="default" className="bg-green-500">
                                {contact.unread_count}
                              </Badge>
                            )}
                            {/* Heure du dernier message */}
                            <span className="text-xs text-gray-500">
                              {formatTime(contact.last_activity)}
                            </span>
                          </div>
                        </div>

                        {/* Dernier message */}
                        <p className="text-sm text-gray-600 truncate">
                          {formatLastMessage(contact)}
                        </p>

                        {/* Email (optionnel, pour debug) */}
                        <p className="text-xs text-gray-400 truncate">
                          {contact.email}
                        </p>
                      </div>

                      {/* Indicateur de conversation */}
                      <div className="flex flex-col items-center gap-1">
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-xs text-gray-500">Chat</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ✅ BOUTON POUR COMMENCER UNE NOUVELLE CONVERSATION */}
          <Card className="mt-6 border-dashed border-2 border-gray-300">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto text-gray-400 mb-3" />
              <h3 className="font-semibold mb-2">Nouvelle conversation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Explorez le fil d'actualité pour découvrir de nouvelles personnes
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Explorer le fil d'actualité
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatLive;
