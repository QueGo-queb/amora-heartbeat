import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardMenu from '@/components/dashboard/DashboardMenu';
import { FeedSection } from '@/components/dashboard/FeedSection';
import { useAdSpaceVisibility } from '@/hooks/useAdSpaceVisibility';
import { CreatePostModal } from '@/components/feed/CreatePostModal';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // UTILISATION UNIQUEMENT du hook qui fonctionne
  const { isVisible: isAdSpaceVisible } = useAdSpaceVisibility();

  // État pour le modal de création de post
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Fonction pour ouvrir le modal de création de post
  const handleCreatePostClick = () => {
    console.log('🎯 BOUTON DASHBOARD - Ouverture du modal');
    setShowCreatePostModal(true);
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setShowCreatePostModal(false);
  };

  // Fonction appelée après création d'un post
  const handlePostCreated = () => {
    console.log('🎯 Post créé avec succès depuis Dashboard');
    setShowCreatePostModal(false);
    toast({
      title: "Publication créée !",
      description: "Votre post a été publié avec succès.",
    });
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', error);
          navigate('/login');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Erreur:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  // FONCTION GARDÉE pour que le menu de gauche fonctionne
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Dashboard Content */}
      <main className="container mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.user_metadata?.full_name || user?.email} ! 👋
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Découvrez votre communauté multiculturelle et trouvez l'amour sans frontières.
          </p>
          
          {/* BOUTON DE CRÉATION */}
          <Button
            onClick={handleCreatePostClick}
            className="bg-[#E91E63] hover:bg-[#C2185B] text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors shadow-lg hover:shadow-xl"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Créer une publication
          </Button>
        </div>

        {/* Fil d'actualité */}
        <FeedSection className="mb-8" />

        {/* Espace publicitaire - Conditionnel */}
        {isAdSpaceVisible && (
          <div className="mb-8">
            <Card className="culture-card bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-purple-200 hover:border-purple-300 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-purple-700">🎭 Espace Culturel</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-600 mb-4">
                  Découvrez les événements culturels près de chez vous
                </p>
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  Explorer les événements
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* MODAL DE CRÉATION DE POST */}
      <CreatePostModal
        open={showCreatePostModal}
        onClose={handleCloseModal}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Dashboard;
