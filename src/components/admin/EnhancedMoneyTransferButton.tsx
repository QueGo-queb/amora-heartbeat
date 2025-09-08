import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Banknote, ArrowRight, Loader2, Plus, CreditCard, Building2, Smartphone } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'bank' | 'card' | 'interac';
  name: string;
  details: string;
  isDefault: boolean;
}

interface PlatformBalance {
  totalRevenue: number;
  availableBalance: number;
  pendingTransfers: number;
  lastTransferDate?: string;
}

export const EnhancedMoneyTransferButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [balance, setBalance] = useState<PlatformBalance | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethodForm, setNewMethodForm] = useState({
    type: 'bank' as 'bank' | 'card' | 'interac',
    name: '',
    details: ''
  });
  const { toast } = useToast();

  // Charger les méthodes de paiement
  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      
      setPaymentMethods(data || []);
      
      // Sélectionner la méthode par défaut
      const defaultMethod = data?.find(m => m.is_default);
      if (defaultMethod) setSelectedMethod(defaultMethod.id);
      
    } catch (error) {
      console.error('Erreur chargement méthodes:', error);
    }
  };

  // Charger le solde de la plateforme
  const loadPlatformBalance = async () => {
    setLoading(true);
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount_cents, created_at, status')
        .eq('status', 'succeeded');

      if (error) throw error;

      const totalRevenue = (transactions?.reduce((sum, t) => sum + (t.amount_cents || 0), 0) || 0) / 100;
      
      const { data: transfers } = await supabase
        .from('admin_transfers')
        .select('amount, created_at')
        .order('created_at', { ascending: false });

      const totalTransferred = (transfers?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0);
      const availableBalance = totalRevenue - totalTransferred;

      setBalance({
        totalRevenue,
        availableBalance,
        pendingTransfers: 0,
        lastTransferDate: transfers?.[0]?.created_at
      });

      await loadPaymentMethods();

    } catch (error: any) {
      console.error('Erreur chargement solde:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger le solde de la plateforme",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une nouvelle méthode de paiement
  const handleAddPaymentMethod = async () => {
    if (!newMethodForm.name || !newMethodForm.details) {
      toast({
        title: "❌ Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          type: newMethodForm.type,
          name: newMethodForm.name,
          details: newMethodForm.details,
          is_default: paymentMethods.length === 0,
          is_active: true,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Méthode ajoutée",
        description: "Nouvelle méthode de paiement ajoutée avec succès",
      });

      setNewMethodForm({ type: 'bank', name: '', details: '' });
      setShowAddMethod(false);
      await loadPaymentMethods();

    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible d'ajouter la méthode de paiement",
        variant: "destructive",
      });
    }
  };

  // Effectuer le transfert
  const handleTransfer = async () => {
    if (!balance || balance.availableBalance <= 0) {
      toast({
        title: "❌ Erreur",
        description: "Aucun montant disponible pour le transfert",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        title: "❌ Erreur",
        description: "Veuillez sélectionner une méthode de paiement",
        variant: "destructive",
      });
      return;
    }

    setTransferLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
      const transferAmount = balance.availableBalance;

      // Enregistrer le transfert
      const { error: transferError } = await supabase
        .from('admin_transfers')
        .insert({
          amount: transferAmount,
          status: 'pending',
          transfer_method: selectedPaymentMethod?.type || 'bank_transfer',
          payment_method_id: selectedMethod,
          requested_by: user.id,
          description: `Transfert via ${selectedPaymentMethod?.name} - ${transferAmount.toFixed(2)}€`
        });

      if (transferError) throw transferError;

      // Simulation API de transfert
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "✅ Transfert effectué",
        description: `${transferAmount.toFixed(2)}€ transférés vers ${selectedPaymentMethod?.name}`,
      });

      await loadPlatformBalance();
      setShowDialog(false);

    } catch (error: any) {
      console.error('Erreur transfert:', error);
      toast({
        title: "❌ Erreur de transfert",
        description: error.message || "Impossible d'effectuer le transfert",
        variant: "destructive",
      });
    } finally {
      setTransferLoading(false);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Building2 className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'interac': return <Smartphone className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={loadPlatformBalance}
        >
          <Banknote className="w-4 h-4 mr-2" />
          Transférer l'argent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transfert d'argent vers vos comptes</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Chargement du solde...</span>
          </div>
        ) : balance ? (
          <div className="space-y-6">
            {/* Résumé du solde */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Solde de la plateforme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenu total :</span>
                  <span className="font-semibold">{balance.totalRevenue.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Montant disponible :</span>
                  <span className="font-bold text-green-600">
                    {balance.availableBalance.toFixed(2)}€
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Sélection de la méthode de paiement */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Méthode de transfert</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddMethod(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent>
                {paymentMethods.length > 0 ? (
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(method.type)}
                            <span>{method.name}</span>
                            {method.isDefault && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                                Défaut
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Aucune méthode de paiement configurée
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Formulaire d'ajout de méthode */}
            {showAddMethod && (
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm">Nouvelle méthode de paiement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={newMethodForm.type} 
                      onValueChange={(value: any) => setNewMethodForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Compte bancaire</SelectItem>
                        <SelectItem value="card">Carte bancaire</SelectItem>
                        <SelectItem value="interac">Interac</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input
                      value={newMethodForm.name}
                      onChange={(e) => setNewMethodForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Compte principal RBC"
                    />
                  </div>
                  <div>
                    <Label>Détails</Label>
                    <Input
                      value={newMethodForm.details}
                      onChange={(e) => setNewMethodForm(prev => ({ ...prev, details: e.target.value }))}
                      placeholder="Ex: ****1234"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddPaymentMethod}>Ajouter</Button>
                    <Button variant="outline" onClick={() => setShowAddMethod(false)}>
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button 
                onClick={handleTransfer}
                disabled={transferLoading || balance.availableBalance <= 0 || !selectedMethod}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {transferLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {transferLoading ? 'Transfert...' : `Transférer ${balance.availableBalance.toFixed(2)}€`}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                disabled={transferLoading}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Erreur lors du chargement des données
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};