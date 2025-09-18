import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CallButtonGroup } from "@/components/chat/CallButton"; // ✅ AJOUT

const Messages = () => {
  const navigate = useNavigate();

  // ✅ DONNÉES RÉELLES - Remplacer par vraies conversations depuis Supabase
  const conversations = [
    {
      id: '1',
      userId: '067914e4-fe71-4d9d-bb90-b0418479ae23', // Clodener Clairvil
      name: 'Clodener Clairvil',
      lastMessage: 'Salut ! Comment ça va ?',
      timestamp: '2024-01-15T10:30:00Z',
      unread: 2,
      avatar: '/placeholder.svg',
      isOnline: true
    },
    {
      id: '2', 
      userId: '5b3ca0d6-e80b-499f-be8c-577a863b836e', // Dieujuste Evaniola
      name: 'Dieujuste Evaniola',
      lastMessage: 'À bientôt !',
      timestamp: '2024-01-15T09:15:00Z',
      unread: 0,
      avatar: '/placeholder.svg',
      isOnline: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec bouton retour */}
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
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        {/* Liste des conversations */}
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center space-x-4 flex-1"
                    onClick={() => navigate(`/messages/${conversation.id}`)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.avatar} alt={conversation.name} />
                        <AvatarFallback>
                          {conversation.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{conversation.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    
                    {conversation.unread > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>

                  {/* ✅ BOUTONS D'APPEL RÉELS */}
                  <div className="ml-4 flex items-center space-x-2">
                    <CallButtonGroup
                      userId={conversation.userId}
                      userName={conversation.name}
                      size="sm"
                      variant="outline"
                      onCallInitiated={(callType) => {
                        console.log(`🎥 Appel ${callType} initié avec ${conversation.name}`);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message si aucune conversation */}
        {conversations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucun message</h3>
              <p className="text-muted-foreground mb-4">
                Commencez à discuter avec des personnes qui partagent vos intérêts
              </p>
              <Button onClick={() => navigate('/matching')}>
                Découvrir des personnes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Messages;
