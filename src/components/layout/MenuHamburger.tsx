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
  Camera
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
  href: string;
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
      label: 'Fil d\'actualité',
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
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      navigate('/');
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="heart-logo">
              <div className="heart-shape" />
            </div>
            <span className="text-xl font-bold gradient-text">AMORA</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start h-12"
                onClick={() => handleNavigation(item.href)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
                {item.premium && (
                  <Badge variant="default" className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500">
                    PREMIUM
                  </Badge>
                )}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            );
          })}

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">Déconnexion</span>
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
