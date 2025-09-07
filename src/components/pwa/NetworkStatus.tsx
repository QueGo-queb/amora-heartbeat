import React from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const NetworkStatus: React.FC = () => {
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();

  if (isOnline && !isSlowConnection) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Badge 
        variant={isOnline ? "secondary" : "destructive"}
        className="flex items-center space-x-2 px-3 py-2 shadow-lg"
      >
        {isOnline ? (
          <>
            <Signal className="w-4 h-4" />
            <span>Connexion lente ({effectiveType})</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Mode hors ligne</span>
          </>
        )}
      </Badge>
    </div>
  );
};

