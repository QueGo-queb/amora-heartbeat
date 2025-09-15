import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mapping des pays vers leurs codes ISO
const countryToCode: Record<string, string> = {
  'États-Unis': 'US',
  'Canada': 'CA',
  'Haïti': 'HT',
  'Chili': 'CL',
  'Brésil': 'BR',
  'Mexique': 'MX',
  'République Dominicaine': 'DO',
  'Congo (RDC)': 'CD',
  'Congo (Brazzaville)': 'CG',
  'Cameroun': 'CM',
  'Algérie': 'DZ',
  'Ouganda': 'UG',
  'France': 'FR',
  'Suisse': 'CH',
  'Espagne': 'ES',
  'Belgique': 'BE',
  'Côte d\'Ivoire': 'CI',
  'Sénégal': 'SN',
  'Mali': 'ML',
  'Burkina Faso': 'BF',
  'Niger': 'NE',
  'Guinée': 'GN',
  'Bénin': 'BJ',
  'Togo': 'TG',
  'Rwanda': 'RW',
  'Burundi': 'BI'
};

// Données des régions (copiées depuis ProfileEditor.tsx)
const regions: Record<string, string[]> = {
  CA: ['Alberta', 'Colombie-Britannique', 'Manitoba', 'Nouveau-Brunswick', 'Terre-Neuve-et-Labrador', 'Territoires du Nord-Ouest', 'Nouvelle-Écosse', 'Nunavut', 'Ontario', 'Île-du-Prince-Édouard', 'Québec', 'Saskatchewan', 'Yukon'],
  US: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'Californie', 'Colorado', 'Connecticut', 'Delaware', 'Floride', 'Géorgie', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiane', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'Nouveau-Mexique', 'New York', 'Caroline du Nord', 'Dakota du Nord', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvanie', 'Rhode Island', 'Caroline du Sud', 'Dakota du Sud', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginie', 'Washington', 'Virginie-Occidentale', 'Wisconsin', 'Wyoming'],
  FR: ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire', 'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'],
  DE: ['Bade-Wurtemberg', 'Bavière', 'Berlin', 'Brandebourg', 'Brême', 'Hambourg', 'Hesse', 'Mecklembourg-Poméranie-Occidentale', 'Basse-Saxe', 'Rhénanie-du-Nord-Westphalie', 'Rhénanie-Palatinat', 'Sarre', 'Saxe', 'Saxe-Anhalt', 'Schleswig-Holstein', 'Thuringe'],
  ES: ['Andalousie', 'Aragon', 'Asturies', 'Îles Baléares', 'Pays basque', 'Îles Canaries', 'Cantabrie', 'Castille-La Manche', 'Castille-et-León', 'Catalogne', 'Estrémadure', 'Galice', 'La Rioja', 'Madrid', 'Murcie', 'Navarre', 'Communauté valencienne'],
  IT: ['Abruzzes', 'Basilicate', 'Calabre', 'Campanie', 'Émilie-Romagne', 'Frioul-Vénétie Julienne', 'Latium', 'Ligurie', 'Lombardie', 'Marches', 'Molise', 'Piémont', 'Pouilles', 'Sardaigne', 'Sicile', 'Toscane', 'Trentin-Haut-Adige', 'Ombrie', 'Vallée d\'Aoste', 'Vénétie'],
  GB: ['Angleterre', 'Écosse', 'Pays de Galles', 'Irlande du Nord'],
  CH: ['Zurich', 'Berne', 'Lucerne', 'Uri', 'Schwyz', 'Obwald', 'Nidwald', 'Glaris', 'Zoug', 'Fribourg', 'Soleure', 'Bâle-Ville', 'Bâle-Campagne', 'Schaffhouse', 'Appenzell Rhodes-Extérieures', 'Appenzell Rhodes-Intérieures', 'Saint-Gall', 'Grisons', 'Argovie', 'Thurgovie', 'Tessin', 'Vaud', 'Valais', 'Neuchâtel', 'Genève', 'Jura'],
  BE: ['Bruxelles-Capitale', 'Flandre', 'Wallonie'],
  NL: ['Drenthe', 'Flevoland', 'Frise', 'Gueldre', 'Groningue', 'Limbourg', 'Brabant-Septentrional', 'Hollande-Septentrionale', 'Overijssel', 'Utrecht', 'Zélande', 'Hollande-Méridionale'],
  AU: ['Nouvelle-Galles du Sud', 'Victoria', 'Queensland', 'Australie-Occidentale', 'Australie-Méridionale', 'Tasmanie', 'Territoire de la capitale australienne', 'Territoire du Nord'],
  NZ: ['Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', 'Hawke\'s Bay', 'Manawatu-Wanganui', 'Marlborough', 'Nelson', 'Northland', 'Otago', 'Southland', 'Taranaki', 'Tasman', 'Waikato', 'Wellington', 'West Coast'],
  HT: ['Artibonite', 'Centre', 'Grand\'Anse', 'Nippes', 'Nord', 'Nord-Est', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Est'],
  CL: ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Región Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble', 'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'],
  BR: ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'],
  MX: ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'],
  JP: ['Hokkaido', 'Tohoku', 'Kanto', 'Chubu', 'Kansai', 'Chugoku', 'Shikoku', 'Kyushu'],
  KR: ['Séoul', 'Busan', 'Daegu', 'Incheon', 'Gwangju', 'Daejeon', 'Ulsan', 'Gyeonggi', 'Gangwon', 'Chungbuk', 'Chungnam', 'Jeonbuk', 'Jeonnam', 'Gyeongbuk', 'Gyeongnam', 'Jeju'],
  DO: ['Azua', 'Baoruco', 'Barahona', 'Dajabón', 'Duarte', 'El Seibo', 'Espaillat', 'Hato Mayor', 'Hermanas Mirabal', 'Independencia', 'La Altagracia', 'La Romana', 'La Vega', 'María Trinidad Sánchez', 'Monseñor Nouel', 'Monte Cristi', 'Monte Plata', 'Pedernales', 'Peravia', 'Puerto Plata', 'Samaná', 'San Cristóbal', 'San José de Ocoa', 'San Juan', 'San Pedro de Macorís', 'Santiago', 'Santiago Rodríguez', 'Santo Domingo', 'Valverde'],
  CD: ['Bas-Uele', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele', 'Ituri', 'Kasaï', 'Kasaï-Central', 'Kasaï-Oriental', 'Kinshasa', 'Kongo-Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba', 'Mai-Ndombe', 'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 'Sankuru', 'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'],
  CG: ['Bouenza', 'Brazzaville', 'Cuvette', 'Cuvette-Ouest', 'Kouilou', 'Lékoumou', 'Likouala', 'Niari', 'Plateaux', 'Pointe-Noire', 'Pool', 'Sangha'],
  CM: ['Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'],
  DZ: ['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane'],
  UG: ['Central', 'Eastern', 'Northern', 'Western'],
  CI: ['Bafing', 'Bas-Sassandra', 'Comoé', 'Denguélé', 'Gôh-Djiboua', 'Lacs', 'Lagunes', 'Montagnes', 'Sassandra-Marahoué', 'Savanes', 'Vallée du Bandama', 'Woroba', 'Yamoussoukro', 'Zanzan'],
  SN: ['Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor'],
  ML: ['Bamako', 'Gao', 'Kayes', 'Kidal', 'Koulikoro', 'Ménaka', 'Mopti', 'Ségou', 'Sikasso', 'Taoudénit', 'Tombouctou'],
  BF: ['Boucle du Mouhoun', 'Cascades', 'Centre', 'Centre-Est', 'Centre-Nord', 'Centre-Ouest', 'Centre-Sud', 'Est', 'Hauts-Bassins', 'Nord', 'Plateau-Central', 'Sahel', 'Sud-Ouest'],
  NE: ['Agadez', 'Diffa', 'Dosso', 'Maradi', 'Niamey', 'Tahoua', 'Tillabéri', 'Zinder'],
  GN: ['Boké', 'Conakry', 'Faranah', 'Kankan', 'Kindia', 'Labé', 'Mamou', 'Nzérékoré'],
  BJ: ['Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines', 'Couffo', 'Donga', 'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou'],
  TG: ['Centrale', 'Kara', 'Maritime', 'Plateaux', 'Savanes'],
  RW: ['Est', 'Kigali', 'Nord', 'Ouest', 'Sud'],
  BI: ['Bubanza', 'Bujumbura Mairie', 'Bujumbura Rural', 'Bururi', 'Cankuzo', 'Cibitoke', 'Gitega', 'Karuzi', 'Kayanza', 'Kirundo', 'Makamba', 'Muramvya', 'Muyinga', 'Mwaro', 'Ngozi', 'Rumonge', 'Rutana', 'Ruyigi']
};

interface RegionAutocompleteProps {
  country: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const RegionAutocomplete: React.FC<RegionAutocompleteProps> = ({
  country,
  value,
  onChange,
  placeholder = "Sélectionnez une région...",
  className,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredRegions, setFilteredRegions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtenir les régions pour le pays sélectionné
  const getRegionsForCountry = (countryName: string): string[] => {
    const countryCode = countryToCode[countryName];
    return countryCode ? regions[countryCode] || [] : [];
  };

  // Filtrer les régions selon la saisie
  useEffect(() => {
    if (!country) {
      setFilteredRegions([]);
      return;
    }

    const availableRegions = getRegionsForCountry(country);
    
    if (!value) {
      setFilteredRegions(availableRegions);
    } else {
      const filtered = availableRegions.filter(region =>
        region.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRegions(filtered);
    }
  }, [country, value]);

  // Gérer la sélection d'une région
  const handleRegionSelect = (region: string) => {
    onChange(region);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Gérer les changements dans l'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Gérer le focus
  const handleFocus = () => {
    if (country) {
      setIsOpen(true);
    }
  };

  // Gérer les clics en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gérer les touches clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Si aucun pays n'est sélectionné ou aucune région disponible
  if (!country || getRegionsForCountry(country).length === 0) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Saisissez votre région..."
        className={cn("border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]", className)}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946] pr-8", className)}
        disabled={disabled}
        autoComplete="off"
      />
      
      {/* Icône de dropdown */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>

      {/* Dropdown des régions */}
      {isOpen && filteredRegions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredRegions.map((region) => (
            <div
              key={region}
              className={cn(
                "px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between",
                value === region && "bg-blue-50 text-blue-600"
              )}
              onClick={() => handleRegionSelect(region)}
            >
              <span className="text-sm">{region}</span>
              {value === region && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
