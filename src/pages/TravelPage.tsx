import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, MapPin, Users, Settings, Plus } from 'lucide-react';
import { TravelModeCard } from '@/components/travel/TravelModeCard';
import { TravelSessionSetup } from '@/components/travel/TravelSessionSetup';
import { TravelMatches } from '@/components/travel/TravelMatches';
import { useTravelMode } from '@/hooks/useTravelMode';
import { SkipLinks } from '@/components/a11y/SkipLinks';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const TravelPage: React.FC = () => {
  const { 
    currentSession, 
    isTravelModeActive, 
    travelMatches, 
    deactivateTravelMode,
    loading 
  } = useTravelMode();

  const [showSetup, setShowSetup] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const handleActivateTravel = () => {
    setShowSetup(true);
  };

  const handleSetupSuccess = () => {
    setShowSetup(false);
  };

  const handleDeactivateTravel = async () => {
    const success = await deactivateTravelMode();
    if (success) {
      setShowDeactivateDialog(false);
    }
  };

  const handleMatchClick = (match: any) => {
    console.log('View match profile:', match);
    // Ici on redirigerait vers le profil
  };

  const handleLikeMatch = (match: any) => {
    console.log('Like match:', match);
    // Ici on enverrait un like
  };

  const handleMessageMatch = (match: any) => {
    console.log('Message match:', match);
    // Ici on ouvrirait la conversation
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <SkipLinks />
      
      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center space-x-2">
          <Plane className="h-8 w-8 text-primary" />
          <span>Mode Voyage</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connectez-vous avec des locaux et d'autres voyageurs dans votre prochaine destination
        </p>
      </div>

      {/* Configuration de voyage */}
      {showSetup && (
        <div className="mb-8">
          <TravelSessionSetup 
            onSuccess={handleSetupSuccess}
            onCancel={() => setShowSetup(false)}
          />
        </div>
      )}

      {!showSetup && (
        <>
          {/* Carte de session actuelle */}
          <div className="mb-8">
            <TravelModeCard
              session={currentSession || undefined}
              onActivate={handleActivateTravel}
              onManage={() => setShowSetup(true)}
              onDeactivate={() => setShowDeactivateDialog(true)}
            />
          </div>

          {/* Contenu principal */}
          {isTravelModeActive ? (
            <Tabs defaultValue="matches" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="matches" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Matchs ({travelMatches.length})</span>
                </TabsTrigger>
                <TabsTrigger value="session" className="flex items-center space-x-2">
                  <Plane className="h-4 w-4" />
                  <span>Ma session</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Préférences</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matches" className="space-y-6">
                <TravelMatches
                  matches={travelMatches}
                  onMatchClick={handleMatchClick}
                  onLikeMatch={handleLikeMatch}
                  onMessageMatch={handleMessageMatch}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="session" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Détails de votre session</CardTitle>
                    <CardDescription>
                      Gérez votre session de voyage active
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentSession && (
                      <TravelModeCard
                        session={currentSession}
                        onManage={() => setShowSetup(true)}
                        onDeactivate={() => setShowDeactivateDialog(true)}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Préférences de voyage</CardTitle>
                    <CardDescription>
                      Configurez vos préférences pour le mode voyage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Fonctionnalité en cours de développement...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Plane className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Mode voyage désactivé</h3>
                <p className="text-muted-foreground mb-6">
                  Activez le mode voyage pour découvrir des personnes dans votre prochaine destination
                </p>
                <Button onClick={handleActivateTravel} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Planifier un voyage
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Dialog de confirmation de désactivation */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Désactiver le mode voyage ?</DialogTitle>
            <DialogDescription>
              Votre session de voyage sera terminée et vous ne serez plus visible dans cette destination.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleDeactivateTravel} disabled={loading}>
              {loading ? 'Désactivation...' : 'Désactiver'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};