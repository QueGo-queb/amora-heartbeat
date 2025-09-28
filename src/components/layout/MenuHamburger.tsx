/**
 * Menu hamburger pour la navigation principale
 * Contient tous les liens vers les différentes sections de l'app
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  MessageCircle, 
  User, 
  Settings, 
  Heart,
  Bell,
  Star,
  CreditCard,
  LogOut,
  ChevronRight,
  Users,
  Globe,
  Camera,
  Edit3 // ✅ AJOUT pour l'icône des publications
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from '@/hooks/useTranslation';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: number;
  premium?: boolean;
  admin?: boolean;
  component?: React.ReactNode; // ✅ AJOUT pour les composants complexes
}

const MenuHamburger = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // ✅ NOUVEAU: Hook pour les messages non lus
  const { unreadCount: unreadMessages } = useUnreadMessages();

  // ✅ AJOUT: Hook pour les notifications
  const { unreadCount: unreadNotifications } = useNotifications();

  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const { t } = useTranslation();

  // ✅ CORRECTION: Remplacer useState par useEffect pour récupérer l'utilisateur
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
        setUser(null);
      }
    };
    getUser();
  }, []); // ✅ Se déclenche une seule fois au montage

  // Menu items
  const menuItems: MenuItem[] = useMemo(() => [
    {
      id: 'feed',
      label: `📱 ${t.home}`, // ou créer une traduction spécifique "Fil d'actualité"
      icon: Home,
      href: '/feed'
    },
    {
      id: 'messages',
      label: t.messages,
      icon: MessageCircle,
      href: '/messages',
      badge: unreadMessages || undefined // ✅ Déjà corrigé
    },
    {
      id: 'matching',
      label: t.search, // ou "Matching"
      icon: Heart,
      href: '/matching'
    },
    {
      id: 'profile',
      label: t.profile,
      icon: User,
      href: '/profile'
    },
    // ✅ AJOUT - Mes Publications
    {
      id: 'my-posts',
      label: t.myPosts,
      icon: Edit3,
      href: '/my-posts'
    },
    {
      id: 'favorites',
      label: t.favorites,
      icon: Star,
      href: '/favorites'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/notifications',
      badge: unreadNotifications || undefined // ✅ CORRECTION: Compteur dynamique
    },
    {
      id: 'premium',
      label: 'Abonnement Premium',
      icon: CreditCard,
      href: '/premium',
      premium: true
    },
    {
      id: 'settings',
      label: t.settings,
      icon: Settings,
      href: '/settings'
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: Users,
      href: '/admin',
      admin: true
    },
    {
      id: 'language',
      label: 'Langue / Language',
      icon: Globe,
      href: '#', // Pas de navigation, juste le sélecteur
      component: (
        <LanguageSelector 
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      )
    }
  ], [t, unreadMessages, unreadNotifications]); // ✅ Dépendances

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.email === 'clodenerc@yahoo.fr';

  // Filtrer les items selon les permissions
  const filteredItems = menuItems.filter(item => {
    if (item.admin && !isAdmin) return false;
    return true;
  });

  const handleLogout = async () => {
    // ✅ UX: Confirmation avant déconnexion
    const confirmed = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
    if (!confirmed) return;
  
    try {
      // ✅ UX: État de chargement
      setLogoutLoading(true);
      
      await supabase.auth.signOut();
      
      // ✅ UX: Fermer le menu
      setOpen(false);
      
      // ✅ UX: Toast de succès
      toast({
        title: "✅ Déconnexion réussie",
        description: "À bientôt sur AMORA !",
        variant: "default",
      });
      
      // ✅ UX: Délai avant redirection pour lire le message
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de se déconnecter. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.href) {
      navigate(item.href);
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span>AMORA</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 pb-24">
          {/* Menu items */}
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start h-auto p-4 text-left"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center gap-3 w-full">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                      {item.premium && (
                        <Badge variant="default" className="ml-auto bg-yellow-500">
                          Premium
                        </Badge>
                      )}
                      {item.admin && (
                        <Badge variant="destructive" className="ml-auto">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                </div>
              </Button>
            ))}
          </div>

          {/* ✅ BOUTON DE DÉCONNEXION MOBILE OPTIMISÉ */}
          <div className="mt-8 pt-6 border-t border-red-100">
          <Button
           variant="ghost"
           className="w-full justify-start h-auto p-4 text-left text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 rounded-lg border border-red-200 hover:border-red-300 disabled:opacity-50"
           onClick={handleLogout}
           disabled={logoutLoading}
        >
          {logoutLoading ? (
            <>
             <div className="w-5 h-5 mr-3 flex-shrink-0 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
             <span className="font-medium">Déconnexion...</span>
           </>
         ) : (
           <>
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="font-medium">Se déconnecter</span>
          </>
        )}
          </Button>
          </div>
        </div>

        {/* User info */}
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuHamburger;