/**
 * Interface admin pour vérifier les paiements Caja Vecina
 * Avec visualisation des reçus et validation sécurisée
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileImage, 
  ExternalLink,
  AlertTriangle 
} from 'lucide-react';
import { useSecureCajaVecina } from '@/hooks/useSecureCajaVecina';
import { supabase } from '@/integrations/supabase/client';

export function CajaVecinaVerificationPanel() {
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [receiptVerified, setReceiptVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const { verifyPaymentAsAdmin } = useSecureCajaVecina();

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('caja_vecina_payments')
        .select(`
          *,
          users (email, full_name),
          caja_vecina_accounts (account_name, account_number)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingPayments(data || []);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (action: 'approve' | 'reject') => {
    if (!selectedPayment) return;

    try {
      const result = await verifyPaymentAsAdmin(
        selectedPayment.id,
        action,
        adminNotes,
        receiptVerified
      );

      if (result.success) {
        setSelectedPayment(null);
        setAdminNotes('');
        setReceiptVerified(false);
        await loadPendingPayments();
      }
    } catch (error) {
      console.error('Erreur vérification:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vérification Paiements Caja Vecina</h2>
        <Badge variant="secondary">
          {pendingPayments.length} en attente
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      ) : pendingPayments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun paiement en attente</h3>
            <p className="text-muted-foreground">
              Tous les paiements Caja Vecina ont été traités
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste des paiements */}
          <div className="space-y-4">
            <h3 className="font-semibold">Paiements à vérifier</h3>
            {pendingPayments.map((payment) => (
              <Card 
                key={payment.id} 
                className={`cursor-pointer transition-colors ${
                  selectedPayment?.id === payment.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedPayment(payment)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{payment.users?.full_name || 'Utilisateur'}</p>
                      <p className="text-sm text-muted-foreground">{payment.users?.email}</p>
                    </div>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      En attente
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <strong>Montant :</strong> ${payment.amount}
                    </div>
                    <div>
                      <strong>Référence :</strong> {payment.transaction_reference}
                    </div>
                    <div>
                      <strong>Compte :</strong> {payment.caja_vecina_accounts?.account_name}
                    </div>
                    <div>
                      <strong>Date :</strong> {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Panneau de vérification */}
          {selectedPayment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Vérification du paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Détails du paiement */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Détails du paiement</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                    <div><strong>Utilisateur :</strong> {selectedPayment.users?.email}</div>
                    <div><strong>Montant :</strong> ${selectedPayment.amount} USD</div>
                    <div><strong>Référence :</strong> {selectedPayment.transaction_reference}</div>
                    <div><strong>Date :</strong> {new Date(selectedPayment.created_at).toLocaleString()}</div>
                  </div>
                </div>

                {/* Reçu de paiement */}
                {selectedPayment.receipt_image_url && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Reçu de paiement</h4>
                    <div className="border rounded-lg p-2">
                      <img
                        src={selectedPayment.receipt_image_url}
                        alt="Reçu de paiement"
                        className="w-full h-48 object-contain rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => window.open(selectedPayment.receipt_image_url, '_blank')}
                        className="w-full mt-2"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Voir en grand
                      </Button>
                    </div>
                  </div>
                )}

                {/* Validation du reçu */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="receipt-verified"
                      checked={receiptVerified}
                      onChange={(e) => setReceiptVerified(e.target.checked)}
                    />
                    <Label htmlFor="receipt-verified" className="text-sm">
                      J'ai vérifié que le reçu est authentique et correspond au montant
                    </Label>
                  </div>
                </div>

                {/* Notes admin */}
                <div className="space-y-2">
                  <Label>Notes de vérification</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notes sur la vérification du paiement..."
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleVerification('approve')}
                    disabled={!receiptVerified || loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approuver et activer Premium
                  </Button>
                  <Button
                    onClick={() => handleVerification('reject')}
                    disabled={loading}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                </div>

                {!receiptVerified && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Vous devez confirmer avoir vérifié le reçu avant d'approuver le paiement
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
