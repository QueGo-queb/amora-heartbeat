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
  showCategories?: boolean;
}

export function EnhancedInterestsSelector({
  selectedInterests,
  onInterestsChange,
  maxSelections = 15,
  className = '',
  showCategories = false
}: EnhancedInterestsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredInterests = allInterests.filter(interest => {
    const matchesSearch = interest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || interest.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleInterest = (interestId: string) => {
    try {
      const newSelection = selectedInterests.includes(interestId)
        ? selectedInterests.filter(id => id !== interestId)
        : selectedInterests.length < maxSelections 
          ? [...selectedInterests, interestId]
          : selectedInterests;
      
      onInterestsChange(newSelection);
    } catch (error) {
      console.error('Error toggling interest:', error);
    }
  };

  const removeInterest = (interestId: string) => {
    try {
      onInterestsChange(selectedInterests.filter(id => id !== interestId));
    } catch (error) {
      console.error('Error removing interest:', error);
    }
  };

  // ✅ CORRECTION: Fonction sécurisée pour obtenir les intérêts sélectionnés
  const getSelectedInterestsDisplay = () => {
    return selectedInterests
      .map(id => allInterests.find(i => i.id === id))
      .filter((interest): interest is NonNullable<typeof interest> => interest !== undefined);
  };

  // Version simplifiée pour mobile (signup)
  if (!showCategories) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {/* Intérêts sélectionnés */}
          {selectedInterests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#212529]">Sélectionnés ({selectedInterests.length}/{maxSelections}) :</h4>
              <div className="flex flex-wrap gap-2">
                {getSelectedInterestsDisplay().map(interest => (
                  <Badge
                    key={interest.id}
                    className="gap-1 pr-1 bg-[#52B788] text-white border-0"
                  >
                    <span>{interest.icon}</span>
                    <span className="text-xs">{interest.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100 text-white hover:text-red-600"
                      onClick={() => removeInterest(interest.id)}
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CED4DA] h-4 w-4" />
            <Input
              placeholder="Rechercher un intérêt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
            />
          </div>

          {/* Grille simplifiée d'intérêts pour mobile */}
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {interestCategories.map(category => {
              const categoryInterests = getInterestsByCategory(category.id);
              const visibleInterests = searchTerm 
                ? categoryInterests.filter(interest => 
                    interest.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                : categoryInterests;

              if (visibleInterests.length === 0) return null;

              return (
                <div key={category.id} className="space-y-2">
                  <h4 className="text-sm font-medium text-[#212529] flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {visibleInterests.map(interest => {
                      const isSelected = selectedInterests.includes(interest.id);
                      const isDisabled = !isSelected && selectedInterests.length >= maxSelections;
                      
                      return (
                        <Button
                          key={interest.id}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`h-auto p-2 flex flex-col items-center gap-1 text-xs ${
                            isSelected 
                              ? 'bg-[#E63946] text-white border-[#E63946]' 
                              : isDisabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'border-[#CED4DA] text-[#212529] hover:border-[#E63946]'
                          }`}
                          onClick={() => !isDisabled && toggleInterest(interest.id)}
                          disabled={isDisabled}
                        >
                          <span className="text-base">{interest.icon}</span>
                          <span className="text-center leading-tight">{interest.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message si aucun intérêt trouvé */}
          {filteredInterests.length === 0 && searchTerm && (
            <div className="text-center text-[#6C757D] py-4">
              <p>Aucun intérêt trouvé pour "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Version complète avec catégories (pour les autres pages)
  return (
    <div className={className}>
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">Tous</TabsTrigger>
          {interestCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Intérêts sélectionnés */}
        {selectedInterests.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-[#212529]">Sélectionnés ({selectedInterests.length}/{maxSelections}) :</h4>
            <div className="flex flex-wrap gap-2">
              {getSelectedInterestsDisplay().map(interest => (
                <Badge
                  key={interest.id}
                  className="gap-1 pr-1 bg-[#52B788] text-white border-0"
                >
                  <span>{interest.icon}</span>
                  <span className="text-xs">{interest.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100 text-white hover:text-red-600"
                    onClick={() => removeInterest(interest.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CED4DA] h-4 w-4" />
          <Input
            placeholder="Rechercher un intérêt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
          />
        </div>

        {/* Contenu des onglets */}
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
            {filteredInterests.map(interest => {
              const isSelected = selectedInterests.includes(interest.id);
              const isDisabled = !isSelected && selectedInterests.length >= maxSelections;
              
              return (
                <Button
                  key={interest.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`h-auto p-3 flex flex-col items-center gap-2 ${
                    isSelected 
                      ? 'bg-[#E63946] text-white border-[#E63946]' 
                      : isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'border-[#CED4DA] text-[#212529] hover:border-[#E63946]'
                  }`}
                  onClick={() => !isDisabled && toggleInterest(interest.id)}
                  disabled={isDisabled}
                >
                  <span className="text-lg">{interest.icon}</span>
                  <span className="text-xs text-center leading-tight">{interest.name}</span>
                </Button>
              );
            })}
          </div>
        </TabsContent>

        {interestCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {getInterestsByCategory(category.id)
                .filter(interest => 
                  searchTerm 
                    ? interest.name.toLowerCase().includes(searchTerm.toLowerCase())
                    : true
                )
                .map(interest => {
                  const isSelected = selectedInterests.includes(interest.id);
                  const isDisabled = !isSelected && selectedInterests.length >= maxSelections;
                  
                  return (
                    <Button
                      key={interest.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`h-auto p-3 flex flex-col items-center gap-2 ${
                        isSelected 
                          ? 'bg-[#E63946] text-white border-[#E63946]' 
                          : isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'border-[#CED4DA] text-[#212529] hover:border-[#E63946]'
                      }`}
                      onClick={() => !isDisabled && toggleInterest(interest.id)}
                      disabled={isDisabled}
                    >
                      <span className="text-lg">{interest.icon}</span>
                      <span className="text-xs text-center leading-tight">{interest.name}</span>
                    </Button>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Message si aucun intérêt trouvé */}
      {filteredInterests.length === 0 && searchTerm && (
        <div className="text-center text-[#6C757D] py-4">
          <p>Aucun intérêt trouvé pour "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

// Fonctions utilitaires
export function getInterestsByCategory(categoryId: string) {
  return allInterests.filter(interest => interest.category === categoryId);
}

export function getCategoryById(categoryId: string) {
  return interestCategories.find(category => category.id === categoryId);
}