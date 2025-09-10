/**
 * Page de gestion des publicités
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  Megaphone, 
  TrendingUp, 
  Eye, 
  DollarSign, 
  Settings2, 
  Monitor,
  MonitorOff,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdSpaceVisibility } from "@/hooks/useAdSpaceVisibility";
import HeaderAdmin from '@/components/admin/HeaderAdmin';

const AdminAds = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isVisible: adSpaceVisible, toggleAdSpaceVisibility, loading: adSpaceLoading, refresh } = useAdSpaceVisibility();
  
  const [stats, setStats] = useState({
    activeAds: 0,
    impressions: 0,
    revenue: 0
  });
  const [toggleInProgress, setToggleInProgress] = useState(false);

  useEffect(() => {
    // Charger les vraies statistiques depuis la base de données
    loadAdStats();
  }, []);

  const loadAdStats = async () => {
    try {
      // TODO: Remplacer par de vraies données depuis Supabase
      setStats({
        activeAds: 0,
        impressions: 0,
        revenue: 0
      });
    } catch (error) {
      console.error('Error loading ad stats:', error);
    }
  };

  const handleAdSpaceToggle = async (checked: boolean) => {
    setToggleInProgress(true);
    
    try {
      console.log(`🎯 Admin attempting to toggle ad space to: ${checked}`);
      
      const success = await toggleAdSpaceVisibility(checked);
      
      if (success) {
        toast({
          title: "✅ Espace publicitaire",
          description: `Espace publicitaire ${checked ? 'ACTIVÉ' : 'DÉSACTIVÉ'} sur la page d'accueil`,
        });
        
        // Forcer un refresh pour s'assurer que l'état est à jour
        setTimeout(() => {
          refresh();
        }, 500);
      } else {
        toast({
          title: "❌ Erreur",
          description: "Impossible de modifier l'espace publicitaire. Vérifiez les logs de la console.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Error in handleAdSpaceToggle:', error);
      toast({
        title: "❌ Erreur système",
        description: `Erreur: ${error}`,
        variant: "destructive",
      });
    } finally {
      setToggleInProgress(false);
    }
  };

  const handleCreateAd = () => {
    toast({
      title: "🚧 Fonctionnalité en développement",
      description: "La création de publicités sera bientôt disponible",
    });
  };

  const handleViewAnalytics = () => {
    toast({
      title: "📊 Analytics",
      description: "Interface d'analytics en cours de développement",
    });
  };

  const handleManageCampaigns = () => {
    toast({
      title: "📋 Gestion des campagnes",
      description: "Interface de gestion des campagnes en cours de développement",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
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
              <h1 className="text-3xl font-bold mb-2 text-[#212529]">📢 Gestion des Publicités</h1>
              <p className="text-[#CED4DA] text-lg">
                Créer et gérer les publicités, suivre les performances et optimiser les campagnes
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/admin')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-[#CED4DA] text-[#212529] hover:bg-[#E63946] hover:text-white hover:border-[#E63946]"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'admin
            </Button>
          </div>
        </div>

        {/* CONTRÔLE ESPACE PUBLICITAIRE - AVEC DEBUG */}
        <Card className="bg-[#F8F9FA] border-[#E63946]/20 border-2 shadow-xl rounded-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#212529]">
              <Settings2 className="w-5 h-5 text-[#E63946]" />
              🎛️ Contrôle de l'Espace Publicitaire
              {adSpaceLoading && <Loader2 className="w-4 h-4 animate-spin text-[#E63946]" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#E63946]/5 to-[#52B788]/5 rounded-lg border border-[#E63946]/10">
              <div className="space-y-1 flex-1">
                <Label className="text-[#212529] font-bold flex items-center gap-2 text-lg">
                  {adSpaceVisible ? (
                    <Monitor className="w-5 h-5 text-[#52B788]" />
                  ) : (
                    <MonitorOff className="w-5 h-5 text-[#CED4DA]" />
                  )}
                  Affichage sur la page d'accueil
                </Label>
                <p className="text-sm text-[#CED4DA]">
                  Contrôle en temps réel l'affichage de l'espace publicitaire sur la page d'accueil
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#CED4DA]">État actuel:</span>
                  <code className="text-xs bg-[#212529] text-white px-2 py-1 rounded">
                    {adSpaceVisible ? 'VISIBLE' : 'MASQUÉ'}
                  </code>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Switch
                  checked={adSpaceVisible}
                  onCheckedChange={handleAdSpaceToggle}
                  disabled={adSpaceLoading || toggleInProgress}
                  className="data-[state=checked]:bg-[#52B788] data-[state=unchecked]:bg-[#CED4DA] scale-125"
                />
                {toggleInProgress && (
                  <span className="text-xs text-[#E63946] font-medium">Mise à jour...</span>
                )}
              </div>
            </div>
            
            {/* Indicateur de statut EN TEMPS RÉEL */}
            <div className={`p-4 rounded-xl border-2 transition-all duration-500 ${
              adSpaceVisible 
                ? "bg-[#52B788]/10 border-[#52B788]/30 shadow-lg" 
                : "bg-[#CED4DA]/10 border-[#CED4DA]/30"
            }`}>
              <div className="flex items-center gap-3">
                {adSpaceVisible ? (
                  <CheckCircle className="w-5 h-5 text-[#52B788]" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#CED4DA]" />
                )}
                <span className={`text-sm font-bold transition-all duration-300 ${
                  adSpaceVisible ? "text-[#52B788]" : "text-[#CED4DA]"
                }`}>
                  {adSpaceVisible ? "🟢 Espace publicitaire ACTIF sur la page d'accueil" : "🔴 Espace publicitaire MASQUÉ"}
                </span>
              </div>
              <p className={`text-xs mt-2 ml-8 ${adSpaceVisible ? "text-[#52B788]" : "text-[#CED4DA]"}`}>
                {adSpaceVisible 
                  ? "✅ Les visiteurs voient l'espace publicitaire sur la page d'accueil" 
                  : "❌ L'espace publicitaire est complètement masqué aux visiteurs"
                }
              </p>
            </div>

            {/* Debug info */}
            <details className="text-xs text-[#CED4DA]">
              <summary className="cursor-pointer hover:text-[#212529]">🔧 Informations de debug</summary>
              <div className="mt-2 p-3 bg-[#212529] text-green-400 rounded font-mono">
                <div>Loading: {adSpaceLoading ? 'true' : 'false'}</div>
                <div>Visible: {adSpaceVisible ? 'true' : 'false'}</div>
                <div>Toggle in progress: {toggleInProgress ? 'true' : 'false'}</div>
                <div>Timestamp: {new Date().toLocaleTimeString()}</div>
              </div>
            </details>
          </CardContent>
        </Card>

        {/* Statistiques des publicités */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#F8F9FA] border-[#CED4DA] shadow-lg rounded-xl hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#212529]">Publicités Actives</CardTitle>
              <Eye className="w-4 h-4 text-[#E63946]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#212529]">{stats.activeAds}</div>
              <p className="text-xs text-[#CED4DA]">
                En cours de diffusion
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#F8F9FA] border-[#CED4DA] shadow-lg rounded-xl hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#212529]">Impressions</CardTitle>
              <TrendingUp className="w-4 h-4 text-[#52B788]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#212529]">{stats.impressions.toLocaleString()}</div>
              <p className="text-xs text-[#CED4DA]">
                Ce mois
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#F8F9FA] border-[#CED4DA] shadow-lg rounded-xl hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#212529]">Revenus</CardTitle>
              <DollarSign className="w-4 h-4 text-[#52B788]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#212529]">€{stats.revenue.toFixed(2)}</div>
              <p className="text-xs text-[#CED4DA]">
                Générés ce mois
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides - BOUTONS FONCTIONNELS */}
        <Card className="bg-[#F8F9FA] border-[#CED4DA] shadow-lg rounded-xl mb-8">
          <CardHeader>
            <CardTitle className="text-[#212529]">🚀 Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={handleCreateAd}
                className="flex items-center gap-2 bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0 h-12 text-base font-bold"
              >
                <Plus className="w-5 h-5" />
                Créer une publicité
              </Button>
              <Button 
                onClick={handleViewAnalytics}
                variant="outline" 
                className="flex items-center gap-2 border-[#52B788] text-[#52B788] hover:bg-[#52B788] hover:text-white h-12 text-base font-bold"
              >
                <TrendingUp className="w-5 h-5" />
                Voir les analytics
              </Button>
              <Button 
                onClick={handleManageCampaigns}
                variant="outline" 
                className="flex items-center gap-2 border-[#CED4DA] text-[#212529] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] h-12 text-base font-bold"
              >
                <Megaphone className="w-5 h-5" />
                Gérer les campagnes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des publicités */}
        <Card className="bg-[#F8F9FA] border-[#CED4DA] shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-[#212529]">📋 Publicités Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Megaphone className="w-16 h-16 text-[#CED4DA] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[#212529]">Aucune publicité active</h3>
              <p className="text-[#CED4DA] mb-4">
                Créez votre première publicité pour commencer à générer des revenus
              </p>
              <Button 
                onClick={handleCreateAd}
                className="flex items-center gap-2 bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0"
              >
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
