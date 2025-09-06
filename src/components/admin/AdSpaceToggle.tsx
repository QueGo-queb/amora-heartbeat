import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAdSpaceVisibility } from '@/hooks/useAdSpaceVisibility';

interface AdSpaceToggleProps {
  className?: string;
}

const AdSpaceToggle: React.FC<AdSpaceToggleProps> = ({ className = '' }) => {
  const { isVisible, toggleVisibility } = useAdSpaceVisibility();

  return (
    <div className={`flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border ${className}`}>
      <div className="flex items-center space-x-2">
        <Switch
          id="ad-space-toggle"
          checked={isVisible}
          onCheckedChange={toggleVisibility}
          className="data-[state=checked]:bg-green-600"
        />
        <Label 
          htmlFor="ad-space-toggle" 
          className="text-sm font-medium cursor-pointer"
        >
          Espace Publicitaire
        </Label>
      </div>
      
      <Badge 
        variant={isVisible ? "default" : "secondary"}
        className={isVisible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
      >
        {isVisible ? "ACTIVÉ" : "DÉSACTIVÉ"}
      </Badge>
      
      <span className="text-xs text-muted-foreground ml-2">
        {isVisible 
          ? "L'espace publicitaire est visible sur le dashboard utilisateur" 
          : "L'espace publicitaire est caché sur le dashboard utilisateur"
        }
      </span>
    </div>
  );
};

export default AdSpaceToggle;
