/**
 * Page "Mes publications" - Affiche uniquement les posts de l'utilisateur connecté
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MyPostsContainer from "@/components/feed/MyPostsContainer";

const MyPosts = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Mes publications</h1>
              <p className="text-sm text-gray-600">Vos posts personnels</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto py-8 px-4">
        <MyPostsContainer />
      </div>
    </div>
  );
};

export default MyPosts;
