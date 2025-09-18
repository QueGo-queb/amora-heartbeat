import { useState } from 'react';
import { usePremium } from '@/hooks/usePremium';
import { useToast } from '@/hooks/use-toast';

export function usePremiumRestriction() {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [restrictedFeature, setRestrictedFeature] = useState<'messages' | 'audio_call' | 'video_call' | null>(null);
  const [targetUserName, setTargetUserName] = useState<string | undefined>();
  const { isPremium } = usePremium();
  const { toast } = useToast();

  const checkPremiumFeature = (
    feature: 'messages' | 'audio_call' | 'video_call',
    callback: () => void,
    userName?: string
  ) => {
    if (isPremium) {
      // Utilisateur Premium → Exécuter l'action normale
      callback();
    } else {
      // Utilisateur gratuit → Afficher l'incitation Premium
      setRestrictedFeature(feature);
      setTargetUserName(userName);
      setShowPremiumModal(true);
      
      // Toast optionnel pour feedback immédiat
      toast({
        title: "💎 Fonctionnalité Premium",
        description: "Cette action nécessite un compte Premium",
        duration: 3000,
      });
    }
  };

  const closePremiumModal = () => {
    setShowPremiumModal(false);
    setRestrictedFeature(null);
    setTargetUserName(undefined);
  };

  return {
    isPremium,
    showPremiumModal,
    restrictedFeature,
    targetUserName,
    checkPremiumFeature,
    closePremiumModal
  };
}