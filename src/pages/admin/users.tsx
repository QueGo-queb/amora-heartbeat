/**
 * Page de gestion des utilisateurs
 * Permet de voir, modifier et gérer tous les utilisateurs
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MoreHorizontal,
  User,
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import HeaderAdmin from '@/components/admin/HeaderAdmin';
import BackButton from '@/components/admin/BackButton';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  plan?: string;
  is_active?: boolean;
  profile?: {
    avatar_url?: string;
    bio?: string;
    location?: string;
  };
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadUsers();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'clodenerc@yahoo.fr') {
      navigate('/');
      return;
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          last_sign_in_at,
          plan,
          is_active,
          profile:profiles!inner(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'delete') => {
    try {
      if (action === 'delete' && !confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
      }

      let updateData = {};
      if (action === 'ban') {
        updateData = { is_active: false };
      } else if (action === 'unban') {
        updateData = { is_active: true };
      }

      if (action === 'delete') {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
        
        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: `Utilisateur ${action === 'ban' ? 'banni' : action === 'unban' ? 'débanni' : 'supprimé'} avec succès`,
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && user.is_active;
    if (filter === 'inactive') return matchesSearch && !user.is_active;
    if (filter === 'premium') return matchesSearch && user.plan === 'premium';
    return matchesSearch;
  });

  const exportUsers = () => {
    const csvContent = [
      ['Email', 'Nom', 'Plan', 'Date création', 'Dernière connexion', 'Statut'],
      ...filteredUsers.map(user => [
        user.email,
        user.full_name || '',
        user.plan || 'free',
        new Date(user.created_at).toLocaleDateString(),
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Jamais',
        user.is_active ? 'Actif' : 'Inactif'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilisateurs-amora.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="heart-logo">
            <div className="heart-shape animate-pulse" />
          </div>
          <span className="text-lg">Chargement des utilisateurs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec bouton de retour automatique */}
      <HeaderAdmin 
        title="Gestion des Utilisateurs"
        showBackButton={true}
        backTo="/admin"
        backLabel="Admin principal"
      />

      {/* Contenu de la page */}
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          
          {/* Bouton de retour alternatif si nécessaire */}
          <BackButton 
            to="/admin"
            label="Retour à l'admin"
            variant="outline"
            size="sm"
          />
        </div>

        {/* Votre contenu existant ici */}
        <div className="culture-card">
          <p>Contenu de la page de gestion des utilisateurs...</p>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
