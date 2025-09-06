import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  showLoginButton?: boolean;
  className?: string;
}

const Header = ({ showLoginButton = true, className = '' }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Gérer le scroll pour l'effet de transparence
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b' 
          : 'bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40'
      } ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Toujours visible */}
          <Link to="/" className="flex items-center gap-3">
            <div className="heart-logo">
              <div className="heart-shape" />
            </div>
            <span className="text-xl font-bold gradient-text">AMORA</span>
          </Link>

          {/* Navigation Desktop - Cachée sur mobile */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Accueil
            </Link>
            
            {/* Ajouter ce lien vers le feed */}
            <Link 
              to="/feed" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              📱 Fil d'actualité
            </Link>
            
            <Link 
              to="/matching" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Matching
            </Link>
          </nav>

          {/* Boutons de droite - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {showLoginButton && !user ? (
              <Button asChild>
                <Link to="/auth">Se connecter</Link>
              </Button>
            ) : user ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/dashboard">
                    <User className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </div>
            ) : null}
          </div>

          {/* Bouton Hamburger - Visible uniquement sur mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Ouvrir le menu"
              className="relative z-50"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu Mobile - Overlay plein écran */}
        {isMenuOpen && (
          <div className="md:hidden">
            {/* Overlay sombre */}
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu mobile */}
            <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg z-50">
              <nav className="px-4 py-6 space-y-4">
                {/* Liens de navigation */}
                <Link 
                  to="/" 
                  className="block py-3 px-4 text-lg font-medium transition-colors hover:text-primary hover:bg-accent rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </Link>
                <Link 
                  to="/feed" 
                  className="block py-3 px-4 text-lg font-medium transition-colors hover:text-primary hover:bg-accent rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Fil d'actualité
                </Link>
                <Link 
                  to="/matching" 
                  className="block py-3 px-4 text-lg font-medium transition-colors hover:text-primary hover:bg-accent rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Matching
                </Link>

                {/* Séparateur */}
                <div className="border-t pt-4 mt-4">
                  {showLoginButton && !user ? (
                    <Button asChild className="w-full justify-start h-12 text-lg">
                      <Link to="/auth">Se connecter</Link>
                    </Button>
                  ) : user ? (
                    <div className="space-y-3">
                      <Button 
                        variant="ghost" 
                        asChild 
                        className="w-full justify-start h-12 text-lg"
                      >
                        <Link to="/dashboard">
                          <User className="w-5 h-5 mr-3" />
                          Mon Profil
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        className="w-full justify-start h-12 text-lg"
                      >
                        Déconnexion
                      </Button>
                    </div>
                  ) : null}
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
