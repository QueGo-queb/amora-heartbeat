/**
 * Page Premium Fail - Échec de l'abonnement
 */

import React from "react";

const PremiumFail = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Échec de l'abonnement</h1>
        <p className="text-muted-foreground">
          Une erreur s'est produite lors du traitement de votre paiement.
        </p>
      </div>
    </div>
  );
};

export default PremiumFail;
