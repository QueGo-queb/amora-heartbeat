/**
 * ✅ COMPOSANT DE SÉLECTION MULTI-PAYS OPTIMISÉ POUR MOBILE
 */

import { useState, useMemo, useCallback } from 'react';
import { Check, ChevronDown, Search, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
}

interface CountryMultiSelectProps {
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  className?: string;
}

// ✅ LISTE COMPLÈTE DES PAYS AVEC ARGENTINE
const COUNTRIES: Country[] = [
  // Amérique du Nord
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', region: 'Amérique du Nord' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Amérique du Nord' },
  { code: 'MX', name: 'Mexique', flag: '🇲🇽', region: 'Amérique du Nord' },
  
  // Amérique du Sud
  { code: 'AR', name: 'Argentine', flag: '🇦🇷', region: 'Amérique du Sud' },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷', region: 'Amérique du Sud' },
  { code: 'CL', name: 'Chili', flag: '🇨🇱', region: 'Amérique du Sud' },
  { code: 'CO', name: 'Colombie', flag: '🇨🇴', region: 'Amérique du Sud' },
  { code: 'PE', name: 'Pérou', flag: '🇵🇪', region: 'Amérique du Sud' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', region: 'Amérique du Sud' },
  
  // Caraïbes
  { code: 'HT', name: 'Haïti', flag: '🇭🇹', region: 'Caraïbes' },
  { code: 'DO', name: 'République Dominicaine', flag: '🇩🇴', region: 'Caraïbes' },
  { code: 'JM', name: 'Jamaïque', flag: '��🇲', region: 'Caraïbes' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', region: 'Caraïbes' },
  { code: 'TT', name: 'Trinité-et-Tobago', flag: '��🇹', region: 'Caraïbes' },
  
  // Europe
  { code: 'FR', name: 'France', flag: '🇫��', region: 'Europe' },
  { code: 'ES', name: 'Espagne', flag: '🇪��', region: 'Europe' },
  { code: 'BE', name: 'Belgique', flag: '🇧��', region: 'Europe' },
  { code: 'CH', name: 'Suisse', flag: '🇨��', region: 'Europe' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹', region: 'Europe' },
  { code: 'DE', name: 'Allemagne', flag: '🇩��', region: 'Europe' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬��', region: 'Europe' },
  
  // Afrique
  { code: 'CD', name: 'Congo (RDC)', flag: '🇨��', region: 'Afrique' },
  { code: 'CG', name: 'Congo (Brazzaville)', flag: '🇨��', region: 'Afrique' },
  { code: 'CM', name: 'Cameroun', flag: '🇨��', region: 'Afrique' },
  { code: 'DZ', name: 'Algérie', flag: '🇩��', region: 'Afrique' },
  { code: 'UG', name: 'Ouganda', flag: '🇺��', region: 'Afrique' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨��', region: 'Afrique' },
  { code: 'SN', name: 'Sénégal', flag: '🇸��', region: 'Afrique' },
  { code: 'ML', name: 'Mali', flag: '🇲��', region: 'Afrique' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧��', region: 'Afrique' },
  { code: 'NE', name: 'Niger', flag: '🇳��', region: 'Afrique' },
  { code: 'GN', name: 'Guinée', flag: '🇬��', region: 'Afrique' },
  { code: 'BJ', name: 'Bénin', flag: '🇧��', region: 'Afrique' },
  { code: 'TG', name: 'Togo', flag: '🇹��', region: 'Afrique' },
  { code: 'RW', name: 'Rwanda', flag: '🇷��', region: 'Afrique' },
  { code: 'BI', name: 'Burundi', flag: '🇧��', region: 'Afrique' },
  
  // Asie
  { code: 'CN', name: 'Chine', flag: '��🇳', region: 'Asie' },
  { code: 'JP', name: 'Japon', flag: '��🇵', region: 'Asie' },
  { code: 'KR', name: 'Corée du Sud', flag: '��🇷', region: 'Asie' },
  { code: 'IN', name: 'Inde', flag: '��🇳', region: 'Asie' },
  
  // Océanie
  { code: 'AU', name: 'Australie', flag: '🇦🇺', region: 'Océanie' },
  { code: 'NZ', name: 'Nouvelle-Zélande', flag: '🇳��', region: 'Océanie' }
];

export function CountryMultiSelect({
  selectedCountries,
  onCountriesChange,
  placeholder = "Sélectionnez des pays...",
  maxSelections = 10,
  className = ""
}: CountryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ FILTRAGE INTELLIGENT DES PAYS
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return COUNTRIES;
    
    const query = searchQuery.toLowerCase();
    return COUNTRIES.filter(country => 
      country.name.toLowerCase().includes(query) ||
      country.region.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // ✅ GROUPEMENT PAR RÉGION
  const groupedCountries = useMemo(() => {
    const groups: Record<string, Country[]> = {};
    
    filteredCountries.forEach(country => {
      if (!groups[country.region]) {
        groups[country.region] = [];
      }
      groups[country.region].push(country);
    });
    
    return groups;
  }, [filteredCountries]);

  // ✅ GESTION DE LA SÉLECTION
  const handleCountryToggle = useCallback((countryCode: string) => {
    const isSelected = selectedCountries.includes(countryCode);
    
    if (isSelected) {
      // Désélectionner
      onCountriesChange(selectedCountries.filter(code => code !== countryCode));
    } else {
      // Sélectionner (avec limite)
      if (selectedCountries.length < maxSelections) {
        onCountriesChange([...selectedCountries, countryCode]);
      }
    }
  }, [selectedCountries, onCountriesChange, maxSelections]);

  // ✅ SUPPRESSION D'UN PAYS
  const handleRemoveCountry = useCallback((countryCode: string) => {
    onCountriesChange(selectedCountries.filter(code => code !== countryCode));
  }, [selectedCountries, onCountriesChange]);

  // ✅ OBTENIR LES DÉTAILS D'UN PAYS
  const getCountryDetails = useCallback((code: string) => {
    return COUNTRIES.find(country => country.code === code);
  }, []);

  // ✅ COMPTEUR DE SÉLECTION
  const selectionCount = selectedCountries.length;
  const isMaxReached = selectionCount >= maxSelections;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ✅ AFFICHAGE DES PAYS SÉLECTIONNÉS */}
      {selectedCountries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Pays sélectionnés ({selectionCount}/{maxSelections})
            </span>
            {isMaxReached && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Limite atteinte
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedCountries.map(countryCode => {
              const country = getCountryDetails(countryCode);
              if (!country) return null;
              
              return (
                <Badge
                  key={countryCode}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1 text-sm"
                >
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCountry(countryCode)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ BOUTON DE SÉLECTION */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 text-left font-normal"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className={selectedCountries.length === 0 ? "text-gray-500" : ""}>
                {selectedCountries.length === 0 
                  ? placeholder 
                  : `${selectedCountries.length} pays sélectionné(s)`
                }
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <CommandInput
                placeholder="Rechercher un pays..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="flex-1 border-0 focus:ring-0"
              />
            </div>
            
            <CommandList className="max-h-64">
              <CommandEmpty>
                <div className="text-center py-6 text-gray-500">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucun pays trouvé</p>
                  <p className="text-sm">Essayez un autre terme de recherche</p>
                </div>
              </CommandEmpty>
              
              {Object.entries(groupedCountries).map(([region, countries]) => (
                <CommandGroup key={region} heading={region}>
                  {countries.map((country) => {
                    const isSelected = selectedCountries.includes(country.code);
                    const isDisabled = !isSelected && isMaxReached;
                    
                    return (
                      <CommandItem
                        key={country.code}
                        value={country.code}
                        onSelect={() => handleCountryToggle(country.code)}
                        disabled={isDisabled}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        
                        <span className="text-lg">{country.flag}</span>
                        
                        <div className="flex-1">
                          <div className="font-medium">{country.name}</div>
                          <div className="text-xs text-gray-500">{country.code}</div>
                        </div>
                        
                        {isDisabled && (
                          <span className="text-xs text-gray-400">Limite atteinte</span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* ✅ MESSAGES D'AIDE */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Conseil :</strong> Sélectionnez les pays où vous souhaitez rencontrer des personnes</p>
        <p>🔍 <strong>Recherche :</strong> Tapez le nom du pays ou de la région pour filtrer</p>
        {isMaxReached && (
          <p className="text-amber-600">⚠️ Vous avez atteint la limite de {maxSelections} pays</p>
        )}
      </div>
    </div>
  );
}
