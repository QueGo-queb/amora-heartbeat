import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

export const PWAUpdatePrompt: React.FC = () => {
  const { isOffline, needRefresh, updateServiceWorker, canInstall, install } = usePWA();
  const { toast } = useToast();

  const handleUpdate = () => {
    updateServiceWorker(true);
    toast({
      title: "Mise à jour en cours",
      description: "L'application va se recharger avec la nouvelle version.",
    });
  };

  const handleInstall = async () => {
    try {
      await install();
      toast({
        title: "Installation réussie",
        description: "AMORA est maintenant installée sur votre appareil.",
      });
    } catch (error) {
      console.error('Erreur installation PWA:', error);
      toast({
        title: "Erreur d'installation",
        description: "Impossible d'installer l'application.",
        variant: "destructive",
      });
    }
  };

  if (!needRefresh && !canInstall && !isOffline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Mise à jour disponible */}
      {needRefresh && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-900">
              Mise à jour disponible
            </CardTitle>
            <CardDescription className="text-blue-700">
              Une nouvelle version d'AMORA est prête.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <Button onClick={handleUpdate} size="sm" className="w-full">
              Mettre à jour
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Prompt d'installation */}
      {canInstall && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-900 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Installer AMORA
            </CardTitle>
            <CardDescription className="text-green-700">
              Installez l'app pour une meilleure expérience.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <Button onClick={handleInstall} size="sm" className="w-full">
              Installer
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Indicateur hors ligne */}
      {isOffline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-2 p-4">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-900">Mode hors ligne</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
