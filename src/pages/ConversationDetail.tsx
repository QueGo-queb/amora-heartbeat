import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, Video, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CallButtonGroup } from '@/components/chat/CallButton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

const ConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Données de test pour la conversation
  useEffect(() => {
    if (!id) return;

    // Simuler le chargement des données
    setTimeout(() => {
      const mockConversation: Conversation = {
        id: id,
        userId: 'user-123',
        userName: 'Sophie Martin',
        userAvatar: null,
        isOnline: true,
        lastSeen: 'maintenant'
      };

      const mockMessages: Message[] = [
        {
          id: '1',
          sender_id: 'user-123',
          receiver_id: 'current-user',
          content: 'Salut ! Comment ça va ?',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender_name: 'Sophie Martin'
        },
        {
          id: '2',
          sender_id: 'current-user',
          receiver_id: 'user-123',
          content: 'Ça va bien merci ! Et toi ?',
          created_at: new Date(Date.now() - 3500000).toISOString(),
          sender_name: 'Moi'
        },
        {
          id: '3',
          sender_id: 'user-123',
          receiver_id: 'current-user',
          content: 'Très bien aussi ! On se voit ce weekend ?',
          created_at: new Date(Date.now() - 3400000).toISOString(),
          sender_name: 'Sophie Martin'
        }
      ];

      setConversation(mockConversation);
      setMessages(mockMessages);
      setLoading(false);
    }, 500);
  }, [id]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    // Simuler l'envoi du message
    setTimeout(() => {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender_id: 'current-user',
        receiver_id: conversation.userId,
        content: messageContent,
        created_at: new Date().toISOString(),
        sender_name: 'Moi'
      };

      setMessages(prev => [...prev, newMsg]);
      setSending(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Conversation introuvable</h3>
            <p className="text-muted-foreground mb-4">
              Cette conversation n'existe pas ou vous n'y avez pas accès.
            </p>
            <Button onClick={() => navigate('/messages')}>
              Retour aux messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header de la conversation */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/messages')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.userAvatar || undefined} />
              <AvatarFallback>
                {conversation.userName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="font-semibold text-gray-900">{conversation.userName}</h1>
              <div className="flex items-center gap-2">
                {conversation.isOnline ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">En ligne</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">
                    Vu {conversation.lastSeen}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === 'current-user';
          const messageDate = new Date(message.created_at);
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {message.sender_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(messageDate, { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                )}
                
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {isOwnMessage && (
                  <div className="text-right mt-1">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(messageDate, { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {sending && (
          <div className="flex justify-end">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                <span className="text-xs text-gray-500">Envoi...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="flex-1"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
