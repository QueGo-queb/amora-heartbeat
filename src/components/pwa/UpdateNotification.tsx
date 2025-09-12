import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si le Service Worker est supporté
    if ('serviceWorker' in navigator) {
      const sw = navigator.serviceWorker;
      
      // Écouter les mises à jour du Service Worker
      sw.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          setUpdateAvailable(true);
          toast({
            title: "Mise à jour disponible",
            description: "Une nouvelle version de l'application est disponible",
          });
        }
      });

      // Vérifier s'il y a un Service Worker en attente
      sw.ready.then((registration) => {
        if (registration.waiting) {
          setUpdateAvailable(true);
        }
      });

      // Écouter les nouveaux Service Workers
      sw.addEventListener('controllerchange', () => {
        // Recharger la page pour appliquer les changements
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Envoyer un message au Service Worker pour forcer la mise à jour
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Forcer le rechargement
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour l'application",
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] w-full max-w-sm">
      <Card className="bg-blue-50 border-blue-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 text-sm">
                Mise à jour disponible
              </h3>
              <p className="text-blue-700 text-xs mt-1">
                Une nouvelle version avec des améliorations est prête
              </p>
              
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour'
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-blue-600 hover:bg-blue-100 text-xs"
                >
                  Plus tard
                </Button>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="flex-shrink-0 h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateNotification;
