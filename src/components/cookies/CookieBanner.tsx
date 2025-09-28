import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  advertising: boolean;
}

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const cookieChoice = localStorage.getItem('amora-cookie-preferences');
    if (!cookieChoice) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: true,
      preferences: true,
      advertising: true
    };
    
    localStorage.setItem('amora-cookie-preferences', JSON.stringify(preferences));
    localStorage.setItem('amora-cookie-choice-made', 'true');
    setShowBanner(false);
    
    // Appliquer les cookies acceptés
    applyCookiePreferences(preferences);
  };

  const handleRejectAll = () => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: false,
      preferences: false,
      advertising: false
    };
    
    localStorage.setItem('amora-cookie-preferences', JSON.stringify(preferences));
    localStorage.setItem('amora-cookie-choice-made', 'true');
    setShowBanner(false);
    
    // Appliquer les cookies refusés
    applyCookiePreferences(preferences);
  };

  const handleSettings = () => {
    navigate('/cookie-settings');
  };

  const applyCookiePreferences = (preferences: CookiePreferences) => {
    // Appliquer les préférences de cookies
    if (preferences.analytics) {
      // Activer Google Analytics ou autres outils d'analyse
      console.log('✅ Cookies analytiques activés');
    }
    
    if (preferences.preferences) {
      // Activer les cookies de préférences
      console.log('✅ Cookies de préférences activés');
    }
    
    if (preferences.advertising) {
      // Activer les cookies publicitaires
      console.log('✅ Cookies publicitaires activés');
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto bg-white border-2 border-red-200 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🍪</span>
                <h3 className="font-semibold text-gray-900">Gestion des cookies</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience sur Amora, analyser l'utilisation du site et personnaliser le contenu. 
                En poursuivant votre navigation, vous acceptez l'utilisation des cookies.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSettings}
                className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                Paramètres des cookies
              </Button>
              
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <Check className="w-4 h-4" />
                Accepter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieBanner;
