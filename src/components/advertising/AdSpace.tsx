import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Megaphone, Settings } from 'lucide-react';
import { useAdSpaceVisibility } from '@/hooks/useAdSpaceVisibility';

interface AdSpaceProps {
  className?: string;
}

export function AdSpace({ className = '' }: AdSpaceProps) {
  const { isVisible, loading } = useAdSpaceVisibility();

  // Ne pas afficher si masqué par l'admin
  if (loading || !isVisible) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-r from-[#E63946]/10 to-[#52B788]/10 border-[#E63946]/20 shadow-lg rounded-xl ${className}`}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Megaphone className="w-6 h-6 text-[#E63946]" />
            <h3 className="text-lg font-bold text-[#212529]">📢 Espace Publicitaire</h3>
          </div>
          
          <div className="bg-[#F8F9FA] border-2 border-dashed border-[#CED4DA] rounded-lg p-8">
            <div className="flex flex-col items-center space-y-3">
              <Settings className="w-12 h-12 text-[#CED4DA]" />
              <p className="text-[#CED4DA] font-medium">
                Les administrateurs peuvent configurer et gérer les publicités depuis l'interface admin.
              </p>
              <p className="text-sm text-[#CED4DA]">
                Espace réservé aux publicités
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
