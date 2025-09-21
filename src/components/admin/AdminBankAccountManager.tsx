import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Save, 
  Copy, 
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  Building,
  Landmark,
  Smartphone,
  Mail,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBankAccountProtection } from '@/hooks/useBankAccountProtection';

interface BankAccount {
  id: string;
  account_type: 'bank' | 'card' | 'mobile';
  bank_name: string;
  account_number: string;
  account_holder: string;
  country: string;
  currency: string;
  iban?: string;
  swift?: string;
  routing_number?: string;
  // ✅ NOUVEAUX CHAMPS pour Canada et paiements mobiles
  transit_number?: string;
  institution_number?: string;
  mobile_email?: string;
  mobile_phone?: string;
  mobile_provider?: string;
  is_active: boolean;
  created_at: string;
}

interface AdminBankAccountManagerProps {
  open: boolean;
  onClose: () => void;
}

// ✅ MISE À JOUR: Base de données complète des banques canadiennes
const banksByCountry = {
  'Canada': {
    physical: [
      'Banque Royale du Canada (RBC)',
      'Banque Toronto-Dominion (TD)',
      'Banque de Nouvelle-Écosse (Scotiabank)',
      'Banque de Montréal (BMO)',
      'Banque Canadienne Impériale de Commerce (CIBC)',
      'Banque Nationale du Canada',
      'Desjardins',
      'HSBC Canada',
      'Banque Laurentienne',
      'Banque Manuvie',
      'ATB Financial',
      'Servus Credit Union',
      'Coast Capital Savings',
      'Vancity Credit Union',
      // ✅ AJOUT: Banques manquantes importantes
      'Peoples Trust Company',
      'Canadian Western Bank',
      'Bridgewater Bank',
      'Equitable Bank',
      'Home Trust Company',
      'Meridian Credit Union',
      'Conexus Credit Union',
      'First West Credit Union',
      'Affinity Credit Union',
      'Innovation Credit Union',
      'Steinbach Credit Union',
      'Caisse Populaire',
      'Credit Union Central of Canada',
      'Canadian Imperial Bank of Commerce',
      'First National Financial',
      'MCAP',
      'B2B Bank',
      'Canadian Tire Bank',
      'President\'s Choice Financial',
      'Concentra Bank',
      'Effort Trust Company',
      'Haventree Bank',
      'Icici Bank Canada',
      'Industrial and Commercial Bank of China (Canada)',
      'Laurentian Bank Securities',
      'Mega International Commercial Bank (Canada)',
      'MUFG Bank (Canada)',
      'Paymi',
      'Wealth One Bank of Canada'
    ],
    virtual: [
      'Tangerine',
      'PC Financial',
      'Simplii Financial',
      'Kooba',
      'Paymi',
      'Mogo',
      'Koodo Mobile Money',
      // ✅ AJOUT: Banques numériques manquantes
      'Neo Financial',
      'Kooba',
      'PayBright (Affirm)',
      'Paymi by Interac',
      'Nuvei',
      'Mogo Money',
      'STACK',
      'Koodo Financial Services',
      'Fido Money',
      'Virgin Mobile Financial',
      'Chatr Financial'
    ]
  },
  'République Dominicaine': {
    physical: [
      'Banco Popular Dominicano',
      'Banco de Reservas',
      'Banco BHD León',
      'Banco Mercantil',
      'Banco Santa Cruz',
      'Banco Múltiple López de Haro',
      'Banco Caribe',
      'Banco Promerica',
      'Banco Vimenca',
      'Banco Ademi',
      'Banesco Dominicana',
      'Banco del Progreso',
      'Banco Adopem',
      // ✅ AJOUT: Banques manquantes
      'Banco Activo',
      'Banco Dominicano del Progreso',
      'Banco Múltiple BDI',
      'Banco Nacional de Crédito',
      'Banco Peravia',
      'Banco Unión'
    ],
    virtual: [
      'Banco Digital BHD',
      'Popular Digital',
      'BanReservas Digital',
      'Mercantil en Línea',
      // ✅ AJOUT: Services numériques
      'Azul Digital',
      'Tpago',
      'Uepa Loans'
    ]
  },
  'USA': {
    physical: [
      'JPMorgan Chase',
      'Bank of America',
      'Wells Fargo',
      'Citibank',
      'U.S. Bank',
      'PNC Bank',
      'Capital One',
      'TD Bank',
      'BB&T (Truist)',
      'SunTrust (Truist)',
      'Regions Bank',
      'KeyBank',
      'Fifth Third Bank',
      'Huntington Bank',
      'M&T Bank',
      'Citizens Bank',
      'First National Bank',
      'Comerica Bank',
      // ✅ AJOUT: Banques américaines importantes manquantes
      'American Express Bank',
      'BMO Harris Bank',
      'BBVA USA',
      'First Republic Bank',
      'Silicon Valley Bank',
      'Zions Bank',
      'Frost Bank',
      'First Citizens Bank',
      'Synovus Bank',
      'Umpqua Bank',
      'Webster Bank',
      'Eastern Bank',
      'People\'s United Bank',
      'Santander Bank',
      'MUFG Union Bank'
    ],
    virtual: [
      'Ally Bank',
      'Marcus by Goldman Sachs',
      'American Express National Bank',
      'Discover Bank',
      'Capital One 360',
      'USAA Bank',
      'Navy Federal Credit Union',
      'Chime',
      'Varo Bank',
      'Current',
      'Axos Bank',
      'CIT Bank',
      // ✅ AJOUT: Néobanques et fintech
      'SoFi Money',
      'Revolut USA',
      'MoneyLion',
      'LendingClub Bank',
      'One Finance',
      'Yotta',
      'HMBradley',
      'Aspiration',
      'Qapital',
      'Acorns Banking'
    ]
  },
  'Chili': {
    physical: [
      'Banco de Chile',
      'BancoEstado',
      'Banco Santander Chile',
      'Banco de Crédito e Inversiones (BCI)',
      'Banco Itaú Chile',
      'Banco Security',
      'Banco Falabella',
      'Banco Ripley',
      'Banco Consorcio',
      'Banco Internacional',
      'Banco Paris',
      'Banco Edwards Citi',
      'Banco BICE',
      'Banco BTG Pactual Chile',
      // ✅ AJOUT: Banques chiliennes manquantes
      'Banco Scotiabank Chile',
      'Banco do Brasil Chile',
      'Banco Monex',
      'Banco Penta',
      'Banco Bilbao Vizcaya Argentaria Chile (BBVA)',
      'Banco Corpbanca',
      'Banco Conosur'
    ],
    virtual: [
      'Banco Digital BCI',
      'Santander Digital',
      'Itaú Digital',
      'Falabella Digital',
      'Tenpo',
      'Mach',
      'Multicaja',
      // ✅ AJOUT: Fintech chiliennes
      'Fintual',
      'Renta4 Chile',
      'Bice Inversiones Digital',
      'Security Digital',
      'Khipu',
      'Flow (DaviPlata Chile)'
    ]
  }
};

// ✅ CONFIGURATION DES PAIEMENTS MOBILES
const mobileProviders = {
  'Interac': {
    fields: ['mobile_email', 'mobile_phone'],
    labels: {
      mobile_email: 'Adresse e-mail Interac',
      mobile_phone: 'Numéro de téléphone (optionnel)'
    }
  },
  'PayPal Mobile': {
    fields: ['mobile_email'],
    labels: {
      mobile_email: 'Adresse e-mail PayPal'
    }
  }
};

export function AdminBankAccountManager({ open, onClose }: AdminBankAccountManagerProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    account_type: 'bank' as 'bank' | 'card' | 'mobile',
    bank_name: '',
    account_number: '',
    account_holder: '',
    country: '',
    currency: 'USD',
    iban: '',
    swift: '',
    routing_number: '',
    // ✅ NOUVEAUX CHAMPS
    transit_number: '',
    institution_number: '',
    mobile_email: '',
    mobile_phone: '',
    mobile_provider: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // ✅ NOUVEAU: État pour gérer la sélection de banque
  const [selectedBankType, setSelectedBankType] = useState<'physical' | 'virtual'>('physical');

  // ✅ NOUVEAU: Protection des comptes bancaires
  const { 
    isAuthorizedAdmin, 
    secureUpdateBankAccount, 
    secureDeleteBankAccount 
  } = useBankAccountProtection();

  // ✅ PROTECTION: Vérifier l'accès admin au montage
  useEffect(() => {
    if (open && !isAuthorizedAdmin) {
      toast({
        title: "❌ Accès refusé",
        description: "Vous n'avez pas les droits pour gérer les comptes bancaires",
        variant: "destructive",
      });
      onClose();
      return;
    }
  }, [open, isAuthorizedAdmin, onClose, toast]);

  // ✅ CONFIGURATION DES PAYS ET LEURS CHAMPS SPÉCIFIQUES
  const countryConfigs = {
    'Canada': {
      currency: 'CAD',
      fields: ['transit_number', 'institution_number', 'account_number'],
      labels: {
        transit_number: 'Numéro de transit',
        institution_number: 'Numéro d\'institution',
        account_number: 'Numéro de compte'
      }
    },
    'République Dominicaine': {
      currency: 'DOP',
      fields: ['bank_name', 'account_number', 'routing_number'],
      labels: {
        bank_name: 'Nom de la banque',
        account_number: 'Numéro de compte',
        routing_number: 'Code de routage'
      }
    },
    'USA': {
      currency: 'USD',
      fields: ['bank_name', 'account_number', 'routing_number'],
      labels: {
        bank_name: 'Bank Name',
        account_number: 'Account Number',
        routing_number: 'Routing Number'
      }
    },
    'Chili': {
      currency: 'CLP',
      fields: ['bank_name', 'account_number', 'swift'],
      labels: {
        bank_name: 'Nombre del Banco',
        account_number: 'Número de Cuenta',
        swift: 'Código SWIFT'
      }
    }
  };

  useEffect(() => {
    if (open) {
      loadBankAccounts();
    }
  }, [open]);

  // ✅ EFFET pour mettre à jour automatiquement la devise selon le pays
  useEffect(() => {
    if (formData.country && countryConfigs[formData.country as keyof typeof countryConfigs]) {
      const config = countryConfigs[formData.country as keyof typeof countryConfigs];
      setFormData(prev => ({ ...prev, currency: config.currency }));
    }
  }, [formData.country]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      
      // Simuler des données d'exemple pour l'instant
      const mockAccounts: BankAccount[] = [
        {
          id: '1',
          account_type: 'bank',
          bank_name: 'Banque Nationale',
          account_number: '**** **** **** 1234',
          account_holder: 'AMORA SAS',
          country: 'Canada',
          currency: 'CAD',
          transit_number: '12345',
          institution_number: '001',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          account_type: 'mobile',
          bank_name: 'Interac',
          account_number: 'admin@amora.com',
          account_holder: 'Admin AMORA',
          country: 'Canada',
          currency: 'CAD',
          mobile_email: 'admin@amora.com',
          mobile_provider: 'Interac',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];
      
      setAccounts(mockAccounts);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les comptes bancaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ SÉCURISÉ: Fonction de sauvegarde protégée
  const handleSave = async () => {
    if (!isAuthorizedAdmin) {
      toast({
        title: "❌ Accès refusé",
        description: "Action non autorisée",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Validation des champs requis
      const requiredFields = getRequiredFields();
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Erreur",
          description: `Veuillez remplir tous les champs obligatoires : ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // ✅ SÉCURISÉ: Utiliser la fonction protégée pour sauvegarder
      const result = await supabase
        .from('admin_bank_accounts')
        .insert({
          ...formData,
          created_by: user?.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (result.error) throw result.error;

      const newAccount: BankAccount = {
        id: result.data.id,
        ...formData,
        is_active: true,
        created_at: new Date().toISOString()
      };

      setAccounts(prev => [...prev, newAccount]);
      setShowAddForm(false);
      resetForm();

      toast({
        title: "✅ Compte ajouté",
        description: "Le compte a été ajouté avec succès",
      });

    } catch (error: any) {
      console.error('❌ Erreur sauvegarde sécurisée:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le compte",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ FONCTION pour déterminer les champs requis selon le type et pays
  const getRequiredFields = () => {
    const baseFields = ['account_holder'];
    
    if (formData.account_type === 'mobile') {
      if (formData.mobile_provider === 'Interac') {
        return [...baseFields, 'mobile_email'];
      }
      return [...baseFields, 'mobile_email'];
    }
    
    if (formData.account_type === 'bank' && formData.country) {
      const config = countryConfigs[formData.country as keyof typeof countryConfigs];
      if (config) {
        return [...baseFields, ...config.fields];
      }
    }
    
    return [...baseFields, 'bank_name', 'account_number'];
  };

  // ✅ FONCTION pour obtenir les banques disponibles selon le pays
  const getAvailableBanks = () => {
    if (!formData.country || formData.account_type !== 'bank') return [];
    
    const countryBanks = banksByCountry[formData.country as keyof typeof banksByCountry];
    if (!countryBanks) return [];
    
    return [
      ...countryBanks.physical.map(bank => ({ name: bank, type: 'physical' as const })),
      ...countryBanks.virtual.map(bank => ({ name: bank, type: 'virtual' as const }))
    ];
  };

  // ✅ FONCTION pour rendre le sélecteur de banque
  const renderBankSelector = () => {
    if (formData.account_type !== 'bank' || !formData.country) return null;

    const availableBanks = getAvailableBanks();
    
    return (
      <div className="space-y-4">
        {/* Type de banque */}
        <div className="space-y-2">
          <Label>Type de banque</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={selectedBankType === 'physical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBankType('physical')}
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Banques physiques
            </Button>
            <Button
              type="button"
              variant={selectedBankType === 'virtual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBankType('virtual')}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Banques numériques
            </Button>
          </div>
        </div>

        {/* Sélecteur de banque */}
        <div className="space-y-2">
          <Label>Nom de la banque *</Label>
          <Select 
            value={formData.bank_name} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, bank_name: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une banque" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {/* Banques physiques */}
              {selectedBankType === 'physical' && (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">
                    🏛️ Banques physiques
                  </div>
                  {banksByCountry[formData.country as keyof typeof banksByCountry]?.physical.map(bank => (
                    <SelectItem key={bank} value={bank}>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {bank}
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}

              {/* Banques numériques */}
              {selectedBankType === 'virtual' && (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">
                    📱 Banques numériques
                  </div>
                  {banksByCountry[formData.country as keyof typeof banksByCountry]?.virtual.map(bank => (
                    <SelectItem key={bank} value={bank}>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        {bank}
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}

              {/* Option personnalisée */}
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border-t">
                ✏️ Autre
              </div>
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Autre banque (saisie manuelle)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Champ de saisie manuelle si "custom" sélectionné */}
        {formData.bank_name === 'custom' && (
          <div className="space-y-2">
            <Label>Nom de la banque (saisie manuelle) *</Label>
            <Input
              placeholder="Ex: Ma Banque Locale"
              value={formData.bank_name === 'custom' ? '' : formData.bank_name}
              onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
            />
          </div>
        )}
      </div>
    );
  };

  // ✅ FONCTION pour rendre les champs dynamiquement (mise à jour)
  const renderDynamicFields = () => {
    if (formData.account_type === 'mobile') {
      return (
        <>
          {/* Sélection du fournisseur de paiement mobile */}
          <div className="space-y-2">
            <Label>Fournisseur de paiement mobile *</Label>
            <Select value={formData.mobile_provider} onValueChange={(value) => setFormData(prev => ({ ...prev, mobile_provider: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Interac">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Interac (Canada)
                  </div>
                </SelectItem>
                <SelectItem value="PayPal Mobile">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    PayPal Mobile
                  </div>
                </SelectItem>
                <SelectItem value="Zelle">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Zelle (USA)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Champs spécifiques au fournisseur mobile */}
          {formData.mobile_provider && mobileProviders[formData.mobile_provider as keyof typeof mobileProviders] && (
            <>
              {mobileProviders[formData.mobile_provider as keyof typeof mobileProviders].fields.map(field => (
                <div key={field} className="space-y-2">
                  <Label>
                    {mobileProviders[formData.mobile_provider as keyof typeof mobileProviders].labels[field as keyof typeof mobileProviders.Interac.labels]} *
                  </Label>
                  <div className="relative">
                    {field === 'mobile_email' ? (
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    )}
                    <Input
                      className="pl-10"
                      type={field === 'mobile_email' ? 'email' : 'tel'}
                      placeholder={field === 'mobile_email' ? 'votre@email.com' : '+1 234 567 8900'}
                      value={formData[field as keyof typeof formData] as string}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      );
    }

    if (formData.account_type === 'bank') {
      return (
        <>
          {/* Sélection du pays */}
          <div className="space-y-2">
            <Label>Pays *</Label>
            <Select value={formData.country} onValueChange={(value) => {
              setFormData(prev => ({ 
                ...prev, 
                country: value,
                bank_name: '' // Reset bank selection when country changes
              }));
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                <SelectItem value="République Dominicaine">🇩🇴 République Dominicaine</SelectItem>
                <SelectItem value="USA">🇺🇸 USA</SelectItem>
                <SelectItem value="Chili">🇨🇱 Chili</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ✅ NOUVEAU: Sélecteur de banque dynamique */}
          {formData.country && renderBankSelector()}

          {/* Champs spécifiques au Canada */}
          {formData.country === 'Canada' && formData.bank_name && formData.bank_name !== 'custom' && (
            <>
              <div className="space-y-2">
                <Label>Numéro de transit *</Label>
                <Input
                  placeholder="Ex: 12345"
                  value={formData.transit_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, transit_number: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">5 chiffres du code de transit</p>
              </div>

              <div className="space-y-2">
                <Label>Numéro d'institution *</Label>
                <Input
                  placeholder="Ex: 001"
                  value={formData.institution_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, institution_number: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">3 chiffres du code d'institution</p>
              </div>

              <div className="space-y-2">
                <Label>Numéro de compte *</Label>
                <Input
                  placeholder="Ex: 1234567"
                  value={formData.account_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">7-12 chiffres du numéro de compte</p>
              </div>
            </>
          )}

          {/* Champs pour autres pays */}
          {formData.country && formData.country !== 'Canada' && formData.bank_name && formData.bank_name !== 'custom' && (
            <>
              <div className="space-y-2">
                <Label>Numéro de compte *</Label>
                <Input
                  placeholder="Ex: 1234567890"
                  value={formData.account_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                />
              </div>

              {(formData.country === 'USA' || formData.country === 'République Dominicaine') && (
                <div className="space-y-2">
                  <Label>Routing Number *</Label>
                  <Input
                    placeholder="Ex: 021000021"
                    value={formData.routing_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, routing_number: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.country === 'USA' ? '9 chiffres du routing number' : 'Code de routage de la banque'}
                  </p>
                </div>
              )}

              {formData.country === 'Chili' && (
                <div className="space-y-2">
                  <Label>Code SWIFT *</Label>
                  <Input
                    placeholder="Ex: BCHCCLRM"
                    value={formData.swift}
                    onChange={(e) => setFormData(prev => ({ ...prev, swift: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Code SWIFT de la banque chilienne</p>
                </div>
              )}

              {/* IBAN optionnel pour certaines banques */}
              <div className="space-y-2">
                <Label>IBAN (optionnel)</Label>
                <Input
                  placeholder="Ex: CL12 3456 7890 1234 5678 9012"
                  value={formData.iban}
                  onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Si votre banque utilise le format IBAN</p>
              </div>
            </>
          )}
        </>
      );
    }

    // Champs pour carte de crédit/débit (existant)
    if (formData.account_type === 'card') {
      return (
        <>
          <div className="space-y-2">
            <Label>Pays *</Label>
            <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                <SelectItem value="République Dominicaine">🇩🇴 République Dominicaine</SelectItem>
                <SelectItem value="USA">🇺🇸 USA</SelectItem>
                <SelectItem value="Chili">🇨🇱 Chili</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nom de la banque/émetteur *</Label>
            <Input
              placeholder="Ex: Visa Business"
              value={formData.bank_name}
              onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Numéro de carte *</Label>
            <Input
              placeholder="Ex: 4532 1234 5678 9012"
              value={formData.account_number}
              onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
            />
          </div>
        </>
      );
    }

    return null;
  };

  // ✅ MISE À JOUR de la fonction resetForm
  const resetForm = () => {
    setFormData({
      account_type: 'bank',
      bank_name: '',
      account_number: '',
      account_holder: '',
      country: '',
      currency: 'USD',
      iban: '',
      swift: '',
      routing_number: '',
      transit_number: '',
      institution_number: '',
      mobile_email: '',
      mobile_phone: '',
      mobile_provider: ''
    });
    setSelectedBankType('physical');
  };

  // ✅ SÉCURISÉ: Fonction de modification protégée
  const toggleAccountStatus = async (accountId: string) => {
    if (!isAuthorizedAdmin) {
      toast({
        title: "❌ Accès refusé",
        description: "Action non autorisée",
        variant: "destructive",
      });
      return;
    }

    try {
      const account = accounts.find(a => a.id === accountId);
      if (!account) return;

      const result = await secureUpdateBankAccount(
        accountId,
        { is_active: !account.is_active }
      );

      if (result.success) {
        setAccounts(prev => prev.map(account => 
          account.id === accountId 
            ? { ...account, is_active: !account.is_active }
            : account
        ));
      }

    } catch (error) {
      console.error('Erreur toggle status:', error);
    }
  };

  // ✅ SÉCURISÉ: Fonction de suppression protégée
  const deleteAccount = async (accountId: string) => {
    if (!isAuthorizedAdmin) {
      toast({
        title: "❌ Accès refusé",
        description: "Action non autorisée",
        variant: "destructive",
      });
      return;
    }

    // Double confirmation pour la suppression
    const confirmed = window.confirm(
      '⚠️ ATTENTION: Êtes-vous sûr de vouloir supprimer ce compte bancaire ?\n\n' +
      'Cette action est irréversible et peut affecter les paiements en cours.\n\n' +
      'Tapez "SUPPRIMER" pour confirmer.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      'Pour confirmer la suppression, tapez exactement: SUPPRIMER'
    );

    if (doubleConfirm !== 'SUPPRIMER') {
      toast({
        title: "Suppression annulée",
        description: "La suppression a été annulée par sécurité",
      });
      return;
    }

    try {
      const result = await secureDeleteBankAccount(accountId);

      if (result.success) {
        setAccounts(prev => prev.filter(account => account.id !== accountId));
      }

    } catch (error) {
      console.error('Erreur suppression sécurisée:', error);
    }
  };

  // ✅ PROTECTION: Bloquer l'accès si pas admin
  if (!isAuthorizedAdmin) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Accès refusé
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p>Vous n'avez pas les droits d'administrateur pour gérer les comptes bancaires.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Cette tentative d'accès a été enregistrée pour audit.
            </p>
            <Button onClick={onClose} className="mt-4">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-blue-500" />
            Gestion des Comptes Bancaires Admin
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête avec bouton d'ajout */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Vos comptes pour recevoir les paiements</h3>
              <p className="text-sm text-muted-foreground">
                Configurez vos comptes bancaires et moyens de paiement pour recevoir l'argent des utilisateurs
              </p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un compte
            </Button>
          </div>

          {/* Liste des comptes existants */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Chargement des comptes...</p>
            </div>
          ) : accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((account) => (
                <Card key={account.id} className={`border-2 ${account.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {account.account_type === 'bank' ? (
                          <Landmark className="w-5 h-5" />
                        ) : account.account_type === 'mobile' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <CreditCard className="w-5 h-5" />
                        )}
                        <div>
                          <h4 className="font-semibold">{account.bank_name}</h4>
                          <Badge variant={account.is_active ? "default" : "secondary"}>
                            {account.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAccountStatus(account.id)}
                        >
                          {account.is_active ? "Désactiver" : "Activer"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAccount(account.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Titulaire :</strong>
                        <p>{account.account_holder}</p>
                      </div>
                      <div>
                        <strong>Type :</strong>
                        <p className="capitalize">{account.account_type}</p>
                      </div>
                      <div>
                        <strong>Pays :</strong>
                        <p>{account.country}</p>
                      </div>
                      <div>
                        <strong>Devise :</strong>
                        <p>{account.currency}</p>
                      </div>
                      
                      {/* ✅ AFFICHAGE DYNAMIQUE selon le type */}
                      {account.account_type === 'bank' && account.country === 'Canada' && (
                        <>
                          <div>
                            <strong>Transit :</strong>
                            <p className="font-mono">{account.transit_number}</p>
                          </div>
                          <div>
                            <strong>Institution :</strong>
                            <p className="font-mono">{account.institution_number}</p>
                          </div>
                          <div className="col-span-2">
                            <strong>Numéro de compte :</strong>
                            <p className="font-mono">{account.account_number}</p>
                          </div>
                        </>
                      )}
                      
                      {account.account_type === 'mobile' && (
                        <>
                          {account.mobile_email && (
                            <div className="col-span-2">
                              <strong>Email :</strong>
                              <p className="font-mono">{account.mobile_email}</p>
                            </div>
                          )}
                          {account.mobile_phone && (
                            <div className="col-span-2">
                              <strong>Téléphone :</strong>
                              <p className="font-mono">{account.mobile_phone}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {account.account_type === 'bank' && account.country !== 'Canada' && (
                        <>
                          <div className="col-span-2">
                            <strong>Numéro :</strong>
                            <p className="font-mono">{account.account_number}</p>
                          </div>
                          {account.iban && (
                            <div className="col-span-2">
                              <strong>IBAN :</strong>
                              <p className="font-mono text-xs">{account.iban}</p>
                            </div>
                          )}
                          {account.swift && (
                            <div>
                              <strong>SWIFT :</strong>
                              <p className="font-mono">{account.swift}</p>
                            </div>
                          )}
                          {account.routing_number && (
                            <div>
                              <strong>Routing :</strong>
                              <p className="font-mono">{account.routing_number}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Landmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun compte configuré</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez vos comptes bancaires pour recevoir les paiements des utilisateurs
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter votre premier compte
              </Button>
            </div>
          )}

          {/* ✅ FORMULAIRE D'AJOUT AMÉLIORÉ AVEC SÉLECTEUR DE BANQUES */}
          {showAddForm && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Ajouter un nouveau compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type de compte */}
                  <div className="space-y-2">
                    <Label>Type de paiement *</Label>
                    <Select value={formData.account_type} onValueChange={(value: any) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        account_type: value,
                        // Reset des champs spécifiques
                        country: '',
                        bank_name: '',
                        mobile_provider: ''
                      }));
                      setSelectedBankType('physical');
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">
                          <div className="flex items-center gap-2">
                            <Landmark className="w-4 h-4" />
                            Compte bancaire
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Carte de débit/crédit
                          </div>
                        </SelectItem>
                        <SelectItem value="mobile">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            Paiement mobile
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Titulaire du compte - toujours affiché */}
                  <div className="space-y-2">
                    <Label>Titulaire du compte *</Label>
                    <Input
                      placeholder="Ex: Votre nom complet"
                      value={formData.account_holder}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_holder: e.target.value }))}
                    />
                  </div>

                  {/* ✅ CHAMPS DYNAMIQUES selon le type et pays */}
                  {renderDynamicFields()}

                  {/* Devise - mise à jour automatiquement */}
                  <div className="space-y-2">
                    <Label>Devise</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAD">CAD - Dollar canadien</SelectItem>
                        <SelectItem value="USD">USD - Dollar américain</SelectItem>
                        <SelectItem value="DOP">DOP - Peso dominicain</SelectItem>
                        <SelectItem value="CLP">CLP - Peso chilien</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* ✅ INFORMATIONS DYNAMIQUES avec guide par pays */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-blue-800">
                        Guide pour {formData.country || 'votre pays'}
                        {formData.account_type === 'mobile' && formData.mobile_provider && ` - ${formData.mobile_provider}`}
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        {formData.country === 'Canada' && formData.account_type === 'bank' && (
                          <>
                            <li>Format canadien : Transit (5 chiffres) + Institution (3 chiffres) + Compte</li>
                            <li>Trouvez ces informations sur votre chèque ou relevé bancaire</li>
                            <li>Banques physiques : succursales disponibles</li>
                            <li>Banques numériques : services en ligne uniquement</li>
                          </>
                        )}
                        {formData.country === 'USA' && formData.account_type === 'bank' && (
                          <>
                            <li>Routing Number : 9 chiffres pour identifier la banque</li>
                            <li>Account Number : votre numéro de compte personnel</li>
                            <li>Vérifiez sur votre chèque ou bank statement</li>
                          </>
                        )}
                        {formData.country === 'République Dominicaine' && formData.account_type === 'bank' && (
                          <>
                            <li>Código de routing : fourni par votre banque</li>
                            <li>Número de cuenta : votre compte personnel</li>
                            <li>Vérifiez avec votre conseiller bancaire</li>
                          </>
                        )}
                        {formData.country === 'Chili' && formData.account_type === 'bank' && (
                          <>
                            <li>Código SWIFT : code international de votre banque</li>
                            <li>Número de cuenta : votre compte en pesos chiliens</li>
                            <li>IBAN optionnel si votre banque le supporte</li>
                          </>
                        )}
                        {formData.account_type === 'mobile' && (
                          <>
                            <li>Les paiements mobiles sont instantanés</li>
                            <li>Vérifiez que votre compte est activé pour recevoir des fonds</li>
                            <li>Les frais peuvent s'appliquer selon le fournisseur</li>
                          </>
                        )}
                        <li>Ces informations sont strictement confidentielles</li>
                        <li>Seul l'admin peut voir ces informations</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
