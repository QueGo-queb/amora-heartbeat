import { useParams } from 'react-router-dom';
import HeaderAdmin from '@/components/admin/HeaderAdmin';
import BackButton from '@/components/admin/BackButton';

const UserDetails = () => {
  const { userId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec bouton de retour automatique */}
      <HeaderAdmin 
        title={`Détails Utilisateur #${userId}`}
        showBackButton={true}
        backTo="/admin/users"
        backLabel="Liste des utilisateurs"
      />

      {/* Contenu de la page */}
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Détails de l'utilisateur</h1>
          
          {/* Bouton de retour alternatif */}
          <BackButton 
            to="/admin/users"
            label="← Retour à la liste"
            variant="outline"
            size="sm"
          />
        </div>

        {/* Votre contenu existant ici */}
        <div className="culture-card">
          <p>Détails de l'utilisateur {userId}...</p>
        </div>
      </main>
    </div>
  );
};

export default UserDetails;
