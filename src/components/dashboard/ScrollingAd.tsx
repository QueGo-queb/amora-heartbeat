import { useState, useEffect } from 'react';
import { Star, Sparkles, ArrowRight, Zap, Gift, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ScrollingAdProps {
  className?: string;
}

const ScrollingAd: React.FC<ScrollingAdProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation d'apparition avec délai
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${className} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 ease-out`}>
      <Card className="culture-card bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-xl overflow-hidden relative">
        {/* Effet de brillance en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse opacity-30"></div>
        
        {/* Bordure animée */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 p-[2px]">
          <div className="h-full w-full bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-lg"></div>
        </div>

        <CardContent className="relative p-6">
          {/* En-tête avec étoiles animées */}
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-2 mb-3">
              <Star className="w-6 h-6 text-amber-500 animate-bounce" style={{ animationDelay: '0s' }} />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Découvrez AMORA
              </h2>
              <Star className="w-6 h-6 text-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <p className="text-lg font-semibold text-amber-700">
              L'Expérience Client Réinventée
            </p>
          </div>

          {/* Cible principale */}
          <div className="bg-white/60 rounded-lg p-4 mb-6 border border-amber-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-blue-700 text-lg">
                Vous êtes entrepreneur, commerçant ou créateur ?
              </span>
            </div>
            <p className="text-blue-600 text-center">
              AMORA vous offre une plateforme intuitive pour gérer vos activités, 
              booster votre visibilité et fidéliser vos clients.
            </p>
          </div>

          {/* Fonctionnalités clés */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Fonctionnalités clés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-white/60 rounded-lg p-3 border border-amber-200">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Gestion simplifiée des produits</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-lg p-3 border border-amber-200">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700">Outils marketing intégrés</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-lg p-3 border border-amber-200">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Statistiques en temps réel</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 rounded-lg p-3 border border-amber-200">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Support client personnalisé</span>
              </div>
            </div>
          </div>

          {/* Offre spéciale */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-700 text-lg">
                  Offre spéciale de lancement
                </span>
              </div>
              <p className="text-green-600 text-center font-medium">
                Inscrivez-vous aujourd'hui et bénéficiez de{' '}
                <span className="font-bold text-green-700 text-lg">30 jours gratuits</span>{' '}
                sur toutes les fonctionnalités premium !
              </p>
            </div>
          </div>

          {/* Bouton d'action */}
          <div className="text-center mt-6">
            <button className="group relative inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <span>Commencer maintenant</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Indicateur admin */}
          <div className="absolute top-2 right-2">
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full text-xs text-amber-700 border border-amber-200">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Admin
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrollingAd;
