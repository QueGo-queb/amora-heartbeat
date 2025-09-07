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

const PremiumPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();
  const { countryInfo } = useCountryDetection();
  const { isAuthenticated } = useAuth();

  // Rediriger vers l'authentification si pas connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Rediriger vers la page précédente ou dashboard
    navigate(-1);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!isAuthenticated) {
    return null; // ou un loader
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
