/**
 * Page de gestion des publicités
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Megaphone, TrendingUp, Eye, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeaderAdmin from '@/components/admin/HeaderAdmin';

const AdminAds = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec bouton de retour */}
      <HeaderAdmin 
        title="Gestion des Publicités"
        showBackButton={true}
        backTo="/admin"
        backLabel="Admin principal"
      />

      {/* Contenu principal */}
      <main className="container mx-auto py-8 px-4">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2"> Gestion des Publicités</h1>
              <p className="text-muted-foreground text-lg">
                Créer et gérer les publicités, suivre les performances et optimiser les campagnes
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/admin')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'admin
            </Button>
          </div>
        </div>

        {/* Statistiques des publicités */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicités Actives</CardTitle>
              <Eye className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                En cours de diffusion
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5K</div>
              <p className="text-xs text-muted-foreground">
                Ce mois
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus</CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€2.4K</div>
              <p className="text-xs text-muted-foreground">
                Générés ce mois
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="culture-card mb-8">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Créer une publicité
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Voir les analytics
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Gérer les campagnes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des publicités */}
        <Card className="culture-card">
          <CardHeader>
            <CardTitle>Publicités Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune publicité active</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre première publicité pour commencer à générer des revenus
              </p>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Créer une publicité
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAds;
