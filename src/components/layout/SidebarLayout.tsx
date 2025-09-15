import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  MessageCircle, 
  Eye, 
  Heart, 
  Star, 
  Camera, 
  LogOut,
  User,
  Settings,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Users,
  Bell,
  CreditCard,
  Menu,
  X,
  Edit3 // ✅ AJOUT pour l'icône des publications
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Charger le profil utilisateur
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, location')
          .eq('id', user.id)
          .single();

        if (error) {
          console.warn('Profil non trouvé, utilisation des données auth:', error);
          setUserProfile({
            full_name: user.user_metadata?.full_name || 'Clodener Clairvil',
            avatar_url: user.user_metadata?.avatar_url || null,
            location: user.user_metadata?.location || 'Salaberry-de-Valleyfield, Québec, Canada'
          });
        } else {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
        setUserProfile({
          full_name: user.user_metadata?.full_name || 'Clodener Clairvil',
          avatar_url: user.user_metadata?.avatar_url || null,
          location: user.user_metadata?.location || 'Salaberry-de-Valleyfield, Québec, Canada'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Écouter les changements d'avatar
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('avatar-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          setUserProfile(payload.new);
          setAvatarError(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  const handlePremiumUpgrade = () => {
    navigate('/premium');
    setIsMobileMenuOpen(false); // Fermer le menu mobile
    toast({
      title: "Passage au Premium",
      description: "Découvrez tous nos avantages premium !",
    });
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Fermer le menu mobile après navigation
  };

  const handleExternalLink = (url: string) => {
    if (url.startsWith('mailto:') || url.startsWith('tel:')) {
      window.open(url);
    } else {
      navigate(url);
    }
    setIsMobileMenuOpen(false);
  };

  // Navigation
  const navigationItems = [
    { name: 'Accueil', icon: Home, path: '/dashboard' },
    { name: 'Recherche', icon: Search, path: '/matching' },
    { name: 'Messages', icon: MessageCircle, path: '/messages', badge: 10 },
    { name: 'Visites', icon: Eye, path: '/profile-views' },
    { name: 'J\'aime', icon: Heart, path: '/likes' },
    { name: 'Favoris', icon: Star, path: '/favorites' },
    { name: 'Chat vidéo', icon: Camera, path: '/chat-live' }, // ✅ CORRIGÉ - /chat-live au lieu de /video-chat
    { name: 'Correspondances', icon: Users, path: '/new-matches' },
    { name: 'Profil', icon: User, path: '/profile' },
    { name: 'Mes Publications', icon: Edit3, path: '/my-posts' },
    { name: 'Paramètres', icon: Settings, path: '/settings' }
  ];

  const supportItems = [
    { name: 'Centre d\'aide', icon: HelpCircle, path: '/help' },
    { name: 'Support par email', icon: Mail, path: 'mailto:support@amora.com' },
    { name: 'Chat en ligne', icon: MessageSquare, path: '/chat-live' }
    // ✅ SUPPRIMÉ - Support dédié
  ];

  // Fonctions helper
  const getAvatarUrl = () => {
    if (avatarError) return '/placeholder.svg';
    if (userProfile?.avatar_url && userProfile.avatar_url !== '') {
      return userProfile.avatar_url;
    }
    if (user?.user_metadata?.avatar_url && user.user_metadata.avatar_url !== '') {
      return user.user_metadata.avatar_url;
    }
    return '/placeholder.svg';
  };

  const getUserName = () => {
    return userProfile?.full_name || 
           user?.user_metadata?.full_name || 
           'Clodener Clairvil';
  };

  const getUserLocation = () => {
    return userProfile?.location || 
           user?.user_metadata?.location || 
           'Salaberry-de-Valleyfield, Québec, Canada';
  };

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setAvatarError(true);
    e.currentTarget.src = '/placeholder.svg';
  };

  const handleAvatarLoad = () => {
    setAvatarError(false);
  };

  // Composant de menu (utilisé pour desktop et mobile)
  const MenuContent = () => (
    <div className="flex flex-col h-full">
      {/* Header avec logo AMORA */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="heart-logo">
            <div className="heart-shape" />
          </div>
          <span className="text-lg lg:text-xl font-bold text-gray-800">AMORA</span>
        </div>
      </div>

      {/* Profil utilisateur */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-12 h-12 lg:w-16 lg:h-16 ring-2 ring-white shadow-lg">
                  <AvatarImage 
                    src={getAvatarUrl()}
                    alt="Photo de profil"
                    onError={handleAvatarError}
                    onLoad={handleAvatarLoad}
                    className="object-cover"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <AvatarFallback className="bg-pink-500 text-white text-sm lg:text-lg font-semibold">
                    {getUserName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm lg:text-lg truncate">
                  {getUserName()}
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 truncate">
                  {getUserLocation()}
                </p>
                <div className="flex gap-2 lg:gap-4 mt-1 lg:mt-2 text-xs text-gray-500">
                  <span>87 Amis</span>
                  <span>67 J'aime</span>
                  <span>20 Matches</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-4 lg:space-y-6">
          {/* Section Navigation principale */}
          <div>
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 lg:gap-3 h-10 lg:h-12 text-sm lg:text-base ${
                      isActive 
                        ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Section Support */}
          <div>
            <h3 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 lg:mb-3">
              Support
            </h3>
            <div className="space-y-1">
              {supportItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 lg:gap-3 h-10 lg:h-12 text-sm lg:text-base ${
                      isActive 
                        ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleExternalLink(item.path)}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="flex-1 text-left">{item.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Bouton Déconnexion */}
          <div className="pt-2 lg:pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 lg:gap-3 h-10 lg:h-12 text-red-600 hover:bg-red-50 hover:text-red-700 text-sm lg:text-base"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* ✅ SUPPRIMÉ - Section Premium entière */}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 p-4 lg:p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <aside className="w-80 bg-white rounded-lg m-4 flex flex-col shadow-lg">
          <MenuContent />
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header mobile avec bouton menu */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="heart-logo">
                <div className="heart-shape" />
              </div>
              <span className="text-lg font-bold text-gray-800">AMORA</span>
            </div>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <MenuContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Contenu principal mobile */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
