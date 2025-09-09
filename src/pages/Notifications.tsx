import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Check, Clock, Heart, MessageCircle, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'like' | 'message' | 'match' | 'system' | 'call';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Données de test pour les notifications
  useEffect(() => {
    // Simuler le chargement des notifications
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'like',
          title: 'Nouveau like',
          message: 'Sophie a aimé votre publication sur la cuisine française',
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
          userId: 'user1',
          userName: 'Sophie Martin',
          userAvatar: null
        },
        {
          id: '2',
          type: 'message',
          title: 'Nouveau message',
          message: 'Alex vous a envoyé un message',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
          userId: 'user2',
          userName: 'Alex Dubois',
          userAvatar: null
        },
        {
          id: '3',
          type: 'match',
          title: 'Nouveau match !',
          message: 'Vous avez un nouveau match avec Maria',
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          userId: 'user3',
          userName: 'Maria Rodriguez',
          userAvatar: null
        },
        {
          id: '4',
          type: 'system',
          title: 'Profil mis à jour',
          message: 'Votre profil a été mis à jour avec succès',
          isRead: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        },
        {
          id: '5',
          type: 'call',
          title: 'Appel manqué',
          message: 'Appel vidéo manqué de Sophie Martin',
          isRead: false,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
          userId: 'user1',
          userName: 'Sophie Martin',
          userAvatar: null
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'match':
        return <Heart className="h-5 w-5 text-pink-500" />;
      case 'call':
        return <Bell className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    toast({
      title: 'Notifications marquées comme lues',
      description: 'Toutes vos notifications ont été marquées comme lues.',
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>
        <div className="container mx-auto py-8 px-4">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Bouton de retour */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Button>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 
                ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes vos notifications sont lues'
              }
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Liste des notifications */}
        <div className="space-y-4 max-w-2xl">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
                <p className="text-muted-foreground">
                  Vous recevrez des notifications ici quand d'autres utilisateurs interagiront avec vous.
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-blue-200 bg-blue-50/50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar ou icône */}
                    <div className="flex-shrink-0">
                      {notification.userAvatar || notification.userName ? (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={notification.userAvatar} />
                          <AvatarFallback>
                            {notification.userName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(notification.createdAt)}
                          </div>
                        </div>
                        
                        {/* Indicateur non lu */}
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer avec paramètres */}
        <Card className="mt-8 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres des notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gérez vos préférences de notification depuis les paramètres.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
            >
              Ouvrir les paramètres
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
