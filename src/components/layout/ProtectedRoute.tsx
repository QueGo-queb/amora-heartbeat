import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallback,
}) => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const location = useLocation();

  // Composant de chargement
  const LoadingComponent = () => (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant d'accès refusé
  const AccessDeniedComponent = () => {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground text-center mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm border rounded hover:bg-muted"
              >
                Retour
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Tableau de bord
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Attendre le chargement de l'auth et de la vérification admin
  if (authLoading || (requireAdmin && adminLoading)) {
    return <LoadingComponent />;
  }

  // Vérification de l'authentification
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // ✅ SÉCURITÉ CORRIGÉE: Vérification admin sécurisée via useAdminCheck
  if (requireAdmin && !isAdmin) {
    console.log('❌ Accès admin refusé pour:', user?.email);
    return <AccessDeniedComponent />;
  }

  if (requireAdmin && isAdmin) {
    console.log('✅ Accès admin autorisé pour:', user?.email);
  }

  return <>{children}</>;
};

export default ProtectedRoute;
