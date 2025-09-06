import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /**
   * URL de destination pour le retour
   * Si non spécifié, utilise l'historique du navigateur
   */
  to?: string;
  
  /**
   * Texte du bouton (défaut: "Retour")
   */
  label?: string;
  
  /**
   * Icône à afficher (défaut: ArrowLeft)
   */
  icon?: React.ComponentType<{ className?: string }>;
  
  /**
   * Classes CSS personnalisées
   */
  className?: string;
  
  /**
   * Variant du bouton (défaut: "ghost")
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  
  /**
   * Taille du bouton (défaut: "sm")
   */
  size?: "default" | "sm" | "lg" | "icon";
  
  /**
   * Afficher l'icône Home si on retourne à l'admin principal
   */
  showHomeIcon?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
  to,
  label = "Retour",
  icon: Icon = ArrowLeft,
  className = "",
  variant = "ghost",
  size = "sm",
  showHomeIcon = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (to) {
      // Navigation vers une URL spécifique
      navigate(to);
    } else {
      // Retour à la page précédente
      navigate(-1);
    }
  };

  // Déterminer si on retourne à l'admin principal
  const isReturningToMainAdmin = to === '/admin' || to === '/admin/dashboard';
  
  // Choisir l'icône appropriée
  const DisplayIcon = showHomeIcon && isReturningToMainAdmin ? Home : Icon;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn(
        "flex items-center gap-2 transition-all duration-200 hover:gap-3",
        "text-gray-700 hover:text-gray-900",
        "border border-gray-200 hover:border-gray-300",
        "bg-white hover:bg-gray-50",
        "shadow-sm hover:shadow-md",
        className
      )}
      aria-label={`Retour à ${to || 'la page précédente'}`}
    >
      <DisplayIcon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </Button>
  );
};

export default BackButton;
