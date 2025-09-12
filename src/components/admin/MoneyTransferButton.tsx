/**
 * Bouton pour transférer l'argent accumulé vers le compte bancaire (version simplifiée)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Banknote, ArrowRight, Loader2, CreditCard } from 'lucide-react';

interface PlatformBalance {
  totalRevenue: number;
  availableBalance: number;
  pendingTransfers: number;
  lastTransferDate?: string;
}

export const MoneyTransferButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [balance, setBalance] = useState<PlatformBalance | null>(null);
  const { toast } = useToast();

  // Charger le solde de la plateforme (simulation)
  const loadPlatformBalance = async () => {
    setLoading(true);
    try {
      // Simulation des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBalance({
        totalRevenue: 2500.00,
        availableBalance: 1200.00,
        pendingTransfers: 0,
        lastTransferDate: new Date().toISOString()
      });

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

  // Effectuer le transfert d'argent (simulation)
  const handleTransfer = async () => {
    if (!balance || balance.availableBalance <= 0) {
      toast({
        title: "❌ Erreur",
        description: "Aucun montant disponible pour le transfert",
        variant: "destructive",
      });
      return;
    }

    setTransferLoading(true);
    try {
      // Simulation du transfert
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "✅ Transfert simulé",
        description: `${balance.availableBalance.toFixed(2)}€ seraient transférés vers votre compte bancaire`,
      });

      // Recharger le solde
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfert d'argent vers votre compte</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Chargement du solde...</span>
          </div>
        ) : balance ? (
          <div className="space-y-4">
            {/* Résumé du solde */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Solde de la plateforme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenu total :</span>
                  <span className="font-semibold">{balance.totalRevenue.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Montant disponible :</span>
                  <span className="font-bold text-green-600">
                    {balance.availableBalance.toFixed(2)}€
                  </span>
                </div>
                {balance.lastTransferDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dernier transfert :</span>
                    <span className="text-sm">
                      {new Date(balance.lastTransferDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations du transfert */}
            {balance.availableBalance > 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-800">Détails du transfert</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Montant: {balance.availableBalance.toFixed(2)}€</p>
                  <p>• Destination: Compte bancaire principal</p>
                  <p>• Délai: 1-3 jours ouvrables</p>
                  <p>• Méthode: Virement bancaire sécurisé</p>
                </div>
              </div>
            ) : (
              <div className="bg-muted border rounded-lg p-4 text-center">
                <p className="text-muted-foreground">Aucun montant disponible pour le transfert</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button 
                onClick={handleTransfer}
                disabled={transferLoading || balance.availableBalance <= 0}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {transferLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {transferLoading ? 'Transfert...' : 'Confirmer le transfert'}
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
          <div className="text-center py-4 text-muted-foreground">
            Erreur lors du chargement des données
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};