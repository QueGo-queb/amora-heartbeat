/**
 * Page de gestion des promotions et publicités
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Gift, TrendingUp, Target, Users, Calendar, DollarSign, Plus, Edit, Trash2, Check } from 'lucide-react';
import AdSpaceToggle from '@/components/admin/AdSpaceToggle';
import BackButton from '@/components/admin/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePremiumPricing } from '@/hooks/usePremiumPricing';
import { PremiumPricingManager } from '@/components/admin/PremiumPricingManager';

const AdminPromotions = () => {
  const [showPricingManager, setShowPricingManager] = useState(false);
  const [showPromotionsManager, setShowPromotionsManager] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Charger toutes les promotions
  const loadPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Erreur chargement promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Créer ou mettre à jour une promotion
  const savePromotion = async (promotionData: Omit<any, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('promotions')
        .insert({
          ...promotionData,
          created_by: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Promotion sauvegardée",
        description: "La promotion a été mise à jour avec succès",
      });

      await loadPromotions();
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Activer une promotion existante
  const activatePromotion = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Promotion activée",
        description: "La promotion est maintenant active",
      });

      await loadPromotions();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'activation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une promotion
  const deletePromotion = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Promotion supprimée",
        description: "La promotion a été supprimée",
      });

      await loadPromotions();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Modifier pour ajouter le temps réel (ajout minimal)
  useEffect(() => {
    loadPromotions();
    
    // Écouter les changements en temps réel
    const subscription = supabase
      .channel('promotions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'promotions' },
        () => {
          loadPromotions(); // Recharger quand il y a des changements
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec bouton retour */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-4 px-4">
          <BackButton to="/admin/dashboard" />
        </div>
      </div>

      <main className="container mx-auto py-8 px-4">
        {/* Titre de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🎯 Gestion des Promotions</h1>
          <p className="text-muted-foreground">
            Gérez les promotions, publicités et offres spéciales de votre plateforme
          </p>
        </div>

        {/* Contrôle de l'espace publicitaire */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Contrôle de l'Espace Publicitaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdSpaceToggle />
          </CardContent>
        </Card>

        {/* Statistiques des promotions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promotions Actives</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 depuis hier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.2%</div>
              <p className="text-xs text-muted-foreground">
                +1.1% ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Touchés</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4K</div>
              <p className="text-xs text-muted-foreground">
                +180 cette semaine
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14j</div>
              <p className="text-xs text-muted-foreground">
                Campagnes actives
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Créer une Promotion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Créez de nouvelles offres spéciales et promotions pour booster l'engagement
              </p>
              <Button className="w-full">
                Créer une Promotion
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Gérer les Publicités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configurez et optimisez vos campagnes publicitaires
              </p>
              <Button variant="outline" className="w-full">
                Gérer les Publicités
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Gestion des Prix Premium */}
        <Card className="culture-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-green-500" />
              Prix Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Gérer les prix du plan Premium par devise
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                Tarification
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPricingManager(true)}
              >
                Gérer les prix
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gestion des Promotions */}
        <Card className="culture-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="w-5 h-5 text-blue-500" />
              Gérer les Promotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Gérez les offres spéciales et les codes promo
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                Promotions
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPromotionsManager(true)}
              >
                Gérer les promotions
              </Button>
            </div>
          </CardContent>
        </Card>

        <PremiumPricingManager 
          open={showPricingManager}
          onClose={() => setShowPricingManager(false)}
        />

        <PremiumPricingManager 
          open={showPromotionsManager}
          onClose={() => setShowPromotionsManager(false)}
        />
      </main>
    </div>
  );
};

export default AdminPromotions;
