import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Users, MessageCircle, Settings, LogOut, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.user_metadata?.full_name || user?.email} !
          </h1>
          <p className="text-muted-foreground">
            Découvrez votre communauté multiculturelle et trouvez l'amour sans frontières.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nouveaux matches</CardTitle>
              <Heart className="w-4 h-4 text-heart-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +3 depuis hier
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages non lus</CardTitle>
              <MessageCircle className="w-4 h-4 text-heart-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                +2 nouveaux messages
              </p>
            </CardContent>
          </Card>

          <Card className="culture-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vues de profil</CardTitle>
              <Users className="w-4 h-4 text-heart-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">
                +8 cette semaine
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/matching')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-heart-red" />
                Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Découvrez de nouveaux profils compatibles avec vos préférences.
              </p>
              <Button className="w-full" variant="outline">
                Trouver des matches
              </Button>
            </CardContent>
          </Card>

          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/messages')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-heart-orange" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Communiquez avec vos matches et développez vos connexions.
              </p>
              <Button className="w-full" variant="outline">
                Voir les messages
              </Button>
            </CardContent>
          </Card>

          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-heart-green" />
                Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Gérez vos informations personnelles et préférences.
              </p>
              <Button className="w-full" variant="outline">
                Modifier le profil
              </Button>
            </CardContent>
          </Card>

          <Card className="culture-card hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Personnalisez votre expérience et vos préférences.
              </p>
              <Button className="w-full" variant="outline">
                Configurer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
          <Card className="culture-card">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-heart-red rounded-full"></div>
                  <span className="text-sm">Nouveau match avec Marie</span>
                  <span className="text-xs text-muted-foreground ml-auto">Il y a 2h</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-heart-orange rounded-full"></div>
                  <span className="text-sm">Message reçu de Jean</span>
                  <span className="text-xs text-muted-foreground ml-auto">Il y a 4h</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-heart-green rounded-full"></div>
                  <span className="text-sm">Profil consulté par 3 personnes</span>
                  <span className="text-xs text-muted-foreground ml-auto">Hier</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
