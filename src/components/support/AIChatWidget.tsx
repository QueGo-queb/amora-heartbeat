import { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'agent';
  timestamp: Date;
  isTransferred?: boolean;
}

interface AIChatWidgetProps {
  open: boolean;
  onClose: () => void;
}

export function AIChatWidget({ open, onClose }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis l\'assistant virtuel d\'AMORA. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransferred, setIsTransferred] = useState(false);

  // Réponses automatiques simples
  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Questions simples avec réponses automatiques
    if (message.includes('comment') && message.includes('profil')) {
      return 'Pour modifier votre profil, allez dans Menu > Profil, puis cliquez sur "Modifier le profil". Vous pouvez y changer vos informations, photos et centres d\'intérêt.';
    }
    
    if (message.includes('premium') || message.includes('abonnement')) {
      return 'L\'abonnement Premium vous donne accès à des fonctionnalités exclusives : messages illimités, voir qui vous a liké, boosts de profil. Voulez-vous en savoir plus sur les tarifs ?';
    }
    
    if (message.includes('message') && message.includes('envoyer')) {
      return 'Pour envoyer un message, allez sur le profil de la personne qui vous intéresse et cliquez sur "Contacter". Note : certaines fonctionnalités nécessitent un abonnement Premium.';
    }
    
    if (message.includes('match') || message.includes('correspondance')) {
      return 'Les matches se basent sur vos préférences, centres d\'intérêt et localisation. Complétez votre profil pour de meilleurs résultats !';
    }
    
    if (message.includes('photo') || message.includes('image')) {
      return 'Pour ajouter des photos, allez dans votre profil et cliquez sur l\'icône appareil photo. Utilisez des photos récentes et authentiques pour de meilleurs résultats.';
    }
    
    if (message.includes('sécurité') || message.includes('signaler')) {
      return 'Votre sécurité est importante. Utilisez le bouton "Signaler" sur tout profil suspect. Ne partagez jamais d\'informations personnelles trop rapidement.';
    }
    
    if (message.includes('supprimer') && message.includes('compte')) {
      return 'Pour supprimer votre compte, allez dans Paramètres > Compte > Supprimer le compte. Cette action est irréversible.';
    }
    
    // Questions complexes - transfert vers agent humain
    if (message.includes('problème') || message.includes('bug') || message.includes('erreur') || 
        message.includes('ne fonctionne pas') || message.includes('paiement') || 
        message.includes('remboursement') || message.includes('facturation')) {
      return 'TRANSFER_TO_HUMAN';
    }
    
    // Réponse par défaut
    return 'Je comprends votre question, mais elle nécessite l\'aide d\'un agent humain. Je vais vous transférer vers notre équipe support qui pourra mieux vous aider.';
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simuler le délai de réponse AI
    setTimeout(() => {
      const aiResponse = getAIResponse(userMessage.content);
      
      if (aiResponse === 'TRANSFER_TO_HUMAN') {
        // Transfert vers agent humain
        const transferMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Je vais vous transférer vers un agent humain qui pourra mieux vous aider avec votre demande. Un membre de notre équipe va prendre en charge votre conversation.',
          sender: 'ai',
          timestamp: new Date(),
          isTransferred: true
        };
        
        setMessages(prev => [...prev, transferMessage]);
        setIsTransferred(true);
        
        // Simuler l'arrivée d'un agent humain
        setTimeout(() => {
          const agentMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: 'Bonjour ! Je suis Sarah de l\'équipe support AMORA. J\'ai pris connaissance de votre demande. Comment puis-je vous aider ?',
            sender: 'agent',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, agentMessage]);
        }, 2000);
      } else {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      
      setIsLoading(false);
    }, 1000);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 h-96 shadow-2xl border-2 border-blue-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="relative">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              Chat Support
              {isTransferred && (
                <Badge variant="secondary" className="text-xs">
                  Agent humain
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : message.sender === 'agent'
                    ? 'bg-green-100 text-green-800 rounded-bl-sm border border-green-200'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <div className="flex items-start gap-2">
                    {message.sender === 'ai' && <Bot className="w-4 h-4 mt-0.5 text-blue-600" />}
                    {message.sender === 'agent' && <User className="w-4 h-4 mt-0.5 text-green-600" />}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      {message.isTransferred && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                          <AlertTriangle className="w-3 h-3" />
                          Transféré vers un agent
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tapez votre message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Actions rapides */}
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => window.open('mailto:support@amora.ca', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Email
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setInputValue('Comment puis-je modifier mon profil ?')}
              >
                Modifier profil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
