import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAdSpace } from '@/hooks/useAdSpace';
import { 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Settings,
  Megaphone
} from 'lucide-react';

const AdSpaceControl = () => {
  const { config, loading, error, toggleAdSpace, updateConfig, refresh } = useAdSpace();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Initialiser les champs d'édition
  const startEditing = () => {
    if (config) {
      setEditTitle(config.title);
      setEditDescription(config.description);
      setIsEditing(true);
    }
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!config) return;

    const result = await updateConfig({
      title: editTitle,
      description: editDescription
    });

    if (result.success) {
      toast({
        title: "Configuration sauvegardée",
        description: "L'espace publicitaire a été mis à jour avec succès.",
      });
      setIsEditing(false);
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration.",
        variant: "destructive",
      });
    }
  };

  // Basculer l'état on/off
  const handleToggle = async () => {
    const result = await toggleAdSpace();
    
    if (result.success) {
      toast({
        title: config?.is_enabled ? "Publicité désactivée" : "Publicité activée",
        description: config?.is_enabled 
          ? "L'espace publicitaire est maintenant masqué." 
          : "L'espace publicitaire est maintenant visible.",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'état de la publicité.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="culture-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-purple-300 border-t-transparent rounded-full animate-spin mr-2" />
            Chargement de la configuration...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="culture-card">
        <CardContent className="pt-6 text-center">
          <div className="text-red-600 mb-4">Erreur: {error}</div>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card className="culture-card">
        <CardContent className="pt-6 text-center">
          <div className="text-gray-600 mb-4">Aucune configuration trouvée</div>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Initialiser
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="culture-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-purple-600" />
          Contrôle de l'Espace Publicitaire
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statut actuel */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {config.is_enabled ? (
              <Eye className="w-5 h-5 text-green-600" />
            ) : (
              <EyeOff className="w-5 h-5 text-red-600" />
            )}
            <div>
              <div className="font-medium">
                Statut: {config.is_enabled ? 'Activé' : 'Désactivé'}
              </div>
              <div className="text-sm text-gray-500">
                Dernière mise à jour: {new Date(config.updated_at).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
          <Badge variant={config.is_enabled ? "default" : "secondary"}>
            {config.is_enabled ? "VISIBLE" : "MASQUÉ"}
          </Badge>
        </div>

        {/* Contrôle on/off */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-3">
            <ToggleLeft className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-medium text-purple-800">
                Contrôle d'affichage
              </div>
              <div className="text-sm text-purple-600">
                {config.is_enabled 
                  ? "L'espace publicitaire est visible sur le dashboard" 
                  : "L'espace publicitaire est masqué sur le dashboard"
                }
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={config.is_enabled}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-purple-600"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              className="flex items-center gap-2"
            >
              {config.is_enabled ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Masquer
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Afficher
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Configuration du contenu */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Configuration du contenu</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={isEditing ? () => setIsEditing(false) : startEditing}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <Label htmlFor="ad-title">Titre de l'espace</Label>
                <Input
                  id="ad-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Titre de l'espace publicitaire"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ad-description">Description</Label>
                <Textarea
                  id="ad-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description de l'espace publicitaire"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-2">
                <span className="font-medium">Titre:</span> {config.title}
              </div>
              <div>
                <span className="font-medium">Description:</span> {config.description}
              </div>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button 
            onClick={() => window.open('/dashboard', '_blank')} 
            variant="outline" 
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir le Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdSpaceControl;
