import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Users, 
  Globe, 
  Languages, 
  Heart,
  Eye,
  Send,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SearchPostCreatorProps {
  open: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

interface SearchCriteria {
  ageMin: number;
  ageMax: number;
  countries: string[];
  languages: string[];
  interests: string[];
  genders: string[];
}

const AVAILABLE_COUNTRIES = [
  'Canada', 'France', 'États-Unis', 'Haïti', 'Chili', 'Brésil', 
  'Belgique', 'Suisse', 'Allemagne', 'Espagne', 'Italie', 'Royaume-Uni'
];

const AVAILABLE_LANGUAGES = [
  'Français', 'English', 'Español', 'Português', 'Deutsch', 'Italiano', 'Nederlands'
];

const AVAILABLE_INTERESTS = [
  'Voyage', 'Cuisine', 'Sport', 'Musique', 'Cinéma', 'Lecture', 'Art', 'Danse',
  'Photographie', 'Nature', 'Technologie', 'Mode', 'Fitness', 'Yoga', 'Méditation',
  'Langues', 'Culture', 'Histoire', 'Sciences', 'Entrepreneuriat'
];

const AVAILABLE_GENDERS = [
  { value: 'male', label: 'Hommes' },
  { value: 'female', label: 'Femmes' },
  { value: 'other', label: 'Autres' }
];

export function SearchPostCreator({ open, onClose, onPostCreated }: SearchPostCreatorProps) {
  const [content, setContent] = useState('');
  const [criteria, setCriteria] = useState<SearchCriteria>({
    ageMin: 18,
    ageMax: 99,
    countries: [],
    languages: [],
    interests: [],
    genders: []
  });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le contenu de votre recherche",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          post_type: 'search',
          target_age_min: criteria.ageMin,
          target_age_max: criteria.ageMax,
          target_countries: criteria.countries,
          target_languages: criteria.languages,
          target_interests: criteria.interests,
          target_genders: criteria.genders,
          visibility: 'public'
        });

      if (error) throw error;

      toast({
        title: "Publication de recherche créée",
        description: "Votre recherche a été publiée et sera visible par les personnes correspondant à vos critères",
      });

      // Reset form
      setContent('');
      setCriteria({
        ageMin: 18,
        ageMax: 99,
        countries: [],
        languages: [],
        interests: [],
        genders: []
      });
      setShowPreview(false);
      onClose();
      onPostCreated?.();
    } catch (error) {
      console.error('Erreur création publication recherche:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la publication de recherche",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToArray = (array: string[], item: string) => {
    if (!array.includes(item)) {
      return [...array, item];
    }
    return array;
  };

  const removeFromArray = (array: string[], item: string) => {
    return array.filter(i => i !== item);
  };

  const updateCriteria = (field: keyof SearchCriteria, value: any) => {
    setCriteria(prev => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Créer une publication de recherche
          </DialogTitle>
          <DialogDescription>
            Créez une publication ciblée pour trouver des personnes correspondant à vos critères spécifiques.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showPreview ? (
            <>
              {/* Contenu de la recherche */}
              <div className="space-y-2">
                <Label htmlFor="search-content" className="text-sm font-medium">
                  Description de votre recherche *
                </Label>
                <Textarea
                  id="search-content"
                  placeholder="Décrivez ce que vous recherchez... (ex: Je cherche des personnes passionnées de cuisine française pour échanger des recettes et organiser des sorties gastronomiques)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Separator />

              {/* Critères de ciblage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Âge */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      Tranche d'âge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="age-min" className="text-xs">Âge minimum</Label>
                        <Input
                          id="age-min"
                          type="number"
                          min="18"
                          max="99"
                          value={criteria.ageMin}
                          onChange={(e) => updateCriteria('ageMin', parseInt(e.target.value) || 18)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="age-max" className="text-xs">Âge maximum</Label>
                        <Input
                          id="age-max"
                          type="number"
                          min="18"
                          max="99"
                          value={criteria.ageMax}
                          onChange={(e) => updateCriteria('ageMax', parseInt(e.target.value) || 99)}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Âge: {criteria.ageMin} - {criteria.ageMax} ans
                    </div>
                  </CardContent>
                </Card>

                {/* Genre */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-600" />
                      Genre ciblé
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {AVAILABLE_GENDERS.map((gender) => (
                        <label key={gender.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={criteria.genders.includes(gender.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateCriteria('genders', addToArray(criteria.genders, gender.value));
                              } else {
                                updateCriteria('genders', removeFromArray(criteria.genders, gender.value));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{gender.label}</span>
                        </label>
                      ))}
                      {criteria.genders.length === 0 && (
                        <div className="text-xs text-muted-foreground">Tous les genres</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pays */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Pays ciblés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {criteria.countries.map((country) => (
                          <Badge key={country} variant="secondary" className="flex items-center gap-1">
                            {country}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-red-500" 
                              onClick={() => updateCriteria('countries', removeFromArray(criteria.countries, country))}
                            />
                          </Badge>
                        ))}
                      </div>
                      <select 
                        className="w-full p-2 border border-input rounded-md text-sm"
                        onChange={(e) => {
                          if (e.target.value) {
                            updateCriteria('countries', addToArray(criteria.countries, e.target.value));
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Ajouter un pays...</option>
                        {AVAILABLE_COUNTRIES.filter(c => !criteria.countries.includes(c)).map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      {criteria.countries.length === 0 && (
                        <div className="text-xs text-muted-foreground">Tous les pays</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Langues */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Languages className="w-4 h-4 text-purple-600" />
                      Langues parlées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {criteria.languages.map((language) => (
                          <Badge key={language} variant="secondary" className="flex items-center gap-1">
                            {language}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-red-500" 
                              onClick={() => updateCriteria('languages', removeFromArray(criteria.languages, language))}
                            />
                          </Badge>
                        ))}
                      </div>
                      <select 
                        className="w-full p-2 border border-input rounded-md text-sm"
                        onChange={(e) => {
                          if (e.target.value) {
                            updateCriteria('languages', addToArray(criteria.languages, e.target.value));
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Ajouter une langue...</option>
                        {AVAILABLE_LANGUAGES.filter(l => !criteria.languages.includes(l)).map((language) => (
                          <option key={language} value={language}>{language}</option>
                        ))}
                      </select>
                      {criteria.languages.length === 0 && (
                        <div className="text-xs text-muted-foreground">Toutes les langues</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Centres d'intérêt */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-orange-600" />
                    Centres d'intérêt ciblés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {criteria.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                          {interest}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-red-500" 
                            onClick={() => updateCriteria('interests', removeFromArray(criteria.interests, interest))}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {AVAILABLE_INTERESTS.filter(i => !criteria.interests.includes(i)).map((interest) => (
                        <Button
                          key={interest}
                          variant="outline"
                          size="sm"
                          className="text-xs justify-start h-auto py-2"
                          onClick={() => updateCriteria('interests', addToArray(criteria.interests, interest))}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {interest}
                        </Button>
                      ))}
                    </div>
                    {criteria.interests.length === 0 && (
                      <div className="text-xs text-muted-foreground">Tous les centres d'intérêt</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={!content.trim()}
                >
                  <Eye className="w-4 h-4" />
                  Prévisualiser
                </Button>
                <Button onClick={onClose} variant="outline">
                  Annuler
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Prévisualisation */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Search className="w-5 h-5" />
                    Prévisualisation de votre publication de recherche
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-800 leading-relaxed">{content}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">👥 Âge ciblé:</span> {criteria.ageMin}-{criteria.ageMax} ans
                    </div>
                    {criteria.genders.length > 0 && (
                      <div>
                        <span className="font-medium text-blue-700">💖 Genre:</span> {criteria.genders.join(', ')}
                      </div>
                    )}
                    {criteria.countries.length > 0 && (
                      <div>
                        <span className="font-medium text-blue-700">🌍 Pays:</span> {criteria.countries.join(', ')}
                      </div>
                    )}
                    {criteria.languages.length > 0 && (
                      <div>
                        <span className="font-medium text-blue-700">🗣️ Langues:</span> {criteria.languages.join(', ')}
                      </div>
                    )}
                    {criteria.interests.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-blue-700">❤️ Intérêts:</span> {criteria.interests.join(', ')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions de prévisualisation */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {loading ? 'Publication...' : 'Publier la recherche'}
                </Button>
                <Button 
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                >
                  Modifier
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}