import React from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export const InstallPrompt: React.FC = () => {
  const {
    showInstallBanner,
    isInstallable,
    promptInstall,
    dismissInstallBanner,
    getInstallInstructions
  } = useInstallPrompt();

  if (!showInstallBanner) return null;

  const handleInstall = async () => {
    const success = await promptInstall();
    if (!success && !isInstallable) {
      // Afficher les instructions manuelles
      alert(getInstallInstructions());
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xl border-0">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Installer AMORA</h3>
                <p className="text-sm opacity-90">
                  Accès rapide depuis votre écran d'accueil
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissInstallBanner}
              className="text-white hover:bg-white/20 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Monitor className="w-4 h-4 opacity-75" />
              <span>✓ Accès hors ligne</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Download className="w-4 h-4 opacity-75" />
              <span>✓ Notifications push</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Smartphone className="w-4 h-4 opacity-75" />
              <span>✓ Expérience native</span>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                onClick={handleInstall}
                className="flex-1 bg-white text-pink-600 hover:bg-gray-100 font-semibold"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Installer
              </Button>
              <Button
                onClick={dismissInstallBanner}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                size="sm"
              >
                Plus tard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

