/**
 * Page Feed - Fil d'actualité personnalisé
 */

import React from "react";

const FeedPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Fil d'actualité</h1>
        <p className="text-muted-foreground">
          Page de feed - Contenu personnalisé selon vos préférences
        </p>
      </div>
    </div>
  );
};

export default FeedPage;
