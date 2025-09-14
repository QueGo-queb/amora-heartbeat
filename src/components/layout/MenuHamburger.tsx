/**
 * Menu hamburger pour la navigation principale
 * Contient tous les liens vers les différentes sections de l'app
 */

import { useState } from 'react';
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

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: number;
  premium?: boolean;
  admin?: boolean;
}

const MenuHamburger = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Menu items
  const menuItems: MenuItem[] = [
    {
      id: 'feed',
      label: '📱 Fil d\'actualité',
      icon: Home,
      href: '/feed'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      href: '/messages',
      badge: 3 // TODO: Récupérer depuis l'API
    },
    {
      id: 'matching',
      label: 'Matching',
      icon: Heart,
      href: '/matching'
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: User,
      href: '/profile'
    },
    // ✅ AJOUT - Mes Publications
    {
      id: 'my-posts',
      label: 'Mes Publications',
      icon: Edit3,
      href: '/my-posts'
    },
    {
      id: 'favorites',
      label: 'Favoris',
      icon: Star,
      href: '/favorites'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/notifications',
      badge: 5 // TODO: Récupérer depuis l'API
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
      label: 'Paramètres',
      icon: Settings,
      href: '/settings'
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: Users,
      href: '/admin',
      admin: true
    }
  ];

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.email === 'clodenerc@yahoo.fr';

  // Filtrer les items selon les permissions
  const filteredItems = menuItems.filter(item => {
    if (item.admin && !isAdmin) return false;
    return true;
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive"
      });
    }
  };

  // Récupérer les données utilisateur au chargement
  useState(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  });

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

        <div className="flex-1 overflow-y-auto p-6">
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

          {/* Logout button */}
          <div className="mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 text-left text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Se déconnecter
            </Button>
          </div>
        </div>

        {/* User info */}
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-gray-50 rounded-lg">
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
