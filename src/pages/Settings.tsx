import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Crown,
  CreditCard,
  Save,
  Camera,
  Mail,
  MapPin,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/usePremium';
import { PremiumUpgradeModal } from '@/components/settings/PremiumUpgradeModal';
import { AccountDeletionModal } from '@/components/settings/AccountDeletionModal';

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    matchNotifications: true,
    messageNotifications: true,
    language: 'fr',
    visibility: 'public',
    showAge: true,
    showLocation: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPremium, plan, loading: premiumLoading } = usePremium();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);

      // Charger le profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setProfile(profile);
        // Charger les paramètres depuis le profil
        setSettings(prev => ({
          ...prev,
          language: profile.language || 'fr',
          // Autres paramètres depuis le profil
        }));
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          language: settings.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour",
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradeToPremium = () => {
    setShowPremiumModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  if (loading || premiumLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="heart-logo">
            <div className="heart-shape animate-pulse" />
          </div>
          <span className="text-lg">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold">Paramètres</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Plan actuel */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Mon abonnement
                </div>
                <Badge 
                  variant={isPremium ? "default" : "secondary"}
                  className={isPremium ? "bg-yellow-100 text-yellow-800" : ""}
                >
                  {isPremium ? "Premium" : "Gratuit"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      {isPremium ? "Amora Premium" : "Amora Gratuit"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isPremium 
                        ? "Profitez de toutes les fonctionnalités premium" 
                        : "Accès limité aux fonctionnalités de base"
                      }
                    </p>
                  </div>
                  {!isPremium && (
                    <Button 
                      onClick={handleUpgradeToPremium}
                      className="btn-hero"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Passer au Premium
                    </Button>
                  )}
                </div>

                {isPremium && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl mb-1">💬</div>
                      <div className="text-sm font-medium">Messages illimités</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl mb-1">📱</div>
                      <div className="text-sm font-medium">Posts enrichis</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl mb-1">⭐</div>
                      <div className="text-sm font-medium">Profil mis en avant</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl mb-1">🔍</div>
                      <div className="text-sm font-medium">Recherche avancée</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations du profil */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations du profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    value={profile?.full_name || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Parlez-nous de vous..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={profile?.location || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ville, Pays"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile?.age || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    min="18"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Préférences */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Préférences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ht">Kreyòl</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilité du profil</Label>
                <Select 
                  value={settings.visibility} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Amis seulement</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Afficher mon âge</Label>
                    <p className="text-sm text-gray-500">Les autres utilisateurs peuvent voir votre âge</p>
                  </div>
                  <Switch
                    checked={settings.showAge}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showAge: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Afficher ma localisation</Label>
                    <p className="text-sm text-gray-500">Les autres utilisateurs peuvent voir votre ville</p>
                  </div>
                  <Switch
                    checked={settings.showLocation}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLocation: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications push</Label>
                  <p className="text-sm text-gray-500">Recevoir des notifications sur votre appareil</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-gray-500">Recevoir des emails pour les événements importants</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouveaux matches</Label>
                  <p className="text-sm text-gray-500">Être notifié des nouveaux matches</p>
                </div>
                <Switch
                  checked={settings.matchNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, matchNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouveaux messages</Label>
                  <p className="text-sm text-gray-500">Être notifié des nouveaux messages</p>
                </div>
                <Switch
                  checked={settings.messageNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, messageNotifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sécurité et confidentialité */}
          <Card className="culture-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sécurité et confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start border-[#CED4DA] text-[#212529] hover:bg-[#52B788] hover:text-white hover:border-[#52B788]"
              >
                <Shield className="w-4 h-4 mr-2" />
                Changer le mot de passe
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start border-[#CED4DA] text-[#212529] hover:bg-[#52B788] hover:text-white hover:border-[#52B788]"
              >
                <Mail className="w-4 h-4 mr-2" />
                Gérer les emails
              </Button>
              
              {/* BOUTON SUPPRIMER COMPTE - FONCTIONNEL */}
              <Button 
                onClick={handleDeleteAccount}
                variant="outline" 
                className="w-full justify-start border-[#E63946]/30 text-[#E63946] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-all duration-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Fermer définitivement mon compte
              </Button>
            </CardContent>
          </Card>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="btn-hero"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Premium */}
      <PremiumUpgradeModal 
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        userCountry={profile?.country}
      />

      {/* Modal de suppression de compte */}
      <AccountDeletionModal 
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={user?.email}
      />
    </div>
  );
};

export default Settings;
