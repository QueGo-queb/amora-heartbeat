import { useState } from 'react';
import { Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccountDeletion } from '@/hooks/useAccountDeletion';

export const DeleteAccountForm = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { deleteAccount, loading } = useAccountDeletion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    const success = await deleteAccount(password);
    if (success) {
      setPassword('');
      setConfirmDelete(false);
    }
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Supprimer mon compte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Attention :</strong> Cette action est irréversible. Toutes vos données 
            (profil, posts, messages, etc.) seront définitivement supprimées.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="delete-password">Confirmez votre mot de passe</Label>
            <div className="relative">
              <Input
                id="delete-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {confirmDelete && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Êtes-vous sûr de vouloir supprimer définitivement votre compte ? 
                Cette action ne peut pas être annulée.
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            variant="destructive"
            disabled={loading || !password}
            className="w-full"
          >
            {loading ? (
              "Suppression en cours..."
            ) : confirmDelete ? (
              "Confirmer la suppression"
            ) : (
              "Supprimer mon compte"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
