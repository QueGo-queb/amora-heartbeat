import { useLocation } from 'react-router-dom';
import { 
  Settings, 
  Bell, 
  User, 
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BackButton from './BackButton';
import { useAdminNavigation } from '@/hooks/useAdminNavigation';
import { cn } from '@/lib/utils';

interface HeaderAdminProps {
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({
  title = "Administration AMORA",
  showBackButton = true,
  backTo,
  backLabel,
  className = ""
}) => {
  const location = useLocation();
  const { canGoBack, getPreviousPage } = useAdminNavigation();

  // Déterminer si on doit afficher le bouton de retour
  const shouldShowBackButton = showBackButton && (
    canGoBack() || 
    location.pathname !== '/admin' && 
    location.pathname !== '/admin/dashboard'
  );

  // Déterminer la destination et le label du bouton de retour
  const getBackButtonConfig = () => {
    if (backTo) {
      return { to: backTo, label: backLabel || "Retour" };
    }

    const previousPage = getPreviousPage();
    if (previousPage) {
      const isMainAdmin = previousPage.path === '/admin' || previousPage.path === '/admin/dashboard';
      return {
        to: previousPage.path,
        label: isMainAdmin ? "Admin principal" : "Retour",
        showHomeIcon: isMainAdmin
      };
    }

    return { to: '/admin', label: "Admin principal", showHomeIcon: true };
  };

  const backConfig = getBackButtonConfig();

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Section gauche avec bouton de retour et titre */}
        <div className="flex items-center gap-4">
          {shouldShowBackButton && (
            <BackButton
              to={backConfig.to}
              label={backConfig.label}
              showHomeIcon={backConfig.showHomeIcon}
              variant="ghost"
              size="sm"
              className="mr-2"
            />
          )}
          
          <div className="flex items-center gap-3">
            <div className="heart-logo">
              <div className="heart-shape" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold gradient-text">AMORA</span>
              <span className="text-sm text-muted-foreground">{title}</span>
            </div>
          </div>
        </div>

        {/* Section droite avec actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Menu utilisateur */}
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>

          {/* Menu mobile */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>

          {/* Déconnexion */}
          <Button variant="outline" size="sm" className="hidden md:flex">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
