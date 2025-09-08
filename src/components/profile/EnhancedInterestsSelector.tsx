// src/components/profile/EnhancedInterestsSelector.tsx
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { allInterests, interestCategories, getInterestsByCategory, getCategoryById } from '@/data/interests';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EnhancedInterestsSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxSelections?: number;
  className?: string;
}

export function EnhancedInterestsSelector({
  selectedInterests,
  onInterestsChange,
  maxSelections = 15,
  className = ''
}: EnhancedInterestsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredInterests = allInterests.filter(interest => {
    const matchesSearch = interest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || interest.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleInterest = (interestId: string) => {
    const newSelection = selectedInterests.includes(interestId)
      ? selectedInterests.filter(id => id !== interestId)
      : selectedInterests.length < maxSelections 
        ? [...selectedInterests, interestId]
        : selectedInterests;
    
    onInterestsChange(newSelection);
  };

  const removeInterest = (interestId: string) => {
    onInterestsChange(selectedInterests.filter(id => id !== interestId));
  };

  const getSelectedInterestsDisplay = () => {
    return selectedInterests.map(id => allInterests.find(i => i.id === id)).filter(Boolean);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Centres d'intérêt</span>
          <Badge variant="outline">
            {selectedInterests.length}/{maxSelections}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Intérêts sélectionnés */}
        {selectedInterests.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Sélectionnés :</h4>
            <div className="flex flex-wrap gap-2">
              {getSelectedInterestsDisplay().map(interest => (
                <Badge
                  key={interest?.id}
                  variant="default"
                  className="gap-1 pr-1"
                >
                  <span>{interest?.icon}</span>
                  <span>{interest?.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => removeInterest(interest?.id!)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un intérêt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Onglets par catégorie */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
            <TabsTrigger value="all" className="text-xs">
              Tous
            </TabsTrigger>
            {interestCategories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                <span className="mr-1">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-6">
              {interestCategories.map(category => {
                const categoryInterests = getInterestsByCategory(category.id);
                const visibleInterests = searchTerm 
                  ? categoryInterests.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  : categoryInterests;

                if (visibleInterests.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={category.color}>
                        {category.icon} {category.name}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {visibleInterests.map(interest => (
                        <Button
                          key={interest.id}
                          variant={selectedInterests.includes(interest.id) ? "default" : "outline"}
                          size="sm"
                          className="justify-start h-auto py-2 px-3"
                          onClick={() => toggleInterest(interest.id)}
                          disabled={
                            !selectedInterests.includes(interest.id) && 
                            selectedInterests.length >= maxSelections
                          }
                        >
                          <span className="mr-2">{interest.icon}</span>
                          <span className="text-xs truncate">{interest.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {interestCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {filteredInterests
                  .filter(i => i.category === category.id)
                  .map(interest => (
                    <Button
                      key={interest.id}
                      variant={selectedInterests.includes(interest.id) ? "default" : "outline"}
                      size="sm"
                      className="justify-start h-auto py-2 px-3"
                      onClick={() => toggleInterest(interest.id)}
                      disabled={
                        !selectedInterests.includes(interest.id) && 
                        selectedInterests.length >= maxSelections
                      }
                    >
                      <span className="mr-2">{interest.icon}</span>
                      <span className="text-xs truncate">{interest.name}</span>
                    </Button>
                  ))
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {selectedInterests.length >= maxSelections && (
          <p className="text-sm text-amber-600">
            Limite de {maxSelections} intérêts atteinte. Supprimez-en pour en ajouter d'autres.
          </p>
        )}
      </CardContent>
    </Card>
  );
}