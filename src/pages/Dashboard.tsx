import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardMenu from '@/components/dashboard/DashboardMenu';
import FeedSection from '@/components/dashboard/FeedSection';
import { useAdSpaceVisibility } from '@/hooks/useAdSpaceVisibility';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // SUPPRESSION de la ligne problématique : const { config: adConfig, loading: adLoading } = useAdSpace();
  
  // UTILISATION UNIQUEMENT du hook qui fonctionne
  const { isVisible: isAdSpaceVisible } = useAdSpaceVisibility();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="heart-logo">
            <div className="heart-shape animate-pulse" />
          </div>
          <span className="text-lg">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="heart-logo">
              <div className="heart-shape" />
            </div>
            <span className="text-2xl font-bold gradient-text">AMORA</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Menu hamburger avec toutes les sections */}
            <DashboardMenu />
            
            {/* Boutons essentiels uniquement */}
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            
            {/* CORRECTION : Bouton profil cliquable */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleProfileClick}
              className="hover:bg-slate-100"
              title="Accéder à mon profil"
            >
              <User className="w-5 h-5" />
            </Button>
            
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content - Version simplifiée */}
      <main className="container mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.user_metadata?.full_name || user?.email} ! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Découvrez votre communauté multiculturelle et trouvez l'amour sans frontières.
          </p>
        </div>

        {/* NOUVEAU : Fil d'actualité intégré */}
        <FeedSection className="mb-8" />

        {/* Espace publicitaire - Conditionnel */}
        {isAdSpaceVisible && (
          <div className="mb-8">
            <Card className="culture-card bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-purple-200 hover:border-purple-300 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-purple-700">📢 Espace Publicitaire</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-600 mb-4">
                  Les administrateurs peuvent configurer et gérer les publicités depuis l'interface admin.
                </p>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  Espace réservé aux publicités
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
