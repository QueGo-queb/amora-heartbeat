import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

const Profile = () => {
  const { profile, loading, error, refreshProfile, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fonction de rafraîchissement avec indicateur visuel
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
      toast({
        title: t.profileUpdated,
        description: t.profileUpdatedDesc,
      });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      toast({
        title: t.profileError,
        description: t.profileErrorDesc,
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Gestion des mises à jour du profil
  const handleProfileUpdate = async (updatedProfile: any) => {
    try {
      console.log('🔧 Mise à jour réussie !');
      
      // Mettre à jour le profil via le hook
      if (updateProfile) {
        await updateProfile(updatedProfile);
      }
      
      // Afficher le toast de succès
      toast({
        title: "✅ Profil mis à jour",
        description: "Vos modifications ont été sauvegardées.",
      });
      
      setIsEditing(false);
      
      // Rafraîchir le profil pour afficher les nouvelles données
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
          <span>{t.loadingProfile}</span>
        </div>
      </div>
    );
  }

  // Affichage des erreurs avec bouton de rafraîchissement
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="culture-card max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.profileLoadError}</h3>
            <p className="text-muted-foreground mb-4">
              <span data-translate="notranslate">{error}</span> || Impossible de récupérer les données de votre profil.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
                {refreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Actualisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </>
                )}
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Retour au Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="heart-logo">
              <div className="heart-shape" />
            </div>
            <span className="text-2xl font-bold gradient-text">AMORA</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-9 w-9"
              title="Actualiser le profil"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="h-9 w-9"
              title="Modifier le profil"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Informations du profil en lecture seule */}
          {!isEditing && (
            <div className="space-y-6">
              {/* En-tête du profil */}
              <Card className="culture-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t.myProfile}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nom complet</label>
                      <p className="text-gray-900 font-medium">{profile.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Plan</label>
                      <p className="text-gray-900">
                        {profile.plan === 'premium' ? (
                          <span className="inline-flex items-center gap-1 text-yellow-600 font-medium">
                            <span>👑</span> Premium
                          </span>
                        ) : (
                          <span className="text-gray-600">Gratuit</span>
                        )}
                      </p>
                    </div>
                    {profile.bio && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Bio</label>
                        <p className="text-gray-900">{profile.bio}</p>
                      </div>
                    )}
                    {profile.location && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Localisation</label>
                        <p className="text-gray-900">{profile.location}</p>
                      </div>
                    )}
                    {profile.age && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Âge</label>
                        <p className="text-gray-900">{profile.age} ans</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Intérêts */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Centres d'intérêt ({profile.interests.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bouton pour passer en mode édition */}
              <div className="text-center">
                <Button onClick={() => setIsEditing(true)} className="px-6">
                  <Settings className="w-4 h-4 mr-2" />
                  {t.editProfile}
                </Button>
              </div>
            </div>
          )}

          {/* Éditeur de profil */}
          {isEditing && (
            <ProfileEditor
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
              onCancel={handleCancel}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;