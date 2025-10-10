import { useState } from 'react';
import { Users, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInterestsMatching } from '@/hooks/useInterestsMatching';
import { useToast } from '@/hooks/use-toast';

export function FriendsSuggestions() {
  const { users, loading, error, refresh } = useInterestsMatching();
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSendFriendRequest = async (userId: string) => {
    try {
      setSendingRequests(prev => new Set(prev).add(userId));
      
      // Simuler l'envoi d'une demande d'ami
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'ami a été envoyée",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande",
        variant: "destructive",
      });
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleSendMessage = (userId: string) => {
    // ✅ CORRIGÉ: Navigation vers la page de messagerie
    const conversationPath = `/messages/${userId}`;
    if (typeof window !== 'undefined') {
      window.location.href = conversationPath;
    }
    
    toast({
      title: "Ouverture de la messagerie",
      description: "Redirection vers la conversation",
    });
  };

  if (loading) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Suggestions d'amis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Suggestions d'amis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={refresh}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Suggestions d'amis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Aucune suggestion pour le moment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Suggestions d'amis
        </CardTitle>
        <p className="text-sm text-gray-500">
          Basé sur vos intérêts communs
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {user.full_name}
                </h4>
                
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    <Heart className="w-3 h-3 mr-1" />
                    {user.commonInterests.length} intérêts communs
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Score: {user.matchScore}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {user.commonInterests.slice(0, 3).map((interest) => (
                    <span
                      key={interest}
                      className="inline-block px-2 py-1 bg-heart-red/10 text-heart-red text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                  {user.commonInterests.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{user.commonInterests.length - 3} autres
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendMessage(user.id)}
                    className="flex-1"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSendFriendRequest(user.id)}
                    disabled={sendingRequests.has(user.id)}
                    className="flex-1"
                  >
                    {sendingRequests.has(user.id) ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    ) : (
                      <UserPlus className="w-3 h-3 mr-1" />
                    )}
                    {sendingRequests.has(user.id) ? 'Envoi...' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}