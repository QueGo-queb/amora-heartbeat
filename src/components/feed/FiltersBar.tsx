/**
 * Barre de filtres pour le feed
 * Permet de filtrer les posts par type, tags, etc.
 */

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { FeedFilters } from '@/feed';

interface FiltersBarProps {
  filters: FeedFilters;
  onFiltersChange: (filters: FeedFilters) => void;
}

const MEDIA_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Vidéos' },
  { value: 'gif', label: 'GIFs' }
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'popular', label: 'Plus populaires' },
  { value: 'trending', label: 'Tendance' }
];

const POPULAR_TAGS = [
  'amour', 'rencontre', 'culture', 'voyage', 'musique', 
  'cuisine', 'sport', 'art', 'technologie', 'nature',
  'danse', 'photographie', 'cinéma', 'littérature', 'mode'
];

export const FiltersBar = ({ filters, onFiltersChange }: FiltersBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (updates: Partial<FeedFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      {/* Bouton toggle filtres */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtres
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {Object.keys(filters).length}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2 text-gray-500"
          >
            <X className="w-4 h-4" />
            Effacer
          </Button>
        )}
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type de média */}
            <div className="space-y-2">
              <Label>Type de média</Label>
              <Select
                value={filters.media_type || 'all'}
                onValueChange={(value) => updateFilters({ 
                  media_type: value === 'all' ? undefined : value 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tri */}
            <div className="space-y-2">
              <Label>Trier par</Label>
              <Select
                value={filters.sort_by || 'recent'}
                onValueChange={(value) => updateFilters({ sort_by: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Premium uniquement */}
            <div className="space-y-2">
              <Label>Type de contenu</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="premium-only"
                  checked={filters.premium_only || false}
                  onCheckedChange={(checked) => 
                    updateFilters({ premium_only: checked ? true : undefined })
                  }
                />
                <Label htmlFor="premium-only" className="text-sm">
                  Premium uniquement
                </Label>
              </div>
            </div>
          </div>

          {/* Tags populaires */}
          <div className="space-y-2">
            <Label>Tags populaires</Label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => {
                const isSelected = filters.tags?.includes(tag);
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? "default" : "secondary"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      const currentTags = filters.tags || [];
                      if (isSelected) {
                        updateFilters({ 
                          tags: currentTags.filter(t => t !== tag) 
                        });
                      } else {
                        updateFilters({ 
                          tags: [...currentTags, tag] 
                        });
                      }
                    }}
                  >
                    #{tag}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Filtres actifs */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium">Filtres actifs :</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.media_type && filters.media_type !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    {MEDIA_TYPES.find(t => t.value === filters.media_type)?.label}
                  </Badge>
                )}
                {filters.sort_by && filters.sort_by !== 'recent' && (
                  <Badge variant="outline" className="text-xs">
                    {SORT_OPTIONS.find(s => s.value === filters.sort_by)?.label}
                  </Badge>
                )}
                {filters.premium_only && (
                  <Badge variant="outline" className="text-xs">
                    Premium uniquement
                  </Badge>
                )}
                {filters.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
