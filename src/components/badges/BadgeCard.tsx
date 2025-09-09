import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, EyeOff, Star, Trophy, Crown, Gem, Award } from 'lucide-react';
import { UserBadge, useBadges } from '@/hooks/useBadges';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BadgeCardProps {
  userBadge: UserBadge;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'inline' | 'minimal';
}

const rarityIcons = {
  common: Award,
  uncommon: Star,
  rare: Trophy,
  epic: Crown,
  legendary: Gem
};

const raritySizes = {
  sm: {
    card: 'w-16 h-20',
    icon: 'h-6 w-6',
    text: 'text-xs'
  },
  md: {
    card: 'w-20 h-24',
    icon: 'h-8 w-8',
    text: 'text-sm'
  },
  lg: {
    card: 'w-24 h-28',
    icon: 'h-10 w-10',
    text: 'text-base'
  }
};

export const BadgeCard: React.FC<BadgeCardProps> = ({ 
  userBadge, 
  showControls = false, 
  size = 'md',
  variant = 'card'
}) => {
  const { updateBadgeDisplay, getRarityColor } = useBadges();
  const { badge_type: badge } = userBadge;
  
  const RarityIcon = rarityIcons[badge.rarity];
  const sizes = raritySizes[size];
  const rarityColor = getRarityColor(badge.rarity);

  const handleToggleDisplay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateBadgeDisplay(userBadge.id, !userBadge.is_displayed);
  };

  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "inline-flex items-center justify-center rounded-full p-2 transition-transform hover:scale-110",
                sizes.card
              )}
              style={{ 
                backgroundColor: badge.background_hex,
                borderColor: rarityColor,
                borderWidth: '2px'
              }}
            >
              <RarityIcon 
                className={cn(sizes.icon)}
                style={{ color: badge.color_hex }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{badge.display_name}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
              <p className="text-xs">
                Obtenu le {format(new Date(userBadge.awarded_at), 'PP', { locale: fr })}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <Badge 
        variant="secondary" 
        className="flex items-center space-x-1"
        style={{ 
          backgroundColor: badge.background_hex,
          borderColor: rarityColor,
          color: badge.color_hex
        }}
      >
        <RarityIcon className="h-3 w-3" />
        <span className="text-xs">{badge.display_name}</span>
      </Badge>
    );
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer",
        sizes.card,
        !userBadge.is_displayed && "opacity-60"
      )}
      style={{ borderColor: rarityColor, borderWidth: '2px' }}
    >
      <CardContent className="p-2 h-full flex flex-col items-center justify-center space-y-1">
        {/* Badge rarity indicator */}
        <div className="absolute top-1 right-1">
          <Badge 
            variant="outline" 
            className="text-xs px-1 py-0"
            style={{ 
              borderColor: rarityColor,
              color: rarityColor,
              backgroundColor: `${rarityColor}10`
            }}
          >
            {badge.rarity}
          </Badge>
        </div>

        {/* Badge icon */}
        <div 
          className={cn(
            "rounded-full p-2 mb-1",
            sizes.card
          )}
          style={{ backgroundColor: badge.background_hex }}
        >
          <RarityIcon 
            className={cn(sizes.icon)}
            style={{ color: badge.color_hex }}
          />
        </div>

        {/* Badge name */}
        <h4 className={cn("font-semibold text-center leading-tight", sizes.text)}>
          {badge.display_name}
        </h4>

        {/* Badge description (tooltip) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className={cn("text-center text-muted-foreground line-clamp-2", sizes.text)}>
                {badge.description}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs space-y-2">
                <p className="font-semibold">{badge.display_name}</p>
                <p className="text-sm">{badge.description}</p>
                {userBadge.award_reason && (
                  <p className="text-xs text-muted-foreground">
                    Raison: {userBadge.award_reason}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Obtenu le {format(new Date(userBadge.awarded_at), 'PPP', { locale: fr })}
                </p>
                <Badge variant="outline" style={{ borderColor: rarityColor, color: rarityColor }}>
                  {badge.rarity} • {badge.category}
                </Badge>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Controls */}
        {showControls && (
          <div className="absolute bottom-1 left-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleDisplay}
              className="h-6 w-6 p-0"
            >
              {userBadge.is_displayed ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
