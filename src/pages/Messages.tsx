import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CallButtonGroup } from "@/components/chat/CallButton";

const Messages = () => {
  const navigate = useNavigate();

  // Données de test pour les conversations
  const conversations = [
    {
      id: '1',
      userId: 'user-123',
      userName: 'Sophie Martin',
      lastMessage: 'Salut ! Comment ça va ?',
      lastMessageTime: '14:30',
      unreadCount: 2,
      isOnline: true,
      avatar: null
    },
    {
      id: '2', 
      userId: 'user-456',
      userName: 'Alex Dubois',
      lastMessage: 'On se voit ce weekend ?',
      lastMessageTime: '12:15',
      unreadCount: 0,
      isOnline: false,
      avatar: null
    },
    {
      id: '3',
      userId: 'user-789', 
      userName: 'Maria Rodriguez',
      lastMessage: 'Merci pour la soirée hier !',
      lastMessageTime: 'Hier',
      unreadCount: 1,
      isOnline: true,
      avatar: null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Bouton de retour discret */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au fil d'actualité
        </Button>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">
              Communiquez avec vos matches
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {conversations.length} conversations
          </Badge>
        </div>

        {/* Liste des conversations */}
        <div className="space-y-4 max-w-2xl">
          {conversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Avatar avec indicateur en ligne */}
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.avatar || undefined} />
                        <AvatarFallback>
                          {conversation.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Infos conversation */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {conversation.userName}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessageTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs min-w-[20px] h-5">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* **NOUVEAU: Boutons d'appel** */}
                  <div className="flex items-center space-x-2 ml-4">
                    <CallButtonGroup
                      userId={conversation.userId}
                      userName={conversation.userName}
                      variant="outline"
                      size="sm"
                      disabled={!conversation.isOnline}
                      onCallInitiated={(callType) => {
                        console.log(`Appel ${callType} initié avec ${conversation.userName}`);
                      }}
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigation vers la conversation détaillée
                        navigate(`/messages/${conversation.id}`);
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message si aucune conversation */}
        {conversations.length === 0 && (
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                <MessageCircle className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardTitle>Aucune conversation</CardTitle>
              <CardDescription>
                Commencez à matcher avec d'autres utilisateurs pour démarrer des conversations !
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/matching')}
                className="w-full"
              >
                Découvrir des profils
              </Button>
            </CardContent>
          </Card>
        )}

        {/* **Informations sur les appels** */}
        <Card className="mt-8 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">💡 Fonctionnalités d'appel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Appels audio et vidéo</p>
                <p className="text-sm text-muted-foreground">
                  Appelez vos matches directement depuis la liste des conversations
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Qualité adaptative</p>
                <p className="text-sm text-muted-foreground">
                  La qualité s'adapte automatiquement à votre connexion
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Appels sécurisés</p>
                <p className="text-sm text-muted-foreground">
                  Chiffrement de bout en bout pour tous vos appels
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
