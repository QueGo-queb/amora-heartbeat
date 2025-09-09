import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Shield, 
  Award,
  Info,
  Zap
} from 'lucide-react';
import { useBadges } from '@/hooks/useBadges';
import { cn } from '@/lib/utils';

interface ReputationScoreProps {
  userId?: string;
  compact?: boolean;
  showDetails?: boolean;
}

const categoryIcons = {
  social: Users,
  activity: Calendar,
  quality: Shield,
  community: Award
};

const categoryLabels = {
  social: 'Social',
  activity: 'Activité',
  quality: 'Qualité',
  community: 'Communauté'
};

const categoryDescriptions = {
  social: 'Interactions et connexions avec la communauté',
  activity: 'Participation aux événements et création de contenu',
  quality: 'Qualité du contenu et comportement exemplaire',
  community: 'Contribution au bien-être de la communauté'
};

const getLevelColor = (level: number) => {
  if (level >= 20) return '#F59E0B'; // Gold
  if (level >= 15) return '#8B5CF6'; // Purple
  if (level >= 10) return '#3B82F6'; // Blue
  if (level >= 5) return '#10B981';  // Green
  return '#6B7280'; // Gray
};

const getLevelLabel = (level: number) => {
  if (level >= 20) return 'Légende';
  if (level >= 15) return 'Expert';
  if (level >= 10) return 'Avancé';
  if (level >= 5) return 'Confirmé';
  return 'Débutant';
};

export const ReputationScore: React.FC<ReputationScoreProps> = ({ 
  userId, 
  compact = false, 
  showDetails = true 
}) => {
  const { reputationScore, getReputationLevel, fetchReputationScore } = useBadges();

  React.useEffect(() => {
    if (userId) {
      fetchReputationScore(userId);
    }
  }, [userId, fetchReputationScore]);

  if (!reputationScore) {
    return (
      <Card className={cn(compact && "w-full max-w-sm")}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Pas encore de réputation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { level, progress, nextLevelAt, currentScore } = getReputationLevel();
  const levelColor = getLevelColor(level);
  const levelLabel = getLevelLabel(level);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-background border">
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: `${levelColor}20`, color: levelColor }}
              >
                <Award className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Niveau {level}</span>
                  <span className="text-xs text-muted-foreground">{currentScore} pts</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{levelLabel} - Niveau {level}</p>
              <p className="text-sm">{currentScore} / {nextLevelAt} points</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% vers le niveau suivant
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div 
            className="p-2 rounded-full"
            style={{ backgroundColor: `${levelColor}20`, color: levelColor }}
          >
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span>Réputation</span>
            <Badge 
              variant="secondary" 
              className="ml-2"
              style={{ backgroundColor: `${levelColor}20`, color: levelColor }}
            >
              {levelLabel}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Votre contribution à la communauté AMORA
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score total et niveau */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Niveau {level}</span>
            <span className="text-sm text-muted-foreground">
              {currentScore} / {nextLevelAt} points
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {nextLevelAt - currentScore} points pour le niveau suivant
          </p>
        </div>

        {/* Multiplicateur de score */}
        {reputationScore.score_multiplier > 1 && (
          <div className="flex items-center justify-center space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <Zap className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Multiplicateur actif: x{reputationScore.score_multiplier}
            </span>
          </div>
        )}

        {/* Détails par catégorie */}
        {showDetails && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium">Détail par catégorie</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Votre réputation est calculée selon vos contributions dans différents domaines
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(categoryLabels).map(([category, label]) => {
                const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
                const score = reputationScore[`${category}_score` as keyof typeof reputationScore] as number;
                const maxScore = Math.max(reputationScore.total_score * 0.4, 100); // Max 40% du total ou 100
                const percentage = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;

                return (
                  <TooltipProvider key={category}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-3 rounded-lg bg-muted/50 space-y-2 cursor-help">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium">{label}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">
                                {score} pts
                              </span>
                            </div>
                            <Progress value={percentage} className="h-1" />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                        </p>
                        <p className="text-xs mt-1">{score} points</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="pt-4 border-t space-y-2">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {reputationScore.positive_actions_count}
              </p>
              <p className="text-xs text-muted-foreground">Actions positives</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {reputationScore.negative_actions_count}
              </p>
              <p className="text-xs text-muted-foreground">Actions négatives</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};