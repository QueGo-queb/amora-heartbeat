/**
 * Page de conversation individuelle
 * Affiche les messages entre l'utilisateur connecté et un contact spécifique
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ConversationDetail = () => {
  const navigate = useNavigate();
  const { contactId } = useParams(); // ID de l'utilisateur avec qui on discute
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contactId && user?.id) {
      loadContact();
      loadMessages();
      markMessagesAsRead();
    }
  }, [contactId, user?.id]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContact = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url, email')
        .eq('user_id', contactId)
        .single();

      if (error) throw error;
      setContact(data);
    } catch (error) {
      console.error('Erreur chargement contact:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations du contact",
        variant: "destructive",
      });
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('sender_id', contactId)
        .eq('receiver_id', user?.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Erreur marquage messages lus:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !contactId || !user?.id) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: contactId,
          content: newMessage.trim(),
          is_read: false
        });

      if (error) throw error;

      setNewMessage('');
      await loadMessages();

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });

    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header de conversation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/chat-live')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              
              {contact && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={contact.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                      {contact.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{contact.full_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {contact.is_online ? '🟢 En ligne' : '⚫ Hors ligne'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions de conversation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="container mx-auto py-4 px-4">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardContent className="flex-1 flex flex-col p-4">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground text-sm">Chargement des messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-muted-foreground">Aucun message dans cette conversation</p>
                  <p className="text-sm text-gray-500">Envoyez le premier message !</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isFromMe = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${isFromMe ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={isFromMe ? user?.user_metadata?.avatar_url : contact?.avatar_url} />
                        <AvatarFallback className={isFromMe ? 'bg-blue-500' : 'bg-gray-500'}>
                          {isFromMe 
                            ? (user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase()
                            : (contact?.full_name?.charAt(0) || '?').toUpperCase()
                          }
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`max-w-xs lg:max-w-md ${isFromMe ? 'text-right' : ''}`}>
                        <div className={`p-3 rounded-lg ${
                          isFromMe 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className="flex gap-2 border-t pt-4">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={sending}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || sending}
                className="bg-green-500 hover:bg-green-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversationDetail;
