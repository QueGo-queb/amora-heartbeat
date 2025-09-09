import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Sparkles, 
  Settings, 
  Eye, 
  Clock,
  Target,
  Activity,
  MapPin,
  BarChart3,
  Info
} from 'lucide-react';
import { useAISuggestions, AIPreferences } from '@/hooks/useAISuggestions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIPreferencesProps {
  onSave?: () => void;
}

export const AIPreferencesComponent: React.FC<AIPreferencesProps> = ({ onSave }) => {
  const { preferences, updatePreferences, loading } = useAISuggestions();
  
  const [localPreferences, setLocalPreferences] = React.useState<Partial<AIPreferences>>({});
  const [hasChanges, setHasChanges] = React.useState(false);

  React.useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handlePreferenceChange = (key: keyof AIPreferences, value: any) => {
    setLocalPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await updatePreferences(localPreferences);
    if (success) {
      setHasChanges(false);
      onSave?.();
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences(preferences);
      setHasChanges(false);
    }
  };

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modération automatique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Modération automatique</span>
          </CardTitle>
          <CardDescription>
            Configurez comment l'IA modère automatiquement le contenu pour votre sécurité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activation de la modération */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Modération IA activée</Label>
              <p className="text-sm text-muted-foreground">
                Analyse automatique du contenu pour détecter les messages inappropriés
              </p>
            </div>
            <Switch
              checked={localPreferences.auto_moderation_enabled ?? true}
              onCheckedChange={(checked) => handlePreferenceChange('auto_moderation_enabled', checked)}
            />
          </div>

          {/* Sensibilité de modération */}
          {localPreferences.auto_moderation_enabled && (
            <div className="space-y-3">
              <Label className="text-base">Sensibilité de détection</Label>
              <Select
                value={localPreferences.moderation_sensitivity || 'medium'}
                onValueChange={(value) => handlePreferenceChange('moderation_sensitivity', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="space-y-1">
                      <div className="font-medium">Faible</div>
                      <div className="text-xs text-muted-foreground">Détecte uniquement le contenu très inapproprié</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="space-y-1">
                      <div className="font-medium">Moyenne (recommandé)</div>
                      <div className="text-xs text-muted-foreground">Équilibre entre sécurité et liberté d'expression</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="space-y-1">
                      <div className="font-medium">Élevée</div>
                      <div className="text-xs text-muted-foreground">Détection stricte, peut flaguer du contenu légitime</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Suggestions intelligentes</span>
          </CardTitle>
          <CardDescription>
            Personnalisez les recommandations de profils basées sur l'intelligence artificielle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activation des suggestions */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Suggestions IA activées</Label>
              <p className="text-sm text-muted-foreground">
                Recevez des recommandations de profils personnalisées
              </p>
            </div>
            <Switch
              checked={localPreferences.ai_suggestions_enabled ?? true}
              onCheckedChange={(checked) => handlePreferenceChange('ai_suggestions_enabled', checked)}
            />
          </div>

          {localPreferences.ai_suggestions_enabled && (
            <>
              {/* Fréquence des suggestions */}
              <div className="space-y-3">
                <Label className="text-base">Fréquence des suggestions</Label>
                <Select
                  value={localPreferences.suggestion_frequency || 'daily'}
                  onValueChange={(value) => handlePreferenceChange('suggestion_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Jamais</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="daily">Quotidienne (recommandé)</SelectItem>
                    <SelectItem value="real_time">Temps réel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nombre maximum de suggestions par jour */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Suggestions par jour</Label>
                  <Badge variant="secondary">
                    {localPreferences.max_suggestions_per_day || 5}
                  </Badge>
                </div>
                <Slider
                  value={[localPreferences.max_suggestions_per_day || 5]}
                  onValueChange={([value]) => handlePreferenceChange('max_suggestions_per_day', value)}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Plus de suggestions = plus de choix, mais peut être moins précis
                </p>
              </div>

              <Separator />

              {/* Types de suggestions */}
              <div className="space-y-4">
                <Label className="text-base">Types de suggestions désirées</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Target className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Compatibilité</p>
                        <p className="text-xs text-muted-foreground">Basé sur la personnalité</p>
                      </div>
                    </div>
                    <Switch
                      checked={localPreferences.want_compatibility_suggestions ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange('want_compatibility_suggestions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Target className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">Intérêts similaires</p>
                        <p className="text-xs text-muted-foreground">Hobbies et passions</p>
                      </div>
                    </div>
                    <Switch
                      checked={localPreferences.want_interest_suggestions ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange('want_interest_suggestions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="font-medium text-sm">Activités communes</p>
                        <p className="text-xs text-muted-foreground">Événements et sorties</p>
                      </div>
                    </div>
                    <Switch
                      checked={localPreferences.want_activity_suggestions ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange('want_activity_suggestions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium text-sm">Proximité géographique</p>
                        <p className="text-xs text-muted-foreground">Utilisateurs proches</p>
                      </div>
                    </div>
                    <Switch
                      checked={localPreferences.want_location_suggestions ?? false}
                      onCheckedChange={(checked) => handlePreferenceChange('want_location_suggestions', checked)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confidentialité et données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Confidentialité des données</span>
          </CardTitle>
          <CardDescription>
            Contrôlez comment vos données sont utilisées pour améliorer les services IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Analyse comportementale</Label>
              <p className="text-sm text-muted-foreground">
                Permettre l'analyse de votre comportement pour de meilleures suggestions
              </p>
            </div>
            <Switch
              checked={localPreferences.allow_behavior_analysis ?? true}
              onCheckedChange={(checked) => handlePreferenceChange('allow_behavior_analysis', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Suivi des interactions</Label>
              <p className="text-sm text-muted-foreground">
                Suivre vos interactions pour améliorer les algorithmes de matching
              </p>
            </div>
            <Switch
              checked={localPreferences.allow_interaction_tracking ?? true}
              onCheckedChange={(checked) => handlePreferenceChange('allow_interaction_tracking', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Partage de données anonymes</Label>
              <p className="text-sm text-muted-foreground">
                Contribuer à l'amélioration d'AMORA avec des données anonymisées
              </p>
            </div>
            <Switch
              checked={localPreferences.share_anonymous_data ?? true}
              onCheckedChange={(checked) => handlePreferenceChange('share_anonymous_data', checked)}
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Vos données sont protégées</p>
                <p className="text-xs">
                  Toutes les données sont anonymisées et chiffrées. Nous ne partageons jamais 
                  d'informations personnelles avec des tiers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {hasChanges && "Vous avez des modifications non sauvegardées"}
        </div>
        
        <div className="flex space-x-3">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              Annuler
            </Button>
          )}
          
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || loading}
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
          </Button>
        </div>
      </div>
    </div>
  );
};