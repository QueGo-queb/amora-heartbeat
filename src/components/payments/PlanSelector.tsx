import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { formatPrice, type PlanId } from '@/lib/stripe';

interface PlanSelectorProps {
  onPlanSelect?: (planId: PlanId) => void;
  className?: string;
}

const planIcons = {
  monthly: Zap,
  yearly: Crown,
  lifetime: Star,
};

const planColors = {
  monthly: 'border-blue-200 hover:border-blue-300',
  yearly: 'border-purple-200 hover:border-purple-300 ring-2 ring-purple-100',
  lifetime: 'border-yellow-200 hover:border-yellow-300',
};

export const PlanSelector: React.FC<PlanSelectorProps> = ({ 
  onPlanSelect,
  className 
}) => {
  const { plans, purchasePlan, loading, hasActiveSubscription } = usePayments();

  const handlePlanSelect = async (planId: PlanId) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    } else {
      await purchasePlan(planId);
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {Object.entries(plans).map(([planId, plan]) => {
        const Icon = planIcons[planId as PlanId];
        const isRecommended = planId === 'yearly';
        
        return (
          <Card 
            key={planId}
            className={`relative ${planColors[planId as PlanId]} transition-all duration-200`}
          >
            {isRecommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white">
                  ⭐ Recommandé
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {formatPrice(plan.price, plan.currency)}
                {plan.interval !== 'one_time' && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.interval === 'month' ? 'mois' : 'an'}
                  </span>
                )}
              </div>
              {planId === 'yearly' && (
                <div className="text-sm text-green-600 font-medium">
                  Économisez 44% par rapport au mensuel !
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handlePlanSelect(planId as PlanId)}
                disabled={loading || hasActiveSubscription}
                className="w-full"
                variant={isRecommended ? "default" : "outline"}
              >
                {loading ? (
                  'Traitement...'
                ) : hasActiveSubscription ? (
                  'Déjà abonné'
                ) : (
                  `Choisir ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
