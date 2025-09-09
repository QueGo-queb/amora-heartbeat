import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Heart, 
  X, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Info,
  Users,
  Activity,
  Target
} from 'lucide-react';
import { AISuggestion, useAISuggestions } from '@/hooks/useAISuggestions';
import { cn } from '@/lib/utils';

interface SuggestionCardProps {
  suggestion: AISuggestion;
  onLike?: (suggestion: AISuggestion) => void;
  onReject?: (suggestion: AISuggestion) => void;
  onViewProfile?: (suggestion: AISuggestion) => void;
  compact?: boolean;
}

const suggestionTypeLabels = {
  compatibility: 'Compatibilité',
  similar_interests: 'Intérêts similaires',
  activity_based: 'Activités communes',
  location_based: 'Proximité géographique',
  behavior_pattern: 'Comportement similaire'
};

const suggestionTypeIcons = {
  compatibility: Heart,
  similar_interests: Target,
  activity_based: Activity,
  location_based: MapPin,
  behavior_pattern: Users
};

const confidenceColors = {
  low: '#6B7280',
  medium: '#3B82F6',
  high: '#10B981'
};

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onLike,
  onReject,
  onViewProfile,
  compact = false
}) => {
  const { recordSuggestionInteraction, markSuggestionPresented } = useAISuggestions();
  
  const TypeIcon = suggestionTypeIcons[suggestion.suggestion_type];
  const confidenceColor = confidenceColors[suggestion.confidence_level];
  
  React.useEffect(() => {
    // Marquer comme présentée quand le composant se monte
    if (!suggestion.presented_at) {
      markSuggestionPresented(suggestion.id);
    }
  }, [suggestion.id, suggestion.presented_at, markSuggestionPresented]);

  const handleLike = async () => {
    await recordSuggestionInteraction(suggestion.id, 'liked', 'good_match');
    onLike?.(suggestion);
  };

  const handleReject = async () => {
    await recordSuggestionInteraction(suggestion.id, 'rejected', 'bad_match');
    onReject?.(suggestion);
  };

  const handleViewProfile = async () => {
    await recordSuggestionInteraction(suggestion.id, 'clicked');
    onViewProfile?.(suggestion);
  };

  if (compact) {
    return (
      <Card className="w-full max-w-sm cursor-pointer hover:shadow-md transition-shadow" onClick={handleViewProfile}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={suggestion.suggested_user?.avatar_url} />
              <AvatarFallback>
                {suggestion.suggested_user?.full_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {suggestion.suggested_user?.full_name || 'Profil privé'}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <TypeIcon className="h-3 w-3" />
                <span className="truncate">{suggestionTypeLabels[suggestion.suggestion_type]}</span>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ color: confidenceColor }}
                >
                  {Math.round(suggestion.compatibility_score * 100)}% compatible
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="relative pb-2">
        {/* Badge de type de suggestion */}
        <div className="absolute top-4 right-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge 
                  variant="outline" 
                  className="flex items-center space-x-1"
                  style={{ borderColor: confidenceColor, color: confidenceColor }}
                >
                  <TypeIcon className="h-3 w-3" />
                  <span className="text-xs">{suggestion.confidence_level}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{suggestionTypeLabels[suggestion.suggestion_type]}</p>
                <p className="text-xs">Confiance: {suggestion.confidence_level}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Photo de profil */}
        <div className="flex justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={suggestion.suggested_user?.avatar_url} />
            <AvatarFallback className="text-lg">
              {suggestion.suggested_user?.full_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
        </div>

        <CardTitle className="text-center text-lg">
          {suggestion.suggested_user?.full_name || 'Profil privé'}
        </CardTitle>
        
        <CardDescription className="text-center">
          {suggestion.suggested_user?.age && `${suggestion.suggested_user.age} ans`}
          {suggestion.suggested_user?.city && ` • ${suggestion.suggested_user.city}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score de compatibilité */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Compatibilité</span>
            <span className="text-sm font-bold" style={{ color: confidenceColor }}>
              {Math.round(suggestion.compatibility_score * 100)}%
            </span>
          </div>
          <Progress 
            value={suggestion.compatibility_score * 100} 
            className="h-2"
          />
        </div>

        {/* Facteurs de matching */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {suggestion.interest_similarity > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Intérêts</span>
              <span className="font-medium">{Math.round(suggestion.interest_similarity * 100)}%</span>
            </div>
          )}
          {suggestion.activity_compatibility > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Activités</span>
              <span className="font-medium">{Math.round(suggestion.activity_compatibility * 100)}%</span>
            </div>
          )}
          {suggestion.age_compatibility > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Âge</span>
              <span className="font-medium">{Math.round(suggestion.age_compatibility * 100)}%</span>
            </div>
          )}
          {suggestion.location_proximity > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Proximité</span>
              <span className="font-medium">{Math.round(suggestion.location_proximity * 100)}%</span>
            </div>
          )}
        </div>

        {/* Explication IA */}
        {suggestion.ai_explanation && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                {suggestion.ai_explanation}
              </p>
            </div>
          </div>
        )}

        {/* Bio courte */}
        {suggestion.suggested_user?.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {suggestion.suggested_user.bio}
          </p>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleReject}
          >
            <X className="h-4 w-4 mr-1" />
            Passer
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleViewProfile}
          >
            <Info className="h-4 w-4 mr-1" />
            Voir
          </Button>
          
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
            onClick={handleLike}
          >
            <Heart className="h-4 w-4 mr-1" />
            J'aime
          </Button>
        </div>

        {/* Raison de la suggestion */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Suggéré car: {suggestion.suggestion_reason}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
