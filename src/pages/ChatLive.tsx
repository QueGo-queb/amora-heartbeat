import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const ChatLive = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    loadOnlineUsers();
    loadMessages();
  }, []);

  const loadOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, is_online')
        .eq('is_online', true)
        .limit(20);

      if (!error) {
        setOnlineUsers(data || []);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error) {
        setMessages(data?.reverse() || []);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('live_chat_messages')
        .insert({
          user_id: user.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString()
        });

      if (!error) {
        setNewMessage('');
        loadMessages();
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

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
          Retour au fil d'actualité
        </Button>
      </div>

      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold">Chat en Live</h1>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Messages */}
            <div className="lg:col-span-2">
              <Card className="culture-card h-96">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Messages en direct
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {messages.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Aucun message pour le moment
                      </p>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.profiles?.avatar_url} />
                            <AvatarFallback>
                              {message.profiles?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {message.profiles?.full_name || 'Utilisateur'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{message.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Utilisateurs en ligne */}
            <div>
              <Card className="culture-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    En ligne ({onlineUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {onlineUsers.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Aucun utilisateur en ligne
                      </p>
                    ) : (
                      onlineUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate">
                            {user.full_name || 'Utilisateur'}
                          </span>
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLive;
