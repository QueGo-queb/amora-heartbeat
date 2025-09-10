import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAccountDeletion } from '@/hooks/useAccountDeletion';

interface AccountDeletionModalProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function AccountDeletionModal({ open, onClose, userEmail }: AccountDeletionModalProps) {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmations, setConfirmations] = useState({
    understand: false,
    permanent: false,
    dataLoss: false
  });

  const { deleteAccount, loading } = useAccountDeletion();

  const allConfirmationsChecked = Object.values(confirmations).every(Boolean);
  const canProceed = allConfirmationsChecked && password.length >= 6;

  const handleDelete = async () => {
    if (!canProceed) return;

    const success = await deleteAccount(password, reason);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPassword('');
      setReason('');
      setConfirmations({
        understand: false,
        permanent: false,
        dataLoss: false
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#F8F9FA] border-[#E63946]/20 border-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#E63946]">
            <AlertTriangle className="w-5 h-5" />
            Supprimer définitivement mon compte
          </DialogTitle>
          <DialogDescription className="text-[#212529]">
            Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avertissements */}
          <div className="p-4 bg-[#E63946]/10 border border-[#E63946]/20 rounded-lg">
            <h4 className="font-bold text-[#E63946] mb-2">⚠️ Attention :</h4>
            <ul className="text-sm text-[#212529] space-y-1">
              <li>• Votre profil sera supprimé définitivement</li>
              <li>• Tous vos messages seront perdus</li>
              <li>• Vos matches seront supprimés</li>
              <li>• Cette action ne peut pas être annulée</li>
            </ul>
          </div>

          {/* Raison (optionnelle) */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-[#212529]">
              Pourquoi fermez-vous votre compte ? (optionnel)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Partagez-nous la raison de votre départ..."
              className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946]"
              rows={3}
            />
          </div>

          {/* Confirmations */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="understand"
                checked={confirmations.understand}
                onCheckedChange={(checked) => 
                  setConfirmations(prev => ({ ...prev, understand: checked as boolean }))
                }
                className="mt-1 data-[state=checked]:bg-[#E63946] data-[state=checked]:border-[#E63946]"
              />
              <Label htmlFor="understand" className="text-sm text-[#212529] leading-relaxed">
                Je comprends que cette action supprimera définitivement mon compte Amora
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="permanent"
                checked={confirmations.permanent}
                onCheckedChange={(checked) => 
                  setConfirmations(prev => ({ ...prev, permanent: checked as boolean }))
                }
                className="mt-1 data-[state=checked]:bg-[#E63946] data-[state=checked]:border-[#E63946]"
              />
              <Label htmlFor="permanent" className="text-sm text-[#212529] leading-relaxed">
                Je comprends que cette action est irréversible et permanente
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="dataLoss"
                checked={confirmations.dataLoss}
                onCheckedChange={(checked) => 
                  setConfirmations(prev => ({ ...prev, dataLoss: checked as boolean }))
                }
                className="mt-1 data-[state=checked]:bg-[#E63946] data-[state=checked]:border-[#E63946]"
              />
              <Label htmlFor="dataLoss" className="text-sm text-[#212529] leading-relaxed">
                J'accepte la perte définitive de toutes mes données
              </Label>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#212529] font-medium">
              Confirmez avec votre mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe actuel"
                className="border-[#CED4DA] focus:border-[#E63946] focus:ring-[#E63946] pr-10"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-[#CED4DA]" />
                ) : (
                  <Eye className="h-4 w-4 text-[#CED4DA]" />
                )}
              </Button>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-[#CED4DA] text-[#212529] hover:bg-[#CED4DA]/20"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!canProceed || loading}
              className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 text-white border-0"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Suppression...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Supprimer définitivement
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
