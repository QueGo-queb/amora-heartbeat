import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, Check, X, Loader2 } from 'lucide-react';
import { usePostContact } from '@/hooks/usePostContact';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ContactButtonProps {
  postId: string;
  authorId: string;
  authorName: string;
  currentUserId?: string;
  disabled?: boolean;
}

export const ContactButton: React.FC<ContactButtonProps> = ({
  postId,
  authorId,
  authorName,
  currentUserId,
  disabled = false
}) => {
  const [contactStatus, setContactStatus] = useState<'none' | 'pending' | 'accepted' | 'declined'>('none');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(true);

  const { 
    createContactRequest, 
    checkContactStatus, 
    loading 
  } = usePostContact();
  
  const { toast } = useToast();

  // Vérifier le statut de contact au chargement
  useEffect(() => {
    const checkStatus = async () => {
      if (currentUserId && currentUserId !== authorId) {
        setCheckingStatus(true);
        const status = await checkContactStatus(postId, authorId);
        setContactStatus(status as any);
        setCheckingStatus(false);
      } else {
        setCheckingStatus(false);
      }
    };

    checkStatus();
  }, [postId, authorId, currentUserId, checkContactStatus]);

  const handleContactRequest = async () => {
    if (!currentUserId) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour contacter cette personne.",
        variant: "destructive",
      });
      return;
    }

    if (currentUserId === authorId) {
      toast({
        title: "Impossible",
        description: "Vous ne pouvez pas vous contacter vous-même.",
        variant: "destructive",
      });
      return;
    }

    const result = await createContactRequest(postId, message.trim() || undefined);
    
    if (result.success) {
      setContactStatus('pending');
      setIsDialogOpen(false);
      setMessage('');
    }
  };

  const getButtonContent = () => {
    if (checkingStatus) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Vérification...</span>
        </>
      );
    }

    if (currentUserId === authorId) {
      return (
        <>
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Votre publication</span>
        </>
      );
    }

    switch (contactStatus) {
      case 'pending':
        return (
          <>
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">En attente</span>
          </>
        );
      case 'accepted':
        return (
          <>
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Contact accepté</span>
          </>
        );
      case 'declined':
        return (
          <>
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Contact décliné</span>
          </>
        );
      default:
        return (
          <>
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Contacter</span>
          </>
        );
    }
  };

  const getButtonVariant = () => {
    if (currentUserId === authorId) return 'outline';
    
    switch (contactStatus) {
      case 'pending': return 'secondary';
      case 'accepted': return 'default';
      case 'declined': return 'outline';
      default: return 'default';
    }
  };

  const isButtonDisabled = () => {
    return disabled || 
           loading || 
           checkingStatus || 
           currentUserId === authorId || 
           contactStatus === 'pending' || 
           contactStatus === 'declined';
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={getButtonVariant()}
          size="sm"
          disabled={isButtonDisabled()}
          className="flex items-center gap-2"
        >
          {getButtonContent()}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contacter {authorName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="message">
              Message (optionnel)
            </Label>
            <Textarea
              id="message"
              placeholder={`Bonjour ${authorName}, j'ai vu votre publication et j'aimerais échanger avec vous...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/500 caractères
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleContactRequest}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Envoi...
                </>
              ) : (
                'Envoyer la demande'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};