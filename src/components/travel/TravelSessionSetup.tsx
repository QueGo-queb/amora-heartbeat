import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Tag,
  Plane,
  Clock,
  Search
} from 'lucide-react';
import { useTravelMode, LocationCache } from '@/hooks/useTravelMode';
import { format, addDays } from 'date-fns';

const travelSessionSchema = z.object({
  destination_country: z.string().min(1, 'Le pays est obligatoire'),
  destination_city: z.string().min(1, 'La ville est obligatoire'),
  travel_start_date: z.string().min(1, 'La date de départ est obligatoire'),
  travel_end_date: z.string().min(1, 'La date de retour est obligatoire'),
  travel_type: z.enum(['leisure', 'business', 'relocation', 'study', 'other']),
  travel_purpose: z.string().max(500, 'Maximum 500 caractères').optional(),
  search_radius_km: z.number().min(1).max(500),
  looking_for_activities: z.array(z.string()).optional(),
  preferred_meeting_types: z.array(z.string()).optional(),
}).refine((data) => {
  const start = new Date(data.travel_start_date);
  const end = new Date(data.travel_end_date);
  return end >= start;
}, {
  message: "La date de retour doit être après la date de départ",
  path: ["travel_end_date"],
});

type TravelSessionFormData = z.infer<typeof travelSessionSchema>;

interface TravelSessionSetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const travelTypes = [
  { value: 'leisure', label: 'Loisirs / Vacances', icon: '🏖️' },
  { value: 'business', label: 'Voyage d\'affaires', icon: '💼' },
  { value: 'relocation', label: 'Déménagement', icon: '📦' },
  { value: 'study', label: 'Études / Formation', icon: '🎓' },
  { value: 'other', label: 'Autre', icon: '✈️' },
];

const popularActivities = [
  'Café', 'Restaurant', 'Musées', 'Art', 'Shopping', 'Vie nocturne',
  'Sport', 'Plage', 'Randonnée', 'Photographie', 'Architecture',
  'Cuisine locale', 'Festivals', 'Concerts', 'Théâtre'
];

const meetingTypes = [
  'Café décontracté', 'Déjeuner', 'Dîner', 'Visite touristique',
  'Sortie culturelle', 'Sport', 'Vie nocturne', 'Activité de groupe'
];

export const TravelSessionSetup: React.FC<TravelSessionSetupProps> = ({
  onSuccess,
  onCancel
}) => {
  const { activateTravelMode, availableLocations, fetchAvailableLocations, loading } = useTravelMode();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedMeetingTypes, setSelectedMeetingTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<LocationCache[]>([]);

  const form = useForm<TravelSessionFormData>({
    resolver: zodResolver(travelSessionSchema),
    defaultValues: {
      travel_start_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      travel_end_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      travel_type: 'leisure',
      search_radius_km: 50,
      looking_for_activities: [],
      preferred_meeting_types: [],
    },
  });

  // Recherche de villes
  const handleLocationSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      await fetchAvailableLocations(query);
      setFilteredLocations(availableLocations.filter(loc => 
        loc.city.toLowerCase().includes(query.toLowerCase()) ||
        loc.country.toLowerCase().includes(query.toLowerCase())
      ));
    } else {
      setFilteredLocations([]);
    }
  };

  const handleLocationSelect = (location: LocationCache) => {
    form.setValue('destination_country', location.country);
    form.setValue('destination_city', location.city);
    setSearchQuery(`${location.city}, ${location.country}`);
    setFilteredLocations([]);
  };

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev => {
      const newActivities = prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity];
      form.setValue('looking_for_activities', newActivities);
      return newActivities;
    });
  };

  const handleMeetingTypeToggle = (meetingType: string) => {
    setSelectedMeetingTypes(prev => {
      const newTypes = prev.includes(meetingType)
        ? prev.filter(t => t !== meetingType)
        : [...prev, meetingType];
      form.setValue('preferred_meeting_types', newTypes);
      return newTypes;
    });
  };

  const onSubmit = async (data: TravelSessionFormData) => {
    const sessionData = {
      ...data,
      looking_for_activities: selectedActivities,
      preferred_meeting_types: selectedMeetingTypes,
    };

    const success = await activateTravelMode(sessionData);
    if (success) {
      onSuccess?.();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plane className="h-5 w-5" />
            <span>Configurer votre voyage</span>
          </CardTitle>
          <CardDescription>
            Activez le mode voyage pour rencontrer des personnes dans votre destination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Destination */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Destination</span>
                </Label>
                
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher une ville..."
                      value={searchQuery}
                      onChange={(e) => handleLocationSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {filteredLocations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredLocations.map(location => (
                        <button
                          key={location.id}
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => handleLocationSelect(location)}
                        >
                          <div>
                            <p className="font-medium">{location.city}, {location.country}</p>
                            {location.region && (
                              <p className="text-sm text-muted-foreground">{location.region}</p>
                            )}
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{location.user_count} utilisateurs</p>
                            {location.traveler_count > 0 && (
                              <p>{location.traveler_count} voyageurs</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="destination_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays</FormLabel>
                        <FormControl>
                          <Input placeholder="France" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="destination_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Paris" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Dates de voyage</span>
                </Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="travel_start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de départ</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="travel_end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de retour</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Type de voyage */}
              <FormField
                control={form.control}
                name="travel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Type de voyage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type de voyage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {travelTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rayon de recherche */}
              <FormField
                control={form.control}
                name="search_radius_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium flex items-center justify-between">
                      <span>Rayon de recherche</span>
                      <Badge variant="secondary">{field.value} km</Badge>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                        max={500}
                        min={1}
                        step={5}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Distance maximale pour trouver des personnes à rencontrer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Activités recherchées */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Activités recherchées</span>
                </Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {popularActivities.map(activity => (
                    <Button
                      key={activity}
                      type="button"
                      variant={selectedActivities.includes(activity) ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => handleActivityToggle(activity)}
                    >
                      {activity}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Types de rencontres */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Types de rencontres préférées</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {meetingTypes.map(meetingType => (
                    <Button
                      key={meetingType}
                      type="button"
                      variant={selectedMeetingTypes.includes(meetingType) ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => handleMeetingTypeToggle(meetingType)}
                    >
                      {meetingType}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Objectif du voyage */}
              <FormField
                control={form.control}
                name="travel_purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objectif de votre voyage (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez ce que vous recherchez lors de ce voyage..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Aidez les autres à comprendre vos attentes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex space-x-4 pt-4">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Annuler
                  </Button>
                )}
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Activation...' : 'Activer le mode voyage'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};