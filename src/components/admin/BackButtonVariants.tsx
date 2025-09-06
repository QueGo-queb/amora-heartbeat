import { ArrowLeft, Home, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonVariantsProps {
  variant?: 'default' | 'minimal' | 'prominent' | 'subtle';
  to?: string;
  label?: string;
  className?: string;
  showHomeIcon?: boolean;
}

const BackButtonVariants: React.FC<BackButtonVariantsProps> = ({
  variant = 'default',
  to,
  label = "Retour",
  className = "",
  showHomeIcon = false
}) => {
  const baseClasses = "flex items-center gap-2 transition-all duration-200";
  
  const variants = {
    default: {
      button: cn(
        baseClasses,
        "px-4 py-2 text-gray-700 hover:text-gray-900",
        "border border-gray-200 hover:border-gray-300",
        "bg-white hover:bg-gray-50",
        "shadow-sm hover:shadow-md rounded-lg",
        "hover:gap-3"
      ),
      icon: "w-4 h-4"
    },
    minimal: {
      button: cn(
        baseClasses,
        "px-3 py-1.5 text-gray-600 hover:text-gray-800",
        "hover:bg-gray-100 rounded-md",
        "hover:gap-2"
      ),
      icon: "w-3.5 h-3.5"
    },
    prominent: {
      button: cn(
        baseClasses,
        "px-5 py-2.5 text-white",
        "bg-gradient-to-r from-blue-600 to-purple-600",
        "hover:from-blue-700 hover:to-purple-700",
        "shadow-lg hover:shadow-xl rounded-lg",
        "hover:gap-3 transform hover:scale-105"
      ),
      icon: "w-4 h-4"
    },
    subtle: {
      button: cn(
        baseClasses,
        "px-3 py-1.5 text-gray-500 hover:text-gray-700",
        "border border-transparent hover:border-gray-200",
        "hover:bg-gray-50 rounded-md",
        "hover:gap-2"
      ),
      icon: "w-3.5 h-3.5"
    }
  };

  const selectedVariant = variants[variant];
  const isReturningToMainAdmin = to === '/admin' || to === '/admin/dashboard';
  const Icon = showHomeIcon && isReturningToMainAdmin ? Home : ArrowLeft;

  return (
    <Button
      variant="ghost"
      className={cn(selectedVariant.button, className)}
      onClick={() => {
        if (to) {
          window.history.pushState({}, '', to);
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
          window.history.back();
        }
      }}
    >
      <Icon className={selectedVariant.icon} />
      <span className="font-medium">{label}</span>
    </Button>
  );
};

export default BackButtonVariants;
