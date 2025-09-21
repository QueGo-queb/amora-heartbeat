/**
 * Composant pour monitorer les tentatives d'accès non autorisées
 * aux comptes bancaires
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import { useBankAccountProtection } from '@/hooks/useBankAccountProtection';

export function BankAccountSecurityMonitor() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [unauthorizedAttempts, setUnauthorizedAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthorizedAdmin, getAuditLogs, getUnauthorizedAttempts } = useBankAccountProtection();

  useEffect(() => {
    if (isAuthorizedAdmin) {
      loadSecurityData();
    }
  }, [isAuthorizedAdmin]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      const [logs, attempts] = await Promise.all([
        getAuditLogs(),
        getUnauthorizedAttempts()
      ]);

      setAuditLogs(logs || []);
      setUnauthorizedAttempts(attempts || []);

    } catch (error) {
      console.error('Erreur chargement données sécurité:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorizedAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          Accès refusé : Vous n'avez pas les droits pour voir les logs de sécurité
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          Monitoring Sécurité Bancaire
        </h2>
        <Button onClick={loadSecurityData} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Alertes de sécurité */}
      {unauthorizedAttempts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>⚠️ {unauthorizedAttempts.length} tentative(s) d'accès non autorisée(s) détectée(s)</strong>
            <p className="mt-1 text-xs">
              Dernière tentative : {new Date(unauthorizedAttempts[0]?.created_at).toLocaleString()}
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tentatives non autorisées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Tentatives bloquées ({unauthorizedAttempts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unauthorizedAttempts.length === 0 ? (
              <div className="text-center py-4 text-green-600">
                <Shield className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">Aucune tentative non autorisée</p>
                <p className="text-xs text-muted-foreground">Système sécurisé</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {unauthorizedAttempts.map((attempt) => (
                  <div key={attempt.id} className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="destructive" className="text-xs">
                        {attempt.action_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(attempt.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{attempt.performed_by_email || 'Utilisateur anonyme'}</p>
                    <p className="text-xs text-red-700">{attempt.blocked_reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs d'audit autorisés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Activity className="w-5 h-5" />
              Actions autorisées ({auditLogs.filter(log => log.is_authorized).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {auditLogs.filter(log => log.is_authorized).slice(0, 10).map((log) => (
                <div key={log.id} className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="default" className="text-xs bg-green-600">
                      {log.action_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{log.performed_by_email}</p>
                  <p className="text-xs text-green-700">Action autorisée et exécutée</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Statistiques de sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{auditLogs.length}</div>
              <div className="text-xs text-blue-600">Actions totales</div>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {auditLogs.filter(log => log.is_authorized).length}
              </div>
              <div className="text-xs text-green-600">Autorisées</div>
            </div>
            <div className="p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">{unauthorizedAttempts.length}</div>
              <div className="text-xs text-red-600">Bloquées</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-600">
                {unauthorizedAttempts.length === 0 ? '100%' : 
                 Math.round((auditLogs.filter(log => log.is_authorized).length / auditLogs.length) * 100) + '%'}
              </div>
              <div className="text-xs text-gray-600">Sécurité</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
