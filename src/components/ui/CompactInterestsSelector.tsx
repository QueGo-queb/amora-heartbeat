// src/components/ui/CompactInterestsSelector.tsx
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { allInterests, interestCategories } from '@/data/interests';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CompactInterestsSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxSelections?: number;
  showByCategory?: boolean;
}

export function CompactInterestsSelector({
  selectedInterests,
  onInterestsChange,
  maxSelections = 10,
  showByCategory = true
}: CompactInterestsSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['lifestyle']);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleInterest = (interestId: string) => {
    const newSelection = selectedInterests.includes(interestId)
      ? selectedInterests.filter(id => id !== interestId)
      : selectedInterests.length < maxSelections 
        ? [...selectedInterests, interestId]
        : selectedInterests;
    
    onInterestsChange(newSelection);
  };

  if (!showByCategory) {
    // Version simple pour inscription rapide
    const popularInterests = allInterests.slice(0, 20);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Centres d'intérêt</h3>
          <Badge variant="outline">{selectedInterests.length}/{maxSelections}</Badge>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {popularInterests.map(interest => (
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
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Centres d'intérêt</h3>
        <Badge variant="outline">{selectedInterests.length}/{maxSelections}</Badge>
      </div>

      {interestCategories.map(category => {
        const categoryInterests = allInterests.filter(i => i.category === category.id);
        const isExpanded = expandedCategories.includes(category.id);
        
        return (
          <div key={category.id} className="border rounded-lg p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-0 h-auto"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {categoryInterests.filter(i => selectedInterests.includes(i.id)).length}
                </Badge>
              </div>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            
            {isExpanded && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                {categoryInterests.map(interest => (
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
                    <span className="mr-1">{interest.icon}</span>
                    <span className="text-xs truncate">{interest.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}