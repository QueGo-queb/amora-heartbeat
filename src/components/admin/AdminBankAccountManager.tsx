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
  Landmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  is_active: boolean;
  created_at: string;
}

interface AdminBankAccountManagerProps {
  open: boolean;
  onClose: () => void;
}

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
    routing_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadBankAccounts();
    }
  }, [open]);

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
          country: 'France',
          currency: 'EUR',
          iban: 'FR76 1234 5678 9012 3456 7890 123',
          swift: 'BNPAFRPP',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          account_type: 'card',
          bank_name: 'Visa Business',
          account_number: '**** **** **** 5678',
          account_holder: 'Admin AMORA',
          country: 'Canada',
          currency: 'CAD',
          is_active: false,
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

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Valider les champs requis
      if (!formData.bank_name || !formData.account_number || !formData.account_holder) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }

      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newAccount: BankAccount = {
        id: Date.now().toString(),
        ...formData,
        is_active: true,
        created_at: new Date().toISOString()
      };

      setAccounts(prev => [...prev, newAccount]);
      setShowAddForm(false);
      setFormData({
        account_type: 'bank',
        bank_name: '',
        account_number: '',
        account_holder: '',
        country: '',
        currency: 'USD',
        iban: '',
        swift: '',
        routing_number: ''
      });

      toast({
        title: "✅ Compte ajouté",
        description: "Le compte bancaire a été ajouté avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le compte bancaire",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAccountStatus = async (accountId: string) => {
    setAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, is_active: !account.is_active }
        : account
    ));
    
    toast({
      title: "Statut modifié",
      description: "Le statut du compte a été mis à jour",
    });
  };

  const deleteAccount = async (accountId: string) => {
    setAccounts(prev => prev.filter(account => account.id !== accountId));
    toast({
      title: "Compte supprimé",
      description: "Le compte bancaire a été supprimé",
    });
  };

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
                Configurez vos comptes bancaires et cartes pour recevoir l'argent des utilisateurs
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
                        <CreditCard className="w-5 h-5" />
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
                        <strong>Numéro :</strong>
                        <p className="font-mono">{account.account_number}</p>
                      </div>
                      <div>
                        <strong>Pays :</strong>
                        <p>{account.country}</p>
                      </div>
                      <div>
                        <strong>Devise :</strong>
                        <p>{account.currency}</p>
                      </div>
                      {account.iban && (
                        <div className="col-span-2">
                          <strong>IBAN :</strong>
                          <p className="font-mono text-xs">{account.iban}</p>
                        </div>
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

          {/* Formulaire d'ajout */}
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
                  <div className="space-y-2">
                    <Label>Type de compte *</Label>
                    <Select value={formData.account_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, account_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Compte bancaire</SelectItem>
                        <SelectItem value="card">Carte de débit/crédit</SelectItem>
                        <SelectItem value="mobile">Paiement mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nom de la banque *</Label>
                    <Input
                      placeholder="Ex: Banque Nationale"
                      value={formData.bank_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Numéro de compte/carte *</Label>
                    <Input
                      placeholder="Ex: 1234567890"
                      value={formData.account_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Titulaire du compte *</Label>
                    <Input
                      placeholder="Ex: Votre nom complet"
                      value={formData.account_holder}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_holder: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pays</Label>
                    <Input
                      placeholder="Ex: France"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Devise</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - Dollar américain</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="CAD">CAD - Dollar canadien</SelectItem>
                        <SelectItem value="HTG">HTG - Gourde haïtienne</SelectItem>
                        <SelectItem value="CLP">CLP - Peso chilien</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.account_type === 'bank' && (
                    <>
                      <div className="space-y-2">
                        <Label>IBAN (optionnel)</Label>
                        <Input
                          placeholder="Ex: FR76 1234 5678 9012 3456 7890 123"
                          value={formData.iban}
                          onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Code SWIFT (optionnel)</Label>
                        <Input
                          placeholder="Ex: BNPAFRPP"
                          value={formData.swift}
                          onChange={(e) => setFormData(prev => ({ ...prev, swift: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-yellow-800">Informations importantes :</p>
                      <ul className="list-disc list-inside space-y-1 text-yellow-700">
                        <li>Ces informations sont strictement confidentielles</li>
                        <li>Vérifiez soigneusement les détails avant de sauvegarder</li>
                        <li>Seul l'admin peut voir ces informations</li>
                        <li>Gardez une sauvegarde de ces informations en lieu sûr</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
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
