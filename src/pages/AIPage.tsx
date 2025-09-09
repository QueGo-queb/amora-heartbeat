import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Settings, Shield, RefreshCw, Users, Brain } from 'lucide-react';
import { SuggestionCard } from '@/components/ai/SuggestionCard';
import { AIPreferencesComponent } from '@/components/ai/AIPreferences';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { SkipLinks } from '@/components/a11y/SkipLinks';

export const AIPage: React.FC = () => {
  const { 
    suggestions, 
    preferences, 
    loading, 
    generateNewSuggestions,
    hasSuggestions,
    activeSuggestionsCount 
  } = useAISuggestions();

  const [selectedSuggestion, setSelectedSuggestion] = React.useState<string | null>(null);

  const handleLikeSuggestion = (suggestion: any) => {
    // Ici on pourrait rediriger vers la page de profil ou ouvrir une conversation
    console.log('Liked suggestion:', suggestion);
  };

  const handleRejectSuggestion = (suggestion: any) => {
    // La suggestion sera automatiquement retirée de la liste
    console.log('Rejected suggestion:', suggestion);
  };

  const handleViewProfile = (suggestion: any) => {
    // Rediriger vers le profil
    console.log('View profile:', suggestion);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <SkipLinks />
      
      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <span>IA & Suggestions</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez des profils compatibles grâce à notre intelligence artificielle avancée
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions actives</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuggestionsCount}</div>
            <p className="text-xs text-muted-foreground">
              Profils recommandés pour vous
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modération IA</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {preferences?.auto_moderation_enabled ? 'ON' : 'OFF'}
            </div>
            <p className="text-xs text-muted-foreground">
              Protection automatique activée
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Préférences</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {preferences?.suggestion_frequency || 'daily'}
            </div>
            <p className="text-xs text-muted-foreground">
              Fréquence des suggestions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="suggestions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suggestions" className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>Suggestions ({activeSuggestionsCount})</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Préférences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-6">
          {/* Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Profils suggérés pour vous</h2>
              <p className="text-muted-foreground">
                Basé sur vos intérêts, comportement et préférences
              </p>
            </div>
            
            <Button 
              onClick={generateNewSuggestions}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          {/* Liste des suggestions */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : hasSuggestions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onLike={handleLikeSuggestion}
                  onReject={handleRejectSuggestion}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Aucune suggestion disponible</h3>
                <p className="text-muted-foreground mb-6">
                  L'IA analyse votre profil pour vous proposer des personnes compatibles.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                  <p>💡 Complétez votre profil pour de meilleures suggestions</p>
                  <p>💬 Interagissez avec la communauté</p>
                  <p>🎯 Participez aux événements</p>
                </div>
                <Button onClick={generateNewSuggestions} disabled={loading}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer des suggestions
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <AIPreferencesComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};