/**
 * Composant pour bloquer les fonctionnalités Premium
 */

import { ReactNode } from 'react';
import { usePremium } from '@/hooks/usePremium';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
  fallback?: ReactNode;
}

export function PremiumGate({ 
  children, 
  feature, 
  description = "Cette fonctionnalité nécessite un abonnement Premium",
  fallback 
}: PremiumGateProps) {
  const { isPremium, loading } = usePremium();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-20 w-full" />
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-2 border-dashed border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mb-3">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          {feature}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span>Messages illimités</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span>Appels audio et vidéo</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span>Profil mis en avant</span>
          </div>
        </div>

        <Button
          onClick={() => navigate('/premium')}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
        >
          Passer au Premium
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
