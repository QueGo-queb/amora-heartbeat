import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Shield, 
  User, 
  Mail, 
  MapPin, 
  Calendar,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  plan: 'free' | 'premium';
  role: 'user' | 'admin';
  created_at: string;
}

interface UserToAdminSelectorProps {
  open: boolean;
  onClose: () => void;
  onAdminCreated: () => void;
}

export function UserToAdminSelector({ open, onClose, onAdminCreated }: UserToAdminSelectorProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [promotingUsers, setPromotingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Charger les utilisateurs (excluant les admins existants)
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin') // Exclure les admins existants
        .order('created_at', { ascending: false })
        .limit(100); // Limiter à 100 pour les performances

      if (error) throw error;

      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs par nom/email
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Charger les utilisateurs à l'ouverture
  useEffect(() => {
    if (open) {
      loadUsers();
      setSearchTerm('');
    }
  }, [open]);

  // Promouvoir un utilisateur en admin
  const promoteToAdmin = async (userId: string, userEmail: string) => {
    try {
      setPromotingUsers(prev => new Set([...prev, userId]));

      // Vérifier les permissions admin
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Non authentifié');

      // Mettre à jour le rôle dans la base de données
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          plan: 'premium' // Les admins ont automatiquement le plan premium
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Mettre à jour l'état local
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setFilteredUsers(prev => prev.filter(u => u.user_id !== userId));

      toast({
        title: "✅ Admin créé avec succès !",
        description: `${userEmail} est maintenant administrateur`,
        duration: 5000,
      });

      onAdminCreated();
    } catch (error: any) {
      console.error('Erreur promotion admin:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de promouvoir l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setPromotingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Promouvoir un utilisateur en administrateur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Statistiques */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>📊 {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}</span>
            <span>🔍 {users.length} utilisateur{users.length > 1 ? 's' : ''} au total</span>
          </div>

          {/* Liste des utilisateurs */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Chargement des utilisateurs...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? (
                  <>
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun utilisateur trouvé pour "{searchTerm}"</p>
                  </>
                ) : (
                  <>
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Tous les utilisateurs sont déjà administrateurs</p>
                  </>
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.user_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {user.full_name || 'Nom non renseigné'}
                            </h3>
                            <Badge variant={user.plan === 'premium' ? 'default' : 'secondary'}>
                              {user.plan === 'premium' ? '👑 Premium' : '🆓 Gratuit'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            {user.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {user.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {user.bio && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => promoteToAdmin(user.user_id, user.email)}
                        disabled={promotingUsers.has(user.user_id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {promotingUsers.has(user.user_id) ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Promotion...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Promouvoir Admin
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
