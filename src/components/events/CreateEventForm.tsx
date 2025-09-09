import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addHours, addDays } from 'date-fns';
import { Calendar, Clock, Users, Tag, Image, Link, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEvents } from '@/hooks/useEvents';

const eventFormSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  event_type: z.enum(['speed_dating', 'group_chat', 'virtual_date', 'workshop', 'meetup', 'game_night', 'discussion']),
  start_time: z.string().min(1, 'La date de début est obligatoire'),
  end_time: z.string().min(1, 'La date de fin est obligatoire'),
  max_participants: z.number()
    .min(2, 'Il faut au moins 2 participants')
    .max(500, 'Maximum 500 participants'),
  min_participants: z.number()
    .min(2, 'Il faut au moins 2 participants minimum'),
  age_min: z.number()
    .min(18, 'Âge minimum : 18 ans')
    .max(100, 'Âge maximum : 100 ans')
    .optional(),
  age_max: z.number()
    .min(18, 'Âge minimum : 18 ans')
    .max(100, 'Âge maximum : 100 ans')
    .optional(),
  gender_restriction: z.enum(['none', 'women_only', 'men_only', 'non_binary_inclusive']).optional(),
  virtual_room_url: z.string().url('URL invalide').optional().or(z.literal('')),
  cover_image_url: z.string().url('URL invalide').optional().or(z.literal('')),
  is_public: z.boolean(),
  requires_approval: z.boolean(),
  tags: z.array(z.string()).optional(),
}).refine((data) => {
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  return end > start;
}, {
  message: "La date de fin doit être après la date de début",
  path: ["end_time"],
}).refine((data) => {
  if (data.age_min && data.age_max) {
    return data.age_max >= data.age_min;
  }
  return true;
}, {
  message: "L'âge maximum doit être supérieur ou égal à l'âge minimum",
  path: ["age_max"],
}).refine((data) => {
  return data.max_participants >= data.min_participants;
}, {
  message: "Le nombre maximum de participants doit être supérieur ou égal au minimum",
  path: ["max_participants"],
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface CreateEventFormProps {
  onSuccess?: () => void;
}

const eventTypeOptions = [
  { value: 'speed_dating', label: 'Speed Dating', description: 'Rencontres rapides entre participants' },
  { value: 'group_chat', label: 'Discussion de groupe', description: 'Conversation ouverte sur un thème' },
  { value: 'virtual_date', label: 'Rendez-vous virtuel', description: 'Rencontre en tête-à-tête virtuelle' },
  { value: 'workshop', label: 'Atelier', description: 'Session d\'apprentissage interactive' },
  { value: 'meetup', label: 'Rencontre communautaire', description: 'Rassemblement informel de la communauté' },
  { value: 'game_night', label: 'Soirée jeux', description: 'Jeux en ligne et activités ludiques' },
  { value: 'discussion', label: 'Discussion thématique', description: 'Débat ou échange sur un sujet précis' },
];

const genderRestrictionOptions = [
  { value: 'none', label: 'Aucune restriction' },
  { value: 'women_only', label: 'Femmes uniquement' },
  { value: 'men_only', label: 'Hommes uniquement' },
  { value: 'non_binary_inclusive', label: 'Inclusif non-binaire' },
];

const popularTags = [
  'rencontres', 'casual', 'sérieux', 'lgbtq+', 'professionnel', 'créatif', 
  'sport', 'musique', 'art', 'technologie', 'cuisine', 'voyage',
  'lecture', 'films', 'fitness', 'mindfulness', 'entrepreneuriat'
];

export const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSuccess }) => {
  const { createEvent, loading } = useEvents();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      event_type: 'meetup',
      start_time: format(addHours(new Date(), 24), 'yyyy-MM-dd\'T\'HH:mm'),
      end_time: format(addHours(new Date(), 25), 'yyyy-MM-dd\'T\'HH:mm'),
      max_participants: 20,
      min_participants: 3,
      is_public: true,
      requires_approval: false,
      gender_restriction: 'none',
      tags: [],
    },
  });

  const onSubmit = async (data: EventFormData) => {
    const eventData = {
      ...data,
      tags: selectedTags,
      virtual_room_url: data.virtual_room_url || undefined,
      cover_image_url: data.cover_image_url || undefined,
      age_min: data.age_min || undefined,
      age_max: data.age_max || undefined,
    };

    const success = await createEvent(eventData);
    if (success) {
      onSuccess?.();
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      handleAddTag(customTag.trim().toLowerCase());
      setCustomTag('');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Informations de base</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Informations essentielles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de l'événement *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ex: Soirée Speed Dating 25-35 ans"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez votre événement, le déroulement, ce que les participants peuvent attendre..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Une bonne description attire plus de participants (max 2000 caractères)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'événement *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisissez le type d'événement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-muted-foreground">{option.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date et heure de début *</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date et heure de fin *</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Participants et restrictions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_participants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Participants minimum *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="2"
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Nombre minimum pour maintenir l'événement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_participants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Participants maximum *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="2"
                            max="500"
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Limite d'inscription à l'événement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Âge minimum</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="18"
                            max="100"
                            placeholder="18"
                            {...field} 
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Âge maximum</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="18"
                            max="100"
                            placeholder="99"
                            {...field} 
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="gender_restriction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restriction de genre</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une restriction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genderRestrictionOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Définir qui peut participer à l'événement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Tags et catégories</span>
                </CardTitle>
                <CardDescription>
                  Aidez les participants à trouver votre événement (max 5 tags)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
                      onClick={() => 
                        selectedTags.includes(tag) 
                          ? handleRemoveTag(tag)
                          : handleAddTag(tag)
                      }
                    >
                      {tag}
                    </Button>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Input
                    placeholder="Tag personnalisé..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    disabled={selectedTags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomTag}
                    disabled={!customTag.trim() || selectedTags.length >= 5}
                  >
                    Ajouter
                  </Button>
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Link className="h-5 w-5" />
                  <span>Liens et médias</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="virtual_room_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lien de la salle virtuelle</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://meet.google.com/abc-defg-hij ou https://zoom.us/j/123456789"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Zoom, Google Meet, Discord, etc. (obligatoire pour les événements virtuels)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image de couverture</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://exemple.com/image.jpg"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Une belle image attire plus l'attention (optionnel)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Paramètres de l'événement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Événement public
                        </FormLabel>
                        <FormDescription>
                          Visible par tous les utilisateurs d'AMORA
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requires_approval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Inscription avec approbation
                        </FormLabel>
                        <FormDescription>
                          Vous devez approuver chaque participant manuellement
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button 
            type="submit" 
            disabled={loading}
            size="lg"
            className="min-w-[120px]"
          >
            {loading ? 'Création...' : 'Créer l\'événement'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
