import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Interest {
  name: string;
  icon: string;
}

interface InterestsEditorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  className?: string;
}

const availableInterests: Interest[] = [
  { name: "Music", icon: "🎵" },
  { name: "Books", icon: "📚" },
  { name: "Parties", icon: "🍸" },
  { name: "Self Care", icon: "🧘‍♀️" },
  { name: "Message", icon: "✉️" },
  { name: "Hot Yoga", icon: "🧘‍♂️" },
  { name: "Gymnastics", icon: "🤸" },
  { name: "Hockey", icon: "🏒" },
  { name: "Football", icon: "⚽" },
  { name: "Meditation", icon: "🧘" },
  { name: "Spotify", icon: "🎧" },
  { name: "Sushi", icon: "🍣" },
  { name: "Painting", icon: "🎨" },
  { name: "Basketball", icon: "🏀" },
  { name: "Theater", icon: "🎭" },
  { name: "Playing Music Instrument", icon: "🎸" },
  { name: "Aquarium", icon: "🐠" },
  { name: "Fitness", icon: "🏋️" },
  { name: "Travel", icon: "✈️" },
  { name: "Coffee", icon: "☕" },
  { name: "Instagram", icon: "📸" },
  { name: "Walking", icon: "🚶" },
  { name: "Running", icon: "🏃" },
  { name: "Church", icon: "⛪" },
  { name: "Cooking", icon: "🍳" },
  { name: "Singing", icon: "🎤" }
];

const InterestsEditor: React.FC<InterestsEditorProps> = ({
  selectedInterests,
  onInterestsChange,
  className = ''
}) => {
  const [localSelectedInterests, setLocalSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    setLocalSelectedInterests(selectedInterests);
  }, [selectedInterests]);

  const toggleInterest = (interestName: string) => {
    setLocalSelectedInterests(prev => {
      const newSelection = prev.includes(interestName)
        ? prev.filter(interest => interest !== interestName)
        : [...prev, interestName];
      
      // CORRECTION : Mettre à jour le parent immédiatement
      onInterestsChange(newSelection);
      return newSelection;
    });
  };

  const isSelected = (interestName: string) => localSelectedInterests.includes(interestName);

  return (
    <Card className={`culture-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🎯</span>
          Vos Centres d'Intérêt
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sélectionnez vos centres d'intérêt pour personnaliser votre expérience
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Intérêts sélectionnés */}
          {localSelectedInterests.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-green-700">
                Intérêts sélectionnés ({localSelectedInterests.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {localSelectedInterests.map((interest) => {
                  const interestData = availableInterests.find(i => i.name === interest);
                  return (
                    <Badge
                      key={interest}
                      variant="default"
                      className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interestData?.icon} {interest}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tous les intérêts disponibles */}
          <div>
            <h4 className="font-medium mb-2 text-gray-700">
              Tous les intérêts disponibles
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableInterests.map((interest) => (
                <Button
                  key={interest.name}
                  variant={isSelected(interest.name) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInterest(interest.name)}
                  className={`h-auto py-2 px-3 text-xs transition-all ${
                    isSelected(interest.name)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "hover:bg-blue-50 hover:border-blue-300"
                  }`}
                >
                  <span className="mr-1">{interest.icon}</span>
                  <span className="truncate">{interest.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Intérêts sélectionnés: {localSelectedInterests.length}</span>
              <span>Total disponible: {availableInterests.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterestsEditor;
