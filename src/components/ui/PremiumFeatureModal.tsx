import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  MessageCircle, 
  Phone, 
  Video, 
  Star, 
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AMORA_PRICING, formatPrice } from '@/constants/pricing';

interface PremiumFeatureModalProps {
  open: boolean;
  onClose: () => void;
  feature: 'messages' | 'audio_call' | 'video_call';
  userName?: string;
}

const featureConfig = {
  messages: {
    icon: MessageCircle,
    title: "Messages privés",
    description: "Envoyez des messages privés illimités",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  audio_call: {
    icon: Phone,
    title: "Appels audio",
    description: "Passez des appels audio de qualité",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  video_call: {
    icon: Video,
    title: "Appels vidéo",
    description: "Profitez d'appels vidéo haute définition",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  }
};

export function PremiumFeatureModal({ open, onClose, feature, userName }: PremiumFeatureModalProps) {
  const navigate = useNavigate();
  const config = featureConfig[feature];
  const FeatureIcon = config.icon;

  const handleUpgrade = () => {
    onClose();
    navigate('/premium');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-full ${config.bgColor} ${config.borderColor} border-2`}>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Fonctionnalité Premium
          </DialogTitle>
          <DialogDescription className="text-center">
            {userName ? `Pour contacter ${userName}` : 'Pour utiliser cette fonctionnalité'}, 
            passez au plan Premium !
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Fonctionnalité demandée */}
          <Card className={`${config.bgColor} ${config.borderColor} border`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FeatureIcon className={`w-6 h-6 ${config.color}`} />
                <div>
                  <h3 className="font-semibold">{config.title}</h3>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avantages Premium */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Avec Premium, débloquez :
            </h4>
            <div className="space-y-2">
              {[
                'Messages privés illimités',
                'Appels audio et vidéo',
                'Profil mis en avant',
                'Filtres avancés',
                'Support prioritaire'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prix */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold">
                {formatPrice(AMORA_PRICING.premium.monthly.usd)} USD/mois
              </span>
            </div>
            <p className="text-sm text-gray-600">Annulable à tout moment</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Plus tard
            </Button>
            <Button onClick={handleUpgrade} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Passer Premium
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}