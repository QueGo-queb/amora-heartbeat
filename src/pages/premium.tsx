/**
 * Page Premium - Formulaire de souscription premium
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PremiumUpgradeModal } from "@/components/settings/PremiumUpgradeModal";
import { useCountryDetection } from "@/hooks/useCountryDetection";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PremiumPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();
  const { countryInfo } = useCountryDetection();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Rediriger vers l'authentification si pas connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // ✅ LOGS DE DÉBOGAGE
  useEffect(() => {
    console.log(' PremiumPage montée');
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log(' countryInfo:', countryInfo);
    console.log('📱 isModalOpen:', isModalOpen);
  }, [isAuthenticated, countryInfo, isModalOpen]);

  const handleCloseModal = () => {
    console.log('❌ Fermeture du modal premium');
    setIsModalOpen(false);
    // Rediriger vers la page précédente ou dashboard
    navigate(-1);
  };

  const handleGoBack = () => {
    console.log('⬅️ Retour depuis la page premium');
    navigate(-1);
  };

  // ✅ FONCTION POUR REOUVRIR LE MODAL SI NÉCESSAIRE
  const handleReopenModal = () => {
    console.log('🔄 Réouverture du modal premium');
    setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentification requise</h1>
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à cette page.</p>
          <Button onClick={() => navigate('/auth')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec bouton retour */}
      <div className="container mx-auto py-4 px-4">
        <Button 
          onClick={handleGoBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>

      {/* Contenu principal avec titre */}
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">✨ Passez au Premium</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Débloquez toutes les fonctionnalités et connectez-vous avec plus de personnes
          </p>
        </div>

        {/* ✅ BOUTON POUR REOUVRIR LE MODAL SI IL SE FERME */}
        {!isModalOpen && (
          <div className="text-center mb-8">
            <Button 
              onClick={handleReopenModal}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              Ouvrir les options de paiement
            </Button>
          </div>
        )}

        {/* Formulaire de souscription intégré */}
        <PremiumUpgradeModal
          open={isModalOpen}
          onClose={handleCloseModal}
          userCountry={countryInfo?.countryCode}
        />
      </div>
    </div>
  );
};

export default PremiumPage;
