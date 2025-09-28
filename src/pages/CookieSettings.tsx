import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Check, X } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  advertising: boolean;
}

const CookieSettings = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    preferences: false,
    advertising: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Charger les préférences existantes
    const savedPreferences = localStorage.getItem('amora-cookie-preferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return; // Les cookies essentiels ne peuvent pas être désactivés
    
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Sauvegarder les préférences
      localStorage.setItem('amora-cookie-preferences', JSON.stringify(preferences));
      localStorage.setItem('amora-cookie-choice-made', 'true');
      
      // Appliquer les préférences
      applyCookiePreferences(preferences);
      
      toast({
        title: "✅ Préférences enregistrées",
        description: "Vos préférences de cookies ont été sauvegardées avec succès.",
      });
      
      // Rediriger vers la page d'accueil après un délai
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder vos préférences. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      preferences: true,
      advertising: true
    };
    setPreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected: CookiePreferences = {
      essential: true,
      analytics: false,
      preferences: false,
      advertising: false
    };
    setPreferences(allRejected);
  };

  const applyCookiePreferences = (preferences: CookiePreferences) => {
    // Appliquer les préférences de cookies
    if (preferences.analytics) {
      console.log('✅ Cookies analytiques activés');
      // Ici vous pouvez activer Google Analytics, etc.
    } else {
      console.log('❌ Cookies analytiques désactivés');
    }
    
    if (preferences.preferences) {
      console.log('✅ Cookies de préférences activés');
    } else {
      console.log('❌ Cookies de préférences désactivés');
    }
    
    if (preferences.advertising) {
      console.log('✅ Cookies publicitaires activés');
    } else {
      console.log('❌ Cookies publicitaires désactivés');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚙️</span>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres des cookies – Amora</h1>
          </div>
          
          <p className="text-gray-600 text-lg">
            Amora utilise différents types de cookies pour améliorer votre expérience sur notre plateforme. 
            Vous pouvez ici gérer vos préférences.
          </p>
        </div>

        {/* Cookie Types */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Types de cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Cookies essentiels */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-1">
                <Label className="text-lg font-semibold text-green-800">
                  Cookies essentiels (toujours activés)
                </Label>
                <p className="text-sm text-green-700 mt-1">
                  Nécessaires au fonctionnement de base du site. Ils ne peuvent pas être désactivés.
                </p>
              </div>
              <Switch
                checked={preferences.essential}
                disabled
                className="opacity-50"
              />
            </div>

            {/* Cookies analytiques */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <Label className="text-lg font-semibold text-blue-800">
                  Cookies analytiques
                </Label>
                <p className="text-sm text-blue-700 mt-1">
                  Nous aident à comprendre comment vous utilisez notre site pour l'améliorer.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
              />
            </div>

            {/* Cookies de préférences */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex-1">
                <Label className="text-lg font-semibold text-purple-800">
                  Cookies de préférences
                </Label>
                <p className="text-sm text-purple-700 mt-1">
                  Mémorisent vos choix pour personnaliser votre expérience.
                </p>
              </div>
              <Switch
                checked={preferences.preferences}
                onCheckedChange={(checked) => handlePreferenceChange('preferences', checked)}
              />
            </div>

            {/* Cookies publicitaires */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex-1">
                <Label className="text-lg font-semibold text-orange-800">
                  Cookies publicitaires
                </Label>
                <p className="text-sm text-orange-700 mt-1">
                  Utilisés pour afficher des publicités pertinentes et mesurer leur efficacité.
                </p>
              </div>
              <Switch
                checked={preferences.advertising}
                onCheckedChange={(checked) => handlePreferenceChange('advertising', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer mes préférences
          </Button>
          
          <Button
            onClick={handleAcceptAll}
            variant="outline"
            className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-3"
          >
            <Check className="w-4 h-4" />
            Tout accepter
          </Button>
          
          <Button
            onClick={handleRejectAll}
            variant="outline"
            className="flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-50 px-8 py-3"
          >
            <X className="w-4 h-4" />
            Tout refuser
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
